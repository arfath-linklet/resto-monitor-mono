import { and, asc, eq, inArray, lte, or, sql } from "drizzle-orm";
import { db as dbFactory } from "resto-db/db";
import { restaurantAvailabilities, restaurantTimings } from "resto-db/schema";
import { env } from "@/env";
import type { ZomatoPageResponse } from "@/types";

const SCRAPE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes between scrapes per restaurant
const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds between poll cycles
const BATCH_SIZE = 10;
const ZOMATO_API_URL = "https://www.zomato.com/webroutes/getPage";

const db = dbFactory(env.DATABASE_URL);

async function fetchZomatoStatus(resUrl: string) {
	const url = `${ZOMATO_API_URL}?page_url=${resUrl}`;

	const res = await fetch(url, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
		},
	});

	if (!res.ok) {
		throw new Error(`Zomato API returned ${res.status} for ${resUrl}`);
	}

	const data: ZomatoPageResponse = await res.json();
	return data.page_data.sections.SECTION_BASIC_INFO;
}

// ── Phase 1: Claim ──────────────────────────────────────────────────
// Short transaction: SELECT … FOR UPDATE SKIP LOCKED → UPDATE status
// to 'RUNNING' → COMMIT.  Lock is held only for the two queries.
async function claimBatch() {
	return db.transaction(async (tx) => {
		const rows = await tx
			.select({
				resId: restaurantAvailabilities.resId,
				resUrl: restaurantAvailabilities.resUrl,
				name: restaurantAvailabilities.name,
				expectedOpen: sql<boolean>`EXISTS (
					SELECT 1 FROM ${restaurantTimings} t
					WHERE t.${sql.identifier(restaurantTimings.resId.name)} = ${restaurantAvailabilities.resId}
					AND (
						(t.${sql.identifier(restaurantTimings.dayOfWeek.name)} = EXTRACT(DOW FROM NOW())::int
						 AND t.${sql.identifier(restaurantTimings.opensAt.name)} < t.${sql.identifier(restaurantTimings.closesAt.name)}
						 AND LOCALTIME >= t.${sql.identifier(restaurantTimings.opensAt.name)}
						 AND LOCALTIME < t.${sql.identifier(restaurantTimings.closesAt.name)})
						OR
						(t.${sql.identifier(restaurantTimings.dayOfWeek.name)} = EXTRACT(DOW FROM NOW())::int
						 AND t.${sql.identifier(restaurantTimings.opensAt.name)} >= t.${sql.identifier(restaurantTimings.closesAt.name)}
						 AND LOCALTIME >= t.${sql.identifier(restaurantTimings.opensAt.name)})
						OR
						(t.${sql.identifier(restaurantTimings.dayOfWeek.name)} = (EXTRACT(DOW FROM NOW())::int + 6) % 7
						 AND t.${sql.identifier(restaurantTimings.opensAt.name)} >= t.${sql.identifier(restaurantTimings.closesAt.name)}
						 AND LOCALTIME < t.${sql.identifier(restaurantTimings.closesAt.name)})
					)
				)`.as("expected_open"),
			})
			.from(restaurantAvailabilities)
			.where(
				and(
					lte(restaurantAvailabilities.nextRunTime, new Date()),
					eq(restaurantAvailabilities.scrapeStatus, "SCHEDULED"),
				),
			)
			.orderBy(asc(restaurantAvailabilities.nextRunTime))
			.limit(BATCH_SIZE)
			.for("update", { skipLocked: true });

		if (rows.length === 0) return [];

		// Claim: flip status to RUNNING so no other worker picks them up
		const claimedIds = rows.map((r) => r.resId);
		await tx
			.update(restaurantAvailabilities)
			.set({ scrapeStatus: "RUNNING" })
			.where(inArray(restaurantAvailabilities.resId, claimedIds));

		return rows;
	});
}

// ── Phase 2: Process ────────────────────────────────────────────────
// Runs outside any transaction — the row is already claimed.
async function processRow(restaurant: {
	resId: string;
	resUrl: string;
	name: string;
	expectedOpen: boolean;
}) {
	try {
		const info = await fetchZomatoStatus(restaurant.resUrl);
		const { show_open_now: isOpenNow } = info.timing;
		const {
			is_perm_closed: isPermClosed,
			is_temp_closed: isTempClosed,
			res_status_text: resStatusText,
		} = info;
		const hasMismatch =
			restaurant.expectedOpen !== isOpenNow || isPermClosed || isTempClosed;

		console.log(
			`[${restaurant.name}] expectedOpen=${restaurant.expectedOpen} isOpenNow=${isOpenNow} isPermClosed=${isPermClosed} isTempClosed=${isTempClosed} hasMismatch=${hasMismatch}`,
		);

		if (hasMismatch) {
			// TODO: Add event to notification queue when expected does not match actual
		}

		// ── Phase 3: Write results back, schedule next run ──────────
		await db
			.update(restaurantAvailabilities)
			.set({
				isOpenNow,
				isPermClosed,
				isTempClosed,
				resStatusText,
				expectedOpen: restaurant.expectedOpen,
				scrapeStatus: "SCHEDULED",
				nextRunTime: new Date(Date.now() + SCRAPE_INTERVAL_MS),
			})
			.where(eq(restaurantAvailabilities.resId, restaurant.resId));
	} catch (err) {
		console.error(`[${restaurant.name}] scrape failed:`, err);

		// Release the row back — set next_run_time to now so it's retried immediately
		await db
			.update(restaurantAvailabilities)
			.set({
				scrapeStatus: "SCHEDULED",
				nextRunTime: new Date(),
			})
			.where(eq(restaurantAvailabilities.resId, restaurant.resId));
	}
}

// ── Poll loop ───────────────────────────────────────────────────────
async function poll() {
	const claimed = await claimBatch();
	if (claimed.length === 0) {
		console.log(`No stale restaurants claimed for scraping`);
		return;
	}

	console.log(`Claimed ${claimed.length} restaurants for scraping`);
	await Promise.allSettled(claimed.map(processRow));
}

console.log(
	`Scrape worker started — polling every ${POLL_INTERVAL_MS / 1000}s`,
);

while (true) {
	try {
		await poll();
	} catch (err) {
		console.error("Poll cycle error:", err);
	}
	await Bun.sleep(POLL_INTERVAL_MS);
}

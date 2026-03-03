import { asc, eq, getTableColumns, lt, sql } from "drizzle-orm";
import cron from "node-cron";
import { db as dbFactory } from "resto-db/db";
import { restaurantAvailabilities, restaurantTimings } from "resto-db/schema";
import { env } from "@/env";
import type { ZomatoPageResponse } from "@/types";

const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
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

async function process(): Promise<void> {
	return db.transaction(async (tx) => {
		const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS);

		// Pick the stalest restaurant that no other worker has locked.
		// expected_open is computed in SQL by checking if LOCALTIME falls
		// within any of the restaurant's timing slots for today (or an
		// overnight slot that started yesterday).
		const [restaurant] = await tx
			.select({
				...getTableColumns(restaurantAvailabilities),
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
			.where(lt(restaurantAvailabilities.updatedAt, staleThreshold))
			.orderBy(asc(restaurantAvailabilities.updatedAt))
			.limit(1)
			.for("update", { skipLocked: true });

		if (!restaurant) return;

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

		await tx
			.update(restaurantAvailabilities)
			.set({
				isOpenNow,
				isPermClosed,
				isTempClosed,
				resStatusText,
				expectedOpen: restaurant.expectedOpen,
				lastCheckedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(restaurantAvailabilities.resId, restaurant.resId));

		return;
	});
}

await process();
cron.schedule("*/5 * * * *", process);

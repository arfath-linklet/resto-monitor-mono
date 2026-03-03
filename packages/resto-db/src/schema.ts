import type { InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
	boolean,
	integer,
	pgSchema,
	text,
	time,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const appPgSchema = pgSchema("app");

export const restaurantAvailabilities = appPgSchema.table(
	"restaurant_availabilities",
	{
		// Identity
		id: uuid("id").primaryKey().defaultRandom(),

		resId: text("res_id").notNull().unique(),
		resUrl: text("res_url").notNull().unique(),
		resStatusText: text("res_status_text"),
		name: text("name").notNull(),
		isOpenNow: boolean("is_open_now").notNull(),
		isPermClosed: boolean("is_perm_closed").notNull(),
		isTempClosed: boolean("is_temp_closed").notNull(),
		expectedOpen: boolean("expected_open").notNull().default(false),
		scrapeStatus: text("scrape_status").notNull().default("SCHEDULED"),
		nextRunTime: timestamp("next_run_time").defaultNow().notNull(),

		// Timestamps
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
);

export type RestaurantAvailability = InferSelectModel<
	typeof restaurantAvailabilities
>;

export const restaurantAvailabilitiesRelations = relations(
	restaurantAvailabilities,
	({ many }) => ({
		timings: many(restaurantTimings),
	}),
);

export const restaurantTimings = appPgSchema.table("restaurant_timings", {
	// Identity
	id: uuid("id").primaryKey().defaultRandom(),

	resId: text("res_id")
		.notNull()
		.references(() => restaurantAvailabilities.resId),
	dayOfWeek: integer("day_of_week").notNull(),
	opensAt: time("opens_at").notNull(),
	closesAt: time("closes_at").notNull(),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const restaurantTimingsRelations = relations(
	restaurantTimings,
	({ one }) => ({
		restaurant: one(restaurantAvailabilities, {
			fields: [restaurantTimings.resId],
			references: [restaurantAvailabilities.resId],
		}),
	}),
);

export type RestaurantTiming = InferSelectModel<typeof restaurantTimings>;

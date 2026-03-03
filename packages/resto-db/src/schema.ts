import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const appPgSchema = pgSchema("app");

export const restaurantAvailabilities = appPgSchema.table(
	"restaurant_availabilities",
	{
		// Identity
		id: uuid("id").primaryKey().defaultRandom(),

		res_id: text("res_id").notNull().unique(),
		res_status_text: text("res_status_text"),
		name: text("name").notNull(),
		isOpenNow: boolean("is_open_now").notNull(),
		isPermClosed: boolean("is_perm_closed").notNull(),
		isTempClosed: boolean("is_temp_closed").notNull(),

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

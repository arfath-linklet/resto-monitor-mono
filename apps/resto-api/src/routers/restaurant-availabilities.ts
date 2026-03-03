import { and, asc, desc, eq } from "drizzle-orm";
import { restaurantAvailabilities } from "resto-db/schema";
import * as v from "valibot";
import { base } from "@/context";

const columnMap = {
	createdAt: restaurantAvailabilities.createdAt,
	updatedAt: restaurantAvailabilities.updatedAt,
	isOpenNow: restaurantAvailabilities.isOpenNow,
	isPermClosed: restaurantAvailabilities.isPermClosed,
	isTempClosed: restaurantAvailabilities.isTempClosed,
	expectedOpen: restaurantAvailabilities.expectedOpen,
	nextRunTime: restaurantAvailabilities.nextRunTime,
};

export const restaurantAvailabilitiesRouter = {
	list: base
		.input(
			v.object({
				offset: v.number(),
				limit: v.pipe(v.number(), v.maxValue(20)),
				sortBy: v.picklist([
					"createdAt",
					"updatedAt",
					"isOpenNow",
					"isPermClosed",
					"isTempClosed",
					"expectedOpen",
					"nextRunTime",
				]),
				sortOrder: v.picklist(["asc", "desc"]),
				filterBy: v.optional(
					v.object({
						isOpenNow: v.optional(v.boolean()),
						isPermClosed: v.optional(v.boolean()),
						isTempClosed: v.optional(v.boolean()),
						expectedOpen: v.optional(v.boolean()),
					}),
				),
			}),
		)
		.handler(async ({ input, context: { db } }) => {
			const { offset, limit, sortBy, sortOrder, filterBy } = input;

			const orderFn = sortOrder === "asc" ? asc : desc;

			const conditions = [];
			if (filterBy?.isOpenNow !== undefined) {
				conditions.push(
					eq(restaurantAvailabilities.isOpenNow, filterBy.isOpenNow),
				);
			}
			if (filterBy?.isPermClosed !== undefined) {
				conditions.push(
					eq(restaurantAvailabilities.isPermClosed, filterBy.isPermClosed),
				);
			}
			if (filterBy?.isTempClosed !== undefined) {
				conditions.push(
					eq(restaurantAvailabilities.isTempClosed, filterBy.isTempClosed),
				);
			}
			if (filterBy?.expectedOpen !== undefined) {
				conditions.push(
					eq(restaurantAvailabilities.expectedOpen, filterBy.expectedOpen),
				);
			}

			const rows = await db
				.select()
				.from(restaurantAvailabilities)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(orderFn(columnMap[sortBy]))
				.offset(offset)
				.limit(limit);

			return rows;
		}),
};

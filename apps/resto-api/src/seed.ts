import type { Db } from "resto-db/db";
import { restaurantAvailabilities, restaurantTimings } from "resto-db/schema";

export const seed = async (db: Db) => {
	// todo: use advisory lock, using regular transaction for now
	await db.transaction(async (tx) => {
		// Seed with 5 locations of McDonald's in Bangalore
		await tx
			.insert(restaurantAvailabilities)
			.values([
				{
					name: "McDonald's, Magadi Road, Bangalore",
					resId: "20009145",
					resUrl: "/bangalore/mcdonalds-magadi-road-bangalore",
					resStatusText: null,
					isOpenNow: true,
					isPermClosed: false,
					isTempClosed: false,
				},
				{
					name: "McDonald's, Banashankari, Bangalore",
					resId: "58636",
					resUrl: "/bangalore/mcdonalds-banashankari",
					resStatusText: null,
					isOpenNow: true,
					isPermClosed: false,
					isTempClosed: false,
				},
				{
					name: "McDonald's, Kempfort Total Mall, Airport Road, Bangalore",
					resId: "50678",
					resUrl: "/bangalore/mcdonalds-airport-road",
					resStatusText: null,
					isOpenNow: true,
					isPermClosed: false,
					isTempClosed: false,
				},
				{
					name: "McDonald's, Vijay Nagar, Bangalore",
					resId: "18554971",
					resUrl: "/bangalore/mcdonalds-1-vijay-nagar",
					resStatusText: null,
					isOpenNow: true,
					isPermClosed: false,
					isTempClosed: false,
				},
				{
					name: "McDonald's, Basavanagudi, Bangalore",
					resId: "20061499",
					resUrl: "/bangalore/mcdonalds-basavanagudi-bangalore",
					resStatusText: null,
					isOpenNow: true,
					isPermClosed: false,
					isTempClosed: false,
				},
			])
			.onConflictDoNothing();

		// dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		const days = [0, 1, 2, 3, 4, 5, 6];

		const timingSlots = [
			// Magadi Road: 11:15am – 10:45pm
			{ resId: "20009145", opensAt: "11:15:00", closesAt: "22:45:00" },

			// Banashankari: 12midnight – 2:45am, 10am – 12midnight
			{ resId: "58636", opensAt: "00:00:00", closesAt: "02:45:00" },
			{ resId: "58636", opensAt: "10:00:00", closesAt: "24:00:00" },

			// Airport Road: 12midnight – 3:45am, 10:15am – 12midnight
			{ resId: "50678", opensAt: "00:00:00", closesAt: "03:45:00" },
			{ resId: "50678", opensAt: "10:15:00", closesAt: "24:00:00" },

			// Vijay Nagar: 12midnight – 3am, 11am – 12midnight
			{ resId: "18554971", opensAt: "00:00:00", closesAt: "03:00:00" },
			{ resId: "18554971", opensAt: "11:00:00", closesAt: "24:00:00" },

			// Basavanagudi: 11am – 12:45am (overnight)
			{ resId: "20061499", opensAt: "11:00:00", closesAt: "00:45:00" },
		];

		await tx
			.insert(restaurantTimings)
			.values(
				timingSlots.flatMap(({ resId, opensAt, closesAt }) =>
					days.map((dayOfWeek) => ({ resId, dayOfWeek, opensAt, closesAt })),
				),
			)
			.onConflictDoNothing();
	});
};

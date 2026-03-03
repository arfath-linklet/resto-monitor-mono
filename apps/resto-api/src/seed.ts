import type { Db } from "resto-db/db";
import { restaurantAvailabilities } from "resto-db/schema";

/*
Seed with 5 locations of McDonald's in Bangalore

{
  "name": "McDonald's, Magadi Road, Bangalore",
  "res_id": "20009145",
  "res_url": "/bangalore/mcdonalds-magadi-road-bangalore",
  "res_status_text": null,
  "is_open_now": true,
  "is_perm_closed": false,
  "is_temp_closed": false
},
{
  "name": "McDonald's, Banashankari, Bangalore",
  "res_id": "58636",
  "res_url": "/bangalore/mcdonalds-banashankari",
  "res_status_text": null,
  "is_open_now": true,
  "is_perm_closed": false,
  "is_temp_closed": false
},
{
  "name": "McDonald's, Kempfort Total Mall, Airport Road, Bangalore",
  "res_id": "50678",
  "res_url": "/bangalore/mcdonalds-airport-road",
  "res_status_text": null,
  "is_open_now": true,
  "is_perm_closed": false,
  "is_temp_closed": false
},
{
  "name": "McDonald's, Vijay Nagar, Bangalore",
  "res_id": "18554971",
  "res_url": "/bangalore/mcdonalds-1-vijay-nagar",
  "res_status_text": null,
  "is_open_now": true,
  "is_perm_closed": false,
  "is_temp_closed": false
},
{
  "name": "McDonald's, Basavanagudi, Bangalore",
  "res_id": "20061499",
  "res_url": "/bangalore/mcdonalds-basavanagudi-bangalore",
  "res_status_text": null,
  "is_open_now": true,
  "is_perm_closed": false,
  "is_temp_closed": false
}
*/

export const seed = async (db: Db) => {
	// todo: use advisory lock, using regular transaction for now
	await db.transaction(async (tx) => {
		const insertedUsers = await tx
			.insert(restaurantAvailabilities)
			.values({})
			.returning();
	});
};

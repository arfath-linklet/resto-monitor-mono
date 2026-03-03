CREATE TABLE "app"."restaurant_availabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"res_id" text NOT NULL,
	"res_status_text" text,
	"name" text NOT NULL,
	"is_open_now" boolean NOT NULL,
	"is_perm_closed" boolean NOT NULL,
	"is_temp_closed" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restaurant_availabilities_res_id_unique" UNIQUE("res_id")
);
--> statement-breakpoint
CREATE TABLE "app"."restaurant_timings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"res_id" text NOT NULL,
	"day_of_week" text NOT NULL,
	"opens_at" time NOT NULL,
	"closes_at" time NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."restaurant_timings" ADD CONSTRAINT "restaurant_timings_res_id_restaurant_availabilities_res_id_fk" FOREIGN KEY ("res_id") REFERENCES "app"."restaurant_availabilities"("res_id") ON DELETE no action ON UPDATE no action;
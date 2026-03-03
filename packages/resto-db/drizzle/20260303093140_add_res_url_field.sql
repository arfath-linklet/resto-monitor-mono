ALTER TABLE "app"."restaurant_availabilities" ADD COLUMN "res_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."restaurant_availabilities" ADD CONSTRAINT "restaurant_availabilities_res_url_unique" UNIQUE("res_url");

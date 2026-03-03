import { db as dbFactory } from "resto-db/db";
import { migrate } from "resto-db/migrate";
import { env } from "@/env";

const db = dbFactory(env.DATABASE_URL);

// migrate db
await migrate(db, {
	migrationsFolder: env.MIGRATIONS_PATH,
});

import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

export const db = (url: string) =>
	drizzle(url, {
		schema,
	});

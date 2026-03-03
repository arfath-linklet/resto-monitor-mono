import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import {
	RequestHeadersPlugin,
	ResponseHeadersPlugin,
} from "@orpc/server/plugins";
import { db as dbFactory } from "resto-db/db";
import { migrate } from "resto-db/migrate";
import { env } from "@/env";
import { seed } from "@/seed";

const db = dbFactory(env.DATABASE_URL);

// migrate db
await migrate(db, {
	migrationsFolder: env.MIGRATIONS_PATH,
});

// seed db
await seed(db);

const router = {};

const handler = new RPCHandler(router, {
	plugins: [
		// todo: not needed for localhost right now
		// new CORSPlugin({
		// 	origin: () => env.FRONTEND_URL,
		// 	allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
		// 	credentials: true,
		// 	allowHeaders: ["authorization", "content-type"],
		// }),
		new RequestHeadersPlugin(),
		new ResponseHeadersPlugin(),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

Bun.serve({
	async fetch(request: Request) {
		const { matched, response } = await handler.handle(request, {
			prefix: "/orpc",
			context: {
				db,
			},
		});

		if (matched) {
			return response;
		}

		return new Response("Not found", { status: 404 });
	},
});

export type AppRouter = typeof router;
export type {
	InferRouterInputs,
	InferRouterOutputs,
	RouterClient,
} from "@orpc/server";

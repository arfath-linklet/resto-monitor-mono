import { os } from "@orpc/server";
import type {
	RequestHeadersPluginContext,
	ResponseHeadersPluginContext,
} from "@orpc/server/plugins";
import type { Db } from "resto-db/db";

export interface ORPCContext
	extends ResponseHeadersPluginContext,
		RequestHeadersPluginContext {
	db: Db;
}

export const base = os.$context<ORPCContext>();

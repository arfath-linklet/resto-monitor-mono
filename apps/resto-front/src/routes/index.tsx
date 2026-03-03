import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useDeferredValue } from "react";
import * as v from "valibot";
import { orpc } from "@/orpc";
import { DataTable } from "./-index/data-table";
import { TablePagination } from "./-index/pagination";
import { RestaurantTableSkeleton } from "./-index/skeleton";
import { Toolbar } from "./-index/toolbar";

type FilterBy = "isOpenNow" | "isPermClosed" | "isTempClosed";

function toApiFilterBy(filterBy: FilterBy | undefined) {
	if (!filterBy) return undefined;
	return {
		isOpenNow: filterBy === "isOpenNow" ? true : undefined,
		isPermClosed: filterBy === "isPermClosed" ? true : undefined,
		isTempClosed: filterBy === "isTempClosed" ? true : undefined,
	};
}

const querySchema = v.object({
	offset: v.optional(v.fallback(v.number(), 0), 0),
	limit: v.optional(v.fallback(v.number(), 20), 20),
	sortBy: v.optional(
		v.fallback(
			v.picklist([
				"createdAt",
				"updatedAt",
				"isOpenNow",
				"isPermClosed",
				"isTempClosed",
				"expectedOpen",
				"nextRunTime",
			]),
			"createdAt",
		),
		"createdAt",
	),
	sortOrder: v.optional(
		v.fallback(v.picklist(["asc", "desc"]), "desc"),
		"desc",
	),
	filterBy: v.optional(
		v.picklist(["isOpenNow", "isPermClosed", "isTempClosed"]),
	),
});

export const Route = createFileRoute("/")({
	validateSearch: querySchema,
	loaderDeps: ({ search: { offset, limit, sortBy, sortOrder, filterBy } }) => ({
		offset,
		limit,
		sortBy,
		sortOrder,
		filterBy,
	}),
	loader: ({ context: { orpc, queryClient }, deps: query }) => {
		queryClient.prefetchQuery(
			orpc.restaurantAvailabilities.list.queryOptions({
				input: {
					offset: query.offset,
					limit: query.limit,
					sortBy: query.sortBy,
					sortOrder: query.sortOrder,
					filterBy: toApiFilterBy(query.filterBy),
				},
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="space-y-6">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
					<p className="text-muted-foreground text-sm">
						Monitor availability of your tracked restaurants.
					</p>
				</div>

				<Suspense fallback={<RestaurantTableSkeleton />}>
					<RestaurantAvailabilityList />
				</Suspense>
			</div>
		</div>
	);
}

function RestaurantAvailabilityList() {
	const _query = Route.useSearch();
	const query = useDeferredValue(_query);

	const { data } = useSuspenseQuery(
		orpc.restaurantAvailabilities.list.queryOptions({
			input: {
				limit: query.limit,
				offset: query.offset,
				sortBy: query.sortBy,
				sortOrder: query.sortOrder,
				filterBy: toApiFilterBy(query.filterBy),
			},
		}),
	);

	return (
		<div className="space-y-4">
			<Toolbar />
			<DataTable data={data} />
			<TablePagination count={data.length} />
		</div>
	);
}

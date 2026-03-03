import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useDeferredValue } from "react";
import * as v from "valibot";
import { orpc } from "@/orpc";

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
		v.picklist([
			"createdAt",
			"updatedAt",
			"isOpenNow",
			"isPermClosed",
			"isTempClosed",
		]),
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
					filterBy: query.filterBy,
				},
			}),
		);
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Suspense fallback={<RestaurantAvailabilityListSkeleton />}>
			<RestaurantAvailabilityList />
		</Suspense>
	);
}

function RestaurantAvailabilityListSkeleton() {
	return null;
}

function RestaurantAvailabilityList() {
	const _query = Route.useSearch();
	const query = useDeferredValue(_query);

	const { data } = useSuspenseQuery({
		...orpc.restaurantAvailabilities.list.queryOptions({
			input: {
				limit: query.limit,
				offset: query.offset,
				sortBy: query.sortBy,
				sortOrder: query.sortOrder,
				filterBy: query.filterBy,
			},
		}),
	});

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-wrap justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
					<p className="text-muted-foreground text-sm">
						List of your restaurants
					</p>
				</div>
			</div>

			{/*todo*/}
		</div>
	);
}

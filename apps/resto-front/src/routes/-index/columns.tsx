import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLinkIcon } from "lucide-react";
import type { AppRouter, InferRouterOutputs } from "resto-api";
import { Badge } from "@/components/ui/badge";

type RouterOutputs = InferRouterOutputs<AppRouter>;
export type RestaurantRow =
	RouterOutputs["restaurantAvailabilities"]["list"][number];

export const columns: ColumnDef<RestaurantRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {
			const resUrl = `https://www.zomato.com${row.original.resUrl}`;
			return (
				<div className="space-y-0.5">
					<a
						href={resUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium hover:underline inline-flex items-center gap-1 text-sm"
					>
						{row.original.name}
						<ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />
					</a>
					{row.original.resStatusText && (
						<p className="text-xs text-muted-foreground">
							{row.original.resStatusText}
						</p>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "isOpenNow",
		header: "Status",
		cell: ({ row }) => {
			if (row.original.isPermClosed) {
				return <Badge variant="destructive">Perm. Closed</Badge>;
			}
			if (row.original.isTempClosed) {
				return <Badge variant="outline">Temp. Closed</Badge>;
			}
			return (
				<Badge variant={row.original.isOpenNow ? "default" : "secondary"}>
					{row.original.isOpenNow ? "Open" : "Closed"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "updatedAt",
		header: "Last Updated",
		cell: ({ getValue }) => {
			const date = new Date(getValue<string>());
			return (
				<span className="text-muted-foreground text-sm">
					{date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
			);
		},
	},
	{
		accessorKey: "createdAt",
		header: "Added",
		cell: ({ getValue }) => {
			const date = new Date(getValue<string>());
			return (
				<span className="text-muted-foreground text-sm">
					{date.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
			);
		},
	},
];

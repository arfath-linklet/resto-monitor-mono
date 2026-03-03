import type { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangleIcon,
	CalendarPlusIcon,
	ClockIcon,
	ExternalLinkIcon,
	ShieldCheckIcon,
	SignalIcon,
	StoreIcon,
	TimerIcon,
} from "lucide-react";
import type { AppRouter, InferRouterOutputs } from "resto-api";
import { Badge } from "@/components/ui/badge";

type RouterOutputs = InferRouterOutputs<AppRouter>;
export type RestaurantRow =
	RouterOutputs["restaurantAvailabilities"]["list"][number];

export const columns: ColumnDef<RestaurantRow>[] = [
	{
		accessorKey: "name",
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<StoreIcon className="size-3.5" /> Name
			</span>
		),
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
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<SignalIcon className="size-3.5" /> Status
			</span>
		),
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
		accessorKey: "expectedOpen",
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<ShieldCheckIcon className="size-3.5" /> Expected
			</span>
		),
		cell: ({ row }) => {
			const expected = row.original.expectedOpen;
			const actual = row.original.isOpenNow;
			const hasMismatch =
				expected !== actual ||
				row.original.isPermClosed ||
				row.original.isTempClosed;

			return (
				<div className="inline-flex items-center gap-1.5">
					<Badge variant={expected ? "default" : "secondary"}>
						{expected ? "Open" : "Closed"}
					</Badge>
					{hasMismatch && (
						<AlertTriangleIcon className="size-4 text-amber-500" />
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "nextRunTime",
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<TimerIcon className="size-3.5" /> Next Scrape
			</span>
		),
		cell: ({ getValue }) => {
			const date = new Date(getValue<string>());
			const now = new Date();
			const diffMs = date.getTime() - now.getTime();

			if (diffMs <= 0) {
				return <span className="text-muted-foreground text-sm">Pending</span>;
			}

			const diffMin = Math.ceil(diffMs / 60_000);
			return (
				<span className="text-muted-foreground text-sm">
					{diffMin < 60
						? `${diffMin}m`
						: `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`}
				</span>
			);
		},
	},
	{
		accessorKey: "updatedAt",
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<ClockIcon className="size-3.5" /> Last Updated
			</span>
		),
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
		header: () => (
			<span className="inline-flex items-center gap-1.5">
				<CalendarPlusIcon className="size-3.5" /> Added
			</span>
		),
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

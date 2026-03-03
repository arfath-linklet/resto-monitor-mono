import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
	{ value: "createdAt", label: "Added" },
	{ value: "updatedAt", label: "Last Updated" },
	{ value: "isOpenNow", label: "Open Now" },
	{ value: "isPermClosed", label: "Perm. Closed" },
	{ value: "isTempClosed", label: "Temp. Closed" },
] as const;

const FILTER_OPTIONS = [
	{ value: "isOpenNow", label: "Open Now" },
	{ value: "isPermClosed", label: "Perm. Closed" },
	{ value: "isTempClosed", label: "Temp. Closed" },
] as const;

export function Toolbar() {
	const search = useSearch({ from: "/" });
	const navigate = useNavigate({ from: "/" });

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Select
				value={search.filterBy ?? "all"}
				onValueChange={(value) =>
					navigate({
						search: (prev) => ({
							...prev,
							filterBy:
								value === "all"
									? undefined
									: (value as (typeof FILTER_OPTIONS)[number]["value"]),
							offset: 0,
						}),
					})
				}
			>
				<SelectTrigger size="sm">
					<SelectValue placeholder="All statuses" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All statuses</SelectItem>
					{FILTER_OPTIONS.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{search.filterBy && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() =>
						navigate({
							search: (prev) => ({ ...prev, filterBy: undefined, offset: 0 }),
						})
					}
				>
					<XIcon />
					Clear
				</Button>
			)}

			<div className="ml-auto flex items-center gap-2">
				<Select
					value={search.sortBy}
					onValueChange={(value) =>
						navigate({
							search: (prev) => ({
								...prev,
								sortBy: value as typeof search.sortBy,
								offset: 0,
							}),
						})
					}
				>
					<SelectTrigger size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{SORT_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="sm"
					onClick={() =>
						navigate({
							search: (prev) => ({
								...prev,
								sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
								offset: 0,
							}),
						})
					}
				>
					{search.sortOrder === "asc" ? <ArrowUpIcon /> : <ArrowDownIcon />}
					{search.sortOrder === "asc" ? "Asc" : "Desc"}
				</Button>
			</div>
		</div>
	);
}

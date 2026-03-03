import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
	count: number;
}

export function TablePagination({ count }: TablePaginationProps) {
	const search = useSearch({ from: "/" });
	const navigate = useNavigate({ from: "/" });
	const { offset, limit } = search;

	const hasPrev = offset > 0;
	const hasNext = count === limit;

	return (
		<div className="flex items-center justify-between text-sm text-muted-foreground">
			<span>
				{count === 0 ? "No results" : `Showing ${offset + 1}–${offset + count}`}
			</span>
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="icon-sm"
					disabled={!hasPrev}
					onClick={() =>
						navigate({
							search: (prev) => ({
								...prev,
								offset: Math.max(0, offset - limit),
							}),
						})
					}
				>
					<ChevronLeftIcon />
					<span className="sr-only">Previous page</span>
				</Button>
				<Button
					variant="outline"
					size="icon-sm"
					disabled={!hasNext}
					onClick={() =>
						navigate({
							search: (prev) => ({
								...prev,
								offset: offset + limit,
							}),
						})
					}
				>
					<ChevronRightIcon />
					<span className="sr-only">Next page</span>
				</Button>
			</div>
		</div>
	);
}

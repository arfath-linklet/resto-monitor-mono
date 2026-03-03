import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function RestaurantTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="ml-auto h-8 w-28" />
				<Skeleton className="h-8 w-20" />
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Last Updated</TableHead>
						<TableHead>Added</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 10 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows
						<TableRow key={i}>
							<TableCell>
								<div className="space-y-1.5">
									<Skeleton className="h-4 w-40" />
									<Skeleton className="h-3 w-24" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-5 w-16 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

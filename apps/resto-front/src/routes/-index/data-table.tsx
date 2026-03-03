import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { columns, type RestaurantRow } from "./columns";

interface DataTableProps {
	data: RestaurantRow[];
}

export function DataTable({ data }: DataTableProps) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
	});

	return (
		<div className="rounded-lg border">
		<Table>
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id}>
								{flexRender(
									header.column.columnDef.header,
									header.getContext(),
								)}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={columns.length}
							className="text-center py-12 text-muted-foreground"
						>
							No restaurants found.
						</TableCell>
					</TableRow>
				) : (
					table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
		</div>
	);
}

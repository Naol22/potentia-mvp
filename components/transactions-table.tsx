"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "framer-motion";

import { useTransactions } from "@/hooks/use-transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction, TransactionStatus,  } from "@/types";

// Define Transaction type (imported from @/types for consistency)
// type Transaction = {
//   id: string;
//   user_id?: string;
//   payment_type: PaymentType;
//   amount: number;
//   status: TransactionStatus;
//   created_at: string;
//   payment_provider_reference?: string;
// };

export function TransactionsTable() {
  const { transactions } = useTransactions();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at") as string);
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: "id",
      header: "Transaction ID",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        return `$${(amount).toFixed(2)}`;
      },
    },
    {
      accessorKey: "payment_provider_reference",
      header: "Payment Provider",
      cell: ({ row }) => {
        const providerRef = row.getValue("payment_provider_reference") as string | undefined;
        return (
          <Badge variant="outline">
            {providerRef?.startsWith("N")
              ? "NowPayments"
              : providerRef?.startsWith("S")
              ? "Stripe"
              : "Unknown"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as TransactionStatus;
        return (
          <Badge 
            variant={
              status === TransactionStatus.Completed
                ? "default"
                : status === TransactionStatus.Pending
                ? "secondary"
                : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions ?? [], // Fallback to empty array if transactions is undefined
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-dark-blue text-white">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription className="text-gray-400">
            A list of all payouts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 py-4">
            <Input
              placeholder="Filter by transaction ID..."
              value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("id")?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-gray-800 text-white border-gray-700"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[180px] justify-between bg-gray-800 text-white border-gray-700 hover:bg-neon-blue"
                >
                  {(table.getColumn("status")?.getFilterValue() as string) || "All Status"}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[180px] bg-gray-800 text-white border-gray-700"
              >
                <DropdownMenuCheckboxItem
                  checked={(table.getColumn("status")?.getFilterValue() as string) === ""}
                  onCheckedChange={() => table.getColumn("status")?.setFilterValue("")}
                >
                  All Status
                </DropdownMenuCheckboxItem>
                {Object.values(TransactionStatus).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={
                      (table.getColumn("status")?.getFilterValue() as string) === status
                    }
                    onCheckedChange={() => table.getColumn("status")?.setFilterValue(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-md border border-gray-700">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-gray-700">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-gray-200">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-gray-700 hover:bg-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-gray-200">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="bg-gray-800 text-white border-gray-700 hover:bg-neon-blue"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="bg-gray-800 text-white border-gray-700 hover:bg-neon-blue"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
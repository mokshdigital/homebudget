
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "@/lib/types";
import { useData } from "@/lib/data-context";
import { getIcon } from "@/lib/icons";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export const getColumns = (
    onEdit: (transaction: Transaction) => void,
    onDelete: (transactionId: string) => void
): ColumnDef<Transaction>[] => {
  const CategoryCell = ({ row }: { row: any }) => {
    const { categories } = useData();
    const category = categories.find(c => c.id === row.getValue("categoryId"));
    return (
      <div className="flex items-center gap-2">
        {category && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />}
        {category?.name}
      </div>
    );
  };

  const VendorCell = ({ row }: { row: any }) => {
    const { vendors } = useData();
    const vendor = vendors.find(v => v.id === row.getValue("vendorId"));
    return vendor?.name;
  };
  
  const ClassificationCell = ({ row }: { row: any }) => {
    const { classifications } = useData();
    const classification = classifications.find(c => c.id === row.getValue("classificationId"));
    return <Badge variant="outline">{classification?.name}</Badge>;
  };

  return [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
        const dateString = row.getValue("date") as string;
        // The date strings from data.ts are like 'YYYY-MM-DD'.
        // To avoid timezone issues, we parse it and then format it.
        const date = parseISO(dateString);
        return format(date, "dd LLL yyyy");
      },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: CategoryCell,
  },
  {
    accessorKey: "vendorId",
    header: "Store/Vendor",
    cell: VendorCell,
  },
  {
    accessorKey: "classificationId",
    header: "Classification",
    cell: ClassificationCell,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => {
      const remarks = row.getValue("remarks") as string;
      return <div className="truncate max-w-[150px]">{remarks}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;
      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(transaction.id)}>
                Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(transaction)}>Edit</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  onClick={() => onDelete(transaction.id)}
                >
                  Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
]};

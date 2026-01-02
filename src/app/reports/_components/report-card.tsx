
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText as FilePdf, Download } from "lucide-react";
import { generateCsv, generatePdf, generateFilename } from "@/lib/reports";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Column<T> = {
  key: keyof T;
  label: string;
};

type ReportCardProps<T extends Record<string, any>> = {
  title: string;
  description: string;
  data: T[];
  columns: Column<T>[];
  total?: number;
  children?: React.ReactNode;
};

export function ReportCard<T extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  total,
  children,
}: ReportCardProps<T>) {

  const handleDownloadCsv = () => {
    generateCsv(data, columns, generateFilename(title, "csv"), total);
  };

  const handleDownloadPdf = () => {
    const pdfColumns = columns.map(c => ({ header: c.label, dataKey: c.key as string }));
    // The data might have complex objects, so we flatten them for the PDF
    const pdfData = data.map(row => {
      const newRow: Record<string, any> = {};
      columns.forEach(col => {
        newRow[col.key as string] = row[col.key];
      });
      return newRow;
    });
    generatePdf(title, pdfColumns, pdfData, generateFilename(title, "pdf"), total);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-10 p-0" disabled={data.length === 0}>
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownloadCsv}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadPdf}>
                    <FilePdf className="mr-2 h-4 w-4" />
                    PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        {children ? (
          data.length > 0 ? children : <p className="text-center text-muted-foreground py-10">No data for this period.</p>
        ) : (
          <p className="text-center text-muted-foreground py-10">This report is download-only.</p>
        )}
      </CardContent>
    </Card>
  );
}

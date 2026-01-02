
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

// --- CSV Generation ---

function escapeCsvCell(cell: any): string {
  let cellStr = String(cell ?? "");
  if (typeof cell === 'number') {
    return `$${cell.toFixed(2)}`;
  }
  if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

export function generateCsv<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string,
  total?: number
) {
  const headers = columns.map((c) => c.label).join(",");
  let rows = data
    .map((row) =>
      columns.map((c) => escapeCsvCell(row[c.key])).join(",")
    )
    .join("\n");

  if (total !== undefined && data.length > 0) {
    const totalLabel = "Total";
    // Create an empty array for the total row, matching the number of columns
    const totalRowArray = new Array(columns.length).fill('');
    // Place the label in the first column
    totalRowArray[0] = totalLabel;
    // Place the formatted total in the last column
    totalRowArray[columns.length - 1] = escapeCsvCell(total);
    rows += `\n${totalRowArray.join(",")}`;
  }

  const csvContent = `${headers}\n${rows}`;
  downloadFile(csvContent, "text/csv", filename);
}

// --- PDF Generation ---

export function generatePdf(
  title: string,
  columns: { header: string; dataKey: string }[],
  data: any[],
  filename: string,
  total?: number
) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("MyHomeBudget", 14, 18);
  
  doc.setFontSize(16);
  doc.text(title, 14, 30);

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: data.map((row) => columns.map((c) => {
        const value = row[c.dataKey] ?? "";
        if (typeof value === 'number') {
            return `$${value.toFixed(2)}`;
        }
        return String(value);
    })),
    startY: 36,
    headStyles: { fillColor: [94, 46, 235] }, // primary color: #5e2eeb
    styles: { fontSize: 10 },
    didDrawPage: (data) => {
      if (total !== undefined && doc.pageNumber === doc.getNumberOfPages()) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const finalY = (data.cursor?.y ?? 0) + 8;
        const pageRightMargin = doc.internal.pageSize.width - data.settings.margin.right;
        
        doc.text("Total", data.settings.margin.left, finalY);
        doc.text(`$${total.toFixed(2)}`, pageRightMargin, finalY, { align: "right" });
      }
    }
  });

  doc.save(filename);
}


// --- Utility ---

function downloadFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function generateFilename(name: string, extension: "csv" | "pdf"): string {
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const sanitizedName = name.replace(/\s+/g, '-').toLowerCase();
    return `${sanitizedName}-report-${dateStr}.${extension}`;
}

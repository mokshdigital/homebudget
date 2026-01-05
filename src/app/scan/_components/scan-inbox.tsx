"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import { createBrowserClient } from '@supabase/ssr';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import ExpenseForm from '@/app/expenses/_components/expense-form';
import type { Transaction } from '@/lib/types';

// Define the shape of our scan record
type ReceiptScan = {
    id: string;
    created_at: string;
    image_path: string;
    scanned_data: {
        vendor?: string;
        date?: string;
        amount?: number;
        description?: string;
        category_guess?: string;
    };
    status: 'pending' | 'processed' | 'rejected';
};

export function ScanInbox({ refreshTrigger }: { refreshTrigger: number }) {
    const [scans, setScans] = useState<ReceiptScan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedScan, setSelectedScan] = useState<ReceiptScan | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { addExpense, categories, vendors } = useData();
    const { toast } = useToast();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchScans = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('receipt_scans')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching scans:", error);
        } else {
            setScans(data as ReceiptScan[]);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchScans();
    }, [fetchScans, refreshTrigger]);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('receipt_scans').delete().eq('id', id);
        if (!error) {
            setScans(prev => prev.filter(s => s.id !== id));
            toast({ title: "Scan Deleted", description: "Removed from inbox." });
        }
    };

    const handleProcess = (scan: ReceiptScan) => {
        setSelectedScan(scan);
        setIsFormOpen(true);
    };

    const handleExpenseSubmit = async (data: Transaction) => {
        if (!selectedScan) return;

        try {
            // 1. Add Expense
            // Remove the fake ID we gave it so addExpense generates a new one (or let it handle it)
            const { id, ...rest } = data;
            await addExpense({
                ...rest,
                receipt: selectedScan.image_path // Link the receipt image!
            } as any);

            // 2. Mark Scan as Processed
            await supabase
                .from('receipt_scans')
                .update({ status: 'processed' })
                .eq('id', selectedScan.id);

            // 3. Update UI
            setScans(prev => prev.filter(s => s.id !== selectedScan.id));
            setIsFormOpen(false);
            setSelectedScan(null);

            toast({ title: "Expense Added", description: "Receipt linked and saved to expenses." });

        } catch (error) {
            console.error("Process Error:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save expense." });
        }
    };

    // Prepare a partial "Transaction" object for the form
    const prefilledTransaction: Transaction | null = selectedScan ? {
        id: `scan-${selectedScan.id}`, // Temporary ID
        date: selectedScan.scanned_data.date || format(new Date(), 'yyyy-MM-dd'),
        amount: selectedScan.scanned_data.amount || 0,
        description: selectedScan.scanned_data.description || selectedScan.scanned_data.vendor || '',
        categoryId: findCategoryId(selectedScan.scanned_data.category_guess),
        vendorId: findVendorId(selectedScan.scanned_data.vendor),
        paymentMethodId: '', // User must select
        classificationId: '', // User must select
        receipt: '',
        remarks: 'Scanned from receipt'
    } : null;

    function findCategoryId(guess?: string) {
        if (!guess) return '';
        // Simple case-insensitive match
        const match = categories.find(c => c.name.toLowerCase().includes(guess.toLowerCase()) || guess.toLowerCase().includes(c.name.toLowerCase()));
        return match ? match.id : '';
    }

    function findVendorId(guess?: string) {
        if (!guess) return undefined;
        const match = vendors.find(v => v.name.toLowerCase() === guess.toLowerCase());
        return match ? match.id : undefined; // Form will allow adding new vendor if not found
    }

    if (loading && scans.length === 0) {
        return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-50" /></div>;
    }

    if (scans.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Your inbox is empty.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4">
                {scans.map((scan) => (
                    <Card key={scan.id} className="overflow-hidden">
                        <CardContent className="p-0 flex">
                            {/* Image Thumbnail (Using Storage URL logic would be better, but user needs to implement getPublicUrl if private bucket) */}
                            {/* For now we skip the image preview in the list to avoid complexity with private buckets signatures here */}
                            <div className="flex-1 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {scan.scanned_data.vendor || "Unknown Vendor"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {scan.scanned_data.date || "No Date"}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-lg font-bold">
                                        ${scan.scanned_data.amount?.toFixed(2) || "0.00"}
                                    </Badge>
                                </div>

                                {scan.scanned_data.category_guess && (
                                    <Badge variant="secondary" className="mb-3 text-xs">
                                        AI Guess: {scan.scanned_data.category_guess}
                                    </Badge>
                                )}

                                <div className="flex gap-2 mt-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleProcess(scan)}
                                    >
                                        Review & Add <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(scan.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Expense Form Dialog */}
            {selectedScan && (
                <ExpenseForm
                    open={isFormOpen}
                    onOpenChange={(open) => {
                        setIsFormOpen(open);
                        if (!open) setSelectedScan(null);
                    }}
                    onSubmitSuccess={handleExpenseSubmit}
                    transaction={prefilledTransaction}
                />
            )}
        </>
    );
}

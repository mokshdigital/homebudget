"use client";

import React, { useState } from 'react';
import { MainLayout } from '@/components/main-layout';
import { Scanner } from './_components/scanner';
import { ScanInbox } from './_components/scan-inbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function ScanPage() {
    const [activeTab, setActiveTab] = useState("new");
    const [refreshInbox, setRefreshInbox] = useState(0);

    const handleScanComplete = () => {
        setRefreshInbox(prev => prev + 1);
        setActiveTab("inbox");
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Receipt Scanner</h1>
                    <p className="text-muted-foreground">
                        Snap a photo of your receipt to automatically log expenses.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="new">Scan New</TabsTrigger>
                        <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    </TabsList>

                    <TabsContent value="new">
                        <Scanner onScanComplete={handleScanComplete} />
                        <div className="text-center text-sm text-muted-foreground mt-4">
                            <p>Scanned items will appear in the <strong>Inbox</strong> tab for your review.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="inbox">
                        <ScanInbox refreshTrigger={refreshInbox} />
                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    );
}

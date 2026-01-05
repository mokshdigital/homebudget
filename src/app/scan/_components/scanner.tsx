"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client'; // Assuming this exists, or use standard import
import { useData } from '@/lib/data-context';

/* 
 * Note: If you don't have a specific supabase client export, 
 * use the generic pattern: createBrowserClient from @supabase/ssr
 */
import { createBrowserClient } from '@supabase/ssr';

export function Scanner({ onScanComplete }: { onScanComplete: () => void }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { currentHome, user } = useData();

    // Create Supabase client locally if not provided by context
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "File too large",
                    description: "Please select an image under 5MB.",
                });
                return;
            }
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processScan = async () => {
        if (!selectedFile || !user || !currentHome) return;

        setIsAnalyzing(true);
        try {
            // 1. Upload Image to Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('receipts')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Convert to Base64 for AI Analysis
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            // 3. Call AI API
            const response = await fetch('/api/scan-receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64 }),
            });

            const aiData = await response.json();

            if (!response.ok) {
                throw new Error(aiData.error || 'AI Analysis failed');
            }

            // 4. Save to receipt_scans table
            const { error: dbError } = await supabase
                .from('receipt_scans')
                .insert({
                    user_id: user.id,
                    home_id: currentHome.id,
                    image_path: fileName,
                    scanned_data: aiData,
                    status: 'pending'
                });

            if (dbError) throw dbError;

            toast({
                title: "Receipt Scanned",
                description: "Added to your inbox for review.",
            });

            handleClear();
            onScanComplete();

        } catch (error: any) {
            console.error("Scan Error:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to process receipt.",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                {!previewUrl ? (
                    <div
                        className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="h-10 w-10 mb-2" />
                        <p>Tap to scan or upload receipt</p>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden max-h-64 aspect-video bg-black/5 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 rounded-full h-8 w-8"
                                onClick={handleClear}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button className="w-full" onClick={processScan} disabled={isAnalyzing}>
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                                </>
                            ) : (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 hidden" /> Analyze & Save
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

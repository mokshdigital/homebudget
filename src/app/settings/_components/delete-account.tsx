"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useData } from '@/lib/data-context';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function DeleteAccount() {
    const { toast } = useToast();
    const { user, signOut } = useData();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') return;

        setIsDeleting(true);
        const supabase = createClient();

        try {
            if (!user) return;

            // 1. Delete all homes owned by the user
            // Because we set ON DELETE CASCADE in the database, 
            // this will automatically delete:
            // - All transactions, incomes, savings, budgets in those homes
            // - All home_members records (including other people's memberships)
            // - All lists (categories, etc.)
            const { error: deleteHomesError } = await supabase
                .from('homes')
                .delete()
                .eq('created_by', user.id);

            if (deleteHomesError) {
                throw new Error(`Failed to delete homes: ${deleteHomesError.message}`);
            }

            // 2. Remove user from any homes they are just a member of (not owner)
            // (Cascading from above should have handled owned homes, but let's be thorough)
            const { error: leaveHomesError } = await supabase
                .from('home_members')
                .delete()
                .eq('user_id', user.id);

            if (leaveHomesError) {
                console.warn('Error leaving other homes:', leaveHomesError);
                // Continue anyway
            }

            // 3. Sign out
            await signOut();

            toast({
                title: 'Account Data Deleted',
                description: 'Your homes and data have been removed. You have been signed out.',
            });

            router.push('/login');

        } catch (error) {
            console.error('Error deleting account:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete account data. Please try again.',
                variant: 'destructive',
            });
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Account Data
                </CardTitle>
                <CardDescription>
                    Permanently delete your homes and all associated data.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Warning:</strong> This action is irreversible.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>All homes you created will be deleted.</li>
                        <li>All budgets, expenses, and income data in those homes will be lost.</li>
                        <li>Any family members invited to your homes will lose access to them.</li>
                        <li>You will be removed from homes created by others.</li>
                    </ul>
                </div>

                <Button
                    variant="destructive"
                    onClick={() => setShowConfirm(true)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete My Account Data
                </Button>

                <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-3" asChild>
                                <div>
                                    <p>
                                        This action cannot be undone. This will permanently delete your homes and remove your data from our servers.
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Type DELETE to confirm:</p>
                                        <Input
                                            value={confirmText}
                                            onChange={(e) => setConfirmText(e.target.value)}
                                            placeholder="DELETE"
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => { setShowConfirm(false); setConfirmText(''); }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteAccount}
                                disabled={confirmText !== 'DELETE' || isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Delete Everything
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

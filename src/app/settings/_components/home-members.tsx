"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { createClient } from '@/lib/supabase/client';
import { Loader2, UserX, Users, Home, Mail, Check, X, Plus, Send } from 'lucide-react';

type PendingInvitation = {
    invitation_id: string;
    home_id: string;
    home_name: string;
    invited_by_email: string;
    invitation_created_at: string;
};

type SentInvitation = {
    id: string;
    email: string;
    status: string;
    created_at: string;
};

export default function HomeMembersSettings() {
    const { toast } = useToast();
    const {
        currentHome,
        homeMembers,
        isOwner,
        user,
        updateHomeName,
        removeMember,
        refreshData,
        createHome,
    } = useData();

    const supabase = createClient() as any;

    // State for home name editing
    const [homeName, setHomeName] = useState(currentHome?.name || '');
    const [isUpdatingName, setIsUpdatingName] = useState(false);

    // State for creating a new home
    const [newHomeName, setNewHomeName] = useState('');
    const [isCreatingHome, setIsCreatingHome] = useState(false);

    // State for pending invitations (received)
    const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
    const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    // State for sent invitations (owner view)
    const [sentInvitations, setSentInvitations] = useState<SentInvitation[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isSendingInvite, setIsSendingInvite] = useState(false);

    // State for removing members
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    // Fetch pending invitations for this user
    useEffect(() => {
        async function fetchInvitations() {
            if (!user) {
                setIsLoadingInvitations(false);
                return;
            }

            setIsLoadingInvitations(true);
            try {
                const { data, error } = await supabase.rpc('get_my_pending_invitations');

                if (error) {
                    console.error('Error fetching invitations:', error.message || error);
                    return;
                }

                setPendingInvitations(data || []);
            } catch (err: any) {
                console.error('Error fetching invitations:', err?.message || err);
            } finally {
                setIsLoadingInvitations(false);
            }
        }
        fetchInvitations();
    }, [user, supabase]);

    // Fetch sent invitations if owner
    useEffect(() => {
        async function fetchSentInvitations() {
            if (!currentHome || !isOwner) return;

            try {
                const { data, error } = await supabase
                    .from('home_invitations')
                    .select('*')
                    .eq('home_id', currentHome.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setSentInvitations(data || []);
            } catch (err) {
                console.error('Error fetching sent invitations:', err);
            }
        }
        fetchSentInvitations();
    }, [currentHome, isOwner, supabase]);

    // Sync home name when currentHome changes
    useEffect(() => {
        setHomeName(currentHome?.name || '');
    }, [currentHome?.name]);

    const handleUpdateName = async () => {
        if (!homeName.trim() || homeName === currentHome?.name) return;

        setIsUpdatingName(true);
        try {
            await updateHomeName(homeName.trim());
            toast({
                title: 'Home Updated',
                description: 'Home name has been updated.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update home name.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingName(false);
        }
    };

    const handleCreateHome = async () => {
        if (!newHomeName.trim()) return;

        setIsCreatingHome(true);
        try {
            await createHome(newHomeName.trim());
            toast({
                title: 'Home Created!',
                description: `Welcome to "${newHomeName}". You can now start tracking your finances.`,
            });
            setNewHomeName('');
        } catch (error) {
            console.error('Error creating home:', error);
            toast({
                title: 'Error',
                description: 'Failed to create home. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsCreatingHome(false);
        }
    };

    const handleAcceptInvitation = async (invitationId: string, homeId: string) => {
        setRespondingTo(invitationId);
        try {
            // 1. Update invitation status
            const { error: updateError } = await (supabase
                .from('home_invitations')
                .update({ status: 'accepted', responded_at: new Date().toISOString() } as any)
                .eq('id', invitationId));

            if (updateError) throw updateError;

            // 2. Add user as member
            const { error: memberError } = await (supabase
                .from('home_members')
                .insert({
                    home_id: homeId,
                    user_id: user!.id,
                    role: 'member',
                    display_name: user!.user_metadata?.full_name || user!.email,
                }) as any);

            if (memberError) throw memberError;

            toast({
                title: 'Welcome!',
                description: 'You have joined the home successfully.',
            });

            // Refresh data to load the new home
            await refreshData();

        } catch (error) {
            console.error('Error accepting invitation:', error);
            toast({
                title: 'Error',
                description: 'Failed to accept invitation.',
                variant: 'destructive',
            });
        } finally {
            setRespondingTo(null);
        }
    };

    const handleDeclineInvitation = async (invitationId: string) => {
        setRespondingTo(invitationId);
        try {
            const { error } = await (supabase
                .from('home_invitations')
                .update({ status: 'declined', responded_at: new Date().toISOString() } as any)
                .eq('id', invitationId));

            if (error) throw error;

            setPendingInvitations(prev => prev.filter(i => i.invitation_id !== invitationId));

            toast({
                title: 'Invitation Declined',
                description: 'You have declined the invitation.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to decline invitation.',
                variant: 'destructive',
            });
        } finally {
            setRespondingTo(null);
        }
    };

    const handleSendInvite = async () => {
        if (!inviteEmail.trim() || !currentHome) return;

        // Basic email validation
        if (!inviteEmail.includes('@')) {
            toast({
                title: 'Invalid Email',
                description: 'Please enter a valid email address.',
                variant: 'destructive',
            });
            return;
        }

        setIsSendingInvite(true);
        try {
            const { error } = await (supabase
                .from('home_invitations')
                .insert({
                    home_id: currentHome.id,
                    email: inviteEmail.trim().toLowerCase(),
                    invited_by: user!.id,
                }) as any);

            if (error) {
                if (error.code === '23505') {
                    toast({
                        title: 'Already Invited',
                        description: 'This email has already been invited.',
                        variant: 'destructive',
                    });
                    return;
                }
                throw error;
            }

            toast({
                title: 'Invitation Sent',
                description: `${inviteEmail} will see the invitation when they log in.`,
            });

            setInviteEmail('');

            // Refresh sent invitations
            const { data } = await supabase
                .from('home_invitations')
                .select('*')
                .eq('home_id', currentHome.id)
                .order('created_at', { ascending: false });
            setSentInvitations(data || []);

        } catch (error) {
            console.error('Error sending invitation:', error);
            toast({
                title: 'Error',
                description: 'Failed to send invitation.',
                variant: 'destructive',
            });
        } finally {
            setIsSendingInvite(false);
        }
    };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        setIsRemoving(true);
        try {
            await removeMember(memberToRemove);
            toast({
                title: 'Member Removed',
                description: 'The member has been removed from your home.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to remove member.',
                variant: 'destructive',
            });
        } finally {
            setIsRemoving(false);
            setMemberToRemove(null);
        }
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
    };

    // NO HOME STATE - Show invitations and create option
    if (!currentHome) {
        return (
            <div className="space-y-6">
                {/* Pending Invitations */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Pending Invitations
                        </CardTitle>
                        <CardDescription>
                            Invitations from other users to join their home.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingInvitations ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : pendingInvitations.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6">
                                No pending invitations.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {pendingInvitations.map((invitation) => (
                                    <div
                                        key={invitation.invitation_id}
                                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                                    >
                                        <div>
                                            <p className="font-medium">{invitation.home_name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Invited by {invitation.invited_by_email}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleAcceptInvitation(invitation.invitation_id, invitation.home_id)}
                                                disabled={respondingTo === invitation.invitation_id}
                                            >
                                                {respondingTo === invitation.invitation_id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeclineInvitation(invitation.invitation_id)}
                                                disabled={respondingTo === invitation.invitation_id}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Home */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Create a New Home
                        </CardTitle>
                        <CardDescription>
                            Start fresh by creating your own home budget.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                value={newHomeName}
                                onChange={(e) => setNewHomeName(e.target.value)}
                                placeholder="Enter home name..."
                                disabled={isCreatingHome}
                            />
                            <Button
                                onClick={handleCreateHome}
                                disabled={isCreatingHome || !newHomeName.trim()}
                            >
                                {isCreatingHome && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // HAS HOME STATE - Show home settings, members, and invite options
    return (
        <div className="space-y-6">
            {/* Home Name */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Home Settings
                    </CardTitle>
                    <CardDescription>
                        Manage your home name and settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            value={homeName}
                            onChange={(e) => setHomeName(e.target.value)}
                            placeholder="Home name"
                            disabled={!isOwner}
                        />
                        {isOwner && (
                            <Button
                                onClick={handleUpdateName}
                                disabled={isUpdatingName || homeName === currentHome.name}
                            >
                                {isUpdatingName && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        )}
                    </div>
                    {!isOwner && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Only the owner can change the home name.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Members */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Members ({homeMembers.length})
                    </CardTitle>
                    <CardDescription>
                        People who have access to this home's budget.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {homeMembers.map((member) => {
                            const isCurrentUser = member.userId === user?.id;
                            const canRemove = isOwner && !isCurrentUser && member.role !== 'owner';

                            return (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {getInitials(member.displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">
                                                {member.displayName || 'Unknown'}
                                                {isCurrentUser && (
                                                    <span className="text-muted-foreground ml-2">(you)</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                        {canRemove && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => setMemberToRemove(member.id)}
                                            >
                                                <UserX className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Invite by Email (Owner only) */}
            {isOwner && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5" />
                            Invite Members
                        </CardTitle>
                        <CardDescription>
                            Invite family members by email. They'll see the invitation when they log in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter email address..."
                                disabled={isSendingInvite}
                            />
                            <Button
                                onClick={handleSendInvite}
                                disabled={isSendingInvite || !inviteEmail.trim()}
                            >
                                {isSendingInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Invite
                            </Button>
                        </div>

                        {/* Sent Invitations */}
                        {sentInvitations.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Sent Invitations</p>
                                <div className="space-y-2">
                                    {sentInvitations.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-2 rounded border text-sm">
                                            <span>{inv.email}</span>
                                            <Badge variant={
                                                inv.status === 'accepted' ? 'default' :
                                                    inv.status === 'declined' ? 'destructive' : 'secondary'
                                            }>
                                                {inv.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Remove Member Dialog */}
            <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove this member? They will no longer have access to the shared budget.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

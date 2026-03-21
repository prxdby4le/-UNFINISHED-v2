import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, Trash2, Link2, Globe, Lock, Loader2 } from 'lucide-react';

interface Share {
    id: number;
    token: string;
    permission: 'view' | 'edit';
    is_active: boolean;
    created_at: string;
}

interface Props {
    projectId: number;
    isPrivate: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPrivacyChange?: (isPrivate: boolean) => void;
}

export function ShareDialog({ projectId, isPrivate, open, onOpenChange, onPrivacyChange }: Props) {
    const [shares, setShares] = useState<Share[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [localPrivate, setLocalPrivate] = useState(isPrivate);

    useEffect(() => {
        setLocalPrivate(isPrivate);
    }, [isPrivate]);

    const fetchShares = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/projects/${projectId}/shares`, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();
            setShares(data.shares || []);
            setLocalPrivate(data.is_private);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (open) fetchShares();
    }, [open, fetchShares]);

    const createLink = async (permission: 'view' | 'edit') => {
        setCreating(true);
        try {
            const res = await fetch(`/projects/${projectId}/shares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
                body: JSON.stringify({ permission }),
            });
            const data = await res.json();
            if (data.share) {
                setShares((prev) => [data.share, ...prev]);
                copyToClipboard(data.share.id, data.url);
            }
        } catch {
            // ignore
        } finally {
            setCreating(false);
        }
    };

    const revokeLink = async (shareId: number) => {
        try {
            await fetch(`/shares/${shareId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
            });
            setShares((prev) => prev.filter((s) => s.id !== shareId));
        } catch {
            // ignore
        }
    };

    const togglePrivacy = async () => {
        setToggling(true);
        try {
            const res = await fetch(`/projects/${projectId}/toggle-privacy`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
                    ),
                },
            });
            const data = await res.json();
            setLocalPrivate(data.is_private);
            onPrivacyChange?.(data.is_private);
        } catch {
            // ignore
        } finally {
            setToggling(false);
        }
    };

    const copyToClipboard = (shareId: number, url?: string) => {
        const shareUrl = url || `${window.location.origin}/share/${shares.find((s) => s.id === shareId)?.token}`;
        navigator.clipboard.writeText(shareUrl);
        setCopiedId(shareId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base font-medium">Compartilhar</DialogTitle>
                    <DialogDescription>
                        Crie links para compartilhar este projeto.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Privacy toggle */}
                    <button
                        onClick={togglePrivacy}
                        disabled={toggling}
                        className="flex w-full items-center gap-3 rounded-lg border border-border/40 p-3 text-left transition-colors hover:bg-muted/30"
                    >
                        {localPrivate ? (
                            <Lock className="size-4 text-muted-foreground" />
                        ) : (
                            <Globe className="size-4 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {localPrivate ? 'Privado' : 'Publico'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {localPrivate
                                    ? 'Links de compartilhamento desativados'
                                    : 'Links de compartilhamento funcionando'}
                            </p>
                        </div>
                        <div
                            className={`relative h-5 w-9 rounded-full transition-colors ${
                                localPrivate ? 'bg-muted' : 'bg-foreground'
                            }`}
                        >
                            <div
                                className={`absolute top-0.5 size-4 rounded-full bg-background shadow transition-transform ${
                                    localPrivate ? 'left-0.5' : 'left-[calc(100%-1.125rem)]'
                                }`}
                            />
                        </div>
                    </button>

                    {/* Create link buttons */}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createLink('view')}
                            disabled={creating || localPrivate}
                            className="flex-1 text-xs"
                        >
                            {creating ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                            ) : (
                                <Link2 className="mr-1 size-3" />
                            )}
                            Link de visualizacao
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => createLink('edit')}
                            disabled={creating || localPrivate}
                            className="flex-1 text-xs"
                        >
                            {creating ? (
                                <Loader2 className="mr-1 size-3 animate-spin" />
                            ) : (
                                <Link2 className="mr-1 size-3" />
                            )}
                            Link de edicao
                        </Button>
                    </div>

                    {/* Links list */}
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : shares.length === 0 ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">
                            Nenhum link criado ainda.
                        </p>
                    ) : (
                        <div className="max-h-48 space-y-1 overflow-y-auto">
                            {shares.map((share) => (
                                <div
                                    key={share.id}
                                    className="group flex items-center gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted/30"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-mono text-muted-foreground">
                                            /share/{share.token.slice(0, 8)}...
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/60">
                                            {share.permission === 'view' ? 'Visualizacao' : 'Edicao'} &middot; {formatDate(share.created_at)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground"
                                        onClick={() => copyToClipboard(share.id)}
                                    >
                                        {copiedId === share.id ? (
                                            <Check className="size-3 text-green-500" />
                                        ) : (
                                            <Copy className="size-3" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground hover:text-destructive"
                                        onClick={() => revokeLink(share.id)}
                                    >
                                        <Trash2 className="size-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type Feedback } from '@/repositories/feedbackRepository';
import EmptyState from '@/components/EmptyState';
import { Send, Edit, Trash2, MessageSquare } from 'lucide-react';

interface Props {
    audioVersionId: number;
    feedback: Feedback[];
    count: number;
    currentUserId?: number;
}

function formatTimestamp(seconds?: number): string {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function timeAgo(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString('pt-BR');
}

export default function FeedbackIndex({ audioVersionId, feedback, count, currentUserId }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        timestamp_seconds: undefined as number | undefined,
    });

    const editForm = useForm({
        content: '',
        timestamp_seconds: undefined as number | undefined,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/audio-versions/${audioVersionId}/feedback`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleEdit = (item: Feedback) => {
        setEditingId(item.id);
        editForm.setData({
            content: item.content,
            timestamp_seconds: item.timestamp_seconds || undefined,
        });
    };

    const handleUpdate = (id: number) => {
        editForm.post(`/feedback/${id}`, {
            _method: 'PUT',
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this comment?')) {
            router.delete(`/feedback/${id}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Feedback" />
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-light tracking-tight">Feedback</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {count} comment{count !== 1 ? 's' : ''}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-3">
                    <textarea
                        value={data.content || ''}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Leave a comment..."
                        className="w-full resize-none rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:border-border focus:outline-none"
                        rows={3}
                        required
                        minLength={3}
                    />
                    <InputError message={errors.content} />
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            min="0"
                            value={data.timestamp_seconds || ''}
                            onChange={(e) =>
                                setData('timestamp_seconds', e.target.value ? parseInt(e.target.value) : undefined)
                            }
                            placeholder="Timestamp (s)"
                            className="w-32 border-border/40"
                        />
                        <Button type="submit" size="sm" disabled={processing}>
                            <Send className="mr-1.5 size-3" />
                            {processing ? 'Sending...' : 'Send'}
                        </Button>
                    </div>
                </form>

                {feedback.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="No feedback yet"
                        description="Be the first to comment"
                    />
                ) : (
                    <div className="space-y-4">
                        {feedback.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs">
                                    {item.user?.profile?.full_name?.[0] || item.user?.name?.[0] || 'U'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    {editingId === item.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={editForm.data.content || ''}
                                                onChange={(e) => editForm.setData('content', e.target.value)}
                                                className="w-full resize-none rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm focus:outline-none"
                                                rows={3}
                                            />
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleUpdate(item.id)} disabled={editForm.processing}>
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-sm font-medium">
                                                    {item.user?.profile?.full_name || item.user?.name || 'User'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {timeAgo(item.created_at)}
                                                </span>
                                                {item.timestamp_seconds != null && (
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        @{formatTimestamp(item.timestamp_seconds)}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm text-foreground/80">{item.content}</p>
                                            {item.user_id === currentUserId && (
                                                <div className="mt-1 flex gap-1">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        Edit
                                                    </button>
                                                    <span className="text-xs text-muted-foreground">&middot;</span>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-xs text-muted-foreground hover:text-destructive"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

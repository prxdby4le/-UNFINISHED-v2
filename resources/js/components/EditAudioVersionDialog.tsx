import { useEffect, useState, FormEventHandler, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { audioRepository, type AudioVersion } from '@/repositories/audioRepository';
import { Upload, CheckCircle2, Clock, PlayCircle } from 'lucide-react';

interface Props {
    version: AudioVersion | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditAudioVersionDialog({ version, open, onOpenChange, onSuccess }: Props) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: version?.name || '',
    });

    const [history, setHistory] = useState<AudioVersion[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadHistory = async () => {
        if (!version) return;
        setIsLoadingHistory(true);
        try {
            const data = await audioRepository.getVersionHistory(version.id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (version && open) {
            setData('name', version.name || '');
            loadHistory();
        } else {
            setHistory([]);
            reset();
        }
    }, [version, open]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!version) return;

        put(`/audio-versions/${version.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !version) return;
        
        setIsUploading(true);
        audioRepository.uploadNewVersion(version.id, file, () => {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            loadHistory();
            onSuccess?.();
        });
    };

    const handleSetActive = (id: number) => {
        audioRepository.setActiveVersion(id, () => {
            loadHistory();
            onSuccess?.();
        });
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Faixa</DialogTitle>
                    <DialogDescription>
                        Atualize as informações ou gerencie as diferentes versões deste áudio.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Basic Info Form */}
                    <form id="edit-track-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome da Faixa</Label>
                            <Input
                                id="name"
                                value={data.name || ''}
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1"
                            />
                            <InputError message={errors.name} />
                        </div>
                    </form>

                    {/* Version History */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Histórico de Versões</Label>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".wav,.flac,.mp3,.aiff,.m4a"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isUploading}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-8 text-xs"
                                >
                                    <Upload className="mr-2 size-3" />
                                    {isUploading ? 'Enviando...' : 'Nova Versão'}
                                </Button>
                            </div>
                        </div>

                        {isLoadingHistory && history.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Carregando histórico...</p>
                        ) : (
                            <div className="space-y-2">
                                {history.map((hItem) => (
                                    <div 
                                        key={hItem.id} 
                                        className={`flex items-center justify-between p-3 rounded-lg border ${hItem.is_active ? 'border-primary/50 bg-primary/5' : 'border-border/40 bg-muted/20'}`}
                                    >
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm truncate">
                                                    {hItem.original_filename || hItem.name}
                                                </span>
                                                {hItem.is_active && (
                                                    <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                                        <CheckCircle2 className="size-3" /> Atual
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {formatDate(hItem.created_at)}
                                                </span>
                                                <span>&middot;</span>
                                                <span className="uppercase font-mono">{hItem.format || 'unknown'}</span>
                                            </div>
                                        </div>

                                        {!hItem.is_active && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="shrink-0 h-7 text-xs"
                                                onClick={() => handleSetActive(hItem.id)}
                                            >
                                                Tornar Ativa
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-0 sm:justify-end border-t border-border/50 pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                    <Button type="submit" form="edit-track-form" disabled={processing}>
                        {processing ? 'Salvando...' : 'Salvar Nome'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

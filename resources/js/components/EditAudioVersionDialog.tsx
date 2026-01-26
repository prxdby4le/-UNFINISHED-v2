import { useEffect, FormEventHandler } from 'react';
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
import { type AudioVersion } from '@/repositories/audioRepository';

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

    // Update form data when version changes
    useEffect(() => {
        if (version && open) {
            setData('name', version.name || '');
        }
    }, [version, open]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!version) return;

        put(`/audio-versions/${version.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Faixa</DialogTitle>
                    <DialogDescription>
                        Atualize o nome e outras informações da faixa.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
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
                        {version && (
                            <div className="text-sm text-muted-foreground">
                                <p>Formato: <span className="uppercase font-mono">{version.format || 'unknown'}</span></p>
                                <p>Duração: {version.duration ? `${Math.floor(version.duration / 60)}:${String(version.duration % 60).padStart(2, '0')}` : 'N/A'}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

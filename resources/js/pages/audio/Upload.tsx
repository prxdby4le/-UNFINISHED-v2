import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Upload as UploadIcon, X, Check } from 'lucide-react';

interface Props {
    projectId: number;
}

interface FileWithProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

function formatSize(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

export default function AudioUpload({ projectId }: Props) {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return;
        const validExtensions = ['.wav', '.flac', '.mp3', '.aiff', '.m4a'];
        const newFiles: FileWithProgress[] = Array.from(fileList)
            .filter((file) => {
                const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                return validExtensions.includes(ext);
            })
            .map((file) => ({ file, progress: 0, status: 'pending' as const }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const uploadFiles = () => {
        const pending = files.filter((f) => f.status === 'pending');
        if (pending.length === 0) return;

        setProcessing(true);
        setFiles((prev) =>
            prev.map((f) =>
                f.status === 'pending' ? { ...f, status: 'uploading' as const } : f,
            ),
        );

        const formData = new FormData();
        pending.forEach(({ file }) => formData.append('files[]', file));

        router.post(`/projects/${projectId}/audio-versions`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onProgress: (progress) => {
                const pct = progress.percentage ?? 0;
                setFiles((prev) =>
                    prev.map((f) =>
                        f.status === 'uploading' ? { ...f, progress: pct } : f,
                    ),
                );
            },
            onSuccess: () => {
                setFiles((prev) =>
                    prev.map((f) =>
                        f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f,
                    ),
                );
                setProcessing(false);
                setTimeout(() => router.visit(`/projects/${projectId}`), 800);
            },
            onError: (errors) => {
                const msg = Object.values(errors).flat().join(', ') || 'Falha no upload';
                setFiles((prev) =>
                    prev.map((f) =>
                        f.status === 'uploading'
                            ? { ...f, status: 'error' as const, error: msg }
                            : f,
                    ),
                );
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Upload" />
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-light tracking-tight">Upload</h1>

                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                    className={`flex flex-col items-center justify-center rounded-xl border border-dashed py-10 transition-colors sm:py-16 ${
                        isDragging ? 'border-foreground/30 bg-muted/30' : 'border-border/40'
                    }`}
                >
                    <UploadIcon className="size-6 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                        Solte os arquivos de áudio aqui ou{' '}
                        <label htmlFor="file-input" className="cursor-pointer underline underline-offset-4 hover:text-foreground">
                            procure
                        </label>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">WAV, FLAC, MP3, AIFF, M4A</p>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept="audio/*,.wav,.flac,.mp3,.aiff,.m4a"
                        onChange={(e) => handleFiles(e.target.files)}
                        className="hidden"
                    />
                </div>

                {files.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                {files.length} arquivo{files.length !== 1 ? 's' : ''} selecionado{files.length !== 1 ? 's' : ''}
                            </p>
                            <Button
                                size="sm"
                                onClick={uploadFiles}
                                disabled={processing}
                                className="bg-foreground text-background hover:bg-foreground/90"
                            >
                                {processing ? 'Enviando...' : 'Enviar Todos'}
                            </Button>
                        </div>

                        <div className="divide-y divide-border/30">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 py-2.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm">{f.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
                                    </div>
                                    {f.status === 'success' && <Check className="size-4 text-green-500 flex-shrink-0" />}
                                    {f.status === 'error' && (
                                        <span className="flex-shrink-0 text-xs text-destructive">{f.error}</span>
                                    )}
                                    {f.status === 'uploading' && (
                                        <div className="flex flex-shrink-0 items-center gap-2">
                                            <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-foreground transition-[width] duration-200"
                                                    style={{ width: `${f.progress}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                                                {f.progress}%
                                            </span>
                                        </div>
                                    )}
                                    {f.status === 'pending' && (
                                        <button className="flex-shrink-0" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>
                                            <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

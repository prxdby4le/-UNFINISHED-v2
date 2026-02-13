import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { audioRepository } from '@/repositories/audioRepository';
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

export default function AudioUpload({ projectId }: Props) {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleFiles = useCallback((fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles: FileWithProgress[] = Array.from(fileList)
            .filter((file) => {
                const validTypes = ['audio/wav', 'audio/flac', 'audio/mpeg', 'audio/aiff', 'audio/mp4', 'audio/x-m4a'];
                const validExtensions = ['.wav', '.flac', '.mp3', '.aiff', '.m4a'];
                const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                return validTypes.includes(file.type) || validExtensions.includes(extension);
            })
            .map((file) => ({
                file,
                progress: 0,
                status: 'pending' as const,
            }));

        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    }, [handleFiles]);

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadFiles = async () => {
        const pendingFiles = files.filter((f) => f.status === 'pending');
        if (pendingFiles.length === 0) return;

        setProcessing(true);
        setFiles((prev) =>
            prev.map((f) =>
                f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f
            )
        );

        try {
            const formData = new FormData();
            pendingFiles.forEach(({ file }) => formData.append('files[]', file));

            await router.post(`/projects/${projectId}/audio-versions`, formData, {
                forceFormData: true,
                preserveScroll: true,
            });

            setFiles((prev) =>
                prev.map((f) => (f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f))
            );

            setTimeout(() => router.visit(`/projects/${projectId}`), 500);
        } catch (error) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.status === 'uploading'
                        ? {
                              ...f,
                              status: 'error' as const,
                              error: error instanceof Error ? error.message : 'Erro ao fazer upload',
                          }
                        : f
                )
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Upload de Áudio" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-2xl font-bold">Upload de Áudio</h1>
                    <p className="text-muted-foreground">Adicione versões de áudio ao projeto</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Selecionar Arquivos</CardTitle>
                        <CardDescription>
                            Arraste arquivos aqui ou clique para selecionar (WAV, FLAC, MP3, AIFF, M4A)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragging
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted-foreground/25'
                            }`}
                        >
                            <UploadIcon className="mx-auto size-12 text-muted-foreground mb-4" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Arraste arquivos de áudio aqui ou
                            </p>
                            <label htmlFor="file-input">
                                <Button type="button" variant="outline" asChild>
                                    <span>Selecionar Arquivos</span>
                                </Button>
                            </label>
                            <input
                                id="file-input"
                                type="file"
                                multiple
                                accept="audio/*,.wav,.flac,.mp3,.aiff,.m4a"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </div>

                        {files.length > 0 && (
                            <div className="mt-6 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">Arquivos Selecionados ({files.length})</h3>
                                    <Button onClick={uploadFiles} disabled={processing}>
                                        {processing ? 'Enviando...' : 'Enviar Todos'}
                                    </Button>
                                </div>

                                {files.map((fileWithProgress, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 rounded-lg border p-4"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{fileWithProgress.file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(fileWithProgress.file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {fileWithProgress.status === 'uploading' && (
                                                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${fileWithProgress.progress}%` }}
                                                    />
                                                </div>
                                            )}
                                            {fileWithProgress.status === 'success' && (
                                                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                                                    <Check className="size-4" />
                                                    Enviado com sucesso
                                                </p>
                                            )}
                                            {fileWithProgress.status === 'error' && (
                                                <p className="text-sm text-destructive mt-1">
                                                    {fileWithProgress.error}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFile(index)}
                                            disabled={fileWithProgress.status === 'uploading'}
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <Card className="max-w-md w-full">
                        <CardContent className="p-6">
                            <Alert variant="error" className="mb-4">
                                <AlertTitle>Algo deu errado</AlertTitle>
                                <AlertDescription>
                                    {this.state.error?.message || 'Ocorreu um erro inesperado'}
                                </AlertDescription>
                            </Alert>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Recarregar página
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => (window.location.href = '/')}
                                >
                                    Ir para início
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

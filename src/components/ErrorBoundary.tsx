import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/logger";

// =====================================================
// ERROR BOUNDARY COMPONENT
// =====================================================
// Catches React rendering errors and displays fallback UI
// =====================================================

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Log the error
        logger.error("React Error Boundary caught an error", error, {
            componentStack: errorInfo.componentStack,
        });

        // Call optional error handler
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = (): void => {
        window.location.href = "/";
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="h-8 w-8 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">Something went wrong</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground text-center">
                                We encountered an unexpected error. Please try again or return to the home page.
                            </p>

                            {/* Error details in development */}
                            {import.meta.env?.DEV && this.state.error && (
                                <div className="p-3 bg-muted rounded-md overflow-auto max-h-40">
                                    <p className="text-xs font-mono text-destructive">
                                        {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo?.componentStack && (
                                        <pre className="text-xs font-mono text-muted-foreground mt-2 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 justify-center pt-2">
                                <Button variant="outline" onClick={this.handleReset}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button onClick={this.handleGoHome}>
                                    <Home className="h-4 w-4 mr-2" />
                                    Go Home
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

// ------------------- Hook-Based Error Boundary Wrapper -------------------

interface ErrorBoundaryWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

/**
 * Functional wrapper for ErrorBoundary with reset on route change
 */
export function AppErrorBoundary({ children, fallback }: ErrorBoundaryWrapperProps) {
    return (
        <ErrorBoundary fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
}

export default ErrorBoundary;

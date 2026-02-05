'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log errors to console in development
        // In production, this should send to an error tracking service like Sentry
        if (process.env.NODE_ENV === 'development') {
            console.error('Application Error:', error);
        }
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="glass-card p-8 rounded-2xl border border-red-500/30">
                    {/* Error Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>

                    {/* Error Message */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Something went wrong!
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {error.message || 'An unexpected error occurred. Please try again.'}
                    </p>

                    {/* Error Digest (for debugging) */}
                    {error.digest && (
                        <p className="text-xs text-gray-600 mb-6 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-6 py-3 bg-neon-cyan/20 text-neon-cyan rounded-xl hover:bg-neon-cyan/30 transition-colors font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <a
                            href="/"
                            className="flex items-center gap-2 px-6 py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedPlayerImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
    sizes?: string;
    quality?: number;
}

// Base64 blur placeholder (small gray image)
const BLUR_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTJlIi8+PC9zdmc+';

const FALLBACK_IMAGE = '/placeholder-player.png';

export function OptimizedPlayerImage({
    src,
    alt,
    fill = false,
    width,
    height,
    priority = false,
    className,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality = 75,
}: OptimizedPlayerImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleError = useCallback(() => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(FALLBACK_IMAGE);
        }
    }, [hasError]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const imageProps = {
        src: imgSrc,
        alt,
        quality,
        priority,
        loading: priority ? ('eager' as const) : ('lazy' as const),
        placeholder: 'blur' as const,
        blurDataURL: BLUR_DATA_URL,
        onError: handleError,
        onLoad: handleLoad,
        className: cn(
            'object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
        ),
    };

    return (
        <div className="relative overflow-hidden w-full h-full">
            {fill ? (
                <Image {...imageProps} fill sizes={sizes} />
            ) : (
                <Image {...imageProps} width={width} height={height} />
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* Error state overlay */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark-800/80">
                    <svg
                        className="w-8 h-8 text-dark-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
}

// Optimized flag image component
export function OptimizedFlagImage({
    src,
    alt,
    className,
    size = 24,
}: {
    src: string;
    alt: string;
    className?: string;
    size?: number;
}) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={size}
            height={Math.round(size * 0.75)}
            quality={80}
            loading="lazy"
            onError={() => setImgSrc('/placeholder-flag.png')}
            className={cn('object-cover rounded-sm', className)}
        />
    );
}

// Optimized club badge component
export function OptimizedBadgeImage({
    src,
    alt,
    className,
    size = 32,
}: {
    src: string;
    alt: string;
    className?: string;
    size?: number;
}) {
    const [imgSrc, setImgSrc] = useState(src);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={size}
            height={size}
            quality={80}
            loading="lazy"
            onError={() => setImgSrc('/placeholder-badge.png')}
            className={cn('object-contain', className)}
        />
    );
}

import React, { memo, useMemo } from 'react';

import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

type SkeletonProps = {
    width?: DimensionValue;
    height?: DimensionValue;
    radius?: number;
    /**
     * Warna dasar skeleton. Default mengikuti tampilan gray yang lembut.
     */
    baseColor?: string;
    /**
     * Warna highlight shimmer.
     */
    highlightColor?: string;
    /**
     * Matikan animasi (mis. low-end device / prefer reduce motion).
     */
    animate?: boolean;
    /**
     * Durasi satu loop shimmer (ms).
     */
    durationMs?: number;
    style?: StyleProp<ViewStyle>;
    className?: string;
};

export const Skeleton = memo(function Skeleton({
    width = '100%',
    height = 12,
    radius = 12,
    baseColor = '#E5E7EB', // gray-200
    highlightColor = '#F3F4F6', // gray-100
    animate = true,
    durationMs = 1100,
    style,
    className,
}: SkeletonProps) {
    const gradientColors = useMemo(
        () => [baseColor, highlightColor, baseColor] as const,
        [baseColor, highlightColor]
    );

    // Lebar shimmer dibuat konstan supaya animasi tetap ringan tanpa perlu onLayout.
    const SHIMMER_WIDTH = 260;

    return (
        <View
            className={className}
            style={[
                {
                    width,
                    height,
                    borderRadius: radius,
                    backgroundColor: baseColor,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            {animate ? (
                <MotiView
                    from={{ translateX: -SHIMMER_WIDTH }}
                    animate={{ translateX: SHIMMER_WIDTH }}
                    transition={{
                        type: 'timing',
                        duration: durationMs,
                        loop: true,
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: -SHIMMER_WIDTH,
                        width: SHIMMER_WIDTH * 2,
                        opacity: 0.9,
                    }}
                >
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                    />
                </MotiView>
            ) : null}
        </View>
    );
});

export const SkeletonCircle = memo(function SkeletonCircle({
    size = 40,
    ...props
}: Omit<SkeletonProps, 'width' | 'height' | 'radius'> & { size?: number }) {
    return <Skeleton width={size} height={size} radius={size / 2} {...props} />;
});

export const SkeletonText = memo(function SkeletonText({
    lines = 3,
    lineHeight = 12,
    gap = 8,
    lastLineWidth = '60%',
    ...props
}: Omit<SkeletonProps, 'height'> & {
    lines?: number;
    lineHeight?: number;
    gap?: number;
    lastLineWidth?: DimensionValue;
}) {
    const items = useMemo(() => Array.from({ length: Math.max(1, lines) }, (_, i) => i), [lines]);

    return (
        <View style={{ gap }}>
            {items.map((i) => (
                <Skeleton
                    key={i}
                    height={lineHeight}
                    width={i === items.length - 1 ? lastLineWidth : props.width ?? '100%'}
                    {...props}
                />
            ))}
        </View>
    );
});


import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { STATUS_STYLES } from "@/assets/data/Data";

export default function Badge({ status, label, className }: BadgeProps) {
    const styles = STATUS_STYLES[status];

    return (
        <View
            className={[
                'px-2.5 py-0.5 rounded-full items-center justify-center self-start',
                styles.container,
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <Text
                className={[
                    'text-[10px] font-semibold',
                    styles.text,
                ].join(' ')}
            >
                {label || styles.defaultLabel}
            </Text>
        </View>
    );
}

export function StatusPill({ status }: { status: TxStatus }) {
    const badgeStatus: BadgeStatus =
        status === 'completed'
            ? 'success'
            : status === 'pending'
                ? 'pending'
                : status === 'cancelled'
                    ? 'canceled'
                    : 'failed';

    const label =
        status === 'completed'
            ? 'Completed'
            : status === 'pending'
                ? 'Pending'
                : status === 'cancelled'
                    ? 'Cancelled'
                    : 'Return';

    return <Badge status={badgeStatus} label={label} />;
}

export function FilterPill({
    label,
    active,
    onPress,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            className={[
                'px-5 py-3 rounded-2xl border',
                active ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200',
            ].join(' ')}
        >
            <Text className={active ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

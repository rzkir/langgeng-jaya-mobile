import React from 'react';

import { Text, View } from 'react-native';

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


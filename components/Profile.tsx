import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

export function getInitials(name?: string) {
    const cleaned = (name || '').trim();
    if (!cleaned) return 'GU';
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return `${first}${last}`.toUpperCase() || 'GU';
}

export function SectionHeader({
    title,
    subtitle,
    actionLabel,
    onPressAction,
}: {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onPressAction?: () => void;
}) {
    return (
        <View className="flex-row items-end justify-between mb-3">
            <View className="flex-1 pr-3">
                <Text className="text-base font-bold text-slate-900">{title}</Text>
                {!!subtitle && (
                    <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
                )}
            </View>
            {!!actionLabel && !!onPressAction && (
                <TouchableOpacity activeOpacity={0.7} onPress={onPressAction}>
                    <Text className="text-sm font-semibold text-purple-600">
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function Card({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {children}
        </View>
    );
}

export function StatCard({
    icon,
    iconBgClassName,
    iconColor,
    label,
    value,
    loading,
    valueClassName,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconBgClassName: string;
    iconColor: string;
    label: string;
    value: string;
    loading?: boolean;
    valueClassName?: string;
}) {
    return (
        <View className="flex-1 bg-white rounded-3xl border border-slate-100 p-4">
            <View className="flex-row items-center justify-between">
                <View
                    className={`w-10 h-10 rounded-2xl items-center justify-center ${iconBgClassName}`}
                >
                    <Ionicons name={icon} size={18} color={iconColor} />
                </View>
                {loading ? (
                    <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                    <Text
                        className={`text-lg font-bold text-slate-900 ${valueClassName || ''}`}
                    >
                        {value}
                    </Text>
                )}
            </View>
            <Text className="text-xs text-slate-500 mt-3">{label}</Text>
        </View>
    );
}

export function Row({
    icon,
    iconBgClassName,
    iconColor,
    title,
    subtitle,
    right,
    onPress,
    danger,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconBgClassName: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    danger?: boolean;
}) {
    const content = (
        <View className="flex-row items-center px-4 py-4">
            <View
                className={`w-10 h-10 rounded-2xl items-center justify-center ${iconBgClassName}`}
            >
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <View className="flex-1 ml-3">
                <Text
                    className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-slate-900'}`}
                >
                    {title}
                </Text>
                {!!subtitle && (
                    <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
                )}
            </View>
            {right ?? (
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            )}
        </View>
    );

    if (!onPress) return content;

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            {content}
        </TouchableOpacity>
    );
}

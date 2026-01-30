import React, { useMemo } from 'react';

import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import appJson from '@/app.json';

import { useAuth } from '@/context/AuthContext';

import { formatRupiah } from '@/lib/FormatPrice';

import { useProfileStats } from '@/services/useProfileStats';

function getInitials(name?: string) {
    const cleaned = (name || '').trim();
    if (!cleaned) return 'GU';
    const parts = cleaned.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
    return `${first}${last}`.toUpperCase() || 'GU';
}

function SectionHeader({
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

function Card({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {children}
        </View>
    );
}

function StatCard({
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

function Row({
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

export default function Profile() {
    const { user, isLoading, logout } = useAuth();
    const {
        salesManaged,
        clientsServed,
        isLoading: transactionsLoading,
        isRefetching: refreshing,
        refetch,
    } = useProfileStats();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    // Format role type for display
    const formatRole = (roleType?: string) => {
        if (!roleType) return 'USER';
        return roleType.toUpperCase().replace('_', ' ');
    };

    const userData = useMemo(() => {
        return {
            name: user?.name || 'Guest User',
            email: user?.email || 'No email',
            role: formatRole(user?.roleType),
            phone: '—',
            storeLocation: user?.branchName || 'No branch assigned',
            salesManaged: formatRupiah(salesManaged),
            clientsServed: clientsServed.toLocaleString('id-ID'),
            appearance: 'Light',
            appVersion: `${appJson.expo.name} v${appJson.expo.version}`,
            lastSync: 'Just now',
        };
    }, [clientsServed, salesManaged, user?.email, user?.name, user?.roleType, user?.branchName]);

    if (isLoading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="text-slate-600 mt-4">Loading profile...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 18 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refetch}
                        tintColor="#7C3AED"
                    />
                }
            >
                {/* Profile header */}
                <View className="px-4 mt-2">
                    <Card>
                        <View className="px-5 pt-5 pb-4">
                            <View className="flex-row items-start justify-between">
                                <View className="flex-row flex-1 pr-3">
                                    <View className="w-14 h-14 rounded-2xl bg-purple-100 items-center justify-center">
                                        <Text className="text-purple-700 font-extrabold text-lg">
                                            {getInitials(userData.name)}
                                        </Text>
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-base font-bold text-slate-900">
                                            {userData.name}
                                        </Text>
                                        <Text className="text-xs text-slate-500 mt-0.5">
                                            {userData.email}
                                        </Text>

                                        <View className="flex-row flex-wrap mt-3">
                                            <View className="bg-purple-100 px-3 py-1 rounded-full mr-2 mb-2">
                                                <Text className="text-[10px] font-bold text-purple-700">
                                                    {userData.role}
                                                </Text>
                                            </View>
                                            <View className="bg-slate-100 px-3 py-1 rounded-full mb-2">
                                                <Text className="text-[10px] font-bold text-slate-700">
                                                    {userData.storeLocation}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    className="w-10 h-10 rounded-2xl bg-slate-100 items-center justify-center"
                                    onPress={() =>
                                        Alert.alert(
                                            'Edit profile',
                                            'Coming soon.'
                                        )
                                    }
                                >
                                    <Ionicons name="create-outline" size={18} color="#475569" />
                                </TouchableOpacity>
                            </View>

                            <View className="mt-4 pt-4 border-t border-slate-100 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={16} color="#64748B" />
                                    <Text className="text-xs text-slate-500 ml-2">
                                        Last sync: {userData.lastSync}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
                </View>

                {/* Today stats */}
                <View className="px-4 mt-6">
                    <SectionHeader
                        title="Today"
                        subtitle="Completed transactions only"
                    />
                    <View className="flex-row gap-3">
                        <StatCard
                            icon="cash-outline"
                            iconBgClassName="bg-purple-100"
                            iconColor="#7C3AED"
                            label="Sales managed"
                            value={userData.salesManaged}
                            loading={transactionsLoading}
                            valueClassName="text-purple-700"
                        />
                        <StatCard
                            icon="people-outline"
                            iconBgClassName="bg-cyan-100"
                            iconColor="#0891B2"
                            label="Clients served"
                            value={userData.clientsServed}
                            loading={transactionsLoading}
                            valueClassName="text-cyan-700"
                        />
                    </View>
                </View>

                {/* Account */}
                <View className="px-4 mt-6">
                    <SectionHeader
                        title="Account"
                        subtitle="Personal information"
                        actionLabel="Edit"
                        onPressAction={() =>
                            Alert.alert('Edit profile', 'Coming soon.')
                        }
                    />
                    <Card>
                        <Row
                            icon="mail-outline"
                            iconBgClassName="bg-slate-100"
                            iconColor="#475569"
                            title="Email"
                            subtitle={userData.email}
                            onPress={() => Alert.alert('Email', userData.email)}
                        />
                        <View className="h-px bg-slate-100 mx-4" />
                        <View className="h-px bg-slate-100 mx-4" />
                        <Row
                            icon="location-outline"
                            iconBgClassName="bg-slate-100"
                            iconColor="#475569"
                            title="Branch"
                            subtitle={userData.storeLocation}
                        />
                    </Card>
                </View>

                {/* Preferences */}
                <View className="px-4 mt-6">
                    <SectionHeader title="Preferences" />
                    <Card>
                        <Row
                            icon="notifications-outline"
                            iconBgClassName="bg-purple-100"
                            iconColor="#7C3AED"
                            title="Notifications"
                            subtitle="Receive transaction updates"
                            onPress={() => router.push('/profile/notifications')}
                        />
                        <View className="h-px bg-slate-100 mx-4" />
                        <Row
                            icon="color-palette-outline"
                            iconBgClassName="bg-slate-100"
                            iconColor="#475569"
                            title="Appearance"
                            subtitle={userData.appearance}
                            onPress={() =>
                                Alert.alert('Appearance', 'Coming soon.')
                            }
                        />
                        <View className="h-px bg-slate-100 mx-4" />
                        <Row
                            icon="print-outline"
                            iconBgClassName="bg-slate-100"
                            iconColor="#475569"
                            title="Printer"
                            subtitle="Receipt & thermal printer"
                            onPress={() =>
                                router.push('/profile/printer')
                            }
                        />
                    </Card>
                </View>

                {/* Support */}
                <View className="px-4 mt-6">
                    <SectionHeader title="Support" />
                    <Card>
                        <Row
                            icon="help-circle-outline"
                            iconBgClassName="bg-slate-100"
                            iconColor="#475569"
                            title="Help & Support"
                            subtitle="FAQ and contact"
                            onPress={() => router.push('/profile/faqs')}
                        />
                        <View className="h-px bg-slate-100 mx-4" />
                        <Row
                            icon="shield-checkmark-outline"
                            iconBgClassName="bg-emerald-100"
                            iconColor="#059669"
                            title="Security PIN"
                            subtitle="Protect access to POS"
                            onPress={() =>
                                Alert.alert('Security PIN', 'Coming soon.')
                            }
                        />
                    </Card>
                </View>

                {/* Danger */}
                <View className="px-4 mt-6">
                    <SectionHeader title="Session" />
                    <Card>
                        <Row
                            icon="log-out-outline"
                            iconBgClassName="bg-red-100"
                            iconColor="#DC2626"
                            title="Logout"
                            subtitle="Sign out from this device"
                            danger
                            onPress={handleLogout}
                        />
                    </Card>
                </View>

                {/* Footer */}
                <View className="items-center px-6 mt-6">
                    <Text className="text-xs text-slate-400">{userData.appVersion}</Text>
                </View>
            </ScrollView>
        </View>
    );
}

import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { Ionicons } from '@expo/vector-icons';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/Skelaton';

import { fetchTransactions } from '@/services/FetchTransactions';

import { useAuth } from '@/context/AuthContext';

import { FilterPill, StatusPill } from "@/components/Badge";

import { RefreshControl } from 'react-native-gesture-handler';

export default function Transaction() {
    const [filter, setFilter] = useState<'all' | TxStatus>('all');

    const page = 1;
    const limit = 10;

    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['transactions', branchName, page, limit],
        queryFn: () => fetchTransactions(branchName, page, limit),
        enabled: !!branchName,
    });

    const records: TxRecord[] = useMemo(() => {
        const txs = data?.data ?? [];

        return txs.map((tx) => {
            let itemsCount = 0;
            try {
                const parsed = JSON.parse(tx.items ?? '[]');
                if (Array.isArray(parsed)) itemsCount = parsed.length;
            } catch {
                itemsCount = 0;
            }

            const created = tx.created_at ? new Date(tx.created_at) : null;
            const time = created
                ? created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                : '';

            const customerName = tx.customer_name?.trim() ? tx.customer_name : 'Transaksi Tamu';
            const paymentMethodLabel =
                tx.payment_method === 'cash' ? 'Cash' : tx.payment_method === 'kasbon' ? 'Kasbon' : tx.payment_method;

            return {
                id: tx.id,
                customerName,
                orderCode: tx.transaction_number,
                time,
                amount: tx.total,
                status: tx.status as TxStatus,
                paymentMethodLabel,
                itemsCount,
            };
        });
    }, [data?.data]);

    const stats = useMemo(() => {
        const today = new Date();
        const isSameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        const allTx = data?.data ?? [];

        // Transaksi hari ini
        const todayTx = allTx.filter((tx) => {
            if (!tx.created_at) return false;
            const d = new Date(tx.created_at);
            return isSameDay(d, today);
        });

        const completedToday = todayTx.filter((tx) => tx.status === 'completed');
        const totalSalesToday = completedToday.reduce((sum, tx) => sum + (tx.total ?? 0), 0);
        const ordersToday = completedToday.length;
        const avg = ordersToday > 0 ? totalSalesToday / ordersToday : 0;

        // Bandingkan dengan total sales kemarin untuk persentase naik/turun
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const yesterdayTx = allTx.filter((tx) => {
            if (!tx.created_at) return false;
            const d = new Date(tx.created_at);
            return isSameDay(d, yesterday);
        });

        const completedYesterday = yesterdayTx.filter((tx) => tx.status === 'completed');
        const totalSalesYesterday = completedYesterday.reduce((sum, tx) => sum + (tx.total ?? 0), 0);

        const trendPercent =
            totalSalesYesterday > 0
                ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100
                : null;

        return { totalSalesToday, ordersToday, avg, trendPercent };
    }, [data?.data]);

    const filtered = useMemo(() => {
        if (filter === 'all') return records;
        return records.filter((r) => r.status === filter);
    }, [filter, records]);

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: filtered.length > 0 ? 20 : 0 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => refetch()}
                    />
                }
            >
                <View
                    className="px-4"
                >
                    <View className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <View className="flex-row">
                            <View className="w-1.5 bg-[#7C3AED]" />
                            <View className="flex-1 px-5 py-5">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-xs tracking-widest text-gray-400 font-bold">
                                        TOTAL PENJUALAN HARI INI
                                    </Text>
                                    {isLoading ? (
                                        <Skeleton
                                            width={90}
                                            height={24}
                                            radius={999}
                                            className="rounded-full"
                                        />
                                    ) : stats.trendPercent !== null ? (
                                        <View
                                            className={[
                                                'flex-row items-center px-3 py-1 rounded-full',
                                                stats.trendPercent >= 0 ? 'bg-success-50' : 'bg-error-50',
                                            ].join(' ')}
                                        >
                                            <Ionicons
                                                name={stats.trendPercent >= 0 ? 'trending-up' : 'trending-down'}
                                                size={14}
                                                color={stats.trendPercent >= 0 ? '#059669' : '#DC2626'}
                                            />
                                            <Text
                                                className={[
                                                    'ml-1 text-xs font-semibold',
                                                    stats.trendPercent >= 0 ? 'text-success-700' : 'text-error-700',
                                                ].join(' ')}
                                            >
                                                {stats.trendPercent >= 0 ? '+ ' : '- '}
                                                {Math.abs(stats.trendPercent).toFixed(1)}%
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>

                                {isLoading ? (
                                    <View className="mt-3">
                                        <Skeleton width="70%" height={32} />
                                    </View>
                                ) : (
                                    <Text className="mt-2 text-3xl font-extrabold text-gray-900">
                                        Rp {Math.round(stats.totalSalesToday).toLocaleString('id-ID')}
                                    </Text>
                                )}

                                <View className="mt-4 flex-row gap-3">
                                    <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                        <Text className="text-xs text-gray-500">Pesanan</Text>
                                        {isLoading ? (
                                            <View className="mt-2">
                                                <Skeleton width={40} height={22} />
                                            </View>
                                        ) : (
                                            <Text className="mt-1 text-xl font-bold text-gray-900">
                                                {stats.ordersToday}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                        <Text className="text-xs text-gray-500">Rata-rata Pendapatan</Text>
                                        {isLoading ? (
                                            <View className="mt-2">
                                                <Skeleton width="80%" height={22} />
                                            </View>
                                        ) : (
                                            <Text className="mt-1 text-xl font-bold text-gray-900">
                                                Rp {Math.round(stats.avg).toLocaleString('id-ID')}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mt-5 flex-row gap-3">
                        <FilterPill label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
                        <FilterPill
                            label="Completed"
                            active={filter === 'completed'}
                            onPress={() => setFilter('completed')}
                        />
                        <FilterPill
                            label="Pending"
                            active={filter === 'pending'}
                            onPress={() => setFilter('pending')}
                        />
                    </View>
                </View>

                <View className="px-6 mt-2">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xs tracking-widest text-gray-400 font-bold">CATATAN TERBARU</Text>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => refetch()}
                            className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center"
                        >
                            <Ionicons name="refresh-outline" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4 gap-4">
                        {isLoading && (
                            <View className="gap-4">
                                {[1, 2, 3].map((i) => (
                                    <View
                                        key={i}
                                        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                                    >
                                        <View className="px-5 pt-5">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-row items-center flex-1 pr-3">
                                                    <SkeletonCircle size={48} />
                                                    <View className="ml-3 flex-1">
                                                        <Skeleton width="80%" height={14} />
                                                        <View className="mt-2">
                                                            <SkeletonText lines={1} lineHeight={10} width="60%" />
                                                        </View>
                                                    </View>
                                                </View>
                                                <View className="items-end">
                                                    <Skeleton width={90} height={16} />
                                                    <View className="mt-2">
                                                        <Skeleton width={70} height={18} radius={999} />
                                                    </View>
                                                </View>
                                            </View>
                                        </View>

                                        <View className="mt-4 px-5 pb-5">
                                            <View className="h-[1px] bg-gray-100 mb-4" />
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <SkeletonCircle size={48} />
                                                    <View className="ml-3">
                                                        <Skeleton width={90} height={14} />
                                                        <View className="mt-2">
                                                            <SkeletonText lines={1} lineHeight={10} width={80} />
                                                        </View>
                                                    </View>
                                                </View>
                                                <Skeleton width={60} height={16} />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {!!error && !isLoading && (
                            <View className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                                <Text className="text-error-600 font-semibold">Gagal memuat transaksi</Text>
                                <Text className="text-gray-500 mt-1">
                                    {error instanceof Error ? error.message : 'Unknown error'}
                                </Text>
                            </View>
                        )}

                        {!isLoading && !error && filtered.length === 0 && (
                            <View className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                                <Text className="text-gray-500">Belum ada transaksi.</Text>
                            </View>
                        )}

                        {!isLoading && !error && filtered.map((r) => (
                            <View
                                key={r.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <View className="px-5 pt-5">
                                    <View className="flex-row items-start justify-between">
                                        <View className="flex-row items-center flex-1 pr-3">
                                            <View className="w-12 h-12 rounded-2xl bg-[#EEF2FF] items-center justify-center">
                                                <Ionicons name="person-outline" size={18} color="#4F46E5" />
                                            </View>
                                            <View className="ml-3 flex-1">
                                                <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                                                    {r.customerName}
                                                </Text>
                                                <Text className="text-xs text-gray-400 mt-0.5">
                                                    {r.orderCode} • {r.time}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="items-end">
                                            <Text className="text-base font-extrabold text-[#7C3AED]">
                                                Rp {Math.round(r.amount).toLocaleString('id-ID')}
                                            </Text>
                                            <View className="mt-2">
                                                <StatusPill status={r.status} />
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View className="mt-4 px-5 pb-5">
                                    <View className="h-[1px] bg-gray-100" />

                                    <View className="flex-row items-center justify-between mt-4">
                                        <View className="flex-row items-center">
                                            <View className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center">
                                                <Text className="text-lg font-extrabold text-[#1F2937]">
                                                    {r.paymentMethodLabel.toUpperCase() === 'CASH'
                                                        ? 'CASH'
                                                        : r.paymentMethodLabel.toUpperCase() === 'KASBON'
                                                            ? 'KSB'
                                                            : r.paymentMethodLabel.toUpperCase().slice(0, 3)}
                                                </Text>
                                            </View>

                                            <View className="ml-3">
                                                <Text className="text-base font-extrabold text-gray-900">
                                                    {r.paymentMethodLabel.toUpperCase() === 'VISA'
                                                        ? 'VISA'
                                                        : r.paymentMethodLabel}
                                                </Text>
                                                <Text className="text-xs text-gray-400 mt-0.5">
                                                    Items: {r.itemsCount}
                                                </Text>
                                            </View>
                                        </View>

                                        <TouchableOpacity activeOpacity={0.85} className="flex-row items-center">
                                            <Text className="text-sm font-semibold text-gray-500 mr-1">Details</Text>
                                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
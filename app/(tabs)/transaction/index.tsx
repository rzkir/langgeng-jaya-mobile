import React from 'react';

import { Ionicons } from '@expo/vector-icons';

import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Skeleton, SkeletonCircle, SkeletonText } from '@/components/Skelaton';

import { useStateTransactios } from '@/services/useStateTransactios';

import { StatusPill } from "@/components/Badge";

import { RefreshControl } from 'react-native-gesture-handler';

import BottomSheets from '@/components/BottomSheets';

import { router } from 'expo-router';

export default function Transaction() {
    const {
        filter,
        setFilter,
        isFilterSheetOpen,
        setIsFilterSheetOpen,
        searchQuery,
        setSearchQuery,
        isLoading,
        error,
        refetch,
        isRefetching,
        stats,
        filtered,
    } = useStateTransactios();

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

                    <View className="mt-5 gap-3 flex-row">
                        <View className="relative flex-1">
                            <View className="absolute left-4 top-0 bottom-0 justify-center z-10">
                                <Ionicons name="search-outline" size={20} color="#9CA3AF" />
                            </View>
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Cari berdasarkan nama atau ID transaksi..."
                                placeholderTextColor="#9CA3AF"
                                className="pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-900"
                                style={{ fontSize: 14 }}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => setSearchQuery('')}
                                    className="absolute right-4 top-0 bottom-0 justify-center"
                                >
                                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setIsFilterSheetOpen(true)}
                            className="px-5 py-3 rounded-2xl border border-gray-200 bg-white flex-row items-center justify-between"
                        >
                            <Text className="text-gray-700 font-semibold">
                                {filter === 'all' ? 'All' : filter === 'completed' ? 'Completed' : 'Pending'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="px-6 mt-2">
                    <Text className="text-base tracking-widest text-gray-400 font-bold mt-4 pl-2 border-l-2 border-gray-600">CATATAN TERBARU</Text>

                    <View className="mt-6 gap-4">
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
                                <Text className="text-gray-500">
                                    {searchQuery.trim() || filter !== 'all'
                                        ? 'Tidak ada transaksi yang sesuai dengan filter.'
                                        : 'Belum ada transaksi.'}
                                </Text>
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
                                                {r.paymentMethodLabel.toUpperCase() === 'CASH' ? (
                                                    <Ionicons name="cash-outline" size={24} color="#1F2937" />
                                                ) : r.paymentMethodLabel.toUpperCase() === 'KASBON' ? (
                                                    <Ionicons name="receipt-outline" size={24} color="#1F2937" />
                                                ) : (
                                                    <Text className="text-lg font-extrabold text-[#1F2937]">
                                                        {r.paymentMethodLabel.toUpperCase().slice(0, 3)}
                                                    </Text>
                                                )}
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

                                        <TouchableOpacity activeOpacity={0.85} className="flex-row items-center" onPress={() => router.push(`/transactions/${r.id}`)}>
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

            <BottomSheets
                visible={isFilterSheetOpen}
                onClose={() => setIsFilterSheetOpen(false)}
                title="Filter Transaksi"
            >
                <View className="pb-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`py-4 border-b border-gray-100 ${filter === 'all' ? 'bg-gray-50' : ''}`}
                        onPress={() => {
                            setFilter('all');
                            setIsFilterSheetOpen(false);
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text className={`font-medium ${filter === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>
                                All
                            </Text>
                            {filter === 'all' && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`py-4 border-b border-gray-100 ${filter === 'completed' ? 'bg-gray-50' : ''}`}
                        onPress={() => {
                            setFilter('completed');
                            setIsFilterSheetOpen(false);
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text className={`font-medium ${filter === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>
                                Completed
                            </Text>
                            {filter === 'completed' && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`py-4 ${filter === 'pending' ? 'bg-gray-50' : ''}`}
                        onPress={() => {
                            setFilter('pending');
                            setIsFilterSheetOpen(false);
                        }}
                    >
                        <View className="flex-row items-center justify-between">
                            <Text className={`font-medium ${filter === 'pending' ? 'text-gray-900' : 'text-gray-600'}`}>
                                Pending
                            </Text>
                            {filter === 'pending' && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                        </View>
                    </TouchableOpacity>
                </View>
            </BottomSheets>
        </View>
    );
}
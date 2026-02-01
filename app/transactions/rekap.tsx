import React from 'react'

import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg'

import BottomSheets from '@/components/BottomSheets'

import { useStateAllTransactions } from '@/services/useStateAllTransactions'

import { Ionicons } from '@expo/vector-icons'

import { router } from 'expo-router'

import { formatShortAmount } from "@/assets/data/Data"

export default function Rekap() {
    const {
        records,
        filterMonth,
        setFilterMonth,
        availableMonths,
        MONTH_NAMES,
        isMonthSheetOpen,
        setIsMonthSheetOpen,
        isLoading,
        error,
        refetch,
        isRefetching,
        byMonth,
        totalAmount,
        totalCount,
        avg,
        topMonth,
        chartData,
        filteredStats,
        topProducts,
    } = useStateAllTransactions()

    const screenWidth = Dimensions.get('window').width
    const paddingLeft = 44
    const paddingRight = 16
    const chartInnerWidth = screenWidth - 32 - paddingLeft - paddingRight
    const chartWidth = screenWidth - 32
    const chartHeight = 220
    const barGap = 12
    const maxBars = Math.max(chartData.length, 1)
    const barWidth = (chartInnerWidth - barGap * (maxBars - 1)) / maxBars

    if (isLoading && records.length === 0) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat rekap...</Text>
            </View>
        )
    }

    if (error && records.length === 0) {
        return (
            <View className="flex-1 bg-white px-5 justify-center">
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center self-center mb-4">
                        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
                    </View>
                    <Text className="text-center text-gray-900 font-semibold text-base">Gagal memuat rekap</Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable onPress={() => refetch()} className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80">
                        <Text className="text-center text-white font-semibold">Coba lagi</Text>
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-white">
            <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={22} color="#374151" />
                    </Pressable>
                    <Text className="flex-1 ml-3 text-lg font-bold text-gray-900">Rekapitulasi</Text>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setIsMonthSheetOpen(true)}
                        className="px-3 py-2.5 rounded-2xl border border-gray-200 bg-white flex-row items-center"
                    >
                        <Ionicons name="calendar-outline" size={18} color="#374151" />
                        <Text className="text-sm font-medium text-gray-700 ml-1.5">Tanggal</Text>
                        {filterMonth !== 'all' && (
                            <View className="ml-1.5 w-2 h-2 rounded-full bg-[#7C3AED]" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <BottomSheets
                visible={isMonthSheetOpen}
                onClose={() => setIsMonthSheetOpen(false)}
                title="Filter Tanggal"
            >
                <View className="pb-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            setFilterMonth('all')
                            setIsMonthSheetOpen(false)
                        }}
                        className={`py-4 border-b border-gray-100 flex-row items-center justify-between ${filterMonth === 'all' ? 'bg-gray-50' : ''}`}
                    >
                        <View className="flex-row items-center">
                            <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                <Ionicons
                                    name="calendar-outline"
                                    size={20}
                                    color={filterMonth === 'all' ? '#7C3AED' : '#6B7280'}
                                />
                            </View>
                            <Text className={`font-medium ${filterMonth === 'all' ? 'text-gray-900' : 'text-gray-600'}`}>
                                Semua Tanggal
                            </Text>
                        </View>
                        {filterMonth === 'all' && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                    </TouchableOpacity>
                    {availableMonths.map((ym) => {
                        const [y, m] = ym.split('-')
                        const monthLabel = `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`
                        return (
                            <TouchableOpacity
                                key={ym}
                                activeOpacity={0.8}
                                onPress={() => {
                                    setFilterMonth(ym)
                                    setIsMonthSheetOpen(false)
                                }}
                                className={`py-4 border-b border-gray-100 flex-row items-center justify-between ${filterMonth === ym ? 'bg-gray-50' : ''}`}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-9 h-9 rounded-xl bg-gray-100 items-center justify-center mr-3">
                                        <Ionicons
                                            name="calendar"
                                            size={20}
                                            color={filterMonth === ym ? '#7C3AED' : '#6B7280'}
                                        />
                                    </View>
                                    <Text className={`font-medium ${filterMonth === ym ? 'text-gray-900' : 'text-gray-600'}`}>
                                        {monthLabel}
                                    </Text>
                                </View>
                                {filterMonth === ym && <Ionicons name="checkmark" size={20} color="#7C3AED" />}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </BottomSheets>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={['#7C3AED']} />
                }
            >
                <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <View className="flex-row">
                        <View className="w-1.5 bg-[#7C3AED]" />
                        <View className="flex-1 px-5 py-5">
                            <Text className="text-xs tracking-widest text-gray-400 font-bold">
                                RINGKASAN {filterMonth !== 'all' ? '(FILTER BULAN)' : ''}
                            </Text>
                            <Text className="mt-2 text-2xl font-extrabold text-gray-900">
                                Rp {Math.round(filteredStats.total).toLocaleString('id-ID')}
                            </Text>
                            <View className="mt-4 flex-row gap-3">
                                <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                    <Text className="text-xs text-gray-500">Jumlah Transaksi</Text>
                                    <Text className="mt-1 text-xl font-bold text-gray-900">
                                        {filteredStats.count}
                                    </Text>
                                </View>
                                <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                                    <Text className="text-xs text-gray-500">Rata-rata</Text>
                                    <Text className="mt-1 text-xl font-bold text-gray-900">
                                        Rp {Math.round(filteredStats.avg).toLocaleString('id-ID')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {topMonth && (
                    <View className="mb-5 flex-row items-center rounded-2xl border-2 border-amber-200 bg-amber-50 p-4">
                        <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center">
                            <Ionicons name="trophy" size={26} color="#D97706" />
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                                Penjualan terbanyak
                            </Text>
                            <Text className="text-lg font-bold text-gray-900 mt-0.5">{topMonth.fullLabel}</Text>
                            <Text className="text-sm text-gray-600 mt-0.5">
                                {topMonth.count} transaksi • Rp {Math.round(topMonth.amount).toLocaleString('id-ID')}
                            </Text>
                        </View>
                    </View>
                )}

                {byMonth.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="bar-chart-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Belum ada data rekap</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Transaksi akan tampil di grafik setelah ada data
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="mb-1">
                            <Text className="text-lg font-bold text-gray-900">Penjualan per Bulan</Text>
                            <Text className="text-sm text-gray-500 mt-0.5">
                                {chartData.length} bulan terakhir • Nilai dalam Rp
                            </Text>
                        </View>
                        <View className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm overflow-hidden">
                            <Svg width={chartWidth} height={chartHeight + 44} viewBox={`0 0 ${chartWidth} ${chartHeight + 44}`}>
                                {/* Y-axis labels & horizontal guide lines */}
                                {(() => {
                                    const topPad = 28
                                    const bottomPad = 44
                                    const graphH = chartHeight - topPad - bottomPad
                                    const maxVal = chartData[0]?.max ?? 1
                                    const y0 = topPad + graphH
                                    const y50 = topPad + graphH * 0.5
                                    const y100 = topPad
                                    return (
                                        <>
                                            <Line x1={paddingLeft} y1={y0} x2={chartWidth - paddingRight} y2={y0} stroke="#E5E7EB" strokeWidth={1} />
                                            <Line x1={paddingLeft} y1={y50} x2={chartWidth - paddingRight} y2={y50} stroke="#E5E7EB" strokeWidth={1} strokeDasharray="4 4" />
                                            <Line x1={paddingLeft} y1={y100} x2={chartWidth - paddingRight} y2={y100} stroke="#E5E7EB" strokeWidth={1} />
                                            <SvgText x={8} y={y0 + 4} fill="#9CA3AF" fontSize={10} textAnchor="start">0</SvgText>
                                            <SvgText x={8} y={y50 + 4} fill="#9CA3AF" fontSize={10} textAnchor="start">{formatShortAmount(maxVal * 0.5)}</SvgText>
                                            <SvgText x={8} y={y100 + 4} fill="#9CA3AF" fontSize={10} textAnchor="start">{formatShortAmount(maxVal)}</SvgText>
                                        </>
                                    )
                                })()}
                                {/* Bars + value on top + month label below */}
                                {chartData.map((d, i) => {
                                    const topPad = 28
                                    const bottomPad = 44
                                    const graphH = chartHeight - topPad - bottomPad
                                    const barH = d.ratio * graphH
                                    const x = paddingLeft + i * (barWidth + barGap)
                                    const yBar = topPad + graphH - barH
                                    return (
                                        <React.Fragment key={d.ym}>
                                            <Rect
                                                x={x}
                                                y={yBar}
                                                width={barWidth}
                                                height={barH}
                                                rx={8}
                                                fill="#7C3AED"
                                            />
                                            <SvgText
                                                x={x + barWidth / 2}
                                                y={yBar - 6}
                                                fill="#374151"
                                                fontSize={11}
                                                fontWeight="600"
                                                textAnchor="middle"
                                            >
                                                {formatShortAmount(d.amount)}
                                            </SvgText>
                                            <SvgText
                                                x={x + barWidth / 2}
                                                y={chartHeight + 26}
                                                fill="#6B7280"
                                                fontSize={11}
                                                fontWeight="500"
                                                textAnchor="middle"
                                            >
                                                {d.label as string}
                                            </SvgText>
                                        </React.Fragment>
                                    )
                                })}
                            </Svg>
                            <View className="mt-4 pt-4 border-t border-gray-100">
                                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Detail per bulan</Text>
                                <View className="gap-2">
                                    {chartData.map((d) => (
                                        <View key={d.ym} className="flex-row items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                                            <Text className="text-sm font-medium text-gray-700">{d.fullLabel}</Text>
                                            <Text className="text-sm font-bold text-[#7C3AED]">
                                                Rp {Math.round(d.amount).toLocaleString('id-ID')}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View className="mt-5 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <View className="flex-row items-center mb-3">
                                <View className="w-9 h-9 rounded-xl bg-violet-100 items-center justify-center mr-3">
                                    <Ionicons name="cube-outline" size={20} color="#7C3AED" />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-gray-900">Produk terlaris</Text>
                                    <Text className="text-xs text-gray-500">
                                        Top 10 {filterMonth !== 'all' ? '(filter bulan)' : '(semua data)'}
                                    </Text>
                                </View>
                            </View>
                            {topProducts.length === 0 ? (
                                <View className="py-6 items-center">
                                    <Text className="text-gray-500 text-sm">Belum ada data produk</Text>
                                </View>
                            ) : (
                                <View className="gap-2">
                                    {topProducts.map((p, i) => (
                                        <View
                                            key={`${p.name}-${i}`}
                                            className="flex-row items-center justify-between py-3 px-3 bg-gray-50 rounded-xl"
                                        >
                                            <View className="flex-1 flex-row items-center pr-2">
                                                <View className="w-7 h-7 rounded-lg bg-violet-100 items-center justify-center mr-2">
                                                    <Text className="text-xs font-bold text-[#7C3AED]">{i + 1}</Text>
                                                </View>
                                                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                                                    {p.name}
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-sm font-bold text-[#7C3AED]">
                                                    Rp {Math.round(p.subtotal).toLocaleString('id-ID')}
                                                </Text>
                                                <Text className="text-xs text-gray-500">{p.quantity} terjual</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>

                        <View className="mt-5 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                            <Text className="text-sm font-semibold text-gray-700 mb-3">Total Semua Data</Text>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Total penjualan</Text>
                                <Text className="font-bold text-gray-900">
                                    Rp {Math.round(totalAmount).toLocaleString('id-ID')}
                                </Text>
                            </View>

                            <View className="flex-row justify-between mt-2">
                                <Text className="text-gray-600">Total transaksi</Text>
                                <Text className="font-bold text-gray-900">{totalCount}</Text>
                            </View>

                            <View className="flex-row justify-between mt-2">
                                <Text className="text-gray-600">Rata-rata per transaksi</Text>
                                <Text className="font-bold text-gray-900">
                                    Rp {Math.round(avg).toLocaleString('id-ID')}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </View>
    )
}

import React from 'react';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomSheets from '@/components/BottomSheets';

import CreateCashLog from '@/components/transactions/cashlog/CreateCashLog';

import {
    CASHLOG_TYPES,
    STATUS_COLORS,
    STATUS_LABELS,
    TYPE_LABELS,
    formatCashLogDate,
    formatCashLogDateTime,
    useStateCashLog,
} from '@/services/useStateCashLog';

import { RefreshControl } from 'react-native-gesture-handler';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

export default function Pembayaran() {
    const {
        records,
        isLoading,
        error,
        refetch,
        isRefetching,
        branchName,
        userName,
        sheetOpen,
        formDate,
        formType,
        setFormType,
        formAmount,
        setFormAmount,
        showDatePicker,
        setShowDatePicker,
        formDateAsDate,
        onDateChange,
        openCreate,
        closeSheet,
        handleSubmit,
        isSubmitting,
        createError,
        validationMessage,
        detailItem,
        setDetailItem,
        detailSheetVisible,
        closeDetailSheet,
        filterSheetOpen,
        setFilterSheetOpen,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterDateFrom,
        filterDateTo,
        showDateFromPicker,
        setShowDateFromPicker,
        showDateToPicker,
        setShowDateToPicker,
        filteredRecords,
        recordsByDate,
        onDateFromChange,
        onDateToChange,
        clearFilters,
        hasActiveFilter,
    } = useStateCashLog();

    if (isLoading && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat cash log...</Text>
            </View>
        );
    }

    if (error && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 px-5 justify-center">
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center self-center mb-4">
                        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
                    </View>
                    <Text className="text-center text-gray-900 font-semibold text-base">Gagal memuat cash log</Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable onPress={() => refetch()} className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80">
                        <Text className="text-center font-semibold text-white">Coba lagi</Text>
                    </Pressable>
                </View>
            </View>
        );
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
                    <Text className="flex-1 ml-3 text-lg font-bold text-gray-900">Pembayaran / Cash Log</Text>
                    <TouchableOpacity
                        onPress={() => setFilterSheetOpen(true)}
                        activeOpacity={0.8}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2"
                    >
                        <Ionicons name="filter" size={20} color={hasActiveFilter ? '#7C3AED' : '#374151'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={openCreate}
                        activeOpacity={0.8}
                        className="flex-row items-center px-4 py-2.5 rounded-2xl bg-[#7C3AED]"
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text className="ml-2 text-sm font-semibold text-white">Tambah</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={() => refetch()}
                        colors={['#7C3AED']}
                    />
                }
            >
                {createError && (
                    <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                        <Text className="text-sm text-red-700">
                            {createError instanceof Error ? createError.message : 'Gagal menambah cash log'}
                        </Text>
                    </View>
                )}

                {records.length > 0 && (
                    <>
                        <View className="mb-4">
                            <Text className="text-xs font-medium text-gray-500 mb-2">Filter Tanggal</Text>
                            <View className="flex-row gap-2">
                                <Pressable
                                    onPress={() => setShowDateFromPicker(true)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex-row items-center justify-between"
                                >
                                    <Text className={filterDateFrom ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                                        {filterDateFrom ? formatCashLogDate(filterDateFrom) : 'Dari'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                                </Pressable>
                                <Pressable
                                    onPress={() => setShowDateToPicker(true)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex-row items-center justify-between"
                                >
                                    <Text className={filterDateTo ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                                        {filterDateTo ? formatCashLogDate(filterDateTo) : 'Sampai'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                                </Pressable>
                            </View>
                            {showDateFromPicker && (
                                <DateTimePicker
                                    value={filterDateFrom ? new Date(filterDateFrom + 'T12:00:00') : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateFromChange}
                                />
                            )}
                            {showDateFromPicker && Platform.OS === 'ios' && (
                                <Pressable onPress={() => setShowDateFromPicker(false)} className="py-2">
                                    <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                                </Pressable>
                            )}
                            {showDateToPicker && (
                                <DateTimePicker
                                    value={filterDateTo ? new Date(filterDateTo + 'T12:00:00') : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateToChange}
                                />
                            )}
                            {showDateToPicker && Platform.OS === 'ios' && (
                                <Pressable onPress={() => setShowDateToPicker(false)} className="py-2">
                                    <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                                </Pressable>
                            )}
                        </View>
                        <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <View className="flex-row">
                                <View className="w-1.5 bg-[#7C3AED]" />
                                <View className="flex-1 px-5 py-5">
                                    <Text className="text-xs tracking-widest text-gray-400 font-bold">TOTAL ENTRI</Text>
                                    <Text className="mt-2 text-2xl font-extrabold text-gray-900">{filteredRecords.length}</Text>
                                    <Text className="mt-1 text-sm text-gray-500">Kas buka / kas tutup</Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {records.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="wallet-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Belum ada cash log</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Catat kas buka atau kas tutup di sini
                        </Text>
                        <TouchableOpacity
                            onPress={openCreate}
                            activeOpacity={0.8}
                            className="mt-6 flex-row items-center px-5 py-3 rounded-2xl bg-[#7C3AED]"
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text className="ml-2 font-semibold text-white">Tambah Cash Log</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-3">
                        <Text className="text-base font-bold text-gray-900">Daftar Cash Log</Text>
                        {filteredRecords.length === 0 && hasActiveFilter ? (
                            <View className="bg-gray-50 rounded-2xl border border-gray-100 p-6 items-center">
                                <Ionicons name="search-outline" size={32} color="#9CA3AF" />
                                <Text className="text-gray-700 font-medium mt-2">Tidak ada hasil untuk filter ini</Text>
                                <Text className="text-gray-500 text-sm mt-1 text-center">Ubah filter atau reset</Text>
                                <TouchableOpacity
                                    onPress={clearFilters}
                                    activeOpacity={0.8}
                                    className="mt-4 px-4 py-2 rounded-xl bg-[#7C3AED]"
                                >
                                    <Text className="text-white text-sm font-semibold">Reset Filter</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View className="gap-5">
                                    {recordsByDate.map(([dateKey, items]) => (
                                        <View key={dateKey}>
                                            <Text className="text-[11px] font-medium text-gray-500 mb-2">
                                                {formatCashLogDate(dateKey)}
                                            </Text>
                                            <View className="flex-row flex-wrap gap-3">
                                                {items.map((item) => (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        activeOpacity={0.8}
                                                        onPress={() => setDetailItem(item)}
                                                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm w-[48%]"
                                                    >
                                                        <View className="flex-row items-center gap-1.5 flex-wrap">
                                                            <View className="px-2 py-0.5 rounded-lg bg-violet-100">
                                                                <Text className="text-[10px] font-semibold text-[#7C3AED]">
                                                                    {TYPE_LABELS[item.type]}
                                                                </Text>
                                                            </View>
                                                            <View className={`px-2 py-0.5 rounded-lg ${STATUS_COLORS[item.status]}`}>
                                                                <Text className="text-[10px] font-semibold">{STATUS_LABELS[item.status]}</Text>
                                                            </View>
                                                        </View>
                                                        <Text className="mt-2 text-base font-bold text-gray-900" numberOfLines={1}>
                                                            Rp {Math.round(item.amount).toLocaleString('id-ID')}
                                                        </Text>
                                                        <Text className="mt-1.5 text-[11px] text-gray-500" numberOfLines={1}>
                                                            {item.cashier_name}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                )}
            </ScrollView>

            <CreateCashLog
                visible={sheetOpen}
                onClose={closeSheet}
                branchName={branchName}
                userName={userName}
                formDate={formDate}
                formType={formType}
                setFormType={setFormType}
                formAmount={formAmount}
                setFormAmount={setFormAmount}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                formDateAsDate={formDateAsDate}
                onDateChange={onDateChange}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                validationMessage={validationMessage}
                createError={createError}
            />

            <BottomSheets
                visible={filterSheetOpen}
                onClose={() => setFilterSheetOpen(false)}
                title="Filter Status & Tipe"
            >
                <View className="pb-8">
                    <Text className="text-xs font-medium text-gray-500 mb-2">Status</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setFilterStatus(s)}
                                activeOpacity={0.8}
                                className={`px-3 py-2 rounded-xl ${filterStatus === s ? 'bg-[#7C3AED]' : 'bg-gray-100 border border-gray-200'}`}
                            >
                                <Text className={`text-xs font-medium ${filterStatus === s ? 'text-white' : 'text-gray-600'}`}>
                                    {s === 'all' ? 'Semua' : STATUS_LABELS[s]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text className="text-xs font-medium text-gray-500 mb-2">Tipe</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {(['all', ...CASHLOG_TYPES] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setFilterType(t)}
                                activeOpacity={0.8}
                                className={`px-3 py-2 rounded-xl ${filterType === t ? 'bg-[#7C3AED]' : 'bg-gray-100 border border-gray-200'}`}
                            >
                                <Text className={`text-xs font-medium ${filterType === t ? 'text-white' : 'text-gray-600'}`}>
                                    {t === 'all' ? 'Semua' : TYPE_LABELS[t]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View className="flex-row gap-3 mt-2">
                        <TouchableOpacity
                            onPress={() => {
                                clearFilters();
                                setFilterSheetOpen(false);
                            }}
                            activeOpacity={0.8}
                            className="flex-1 py-3 rounded-2xl border border-gray-200 bg-gray-100"
                        >
                            <Text className="text-center font-semibold text-gray-700">Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFilterSheetOpen(false)}
                            activeOpacity={0.8}
                            className="flex-1 py-3 rounded-2xl bg-[#7C3AED]"
                        >
                            <Text className="text-center font-semibold text-white">Terapkan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheets>

            <BottomSheets
                visible={detailSheetVisible}
                onClose={closeDetailSheet}
                title="Detail Cash Log"
            >
                {detailItem && (
                    <View className="pb-8">
                        <View className="flex-row items-center gap-2 flex-wrap mb-4">
                            <View className="px-2.5 py-1 rounded-lg bg-violet-100">
                                <Text className="text-xs font-semibold text-[#7C3AED]">
                                    {TYPE_LABELS[detailItem.type]}
                                </Text>
                            </View>
                            <View className={`px-2.5 py-1 rounded-lg ${STATUS_COLORS[detailItem.status]}`}>
                                <Text className="text-xs font-semibold">{STATUS_LABELS[detailItem.status]}</Text>
                            </View>
                        </View>
                        <View className="gap-3">
                            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                <Text className="text-gray-500 text-sm">Jumlah</Text>
                                <Text className="text-gray-900 font-semibold">
                                    Rp {Math.round(detailItem.amount).toLocaleString('id-ID')}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                <Text className="text-gray-500 text-sm">Tanggal & Waktu</Text>
                                <Text className="text-gray-900 text-sm text-right flex-1 ml-2">
                                    {formatCashLogDateTime(detailItem.date)}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                <Text className="text-gray-500 text-sm">Kasir</Text>
                                <Text className="text-gray-900">{detailItem.cashier_name}</Text>
                            </View>
                            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                <Text className="text-gray-500 text-sm">Cabang</Text>
                                <Text className="text-gray-900">{detailItem.branch_name}</Text>
                            </View>
                            {detailItem.approved_by && (
                                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                    <Text className="text-gray-500 text-sm">Disetujui oleh</Text>
                                    <Text className="text-gray-900">{detailItem.approved_by}</Text>
                                </View>
                            )}
                            {detailItem.approved_at && (
                                <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                    <Text className="text-gray-500 text-sm">Disetujui pada</Text>
                                    <Text className="text-gray-900">{formatCashLogDate(detailItem.approved_at)}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </BottomSheets>
        </View>
    );
}

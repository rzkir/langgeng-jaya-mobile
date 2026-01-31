import React from 'react';

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import CreateLaporan from '@/components/transactions/laporan/CreateLaporan';
import DetailsLaporan from '@/components/transactions/laporan/DetailsLaporan';
import FilterLaporan from '@/components/transactions/laporan/FIlterLaporan';

import { RefreshControl } from 'react-native-gesture-handler';

import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS, formatDate, useStateLaporan } from '@/services/useStateLaporan';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

export default function Laporan() {
    const {
        records,
        isLoading,
        error,
        refetch,
        isRefetching,
        branchName,
        userName,
        sheetOpen,
        filterSheetOpen,
        setFilterSheetOpen,
        detailsSheetOpen,
        selectedLaporan,
        openDetail,
        closeDetailSheet,
        formDate,
        formCategory,
        setFormCategory,
        formAmount,
        setFormAmount,
        formDescription,
        setFormDescription,
        formReceiptUrl,
        setFormReceiptUrl,
        showDatePicker,
        setShowDatePicker,
        uploadReceiptLoading,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        filterDateFrom,
        filterDateTo,
        showFilterDateFrom,
        setShowFilterDateFrom,
        showFilterDateTo,
        setShowFilterDateTo,
        formDateAsDate,
        filteredRecords,
        hasActiveFilters,
        onDateChange,
        onFilterDateFromChange,
        onFilterDateToChange,
        clearFilters,
        closeFilterSheet,
        openCreate,
        closeSheet,
        pickReceiptImage,
        handleSubmit,
        totalAmount,
        isSubmitting,
    } = useStateLaporan();

    if (isLoading && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat laporan...</Text>
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
                    <Text className="text-center text-gray-900 font-semibold text-base">Gagal memuat laporan</Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable onPress={() => refetch()} className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80">
                        <Text className="text-center text-white font-semibold">Coba lagi</Text>
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
                    <Text className="flex-1 ml-3 text-lg font-bold text-gray-900">Laporan</Text>
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
                {records.length > 0 && (
                    <>
                        <TouchableOpacity
                            onPress={() => setFilterSheetOpen(true)}
                            activeOpacity={0.8}
                            className="mb-4 flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                        >
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="filter" size={20} color="#7C3AED" />
                                <Text className="text-sm font-semibold text-gray-800">Filter</Text>
                                {hasActiveFilters && (
                                    <View className="rounded-full bg-[#7C3AED] px-2 py-0.5">
                                        <Text className="text-xs font-semibold text-white">Aktif</Text>
                                    </View>
                                )}
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                        <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <View className="flex-row">
                                <View className="w-1.5 bg-[#7C3AED]" />
                                <View className="flex-1 px-5 py-5">
                                    <Text className="text-xs tracking-widest text-gray-400 font-bold">TOTAL PENGELUARAN</Text>
                                    <Text className="mt-2 text-2xl font-extrabold text-gray-900">
                                        Rp {Math.round(totalAmount).toLocaleString('id-ID')}
                                    </Text>
                                    <Text className="mt-1 text-sm text-gray-500">
                                        {filteredRecords.length} entri{hasActiveFilters ? ` (dari ${records.length})` : ''}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {records.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Belum ada data laporan</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Data pengeluaran toko akan tampil di sini
                        </Text>
                        <TouchableOpacity
                            onPress={openCreate}
                            activeOpacity={0.8}
                            className="mt-6 flex-row items-center px-5 py-3 rounded-2xl bg-[#7C3AED]"
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text className="ml-2 font-semibold text-white">Tambah Laporan</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredRecords.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="filter-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Tidak ada hasil</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Tidak ada laporan yang sesuai filter. Coba ubah filter atau reset.
                        </Text>
                        <TouchableOpacity onPress={clearFilters} activeOpacity={0.8} className="mt-6 px-5 py-3 rounded-2xl bg-[#7C3AED]">
                            <Text className="font-semibold text-white">Reset Filter</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-3">
                        <Text className="text-base font-bold text-gray-900">Daftar Laporan</Text>
                        {filteredRecords.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => openDetail(item)}
                                activeOpacity={0.8}
                                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                            >
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <View className="px-2.5 py-1 rounded-lg bg-violet-100">
                                        <Text className="text-xs font-semibold text-[#7C3AED]">
                                            {CATEGORY_LABELS[item.category]}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-lg ${STATUS_COLORS[item.status]}`}>
                                        <Text className="text-xs font-semibold">
                                            {STATUS_LABELS[item.status]}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="mt-2 text-lg font-bold text-gray-900">
                                    Rp {Math.round(item.amount).toLocaleString('id-ID')}
                                </Text>
                                {item.description ? (
                                    <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                ) : null}
                                <Text className="mt-2 text-xs text-gray-500">
                                    {formatDate(item.date)} • {item.cashier_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>

            <FilterLaporan
                visible={filterSheetOpen}
                onClose={closeFilterSheet}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterDateFrom={filterDateFrom}
                filterDateTo={filterDateTo}
                showFilterDateFrom={showFilterDateFrom}
                setShowFilterDateFrom={setShowFilterDateFrom}
                showFilterDateTo={showFilterDateTo}
                setShowFilterDateTo={setShowFilterDateTo}
                onFilterDateFromChange={onFilterDateFromChange}
                onFilterDateToChange={onFilterDateToChange}
                clearFilters={clearFilters}
                closeFilterSheet={closeFilterSheet}
            />

            <DetailsLaporan
                visible={detailsSheetOpen}
                onClose={closeDetailSheet}
                item={selectedLaporan}
            />

            <CreateLaporan
                visible={sheetOpen}
                onClose={closeSheet}
                branchName={branchName}
                userName={userName}
                formDate={formDate}
                formCategory={formCategory}
                setFormCategory={setFormCategory}
                formAmount={formAmount}
                setFormAmount={setFormAmount}
                formDescription={formDescription}
                setFormDescription={setFormDescription}
                formReceiptUrl={formReceiptUrl}
                setFormReceiptUrl={setFormReceiptUrl}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                formDateAsDate={formDateAsDate}
                onDateChange={onDateChange}
                uploadReceiptLoading={uploadReceiptLoading}
                pickReceiptImage={pickReceiptImage}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />
        </View>
    );
}

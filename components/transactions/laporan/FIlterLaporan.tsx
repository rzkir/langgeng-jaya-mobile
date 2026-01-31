import React from 'react';

import {
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheets from '@/components/BottomSheets';

import { CATEGORIES, CATEGORY_LABELS, STATUS_LABELS, formatDate } from '@/services/useStateLaporan';

import { Ionicons } from '@expo/vector-icons';

export default function FilterLaporan({
    visible,
    onClose,
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
    onFilterDateFromChange,
    onFilterDateToChange,
    clearFilters,
    closeFilterSheet,
}: FilterLaporanProps) {
    return (
        <BottomSheets visible={visible} onClose={onClose} title="Filter Laporan">
            <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-96"
                contentContainerStyle={{ paddingBottom: 24 }}
            >
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
                <Text className="text-xs font-medium text-gray-500 mb-2">Kategori</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                    {(['all', ...CATEGORIES] as const).map((c) => (
                        <TouchableOpacity
                            key={c}
                            onPress={() => setFilterCategory(c)}
                            activeOpacity={0.8}
                            className={`px-3 py-2 rounded-xl ${filterCategory === c ? 'bg-[#7C3AED]' : 'bg-gray-100 border border-gray-200'}`}
                        >
                            <Text className={`text-xs font-medium ${filterCategory === c ? 'text-white' : 'text-gray-600'}`}>
                                {c === 'all' ? 'Semua' : CATEGORY_LABELS[c]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text className="text-xs font-medium text-gray-500 mb-2">Tanggal</Text>
                <View className="flex-row gap-2 mb-2">
                    <Pressable
                        onPress={() => setShowFilterDateFrom(true)}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex-row items-center justify-between"
                    >
                        <Text className={filterDateFrom ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                            {filterDateFrom ? formatDate(filterDateFrom) : 'Dari'}
                        </Text>
                        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                    </Pressable>
                    <Pressable
                        onPress={() => setShowFilterDateTo(true)}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 flex-row items-center justify-between"
                    >
                        <Text className={filterDateTo ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                            {filterDateTo ? formatDate(filterDateTo) : 'Sampai'}
                        </Text>
                        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                    </Pressable>
                </View>
                {showFilterDateFrom && (
                    <DateTimePicker
                        value={filterDateFrom ? new Date(filterDateFrom + 'T12:00:00') : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onFilterDateFromChange}
                    />
                )}
                {showFilterDateFrom && Platform.OS === 'ios' && (
                    <Pressable onPress={() => setShowFilterDateFrom(false)} className="py-2">
                        <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                    </Pressable>
                )}
                {showFilterDateTo && (
                    <DateTimePicker
                        value={filterDateTo ? new Date(filterDateTo + 'T12:00:00') : new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onFilterDateToChange}
                    />
                )}
                {showFilterDateTo && Platform.OS === 'ios' && (
                    <Pressable onPress={() => setShowFilterDateTo(false)} className="py-2">
                        <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                    </Pressable>
                )}
                <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity
                        onPress={() => {
                            clearFilters();
                            closeFilterSheet();
                        }}
                        activeOpacity={0.8}
                        className="flex-1 py-3 rounded-2xl border border-gray-200 bg-gray-100"
                    >
                        <Text className="text-center font-semibold text-gray-700">Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={closeFilterSheet}
                        activeOpacity={0.8}
                        className="flex-1 py-3 rounded-2xl bg-[#7C3AED]"
                    >
                        <Text className="text-center font-semibold text-white">Terapkan</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </BottomSheets>
    );
}

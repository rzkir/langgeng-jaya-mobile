import React from 'react';

import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import CreateCashLog from '@/components/transactions/cashlog/CreateCashLog';
import {
    STATUS_COLORS,
    STATUS_LABELS,
    TYPE_LABELS,
    formatCashLogDate,
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
                    <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <View className="flex-row">
                            <View className="w-1.5 bg-[#7C3AED]" />
                            <View className="flex-1 px-5 py-5">
                                <Text className="text-xs tracking-widest text-gray-400 font-bold">TOTAL ENTRI</Text>
                                <Text className="mt-2 text-2xl font-extrabold text-gray-900">{records.length}</Text>
                                <Text className="mt-1 text-sm text-gray-500">Kas buka / kas tutup</Text>
                            </View>
                        </View>
                    </View>
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
                        {records.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.8}
                                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                            >
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <View className="px-2.5 py-1 rounded-lg bg-violet-100">
                                        <Text className="text-xs font-semibold text-[#7C3AED]">
                                            {TYPE_LABELS[item.type]}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-lg ${STATUS_COLORS[item.status]}`}>
                                        <Text className="text-xs font-semibold">{STATUS_LABELS[item.status]}</Text>
                                    </View>
                                </View>
                                <Text className="mt-2 text-lg font-bold text-gray-900">
                                    Rp {Math.round(item.amount).toLocaleString('id-ID')}
                                </Text>
                                <Text className="mt-2 text-xs text-gray-500">
                                    {formatCashLogDate(item.date)} • {item.cashier_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
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
            />
        </View>
    );
}

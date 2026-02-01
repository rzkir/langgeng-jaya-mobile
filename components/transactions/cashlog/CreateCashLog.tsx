import React from 'react';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheets from '@/components/BottomSheets';
import { CASHLOG_TYPES, formatCashLogDate, formatRupiahInput, TYPE_LABELS } from '@/services/useStateCashLog';

import { Ionicons } from '@expo/vector-icons';

interface CreateCashLogProps {
    visible: boolean;
    onClose: () => void;
    branchName: string;
    userName: string;
    formDate: string;
    formType: CashLog['type'];
    setFormType: (t: CashLog['type']) => void;
    formAmount: string;
    setFormAmount: (v: string) => void;
    showDatePicker: boolean;
    setShowDatePicker: (v: boolean) => void;
    formDateAsDate: () => Date;
    onDateChange: (event: { type: string }, date?: Date) => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
    validationMessage?: string | null;
    createError?: Error | null;
}

export default function CreateCashLog({
    visible,
    onClose,
    branchName,
    userName,
    formDate,
    formType,
    setFormType,
    formAmount,
    setFormAmount,
    showDatePicker,
    setShowDatePicker,
    formDateAsDate,
    onDateChange,
    handleSubmit,
    isSubmitting,
    validationMessage,
    createError,
}: CreateCashLogProps) {
    const errorText = validationMessage ?? (createError instanceof Error ? createError.message : null);
    return (
        <BottomSheets visible={visible} onClose={onClose} title="Tambah Cash Log">
            <View className="min-h-[500px]">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 24 }}
                    >
                        {errorText && (
                            <View className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                <Text className="text-sm text-red-700">{errorText}</Text>
                            </View>
                        )}
                        <Text className="text-sm font-medium text-gray-700 mb-1">Cabang</Text>
                        <TextInput
                            value={branchName}
                            editable={false}
                            placeholder="Nama cabang"
                            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text className="text-sm font-medium text-gray-700 mb-1">Kasir</Text>
                        <TextInput
                            value={userName}
                            editable={false}
                            placeholder="Nama kasir"
                            className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text className="text-sm font-medium text-gray-700 mb-1">Tanggal</Text>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 flex-row items-center justify-between"
                        >
                            <Text className="text-gray-900">{formatCashLogDate(formDate)}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={formDateAsDate()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                            />
                        )}
                        {showDatePicker && Platform.OS === 'ios' && (
                            <Pressable onPress={() => setShowDatePicker(false)} className="mb-4 py-2">
                                <Text className="text-[#7C3AED] font-semibold text-center">Selesai</Text>
                            </Pressable>
                        )}

                        <Text className="text-sm font-medium text-gray-700 mb-2">Tipe</Text>
                        <View className="flex-row flex-wrap gap-2 mb-4">
                            {CASHLOG_TYPES.map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setFormType(t)}
                                    activeOpacity={0.8}
                                    className={`px-4 py-2.5 rounded-xl border ${formType === t ? 'border-[#7C3AED] bg-violet-50' : 'border-gray-200 bg-white'}`}
                                >
                                    <Text
                                        className={`text-sm font-medium ${formType === t ? 'text-[#7C3AED]' : 'text-gray-600'}`}
                                    >
                                        {TYPE_LABELS[t]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</Text>
                        <TextInput
                            value={formAmount}
                            onChangeText={(t) => setFormAmount(formatRupiahInput(t))}
                            placeholder="0"
                            keyboardType="numeric"
                            className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
                            placeholderTextColor="#9CA3AF"
                        />
                    </ScrollView>

                    <View className="border-t border-gray-100 bg-white pt-4 pb-2">
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={onClose}
                                activeOpacity={0.8}
                                className="flex-1 py-3.5 rounded-2xl border border-gray-200 bg-white"
                            >
                                <Text className="text-center font-semibold text-gray-700">Batal</Text>
                            </TouchableOpacity>
                            <Pressable
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3.5 rounded-2xl bg-[#7C3AED] items-center justify-center disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="font-semibold text-white">Tambah</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </BottomSheets>
    );
}

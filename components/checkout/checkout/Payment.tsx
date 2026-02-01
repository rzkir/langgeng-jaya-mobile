import React from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomSheets from '@/components/BottomSheets';

import { formatRupiah, formatRupiahInput } from '@/lib/FormatPrice';

const styles = StyleSheet.create({
    input: { backgroundColor: 'rgba(249,250,251,0.95)' },
    methodContainer: { backgroundColor: 'rgba(243,244,246,0.95)' },
    quickAmount: { backgroundColor: 'rgba(124,58,237,0.1)', borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)' },
    summaryHeader: { backgroundColor: 'rgba(124,58,237,0.05)' },
    summaryBorder: { borderWidth: 1, borderColor: 'rgba(229,231,235,0.9)' },
    shadowSm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
});

const labelClass = 'text-gray-600 text-[12px] mb-1.5 font-medium';

const inputClass = 'w-full rounded-xl border border-gray-200 px-2 py-3.5 text-gray-900 text-[15px]';

export default function Payment({
    visible,
    onClose,

    customerName,
    onChangeCustomerName,

    paymentMethod,
    onChangePaymentMethod,

    discountInput,
    onChangeDiscountInput,

    receivedInput,
    onChangeReceivedInput,

    quickAmounts,

    subtotal,
    discount,
    total,
    receivedAmount,
    change,
    amountDue,

    isSubmitting,
    onSubmit,
}: PaymentProps) {
    return (
        <BottomSheets
            visible={visible}
            onClose={onClose}
            title="Pembayaran"
        >
            <View className="mt-1 pb-2">
                {/* Nama pelanggan */}
                <View className="mb-4">
                    <Text className={labelClass}>Nama pelanggan</Text>
                    <TextInput
                        className={inputClass}
                        style={styles.input}
                        placeholder="Masukkan nama pelanggan"
                        placeholderTextColor="#9CA3AF"
                        value={customerName}
                        onChangeText={onChangeCustomerName}
                    />
                </View>

                {/* Metode pembayaran */}
                <View className="mb-4">
                    <Text className={labelClass}>Metode pembayaran</Text>
                    <View className="flex-row gap-2 rounded-xl p-1" style={styles.methodContainer}>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-lg items-center justify-center ${paymentMethod === 'cash' ? 'bg-primary' : 'bg-transparent'}`}
                            style={paymentMethod === 'cash' ? styles.shadowSm : undefined}
                            activeOpacity={0.8}
                            onPress={() => onChangePaymentMethod('cash')}
                        >
                            <Text
                                className={`font-semibold text-[14px] ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                Cash
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-lg items-center justify-center ${paymentMethod === 'kasbon' ? 'bg-primary' : 'bg-transparent'}`}
                            style={paymentMethod === 'kasbon' ? styles.shadowSm : undefined}
                            activeOpacity={0.8}
                            onPress={() => onChangePaymentMethod('kasbon')}
                        >
                            <Text
                                className={`font-semibold text-[14px] ${paymentMethod === 'kasbon' ? 'text-white' : 'text-gray-600'
                                    }`}
                            >
                                Kasbon
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Diskon & Uang diterima */}
                <View className="flex-row gap-3 mb-4">
                    <View className="flex-1">
                        <Text className={labelClass}>Diskon (Rp)</Text>
                        <TextInput
                            className={inputClass}
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={discountInput}
                            onChangeText={(t) => onChangeDiscountInput(formatRupiahInput(t))}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className={labelClass}>Uang diterima</Text>
                        <TextInput
                            className={inputClass}
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={receivedInput}
                            onChangeText={(t) => onChangeReceivedInput(formatRupiahInput(t))}
                        />
                    </View>
                </View>

                {/* Quick amounts */}
                {quickAmounts.length > 0 && (
                    <View className="mb-5 flex-row flex-wrap gap-2">
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                className="px-4 py-2.5 rounded-xl border"
                                style={styles.quickAmount}
                                activeOpacity={0.8}
                                onPress={() => onChangeReceivedInput(formatRupiahInput(String(amount)))}
                            >
                                <Text className="text-primary font-semibold text-[13px]">
                                    {formatRupiah(amount)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Ringkasan */}
                <View className="rounded-2xl bg-gray-50 overflow-hidden mb-5" style={styles.summaryBorder}>
                    <View className="px-4 py-3 border-b border-gray-200" style={styles.summaryHeader}>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-700 font-semibold text-[13px]">Ringkasan</Text>
                            <View className="px-3 py-1.5 rounded-lg bg-primary">
                                <Text className="text-white font-bold text-[13px]">
                                    {formatRupiah(total)}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="px-4 py-3">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-[12px]">Sub total</Text>
                            <Text className="text-gray-800 font-medium text-[12px]">
                                {formatRupiah(subtotal)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-[12px]">Diskon</Text>
                            <Text className="text-gray-800 font-medium text-[12px]">
                                {formatRupiah(discount)}
                            </Text>
                        </View>
                        <View className="h-px bg-gray-200 my-2" />
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-700 font-semibold text-[13px]">Total bayar</Text>
                            <Text className="text-gray-900 font-semibold text-[13px]">
                                {formatRupiah(total)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-[12px]">Uang diterima</Text>
                            <Text className="text-gray-800 font-medium text-[12px]">
                                {formatRupiah(receivedAmount)}
                            </Text>
                        </View>
                        {paymentMethod === 'kasbon' ? (
                            <View className="flex-row items-center justify-between pt-1">
                                <Text className="text-gray-500 text-[12px]">Sisa harus dibayar</Text>
                                <Text className="text-primary font-semibold text-[12px]">
                                    {formatRupiah(amountDue)}
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center justify-between pt-1">
                                <Text className="text-gray-500 text-[12px]">Kembalian</Text>
                                <Text className="text-success font-semibold text-[12px]">
                                    {formatRupiah(change)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3 pb-1">
                    <TouchableOpacity
                        className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 bg-white items-center justify-center active:bg-gray-50"
                        activeOpacity={0.8}
                        onPress={onClose}
                    >
                        <Text className="text-gray-700 font-semibold text-[15px]">Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3.5 rounded-xl items-center justify-center ${isSubmitting ? 'bg-gray-400' : 'bg-primary'
                            }`}
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                        onPress={onSubmit}
                    >
                        <Text className="text-white font-semibold text-[15px]">
                            {isSubmitting ? 'Memproses...' : 'Bayar Sekarang'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheets>
    );
}

import React from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import BottomSheets from '@/components/BottomSheets';

import { formatRupiah } from '@/lib/FormatPrice';

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
            <View className="mt-2">
                <Text className="text-gray-900 text-[13px] mb-2 font-semibold">Nama pelanggan</Text>
                <TextInput
                    className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900"
                    placeholder="Masukkan nama pelanggan"
                    placeholderTextColor="#9CA3AF"
                    value={customerName}
                    onChangeText={onChangeCustomerName}
                />

                <Text className="text-gray-900 text-[13px] mt-5 mb-2 font-semibold">Metode pembayaran</Text>
                <View className="flex-row gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1">
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-2xl items-center ${paymentMethod === 'cash'
                            ? 'bg-gray-900'
                            : 'bg-transparent'
                            }`}
                        activeOpacity={0.85}
                        onPress={() => onChangePaymentMethod('cash')}
                    >
                        <Text
                            className={`font-semibold ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            Cash
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-2xl items-center ${paymentMethod === 'kasbon'
                            ? 'bg-gray-900'
                            : 'bg-transparent'
                            }`}
                        activeOpacity={0.85}
                        onPress={() => onChangePaymentMethod('kasbon')}
                    >
                        <Text
                            className={`font-semibold ${paymentMethod === 'kasbon' ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            Kasbon
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-900 text-[13px] mt-5 mb-2 font-semibold">Diskon (Rp)</Text>
                <TextInput
                    className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={discountInput}
                    onChangeText={onChangeDiscountInput}
                />

                <Text className="text-gray-900 text-[13px] mt-5 mb-2 font-semibold">Uang diterima</Text>
                <TextInput
                    className="w-full rounded-2xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={receivedInput}
                    onChangeText={onChangeReceivedInput}
                />
                {quickAmounts.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap gap-2">
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                className="px-3 py-2 rounded-2xl bg-white border border-gray-200"
                                activeOpacity={0.85}
                                onPress={() => onChangeReceivedInput(String(amount))}
                            >
                                <Text className="text-gray-900 text-xs font-semibold">
                                    {formatRupiah(amount)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Summary pembayaran */}
                <View className="mt-5 rounded-3xl bg-white border border-gray-200 p-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-900 font-semibold text-[14px] tracking-tight">Ringkasan</Text>
                        <View className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                            <Text className="text-emerald-700 font-semibold text-[12px]">
                                {formatRupiah(total)}
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-600 text-[12px]">Sub total</Text>
                        <Text className="text-gray-900 font-semibold text-[12px}">
                            {formatRupiah(subtotal)}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-600 text-[12px]">Diskon</Text>
                        <Text className="text-gray-900 font-semibold text-[12px}">
                            {formatRupiah(discount)}
                        </Text>
                    </View>
                    <View className="h-px bg-gray-200/70 my-2" />
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-gray-900 font-semibold text-[13px]">Total bayar</Text>
                        <Text className="text-gray-900 font-semibold text-[13px]">
                            {formatRupiah(total)}
                        </Text>
                    </View>
                    <View className="flex-row items-center justify-between mt-1">
                        <Text className="text-gray-600 text-[12px]">Uang diterima</Text>
                        <Text className="text-gray-900 font-semibold text-[12px]">
                            {formatRupiah(receivedAmount)}
                        </Text>
                    </View>
                    {paymentMethod === 'kasbon' ? (
                        <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-gray-600 text-[12px]">Jumlah yang harus dibayar</Text>
                            <Text className="text-gray-900 font-semibold text-[12px]">
                                {formatRupiah(amountDue)}
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-gray-600 text-[12px]">Kembalian</Text>
                            <Text className="text-gray-900 font-semibold text-[12px]">
                                {formatRupiah(change)}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="mt-5 flex-row gap-3 pb-4">
                    <TouchableOpacity
                        className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white items-center"
                        activeOpacity={0.85}
                        onPress={onClose}
                    >
                        <Text className="text-gray-900 font-semibold">Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-2xl items-center ${isSubmitting ? 'bg-gray-400' : 'bg-gray-900'
                            }`}
                        activeOpacity={0.85}
                        disabled={isSubmitting}
                        onPress={onSubmit}
                    >
                        <Text className="text-white font-semibold">
                            {isSubmitting ? 'Pembayaran berlangsung...' : 'Bayar Sekarang'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheets>
    );
}

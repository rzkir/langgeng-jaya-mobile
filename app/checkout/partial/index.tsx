import { buildStrukMessage } from '@/lib/TemplateStruk';

import { Ionicons } from '@expo/vector-icons';

import { router, useLocalSearchParams } from 'expo-router';

import LottieView from 'lottie-react-native';

import React, { useCallback, useMemo } from 'react';

import { Alert, Share, Text, TouchableOpacity, View } from 'react-native';

import Badge from '@/components/Badge';

import { formatRupiah } from "@/lib/FormatPrice";

export default function CheckoutSuccess() {
    const params = useLocalSearchParams<{
        total?: string;
        transactionNumber?: string;
        paymentMethod?: string;
        receivedAmount?: string;
        change?: string;
        customerName?: string;
        cashierName?: string;
        branchName?: string;
        transactionItems?: string;
    }>();

    const total = Number(params.total || 0);
    const receivedAmount = Number(params.receivedAmount || 0);
    const change = Number(params.change || 0);
    const paidAmount = useMemo(() => Math.min(receivedAmount || 0, total || 0), [receivedAmount, total]);
    const amountDue = useMemo(() => Math.max((total || 0) - paidAmount, 0), [total, paidAmount]);
    const transactionNumber = params.transactionNumber || '-';
    const customerName = params.customerName || '-';
    const cashierName = params.cashierName || '-';
    const branchName = params.branchName || '';
    const formattedTotal = formatRupiah(Number.isFinite(total) ? total : 0);
    const formattedReceivedAmount = formatRupiah(Number.isFinite(receivedAmount) ? receivedAmount : 0);
    const formattedChange = formatRupiah(Number.isFinite(change) ? change : 0);
    const formattedAmountDue = formatRupiah(Number.isFinite(amountDue) ? amountDue : 0);
    // Halaman ini khusus untuk transaksi kasbon, jadi statusnya sudah pasti partial
    const paymentMethodText = 'Kasbon';
    const paymentStatusText = 'Partial';

    const transactionItems: TransactionItemPayload[] = useMemo(() => {
        if (params.transactionItems && typeof params.transactionItems === 'string') {
            try {
                const parsed = JSON.parse(params.transactionItems) as TransactionItemPayload[];
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                console.error('Failed to parse transactionItems params:', error);
            }
        }
        return [];
    }, [params.transactionItems]);

    const handleShare = useCallback(async () => {
        try {
            const message = buildStrukMessage({
                transactionNumber,
                branchName,
                customerName,
                cashierName,
                paymentMethodText,
                formattedTotal,
                formattedReceivedAmount,
                formattedChange,
                formattedAmountDue,
                isCredit: true,
                items: transactionItems,
                formatRupiah,
            });

            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Gagal membagikan', 'Terjadi kesalahan saat membagikan struk.');
        }
    }, [
        transactionItems,
        transactionNumber,
        branchName,
        customerName,
        cashierName,
        paymentMethodText,
        formattedTotal,
        formattedReceivedAmount,
        formattedChange,
        formattedAmountDue,
    ]);

    const handlePrint = useCallback(() => {
        Alert.alert(
            'Cetak struk',
            'Fitur cetak terhubung ke printer akan ditambahkan sesuai perangkat / printer yang digunakan.',
        );
    }, []);

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 items-center px-6 pt-16 pb-6">
                {/* Icon success */}
                <View className="w-40 h-40 items-center justify-center mb-4">
                    <LottieView
                        source={require('../../../assets/json/success.json')}
                        autoPlay
                        loop={true}
                        style={{ width: 100, height: 100 }}
                    />
                </View>

                <Text className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</Text>
                <Text className="text-lg text-gray-500 mb-6">Successfully paid {formattedTotal}</Text>

                {/* Card detail */}
                <View className="w-full rounded-3xl bg-gray-50 shadow-lg border border-gray-100 p-4 mb-4">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Transaction Summary
                            </Text>
                            <Text className="text-gray-900 font-semibold mt-1">Details</Text>
                        </View>
                        <Badge status="pending" label={paymentStatusText} />
                    </View>

                    <View className="h-px bg-gray-200 mb-3" />

                    {/* Transaction number */}
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase tracking-widest">
                                Transaction No.
                            </Text>
                        </View>
                        <Text className="text-gray-900 text-sm font-semibold">{transactionNumber}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase tracking-widest">Customer</Text>
                        </View>
                        <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                            {customerName || '-'}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase tracking-widest">Cashier</Text>
                        </View>
                        <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                            {cashierName || '-'}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase tracking-widest">Payment Status</Text>
                        </View>
                        <Text
                            className="text-sm font-semibold text-amber-700"
                            numberOfLines={1}
                        >
                            {paymentStatusText}
                        </Text>
                    </View>

                    <View className="h-px bg-gray-100 my-1" />

                    {/* Amount breakdown */}
                    <View className="mt-2 space-y-1.5">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-sm">Item Total</Text>
                            <Text className="text-gray-900 text-sm font-semibold">{formattedTotal}</Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-sm">Payment Method</Text>
                            <Text className="text-gray-900 text-sm font-semibold">{paymentMethodText}</Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-sm">Uang Diterima</Text>
                            <Text className="text-gray-900 text-sm font-semibold">{formattedReceivedAmount}</Text>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-500 text-sm">Jumlah yang harus dibayar</Text>
                            <Text className="text-gray-900 text-sm font-semibold">{formattedAmountDue}</Text>
                        </View>
                    </View>

                    <View className="h-px bg-gray-200 my-3" />

                    {/* Grand total */}
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase tracking-widest">
                                Grand Total
                            </Text>
                            <Text className="text-gray-900 font-semibold mt-1">Amount Paid</Text>
                        </View>
                        <Text className="text-emerald-600 font-bold text-lg">{formattedTotal}</Text>
                    </View>
                </View>

                {/* Items detail */}
                {transactionItems.length > 0 && (
                    <View className="w-full rounded-3xl bg-white shadow-lg border border-gray-100 p-4 mb-4">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Items
                            </Text>
                            <Text className="text-gray-500 text-xs">{transactionItems.length} item</Text>
                        </View>

                        <View className="h-px bg-gray-100 mb-3" />

                        <View>
                            {transactionItems.map((item) => (
                                <View
                                    key={item.product_id}
                                    className="flex-row items-center justify-between py-1.5"
                                >
                                    <View className="flex-1 pr-2">
                                        <Text
                                            className="text-gray-900 text-sm font-medium"
                                            numberOfLines={1}
                                        >
                                            {item.product_name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {item.quantity} {item.unit || ''} x {formatRupiah(item.price)}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-900 text-sm font-semibold">
                                        {formatRupiah(item.subtotal)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* CTA Print & Share */}
                <View className="w-full flex-row gap-3 mb-4">
                    <TouchableOpacity
                        className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white flex-row items-center justify-center"
                        activeOpacity={0.9}
                        onPress={handlePrint}
                    >
                        <Ionicons name="print-outline" size={18} color="#111827" />
                        <Text className="ml-2 text-gray-900 font-semibold text-sm">Print Struk</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-1 py-3 rounded-2xl bg-gray-900 flex-row items-center justify-center"
                        activeOpacity={0.9}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                        <Text className="ml-2 text-white font-semibold text-sm">Bagikan</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom primary CTA */}
                <View className="w-full mt-auto">
                    <TouchableOpacity
                        className="w-full py-3 rounded-2xl bg-orange-500 items-center mb-3"
                        activeOpacity={0.9}
                        onPress={() => router.replace('/(tabs)/beranda' as any)}
                    >
                        <Text className="text-white font-semibold">Back Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="w-full py-3 rounded-2xl border border-gray-200 bg-white items-center"
                        activeOpacity={0.9}
                        onPress={() => router.replace('/checkout' as any)}
                    >
                        <Text className="text-gray-900 font-semibold">Create New Order</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
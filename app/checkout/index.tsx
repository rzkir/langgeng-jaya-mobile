import React from 'react';

import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import AddProducts from '@/components/checkout/checkout/AddProducts';

import Payment from '@/components/checkout/checkout/Payment';

import Scanner from '@/components/checkout/checkout/Scanner';

import { useStateCheckout } from '@/services/useStateCheckout';

import { formatRupiah } from "@/lib/FormatPrice";

export default function Checkout() {
    const {
        totalItems,
        removeItem,
        updateItemQuantity,
        clearCart,

        isAddItemSheetVisible,
        setAddItemSheetVisible,
        customQuantities,
        setCustomQuantities,
        searchQuery,
        setSearchQuery,

        isScannerVisible,
        setScannerVisible,
        ScannerComponent,

        isPaymentSheetVisible,
        setPaymentSheetVisible,
        customerName,
        setCustomerName,
        discountInput,
        setDiscountInput,
        paymentMethod,
        setPaymentMethod,
        receivedInput,
        setReceivedInput,
        isSubmitting,

        subtotal,
        discount,
        total,
        receivedAmount,
        change,
        quickAmounts,
        amountDue,
        isEmpty,

        products,
        filteredProducts,
        isProductsLoading,
        productsError,

        isCustomUnit,
        lines,

        handleSubmitTransaction,
        handleOpenScanner,
        handleBarCodeScanned,
    } = useStateCheckout();

    return (
        <View className="flex-1">
            {/* Header */}
            <View className="pt-4 pb-3 flex-row items-center justify-between border-b border-gray-200 mx-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-11 h-11 rounded-2xl bg-white border border-gray-200 items-center justify-center"
                    activeOpacity={0.85}
                >
                    <Ionicons name="chevron-back" size={20} color="#111827" />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-gray-900 font-semibold text-[16px] tracking-tight">Checkout</Text>
                    <View className="mt-1 px-2 py-1 rounded-full bg-white border border-gray-200">
                        <Text className="text-gray-600 text-[11px] font-medium">{totalItems} item</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={clearCart}
                    className={`w-11 h-11 rounded-2xl items-center justify-center border ${isEmpty ? 'bg-white border-gray-200' : 'bg-red-50 border-red-100'}`}
                    activeOpacity={0.85}
                    disabled={isEmpty}
                >
                    <Ionicons name="trash-outline" size={20} color={isEmpty ? '#9CA3AF' : '#EF4444'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="px-4 mt-2"
                contentContainerStyle={{ paddingBottom: 220 }}
            >
                {/* Cart items */}
                {isEmpty ? (
                    <View className="mt-12 items-center px-6">
                        <View className="w-20 h-20 rounded-3xl bg-white border border-gray-200 items-center justify-center">
                            <Ionicons name="cart-outline" size={30} color="#6B7280" />
                        </View>
                        <Text className="text-gray-900 font-semibold mt-5 text-[16px] tracking-tight">Keranjang kosong</Text>

                        <Text className="text-gray-600 text-[13px] mt-2 text-center leading-5">
                            Tambahkan produk dulu, lalu kembali ke sini untuk checkout.
                        </Text>

                        <TouchableOpacity
                            onPress={() => setAddItemSheetVisible(true)}
                            className="mt-5 px-5 py-3 rounded-2xl bg-gray-900"
                            activeOpacity={0.9}
                        >
                            <Text className="text-white font-semibold">Pilih Produk</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="mt-2">
                        {lines.map((item) => {
                            const hasImage = !!item.image_url;
                            return (
                                <View
                                    key={item.id}
                                    className="bg-white border border-gray-200 shadow-sm rounded-3xl p-4 mb-4"
                                >
                                    <View className="flex-row">
                                        {/* image */}
                                        <View className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100">
                                            {hasImage ? (
                                                <Image
                                                    source={{ uri: item.image_url }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Ionicons name="image-outline" size={18} color="#9CA3AF" />
                                                    <Text className="text-gray-400 text-[10px] mt-1">No image</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* info */}
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-gray-900 font-semibold text-[14px] tracking-tight" numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    <View className="mt-1 self-start px-2 py-1 rounded-full bg-gray-50 border border-gray-200">
                                                        <Text className="text-gray-600 text-[11px] font-medium" numberOfLines={1}>
                                                            {item.unit}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => removeItem(item.id)}
                                                    className="w-10 h-10 rounded-2xl bg-white border border-gray-200 items-center justify-center"
                                                    activeOpacity={0.85}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>

                                            <View className="mt-3 flex-row items-center justify-between">
                                                <View>
                                                    <Text className="text-gray-500 text-[11px]">Harga</Text>
                                                    <Text className="text-gray-900 font-semibold text-[16px] tracking-tight mt-0.5">
                                                        {formatRupiah(item.price)}
                                                    </Text>
                                                </View>

                                                {/* stepper / input quantity */}
                                                {isCustomUnit(item.unit) ? (
                                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-2 py-2">
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const step = 0.1;
                                                                const next = Math.max(0, item.quantity - step);
                                                                const normalized = Number(next.toFixed(2));
                                                                updateItemQuantity(item.id, normalized);
                                                                setCustomQuantities((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: String(normalized),
                                                                }));
                                                            }}
                                                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="remove" size={18} color="#111827" />
                                                        </TouchableOpacity>

                                                        <TextInput
                                                            className="mx-2 w-16 text-gray-900 font-semibold text-center px-2 py-2 rounded-xl bg-white border border-gray-200"
                                                            keyboardType="decimal-pad"
                                                            value={
                                                                customQuantities[item.id] !== undefined
                                                                    ? customQuantities[item.id]
                                                                    : String(item.quantity)
                                                            }
                                                            onChangeText={(text) => {
                                                                setCustomQuantities((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: text,
                                                                }));
                                                            }}
                                                            onBlur={() => {
                                                                const raw =
                                                                    customQuantities[item.id] !== undefined
                                                                        ? customQuantities[item.id]
                                                                        : String(item.quantity);
                                                                const parsed = parseFloat(raw.replace(',', '.'));
                                                                if (!Number.isNaN(parsed)) {
                                                                    const normalized = Number(parsed.toFixed(2));
                                                                    updateItemQuantity(item.id, normalized);
                                                                    setCustomQuantities((prev) => ({
                                                                        ...prev,
                                                                        [item.id]: String(normalized),
                                                                    }));
                                                                } else {
                                                                    // jika tidak valid, kembalikan ke quantity sekarang
                                                                    setCustomQuantities((prev) => ({
                                                                        ...prev,
                                                                        [item.id]: String(item.quantity),
                                                                    }));
                                                                }
                                                            }}
                                                            placeholder="Qty"
                                                            placeholderTextColor="#9CA3AF"
                                                        />

                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const step = 0.1;
                                                                const next = item.quantity + step;
                                                                const normalized = Number(next.toFixed(2));
                                                                updateItemQuantity(item.id, normalized);
                                                                setCustomQuantities((prev) => ({
                                                                    ...prev,
                                                                    [item.id]: String(normalized),
                                                                }));
                                                            }}
                                                            className="w-9 h-9 rounded-xl bg-gray-900 items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="add" size={18} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-2 py-2">
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                updateItemQuantity(item.id, item.quantity - 1);
                                                            }}
                                                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="remove" size={18} color="#111827" />
                                                        </TouchableOpacity>

                                                        <View className="mx-3 min-w-[22px] items-center">
                                                            <Text className="text-gray-900 font-semibold text-[14px]">{item.quantity}</Text>
                                                        </View>

                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                updateItemQuantity(item.id, item.quantity + 1);
                                                            }}
                                                            className="w-9 h-9 rounded-xl bg-gray-900 items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="add" size={18} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Summary + actions */}
            <View className="absolute bottom-0 left-0 right-0 px-4 pb-6">
                <View className="bg-white/95 rounded-[28px] border border-gray-200 shadow-xl p-5">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-gray-500 text-[11px]">Ringkasan</Text>
                            <Text className="text-gray-900 font-semibold text-[15px] tracking-tight mt-0.5">
                                Total pembayaran
                            </Text>
                        </View>
                        <View className="px-3 py-2 rounded-2xl bg-emerald-50 bo3der border-emerald-100">
                            <Text className="text-emerald-700 font-semibold text-[13px]">
                                {formatRupiah(total)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-600 text-[13px]">Sub total</Text>
                        <Text className="text-gray-900 font-semibold text-[13px]">{formatRupiah(subtotal)}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-600 text-[13px]">Diskon</Text>
                        <Text className="text-gray-900 font-semibold text-[13px]">{formatRupiah(discount)}</Text>
                    </View>

                    <View className="h-px bg-gray-200/70 mb-4" />

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white items-center flex-row justify-center gap-2"
                            activeOpacity={0.9}
                            disabled={isEmpty}
                            onPress={() => setAddItemSheetVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#111827" />
                            <Text className="text-gray-900 font-semibold">Tambah item</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center gap-2 ${isEmpty ? 'bg-gray-300' : 'bg-gray-900'}`}
                            activeOpacity={0.9}
                            disabled={isEmpty}
                            onPress={() => setPaymentSheetVisible(true)}
                        >
                            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
                            <Text className="text-white font-semibold">Bayar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bottomsheets For Add Products + Scan */}
            <AddProducts
                visible={isAddItemSheetVisible}
                onClose={() => setAddItemSheetVisible(false)}
                searchQuery={searchQuery}
                onChangeSearchQuery={setSearchQuery}
                isProductsLoading={isProductsLoading}
                productsError={productsError}
                products={products}
                filteredProducts={filteredProducts}
                onPressScan={handleOpenScanner}
            />

            {/* Bottomsheets For Payment */}
            <Payment
                visible={isPaymentSheetVisible}
                onClose={() => setPaymentSheetVisible(false)}
                customerName={customerName}
                onChangeCustomerName={setCustomerName}
                paymentMethod={paymentMethod}
                onChangePaymentMethod={setPaymentMethod}
                discountInput={discountInput}
                onChangeDiscountInput={setDiscountInput}
                receivedInput={receivedInput}
                onChangeReceivedInput={setReceivedInput}
                quickAmounts={quickAmounts}
                subtotal={subtotal}
                discount={discount}
                total={total}
                receivedAmount={receivedAmount}
                change={change}
                amountDue={amountDue}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitTransaction}
            />

            {ScannerComponent && (
                <Scanner
                    visible={isScannerVisible}
                    onClose={() => setScannerVisible(false)}
                    ScannerComponent={ScannerComponent}
                    onBarCodeScanned={handleBarCodeScanned}
                />
            )}
        </View>
    );
}
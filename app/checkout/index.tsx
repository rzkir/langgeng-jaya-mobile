import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import BottomSheets from '@/components/BottomSheets';

import { ProductCard } from '@/components/ProductCard';

import { useAuth } from '@/context/AuthContext';

import { useCart } from '@/context/CartContext';

import { useQuery } from '@tanstack/react-query';

import { fetchKaryawanProducts } from '@/services/FetchProducts';
import { postTransaction } from '@/services/PostTransactions';

function formatRupiah(value: number) {
    return `Rp ${Math.max(0, Math.round(value)).toLocaleString('id-ID')}`;
}

export default function Checkout() {
    const { user } = useAuth();
    const branchName = user?.branchName || '';

    const { items, totalItems, totalPrice, removeItem, updateItemQuantity, clearCart, addItem } = useCart();
    const [isAddItemSheetVisible, setAddItemSheetVisible] = useState(false);
    const [customQuantities, setCustomQuantities] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isScannerVisible, setScannerVisible] = useState(false);
    const [ScannerComponent, setScannerComponent] = useState<any | null>(null);
    const [isPaymentSheetVisible, setPaymentSheetVisible] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [discountInput, setDiscountInput] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'kasbon'>('cash');
    const [receivedInput, setReceivedInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const CUSTOM_UNITS = useMemo(() => ['kg', 'meter', 'liter'], []);

    const isCustomUnit = useCallback(
        (unit?: string | null) => {
            if (!unit) return false;
            const normalized = unit.trim().toLowerCase();
            return CUSTOM_UNITS.includes(normalized);
        },
        [CUSTOM_UNITS],
    );

    // Sinkronkan state input custom dengan isi cart
    useEffect(() => {
        setCustomQuantities((prev) => {
            const next: Record<string, string> = { ...prev };

            // Perbarui / isi untuk item yang ada
            for (const it of items) {
                if (isCustomUnit(it.product.unit)) {
                    const current = next[it.product.id];
                    const desired = String(it.quantity);
                    if (current === undefined || current !== desired) {
                        next[it.product.id] = desired;
                    }
                }
            }

            // Hapus entry untuk item yang sudah tidak ada
            for (const key of Object.keys(next)) {
                const stillExists = items.some((it) => it.product.id === key && isCustomUnit(it.product.unit));
                if (!stillExists) {
                    delete next[key];
                }
            }

            return next;
        });
    }, [items, isCustomUnit]);

    const {
        data: productsData,
        isLoading: isProductsLoading,
        error: productsError,
    } = useQuery({
        queryKey: ['karyawan-products-checkout', branchName],
        queryFn: () => fetchKaryawanProducts(branchName),
        enabled: !!branchName && isAddItemSheetVisible,
    });

    const products = useMemo(() => productsData?.data ?? [], [productsData]);

    const subtotal = totalPrice;
    const discount = useMemo(() => {
        const numeric = parseInt(discountInput.replace(/[^0-9]/g, ''), 10);
        if (Number.isNaN(numeric)) return 0;
        return Math.min(subtotal, numeric);
    }, [discountInput, subtotal]);
    const subtotalAfterDiscount = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
    const total = subtotalAfterDiscount;

    const receivedAmount = useMemo(() => {
        const numeric = parseInt(receivedInput.replace(/[^0-9]/g, ''), 10);
        if (Number.isNaN(numeric)) return 0;
        return numeric;
    }, [receivedInput]);

    const change = useMemo(() => {
        if (receivedAmount <= 0) return 0;
        return Math.max(receivedAmount - total, 0);
    }, [receivedAmount, total]);

    const quickAmounts = useMemo(() => {
        const base = Math.max(total, 0);
        const candidates = [base, base + 5000, base + 10000, 50000, 100000];
        // hilangkan duplikat dan nilai <= 0
        return Array.from(new Set(candidates.filter((v) => v > 0)));
    }, [total]);

    const isEmpty = items.length === 0;

    const paidAmount = useMemo(() => {
        // Mengikuti logika di web: kalau bukan kasbon, paid = total; kalau kasbon, pakai nilai input (maksimal total)
        if (paymentMethod !== 'kasbon') {
            return total;
        }
        return Math.min(receivedAmount || 0, total);
    }, [paymentMethod, receivedAmount, total]);

    const handleSubmitTransaction = useCallback(async () => {
        if (isEmpty) {
            Alert.alert('Keranjang kosong', 'Tambahkan produk terlebih dahulu.');
            return;
        }

        if (paymentMethod === 'kasbon' && !customerName.trim()) {
            Alert.alert('Nama pelanggan wajib', 'Masukkan nama pelanggan untuk transaksi kasbon.');
            return;
        }

        if (total <= 0) {
            Alert.alert('Total tidak valid', 'Total pembayaran harus lebih dari 0.');
            return;
        }

        setIsSubmitting(true);

        try {
            const transactionItems = items.map((cartItem) => ({
                product_id: String(cartItem.product.id),
                product_name: cartItem.product.name,
                image_url: cartItem.product.image_url,
                quantity: cartItem.quantity,
                price: cartItem.product.price,
                subtotal: cartItem.product.price * cartItem.quantity,
                unit: cartItem.product.unit,
            }));

            const response = await postTransaction({
                customer_name: customerName || '',
                created_by: user?.name || '',
                subtotal: subtotalAfterDiscount,
                tax: 0,
                total,
                discount,
                paid_amount: paidAmount,
                is_credit: paymentMethod === 'kasbon',
                branch_name: branchName,
                payment_method: paymentMethod,
                status: paymentMethod === 'kasbon' ? 'pending' : 'completed',
                items: transactionItems,
            });

            clearCart();
            setCustomerName('');
            setDiscountInput('0');
            setPaymentMethod('cash');
            setReceivedInput('');
            setPaymentSheetVisible(false);

            const transactionNumber =
                (response as any)?.data?.transaction_number || (response as any)?.data?.id || '';

            router.push({
                pathname: '/checkout/success',
                params: {
                    total: String(total),
                    transactionNumber,
                    paymentMethod,
                    receivedAmount: String(receivedAmount),
                    change: String(change),
                    customerName: customerName || '',
                    cashierName: user?.name || '',
                    branchName,
                    transactionItems: JSON.stringify(transactionItems),
                },
            } as any);
        } catch (err) {
            console.error('Gagal membuat transaksi:', err);
            Alert.alert(
                'Gagal membuat transaksi',
                err instanceof Error ? err.message : 'Terjadi kesalahan, silakan coba lagi.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isEmpty,
        paymentMethod,
        customerName,
        total,
        items,
        subtotalAfterDiscount,
        discount,
        paidAmount,
        receivedAmount,
        change,
        branchName,
        user?.name,
        clearCart,
    ]);

    const lines = useMemo(() => {
        return items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            unit: it.product.unit,
            image_url: it.product.image_url,
            price: it.product.price,
            quantity: it.quantity,
        }));
    }, [items]);

    const filteredProducts = useMemo(() => {
        if (!products || !Array.isArray(products)) return [];
        if (!searchQuery.trim()) return products;

        const q = searchQuery.trim().toLowerCase();
        return products.filter((p: Product) => {
            const nameStr = (p.name ?? '').toString();
            const rawBarcode = p.barcode ?? '';
            const barcodeStr = typeof rawBarcode === 'string' ? rawBarcode : String(rawBarcode);

            const nameMatch = nameStr.toLowerCase().includes(q);
            const barcodeMatch = barcodeStr.toLowerCase().includes(q);

            return nameMatch || barcodeMatch;
        });
    }, [products, searchQuery]);

    const handleOpenScanner = async () => {
        // Reset dulu komponen scanner
        setScannerComponent(null);

        try {
            const cameraModule = await import('expo-camera');

            // Sesuaikan dengan struktur expo-camera v17 (SDK 54):
            // - Camera: class dengan static requestCameraPermissionsAsync / requestPermissionsAsync
            // - CameraView: komponen utama untuk preview (bisa undefined di beberapa versi)
            const Camera = (cameraModule as any).Camera ?? (cameraModule as any).default;
            const CameraView = (cameraModule as any).CameraView ?? Camera ?? (cameraModule as any).default;

            const requestPermissionsAsync =
                Camera?.requestCameraPermissionsAsync ??
                Camera?.requestPermissionsAsync ??
                (cameraModule as any).requestCameraPermissionsAsync ??
                (cameraModule as any).requestPermissionsAsync;

            if (typeof requestPermissionsAsync !== 'function') {
                throw new Error('Permission helper for camera is not available');
            }

            const { status } = await requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Izin kamera ditolak',
                    'Aktifkan izin kamera di pengaturan untuk menggunakan scan barcode.',
                );
                return;
            }

            if (!CameraView) {
                throw new Error('Camera / CameraView component is not available');
            }

            setScannerComponent(() => CameraView);
            setScannerVisible(true);
        } catch {
            Alert.alert(
                'Scan tidak tersedia',
                'Fitur scan barcode belum tersedia di build / perangkat ini. Silakan gunakan pencarian manual.',
            );
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScannerVisible(false);

        if (!data) return;

        const scanned = String(data).trim();
        if (!scanned) return;

        // Cari produk berdasarkan barcode yang discan
        const found = products.find((p: Product) => {
            const rawBarcode = p.barcode ?? '';
            const barcodeStr = typeof rawBarcode === 'string' ? rawBarcode : String(rawBarcode);
            return barcodeStr.trim() === scanned;
        });

        if (found) {
            // Tambahkan langsung ke cart (akan menambah quantity jika sudah ada)
            addItem(found, 1);
        } else {
            // Jika tidak ketemu, gunakan sebagai kata kunci pencarian di bottom sheet
            setSearchQuery(scanned);
            setAddItemSheetVisible(true);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 pt-4 pb-3 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-11 h-11 rounded-2xl bg-gray-100 items-center justify-center"
                    activeOpacity={0.85}
                >
                    <Ionicons name="chevron-back" size={20} color="#111827" />
                </TouchableOpacity>

                <View className="flex-1 items-center">
                    <Text className="text-gray-900 font-semibold text-base">Checkout</Text>
                    <Text className="text-gray-400 text-xs">{totalItems} item</Text>
                </View>

                <TouchableOpacity
                    onPress={clearCart}
                    className="w-11 h-11 rounded-2xl bg-red-50 items-center justify-center"
                    activeOpacity={0.85}
                    disabled={isEmpty}
                >
                    <Ionicons name="trash-outline" size={20} color={isEmpty ? '#FCA5A5' : '#EF4444'} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 170 }}
                className="px-4"
            >
                {/* Cart items */}
                {isEmpty ? (
                    <View className="mt-10 items-center">
                        <View className="w-16 h-16 rounded-3xl bg-gray-100 items-center justify-center">
                            <Ionicons name="cart-outline" size={28} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold mt-4">Keranjang kosong</Text>
                        <Text className="text-gray-500 text-sm mt-1 text-center">
                            Tambahkan produk dulu, lalu kembali ke sini untuk checkout.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/beranda' as any)}
                            className="mt-5 px-5 py-3 rounded-2xl bg-gray-900"
                            activeOpacity={0.9}
                        >
                            <Text className="text-white font-semibold">Kembali belanja</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="mt-2">
                        {lines.map((item) => {
                            const hasImage = !!item.image_url;
                            return (
                                <View
                                    key={item.id}
                                    className="bg-white border border-gray-100 shadow-sm rounded-3xl p-3 mb-4"
                                >
                                    <View className="flex-row">
                                        {/* image */}
                                        <View className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden">
                                            {hasImage ? (
                                                <Image
                                                    source={{ uri: item.image_url }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Text className="text-gray-400 text-[10px]">No Image</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* info */}
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row items-start justify-between">
                                                <View className="flex-1 pr-2">
                                                    <Text className="text-gray-900 font-semibold text-sm" numberOfLines={1}>
                                                        {item.name}
                                                    </Text>
                                                    <Text className="text-gray-500 text-[11px]" numberOfLines={1}>
                                                        {item.unit}
                                                    </Text>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => removeItem(item.id)}
                                                    className="w-9 h-9 rounded-2xl bg-red-50 items-center justify-center"
                                                    activeOpacity={0.85}
                                                >
                                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>

                                            <View className="mt-3 flex-row items-center justify-between">
                                                <Text className="text-gray-900 font-semibold text-base">
                                                    {formatRupiah(item.price)}
                                                </Text>

                                                {/* stepper / input quantity */}
                                                {isCustomUnit(item.unit) ? (
                                                    <View className="flex-row items-center bg-gray-100 rounded-2xl px-2 py-2">
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
                                                            className="w-8 h-8 rounded-xl bg-white items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="remove" size={18} color="#111827" />
                                                        </TouchableOpacity>

                                                        <TextInput
                                                            className="mx-1 w-16 text-gray-900 font-semibold text-center px-2 py-1 rounded-xl bg-white"
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
                                                            className="w-8 h-8 rounded-xl bg-emerald-500 items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="add" size={18} color="#FFFFFF" />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <View className="flex-row items-center bg-gray-100 rounded-2xl px-2 py-2">
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                updateItemQuantity(item.id, item.quantity - 1);
                                                            }}
                                                            className="w-8 h-8 rounded-xl bg-white items-center justify-center"
                                                            activeOpacity={0.85}
                                                        >
                                                            <Ionicons name="remove" size={18} color="#111827" />
                                                        </TouchableOpacity>

                                                        <Text className="mx-3 text-gray-900 font-semibold min-w-[18px] text-center">
                                                            {item.quantity}
                                                        </Text>

                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                updateItemQuantity(item.id, item.quantity + 1);
                                                            }}
                                                            className="w-8 h-8 rounded-xl bg-emerald-500 items-center justify-center"
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
            <View className="absolute bottom-0 left-0 right-0 px-5 pb-6">
                <View className="bg-white rounded-3xl border border-gray-100 shadow-xl p-5">
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-gray-500 text-sm">Sub total :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(subtotal)}</Text>
                    </View>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-gray-500 text-sm">Discount :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(discount)}</Text>
                    </View>

                    <View className="h-px bg-gray-100 mb-3" />

                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-gray-900 font-semibold text-sm">total :</Text>
                        <Text className="text-gray-900 font-semibold text-sm">{formatRupiah(total)}</Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white items-center"
                            activeOpacity={0.9}
                            disabled={isEmpty}
                            onPress={() => setAddItemSheetVisible(true)}
                        >
                            <Text className="text-gray-900 font-semibold">Tambah item</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-2xl items-center ${isEmpty ? 'bg-emerald-200' : 'bg-emerald-500'}`}
                            activeOpacity={0.9}
                            disabled={isEmpty}
                            onPress={() => setPaymentSheetVisible(true)}
                        >
                            <Text className="text-white font-semibold">Bayar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <BottomSheets
                visible={isAddItemSheetVisible}
                onClose={() => setAddItemSheetVisible(false)}
                title="Tambah item"
            >
                <View className="mt-1 max-h-[500px]">
                    {/* Search & Scan */}
                    <View className="flex-row items-center mb-3 gap-2">
                        <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-3">
                            <Ionicons name="search-outline" size={18} color="#6B7280" />
                            <TextInput
                                className="flex-1 ml-2 py-2 text-gray-900"
                                placeholder="Cari nama / barcode produk"
                                placeholderTextColor="#9CA3AF"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <TouchableOpacity
                            className="w-11 h-11 rounded-2xl bg-gray-900 items-center justify-center"
                            activeOpacity={0.85}
                            onPress={handleOpenScanner}
                        >
                            <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {isProductsLoading && (
                        <FlatList
                            data={Array.from({ length: 6 }, (_, i) => i.toString())}
                            keyExtractor={(item) => item}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                            renderItem={() => (
                                <View className="flex-1 bg-gray-100 rounded-2xl p-3 animate-pulse">
                                    <View className="w-full aspect-square rounded-2xl bg-gray-200 mb-3" />
                                    <View className="h-3 w-3/4 rounded-full bg-gray-200 mb-2" />
                                    <View className="h-3 w-1/2 rounded-full bg-gray-200" />
                                </View>
                            )}
                        />
                    )}

                    {productsError && !isProductsLoading && (
                        <Text className="text-red-500 text-sm">
                            {productsError instanceof Error
                                ? productsError.message
                                : 'Gagal memuat produk.'}
                        </Text>
                    )}

                    {!isProductsLoading && !productsError && products.length === 0 && (
                        <Text className="text-gray-500 text-sm">Belum ada produk.</Text>
                    )}

                    {!isProductsLoading && !productsError && products.length > 0 && filteredProducts.length === 0 && (
                        <Text className="text-gray-500 text-sm">Produk tidak ditemukan.</Text>
                    )}

                    {!isProductsLoading && !productsError && filteredProducts.length > 0 && (
                        <FlatList
                            data={filteredProducts}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            columnWrapperStyle={{ gap: 8 }}
                            renderItem={({ item }) => (
                                <View className="flex-1">
                                    <ProductCard product={item} />
                                </View>
                            )}
                        />
                    )}
                </View>
            </BottomSheets>

            <BottomSheets
                visible={isPaymentSheetVisible}
                onClose={() => setPaymentSheetVisible(false)}
                title="Pembayaran"
            >
                <View className="mt-1">
                    <Text className="text-gray-900 text-sm mb-1">Nama pelanggan</Text>
                    <TextInput
                        className="w-full rounded-2xl bg-gray-100 px-3 py-2 text-gray-900"
                        placeholder="Masukkan nama pelanggan"
                        placeholderTextColor="#9CA3AF"
                        value={customerName}
                        onChangeText={setCustomerName}
                    />

                    <Text className="text-gray-900 text-sm mt-4 mb-1">Metode pembayaran</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className={`flex-1 py-2 rounded-2xl border items-center ${paymentMethod === 'cash'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-white border-gray-200'
                                }`}
                            activeOpacity={0.85}
                            onPress={() => setPaymentMethod('cash')}
                        >
                            <Text
                                className={`font-semibold ${paymentMethod === 'cash' ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                Cash
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-2 rounded-2xl border items-center ${paymentMethod === 'kasbon'
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'bg-white border-gray-200'
                                }`}
                            activeOpacity={0.85}
                            onPress={() => setPaymentMethod('kasbon')}
                        >
                            <Text
                                className={`font-semibold ${paymentMethod === 'kasbon' ? 'text-white' : 'text-gray-900'
                                    }`}
                            >
                                Kasbon
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-900 text-sm mt-4 mb-1">Diskon (Rp)</Text>
                    <TextInput
                        className="w-full rounded-2xl bg-gray-100 px-3 py-2 text-gray-900"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={discountInput}
                        onChangeText={setDiscountInput}
                    />

                    <Text className="text-gray-900 text-sm mt-4 mb-1">Uang diterima</Text>
                    <TextInput
                        className="w-full rounded-2xl bg-gray-100 px-3 py-2 text-gray-900"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={receivedInput}
                        onChangeText={setReceivedInput}
                    />
                    {quickAmounts.length > 0 && (
                        <View className="mt-2 flex-row flex-wrap gap-2">
                            {quickAmounts.map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    className="px-3 py-2 rounded-2xl bg-white border border-gray-200"
                                    activeOpacity={0.85}
                                    onPress={() => setReceivedInput(String(amount))}
                                >
                                    <Text className="text-gray-900 text-xs font-semibold">
                                        {formatRupiah(amount)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Summary pembayaran */}
                    <View className="mt-5 rounded-2xl bg-gray-50 p-4">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-xs">Sub total</Text>
                            <Text className="text-gray-900 font-semibold text-xs">
                                {formatRupiah(subtotal)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-500 text-xs">Diskon</Text>
                            <Text className="text-gray-900 font-semibold text-xs">
                                {formatRupiah(discount)}
                            </Text>
                        </View>
                        <View className="h-px bg-gray-200 my-1" />
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-gray-900 font-semibold text-sm">Total bayar</Text>
                            <Text className="text-emerald-600 font-semibold text-sm">
                                {formatRupiah(total)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-gray-500 text-xs">Uang diterima</Text>
                            <Text className="text-gray-900 font-semibold text-xs">
                                {formatRupiah(receivedAmount)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mt-1">
                            <Text className="text-gray-500 text-xs">Kembalian</Text>
                            <Text className="text-gray-900 font-semibold text-xs">
                                {formatRupiah(change)}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-5 flex-row gap-3 pb-4">
                        <TouchableOpacity
                            className="flex-1 py-3 rounded-2xl border border-gray-200 bg-white items-center"
                            activeOpacity={0.85}
                            onPress={() => setPaymentSheetVisible(false)}
                        >
                            <Text className="text-gray-900 font-semibold">Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 py-3 rounded-2xl items-center ${isSubmitting ? 'bg-emerald-300' : 'bg-emerald-500'
                                }`}
                            activeOpacity={0.85}
                            disabled={isSubmitting}
                            onPress={handleSubmitTransaction}
                        >
                            <Text className="text-white font-semibold">
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheets>

            {ScannerComponent && (
                <Modal
                    visible={isScannerVisible}
                    animationType="slide"
                    onRequestClose={() => setScannerVisible(false)}
                >
                    <View className="flex-1 bg-black">
                        <ScannerComponent
                            style={{ flex: 1 }}
                            // Dukungan untuk API lama (Camera.onBarCodeScanned) dan baru (CameraView.onBarcodeScanned)
                            onBarCodeScanned={handleBarCodeScanned}
                            onBarcodeScanned={handleBarCodeScanned}
                            barcodeScannerSettings={{
                                // tipe-tipe barcode umum, bisa disesuaikan kebutuhan
                                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
                            }}
                        />
                        <View className="absolute top-12 left-0 right-0 items-center">
                            <Text className="text-white text-lg font-semibold">Arahkan ke barcode produk</Text>
                        </View>
                        <View className="absolute bottom-10 left-0 right-0 items-center">
                            <TouchableOpacity
                                className="px-5 py-3 rounded-2xl bg-white/80"
                                activeOpacity={0.85}
                                onPress={() => setScannerVisible(false)}
                            >
                                <Text className="text-gray-900 font-semibold">Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}
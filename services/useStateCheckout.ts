import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { router } from 'expo-router';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';

import { useCart } from '@/context/CartContext';

import { fetchKaryawanProducts } from '@/services/FetchProducts';

import { postTransaction } from '@/services/PostTransactions';

export function useStateCheckout(): UseStateCheckoutResult {
    const { user } = useAuth();
    const userName = user?.name || '';
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
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
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
    } = useQuery<any, Error>({
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
        return Array.from(new Set(candidates.filter((v) => v > 0)));
    }, [total]);

    const isEmpty = items.length === 0;

    const paidAmount = useMemo(() => {
        if (paymentMethod !== 'kasbon') {
            return total;
        }
        return Math.min(receivedAmount || 0, total);
    }, [paymentMethod, receivedAmount, total]);

    const amountDue = useMemo(() => {
        if (paymentMethod !== 'kasbon') return 0;
        return Math.max(total - paidAmount, 0);
    }, [paymentMethod, total, paidAmount]);

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

        if (paymentMethod === 'cash') {
            if (!receivedInput.trim() || receivedAmount <= 0) {
                Alert.alert('Uang diterima belum diisi', 'Masukkan nominal uang yang diterima.');
                return;
            }

            if (receivedAmount < total) {
                Alert.alert('Uang diterima kurang', 'Nominal uang yang diterima harus sama atau lebih dari total pembayaran.');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const transactionItems: TransactionItemPayload[] = items.map((cartItem) => ({
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
                created_by: userName || '',
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
                pathname: paymentMethod === 'kasbon' ? '/checkout/partial' : '/checkout/success',
                params: {
                    total: String(total),
                    transactionNumber,
                    paymentMethod,
                    receivedAmount: String(receivedAmount),
                    change: String(change),
                    customerName: customerName || '',
                    cashierName: userName || '',
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
        receivedInput,
        change,
        branchName,
        userName,
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

    const handleOpenScanner = useCallback(async () => {
        setScannerComponent(null);

        try {
            const cameraModule = await import('expo-camera');

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
    }, []);

    const handleBarCodeScanned = useCallback(
        ({ data }: { data: string }) => {
            setScannerVisible(false);

            if (!data) return;

            const scanned = String(data).trim();
            if (!scanned) return;

            const found = products.find((p: Product) => {
                const rawBarcode = p.barcode ?? '';
                const barcodeStr = typeof rawBarcode === 'string' ? rawBarcode : String(rawBarcode);
                return barcodeStr.trim() === scanned;
            });

            if (found) {
                addItem(found, 1);
            } else {
                setSearchQuery(scanned);
                setAddItemSheetVisible(true);
            }
        },
        [addItem, products],
    );

    return {
        userName,
        branchName,

        items,
        totalItems,
        totalPrice,
        removeItem,
        updateItemQuantity,
        clearCart,
        addItem,

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
        subtotalAfterDiscount,
        total,
        receivedAmount,
        change,
        quickAmounts,
        paidAmount,
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
    };
}

import { useCallback, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useQuery } from '@tanstack/react-query';

import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

import { fetchCategories, fetchKaryawanProducts, fetchProductsPopular } from '@/services/FetchProducts';

export function useStateBeranda(): UseStateBerandaResult {
    const { user } = useAuth();
    const { totalItems, totalPrice, clearCart, addItem } = useCart();
    const branchName = user?.branchName || '';

    const {
        data,
        isLoading,
        error,
        refetch: refetchProducts,
    } = useQuery<any, Error>({
        queryKey: ['karyawan-products', branchName],
        queryFn: () => fetchKaryawanProducts(branchName),
        enabled: !!branchName,
    });

    const products = useMemo(() => data?.data ?? [], [data]);

    const {
        data: popularData,
        isLoading: popularLoading,
        error: popularError,
        refetch: refetchPopular,
    } = useQuery<any, Error>({
        queryKey: ['karyawan-products-popular', branchName],
        queryFn: () => fetchProductsPopular(branchName, 10),
        enabled: !!branchName,
    });

    const popularProducts = useMemo(() => popularData?.data ?? [], [popularData]);

    const {
        data: categoriesData,
        isLoading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories,
    } = useQuery<any, Error>({
        queryKey: ['karyawan-categories', branchName],
        queryFn: fetchCategories,
    });

    const categories = categoriesData?.data ?? [];

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const errorMessage = error instanceof Error ? error.message : 'Gagal memuat produk';
    const popularErrorMessage = popularError instanceof Error ? popularError.message : 'Gagal memuat produk popular';
    const categoriesErrorMessage = categoriesError instanceof Error ? categoriesError.message : 'Gagal memuat kategori';

    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [isScannerVisible, setScannerVisible] = useState(false);
    const [ScannerComponent, setScannerComponent] = useState<any | null>(null);

    const filteredProducts = useMemo(() => {
        if (!selectedCategory) {
            return products;
        }
        return products.filter(
            (product: Product) =>
                product.category_name && product.category_name.toLowerCase() === selectedCategory.toLowerCase(),
        );
    }, [products, selectedCategory]);

    const handleConfirmDelete = useCallback(() => {
        clearCart();
        setIsConfirmVisible(false);
        Toast.show({
            type: 'error',
            topOffset: 50,
            text1: 'Keranjang dikosongkan',
            text2: 'Semua item berhasil dihapus.',
        });
    }, [clearCart]);

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
        ({ data: scannedData }: { data: string }) => {
            setScannerVisible(false);

            if (!scannedData) return;
            const scanned = String(scannedData).trim();
            if (!scanned) return;

            const found = products.find((p: Product) => {
                const rawBarcode = p.barcode ?? '';
                const barcodeStr = typeof rawBarcode === 'string' ? rawBarcode : String(rawBarcode);
                return barcodeStr.trim() === scanned;
            });

            if (found) {
                addItem(found, 1);
                Toast.show({
                    type: 'success',
                    topOffset: 50,
                    text1: 'Produk ditambahkan',
                    text2: `${found.name} masuk ke keranjang.`,
                });
            } else {
                Toast.show({
                    type: 'error',
                    topOffset: 50,
                    text1: 'Produk tidak ditemukan',
                    text2: `Barcode: ${scanned}`,
                });
            }
        },
        [addItem, products],
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const tasks: Promise<unknown>[] = [refetchCategories()];
            if (branchName) {
                tasks.push(refetchProducts());
                tasks.push(refetchPopular());
            }
            await Promise.all(tasks);
        } finally {
            setIsRefreshing(false);
        }
    }, [branchName, refetchCategories, refetchPopular, refetchProducts]);

    return {
        branchName,

        totalItems,
        totalPrice,
        clearCart,
        addItem,

        products,
        isLoading,
        error,
        errorMessage,

        popularProducts,
        popularLoading,
        popularError,
        popularErrorMessage,

        categories,
        categoriesLoading,
        categoriesError,
        categoriesErrorMessage,

        selectedCategory,
        setSelectedCategory,
        filteredProducts,

        isConfirmVisible,
        setIsConfirmVisible,
        handleConfirmDelete,

        isRefreshing,
        handleRefresh,

        isScannerVisible,
        setScannerVisible,
        ScannerComponent,
        handleOpenScanner,
        handleBarCodeScanned,
    };
}

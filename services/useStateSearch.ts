import { useAuth } from '@/context/AuthContext';

import { useCart } from '@/context/CartContext';

import { fetchCategories, fetchProductsSearch } from '@/services/FetchProducts';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { useCallback, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import Toast from 'react-native-toast-message';

const LIMIT = 10;

export function useStateSearch(): UseStateSearchResult {
    const { user } = useAuth();
    const { totalItems, totalPrice, clearCart, addItem } = useCart();
    const branchName = user?.branchName || '';

    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);
    const [isCategorySheetVisible, setIsCategorySheetVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isScannerVisible, setScannerVisible] = useState(false);
    const [ScannerComponent, setScannerComponent] = useState<any | null>(null);

    const handleConfirmDelete = useCallback(() => {
        clearCart();
        setIsConfirmVisible(false);
    }, [clearCart]);

    const handleOpenScanner = useCallback(async () => {
        setScannerComponent(null);
        try {
            const cameraModule = await import('expo-camera');
            const Camera = (cameraModule as any).Camera ?? (cameraModule as any).default;
            const CameraView = (cameraModule as any).CameraView ?? Camera ?? (cameraModule as any).default;
            const requestPermissionsAsync =
                Camera?.requestCameraPermissionsAsync ??
                (cameraModule as any).requestCameraPermissionsAsync;
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

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['products-search', branchName],
        queryFn: ({ pageParam }) =>
            fetchProductsSearch(branchName, pageParam as number, LIMIT),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const pagination = lastPage?.pagination;
            if (!pagination?.hasNext) return undefined;
            return pagination.page + 1;
        },
        enabled: !!branchName,
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['karyawan-categories', branchName],
        queryFn: fetchCategories,
        enabled: !!branchName,
    });
    const rawCategories = categoriesData?.data;
    const categories = Array.isArray(rawCategories) ? rawCategories : [];

    const products = useMemo(
        () => data?.pages?.flatMap((p) => p.data ?? []) ?? [],
        [data?.pages],
    );

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory) {
            result = result.filter(
                (p) => p.category_name?.toLowerCase() === selectedCategory.toLowerCase(),
            );
        }
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.barcode?.toLowerCase().includes(q) ||
                    p.category_name?.toLowerCase().includes(q),
            );
        }
        return result;
    }, [products, searchQuery, selectedCategory]);

    const errorMessage = error instanceof Error ? error.message : 'Gagal memuat produk';

    const handleBarCodeScanned = useCallback(
        ({ data: scannedData }: { data: string }) => {
            setScannerVisible(false);
            if (!scannedData) return;
            const scanned = String(scannedData).trim();
            if (!scanned) return;
            const found = products.find((p) => {
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

    return {
        branchName,
        totalItems,
        totalPrice,
        clearCart,
        addItem,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isCategorySheetVisible,
        setIsCategorySheetVisible,
        categories,
        products,
        filteredProducts,
        isLoading,
        isError,
        error: error ?? null,
        errorMessage,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isRefetching,
        refetch,
        isConfirmVisible,
        setIsConfirmVisible,
        handleConfirmDelete,
        isScannerVisible,
        setScannerVisible,
        ScannerComponent,
        handleOpenScanner,
        handleBarCodeScanned,
    };
}

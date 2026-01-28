import { useCallback, useMemo, useState } from 'react';

import { Alert } from 'react-native';

import { useQuery } from '@tanstack/react-query';

import Toast from 'react-native-toast-message';

import { useAuth } from '@/context/AuthContext';

import { useCart } from '@/context/CartContext';

import { fetchKaryawanProducts } from '@/services/FetchProducts';

export function useStateProducts(): UseStateProductsResult {
    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const { addItem, totalItems, totalPrice, clearCart } = useCart();

    const [isScannerVisible, setScannerVisible] = useState(false);
    const [ScannerComponent, setScannerComponent] = useState<any | null>(null);

    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const {
        data,
        isLoading,
        error,
        refetch,
    } = useQuery<any, Error>({
        queryKey: ['karyawan-products', branchName],
        queryFn: () => fetchKaryawanProducts(branchName),
        enabled: !!branchName,
    });

    const products = useMemo(() => data?.data ?? [], [data]);

    const errorMessage = error instanceof Error ? error.message : 'Gagal memuat produk';

    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

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

    return {
        branchName,

        addItem,
        totalItems,
        totalPrice,
        clearCart,

        products,
        isLoading,
        error,
        errorMessage,
        refetch,

        isRefreshing,
        handleRefresh,

        isScannerVisible,
        setScannerVisible,
        ScannerComponent,
        handleOpenScanner,
        handleBarCodeScanned,

        isConfirmVisible,
        setIsConfirmVisible,
        handleConfirmDelete,
    };
}

import { useLocalSearchParams } from 'expo-router';

import { useCallback, useMemo } from 'react';

import { Alert, Share } from 'react-native';

import { buildStrukMessage } from '@/lib/TemplateStruk';

import { formatRupiah } from '@/lib/FormatPrice';

export function useStateSuccess(): UseStateSuccessResult {
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
    const transactionNumber = params.transactionNumber || '-';
    const customerName = params.customerName || '-';
    const cashierName = params.cashierName || '-';
    const branchName = params.branchName || '';

    const formattedTotal = formatRupiah(Number.isFinite(total) ? total : 0);
    const formattedReceivedAmount = formatRupiah(Number.isFinite(receivedAmount) ? receivedAmount : 0);
    const formattedChange = formatRupiah(Number.isFinite(change) ? change : 0);

    // Halaman ini khusus untuk transaksi yang sudah paid (cash)
    const paymentMethodText = 'Cash';

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
    ]);

    const handlePrint = useCallback(() => {
        Alert.alert(
            'Cetak struk',
            'Fitur cetak terhubung ke printer akan ditambahkan sesuai perangkat / printer yang digunakan.',
        );
    }, []);

    return {
        total,
        receivedAmount,
        change,
        transactionNumber,
        customerName,
        cashierName,
        branchName,
        formattedTotal,
        formattedReceivedAmount,
        formattedChange,
        paymentMethodText,
        transactionItems,
        handleShare,
        handlePrint,
    };
}
import * as ImagePicker from 'expo-image-picker';

import { useCallback, useMemo, useState } from 'react';

import { Alert, Platform } from 'react-native';

import { useAuth } from '@/context/AuthContext';

import { fetchLaporan } from '@/services/FetchLaporan';

import { postLaporan } from '@/services/PostLaporan';

import { uploadLaporanReceipt } from '@/services/UploadLaporan';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const LIMIT = 10;

function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export const CATEGORIES: StoreExpense['category'][] = ['operasional', 'listrik', 'air', 'pembelian', 'lainnya'];

export const CATEGORY_LABELS: Record<StoreExpense['category'], string> = {
    operasional: 'Operasional',
    listrik: 'Listrik',
    air: 'Air',
    pembelian: 'Pembelian',
    lainnya: 'Lainnya',
};

export const STATUS_LABELS: Record<StoreExpense['status'], string> = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export const STATUS_COLORS: Record<StoreExpense['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

export function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export function formatRupiahInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') return '';
    const num = parseInt(digits, 10);
    return num.toLocaleString('id-ID');
}

export function useStateLaporan() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const userName = user?.name || user?.email || '';

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['laporan', branchName, 1, LIMIT],
        queryFn: () => fetchLaporan(branchName, 1, LIMIT),
        enabled: !!branchName,
        refetchOnMount: false,
    });

    const records = useMemo<StoreExpense[]>(() => data?.data ?? [], [data?.data]);
    const pagination = data?.pagination;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['laporan', branchName, 1, LIMIT] });
    };

    const createMutation = useMutation({
        mutationFn: postLaporan,
        onSuccess: invalidate,
    });

    // Form & sheet state
    const [sheetOpen, setSheetOpen] = useState(false);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
    const [selectedLaporan, setSelectedLaporan] = useState<StoreExpense | null>(null);
    const [formDate, setFormDate] = useState(getTodayISO);
    const [formCategory, setFormCategory] = useState<StoreExpense['category']>('lainnya');
    const [formAmount, setFormAmount] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formReceiptUrl, setFormReceiptUrl] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [uploadReceiptLoading, setUploadReceiptLoading] = useState(false);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<StoreExpense['status'] | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<StoreExpense['category'] | 'all'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showFilterDateFrom, setShowFilterDateFrom] = useState(false);
    const [showFilterDateTo, setShowFilterDateTo] = useState(false);

    const formDateAsDate = (): Date => {
        const trimmed = formDate.trim();
        if (!trimmed) return new Date();
        const parts = trimmed.split('-').map(Number);
        const [y, m, d] = parts;
        if (parts.length < 3 || !Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
            return new Date();
        }
        const date = new Date(y, m - 1, d);
        return Number.isNaN(date.getTime()) ? new Date() : date;
    };

    const filteredRecords = useMemo(() => {
        return records.filter((r) => {
            if (filterStatus !== 'all' && r.status !== filterStatus) return false;
            if (filterCategory !== 'all' && r.category !== filterCategory) return false;
            const itemDate = r.date.split('T')[0];
            if (filterDateFrom.trim() && itemDate < filterDateFrom.trim()) return false;
            if (filterDateTo.trim() && itemDate > filterDateTo.trim()) return false;
            return true;
        });
    }, [records, filterStatus, filterCategory, filterDateFrom, filterDateTo]);

    const hasActiveFilters =
        filterStatus !== 'all' ||
        filterCategory !== 'all' ||
        filterDateFrom.trim() !== '' ||
        filterDateTo.trim() !== '';

    const resetForm = useCallback(() => {
        setFormDate(getTodayISO());
        setFormCategory('lainnya');
        setFormAmount('');
        setFormDescription('');
        setFormReceiptUrl('');
        setShowDatePicker(false);
    }, []);

    const onDateChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFormDate(date.toISOString().split('T')[0]);
    };

    const onFilterDateFromChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowFilterDateFrom(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFilterDateFrom(date.toISOString().split('T')[0]);
    };

    const onFilterDateToChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowFilterDateTo(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFilterDateTo(date.toISOString().split('T')[0]);
    };

    const clearFilters = () => {
        setFilterStatus('all');
        setFilterCategory('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const closeFilterSheet = () => setFilterSheetOpen(false);

    const openDetail = useCallback((item: StoreExpense) => {
        setSelectedLaporan(item);
        setDetailsSheetOpen(true);
    }, []);

    const closeDetailSheet = useCallback(() => {
        setDetailsSheetOpen(false);
        setSelectedLaporan(null);
    }, []);

    const openCreate = useCallback(() => {
        resetForm();
        setSheetOpen(true);
    }, [resetForm]);

    const closeSheet = useCallback(() => {
        setSheetOpen(false);
        resetForm();
    }, [resetForm]);

    const pickReceiptImage = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk memilih foto struk.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (result.canceled || !result.assets[0]?.uri) return;
        setUploadReceiptLoading(true);
        try {
            const url = await uploadLaporanReceipt(result.assets[0].uri);
            setFormReceiptUrl(url);
        } catch (e) {
            Alert.alert('Gagal mengunggah', e instanceof Error ? e.message : 'Gagal mengunggah foto struk');
        } finally {
            setUploadReceiptLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(() => {
        const amount = Number(formAmount.replace(/\D/g, ''));
        if (!formDate.trim()) {
            Alert.alert('Tanggal wajib', 'Pilih atau isi tanggal.');
            return;
        }
        if (!amount || amount <= 0) {
            Alert.alert('Nominal wajib', 'Isi nominal pengeluaran.');
            return;
        }
        if (!branchName.trim()) {
            Alert.alert('Cabang tidak ditemukan', 'Login ulang atau pilih cabang.');
            return;
        }

        createMutation.mutate(
            {
                date: formDate.trim(),
                category: formCategory,
                amount,
                description: formDescription.trim() || undefined,
                branch_name: branchName,
                cashier_name: userName,
                receipt_url: formReceiptUrl.trim() || undefined,
            },
            {
                onSuccess: closeSheet,
                onError: (e) => {
                    Alert.alert('Gagal menambah', e instanceof Error ? e.message : 'Terjadi kesalahan');
                },
            },
        );
    }, [
        formAmount,
        formDate,
        formCategory,
        formDescription,
        formReceiptUrl,
        branchName,
        userName,
        createMutation,
        closeSheet,
    ]);

    const totalAmount = useMemo(
        () => filteredRecords.reduce((sum, r) => sum + r.amount, 0),
        [filteredRecords],
    );

    const isSubmitting = createMutation.isPending;

    return {
        records,
        pagination,
        isLoading,
        error,
        refetch,
        isRefetching,
        branchName,
        userName,
        createMutation,
        getTodayISO,
        // Form & sheet
        sheetOpen,
        setSheetOpen,
        filterSheetOpen,
        setFilterSheetOpen,
        detailsSheetOpen,
        selectedLaporan,
        openDetail,
        closeDetailSheet,
        formDate,
        setFormDate,
        formCategory,
        setFormCategory,
        formAmount,
        setFormAmount,
        formDescription,
        setFormDescription,
        formReceiptUrl,
        setFormReceiptUrl,
        showDatePicker,
        setShowDatePicker,
        uploadReceiptLoading,
        setUploadReceiptLoading,
        // Filter
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        filterDateFrom,
        setFilterDateFrom,
        filterDateTo,
        setFilterDateTo,
        showFilterDateFrom,
        setShowFilterDateFrom,
        showFilterDateTo,
        setShowFilterDateTo,
        // Derived & handlers
        formDateAsDate,
        filteredRecords,
        hasActiveFilters,
        resetForm,
        onDateChange,
        onFilterDateFromChange,
        onFilterDateToChange,
        clearFilters,
        closeFilterSheet,
        openCreate,
        closeSheet,
        pickReceiptImage,
        handleSubmit,
        totalAmount,
        isSubmitting,
    };
}
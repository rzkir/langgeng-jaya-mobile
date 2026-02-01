import { useCallback, useMemo, useState } from 'react';

import { Platform } from 'react-native';

import { useAuth } from '@/context/AuthContext';

import { fetchCashLog } from '@/services/FetchCashLog';

import { postCashLog } from '@/services/PostCashLog';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type FilterStatus = CashLog['status'] | 'all';

export type FilterType = CashLog['type'] | 'all';

const CASHLOG_PAGE_LIMIT = 100;

function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export const CASHLOG_TYPES: CashLog['type'][] = ['opening_cash', 'closing_cash'];

export const TYPE_LABELS: Record<CashLog['type'], string> = {
    opening_cash: 'Kas Buka',
    closing_cash: 'Kas Tutup',
};

export const STATUS_LABELS: Record<CashLog['status'], string> = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

export const STATUS_COLORS: Record<CashLog['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

export function formatCashLogDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

export function formatCashLogDateTime(dateStr: string) {
    try {
        const d = new Date(dateStr);
        const date = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `${date}, ${time}`;
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

export function useStateCashLog() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const userName = user?.name || user?.email || '';

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['cashlog', branchName, 1, CASHLOG_PAGE_LIMIT],
        queryFn: () => fetchCashLog(branchName, 1, CASHLOG_PAGE_LIMIT),
        enabled: !!branchName,
        refetchOnMount: false,
    });

    const records = useMemo<CashLog[]>(() => data?.data ?? [], [data?.data]);
    const pagination = data?.pagination;

    const [detailItem, setDetailItem] = useState<CashLog | null>(null);
    const detailSheetVisible = detailItem !== null;
    const closeDetailSheet = useCallback(() => setDetailItem(null), []);

    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showDateFromPicker, setShowDateFromPicker] = useState(false);
    const [showDateToPicker, setShowDateToPicker] = useState(false);

    const filteredRecords = useMemo(() => {
        return records.filter((item) => {
            if (filterStatus !== 'all' && item.status !== filterStatus) return false;
            if (filterType !== 'all' && item.type !== filterType) return false;
            const itemDate = item.date.split('T')[0];
            if (filterDateFrom && itemDate < filterDateFrom) return false;
            if (filterDateTo && itemDate > filterDateTo) return false;
            return true;
        });
    }, [records, filterStatus, filterType, filterDateFrom, filterDateTo]);

    const recordsByDate = useMemo(() => {
        const map = new Map<string, CashLog[]>();
        for (const item of filteredRecords) {
            const dateKey = item.date.split('T')[0];
            const list = map.get(dateKey) ?? [];
            list.push(item);
            map.set(dateKey, list);
        }
        return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
    }, [filteredRecords]);

    const onDateFromChange = useCallback((_: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') setShowDateFromPicker(false);
        if (date) setFilterDateFrom(date.toISOString().split('T')[0]);
    }, []);
    const onDateToChange = useCallback((_: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') setShowDateToPicker(false);
        if (date) setFilterDateTo(date.toISOString().split('T')[0]);
    }, []);
    const clearFilters = useCallback(() => {
        setFilterStatus('all');
        setFilterType('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    }, []);
    const hasActiveFilter =
        filterStatus !== 'all' ||
        filterType !== 'all' ||
        filterDateFrom !== '' ||
        filterDateTo !== '';

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['cashlog', branchName, 1, CASHLOG_PAGE_LIMIT] });
    }, [queryClient, branchName]);

    const createMutation = useMutation({
        mutationFn: postCashLog,
        onSuccess: invalidate,
    });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [formDate, setFormDate] = useState(getTodayISO);
    const [formType, setFormType] = useState<CashLog['type']>('opening_cash');
    const [formAmount, setFormAmount] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    const formDateAsDate = useCallback((): Date => {
        const trimmed = formDate.trim();
        if (!trimmed) return new Date();
        const parts = trimmed.split('-').map(Number);
        const [y, m, d] = parts;
        if (parts.length < 3 || !Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
            return new Date();
        }
        const date = new Date(y, m - 1, d);
        return Number.isNaN(date.getTime()) ? new Date() : date;
    }, [formDate]);

    const onDateChange = useCallback((_event: { type: string }, date?: Date) => {
        setShowDatePicker(false);
        if (date) setFormDate(date.toISOString().split('T')[0]);
    }, []);

    const openCreate = useCallback(() => {
        setFormDate(getTodayISO());
        setFormType('opening_cash');
        setFormAmount('');
        setValidationMessage(null);
        refetch();
        setSheetOpen(true);
    }, [refetch]);

    const closeSheet = useCallback(() => {
        setSheetOpen(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        setValidationMessage(null);
        const amountNum = parseInt(formAmount.replace(/\D/g, ''), 10);
        if (!branchName.trim() || !userName.trim()) {
            return;
        }
        if (!Number.isFinite(amountNum) || amountNum < 0) {
            return;
        }
        const dateNorm = formDate.trim();
        const trimmedBranch = branchName.trim();
        const freshResult = await queryClient.fetchQuery({
            queryKey: ['cashlog', trimmedBranch, 1, CASHLOG_PAGE_LIMIT],
            queryFn: () => fetchCashLog(trimmedBranch, 1, CASHLOG_PAGE_LIMIT),
        });
        const freshRecords: CashLog[] = freshResult?.data ?? [];
        const logsForDate = freshRecords.filter((r: CashLog) => {
            const rDate = (r.date || '').split('T')[0];
            return rDate === dateNorm && (r.branch_name || '').trim() === trimmedBranch;
        });
        const hasOpening = logsForDate.some((r: CashLog) => r.type === 'opening_cash');
        const hasClosing = logsForDate.some((r: CashLog) => r.type === 'closing_cash');
        if (hasOpening && hasClosing) {
            setValidationMessage(
                `Laporan Kas Buka dan Kas Tutup untuk tanggal ${dateNorm} sudah lengkap. Silakan tunggu hari berikutnya.`,
            );
            return;
        }
        if (formType === 'opening_cash' && hasOpening) {
            setValidationMessage(`Kas Buka untuk tanggal ${dateNorm} sudah dikirim.`);
            return;
        }
        if (formType === 'closing_cash' && hasClosing) {
            setValidationMessage(`Kas Tutup untuk tanggal ${dateNorm} sudah dikirim.`);
            return;
        }
        createMutation.mutate({
            date: formDate.trim(),
            amount: amountNum,
            branch_name: branchName.trim(),
            cashier_name: userName.trim(),
            type: formType,
        }, {
            onSuccess: () => {
                closeSheet();
                setFormAmount('');
            },
        });
    }, [formDate, formAmount, formType, branchName, userName, queryClient, createMutation, closeSheet]);

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
        sheetOpen,
        setSheetOpen,
        formDate,
        setFormDate,
        formType,
        setFormType,
        formAmount,
        setFormAmount,
        showDatePicker,
        setShowDatePicker,
        formDateAsDate,
        onDateChange,
        openCreate,
        closeSheet,
        handleSubmit,
        isSubmitting,
        createError: createMutation.error,
        validationMessage,
        // Detail sheet
        detailItem,
        setDetailItem,
        detailSheetVisible,
        closeDetailSheet,
        // Filter
        filterSheetOpen,
        setFilterSheetOpen,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        filterDateFrom,
        setFilterDateFrom,
        filterDateTo,
        setFilterDateTo,
        showDateFromPicker,
        setShowDateFromPicker,
        showDateToPicker,
        setShowDateToPicker,
        filteredRecords,
        recordsByDate,
        onDateFromChange,
        onDateToChange,
        clearFilters,
        hasActiveFilter,
    };
}
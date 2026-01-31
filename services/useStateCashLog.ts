import { useCallback, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { fetchCashLog } from '@/services/FetchCashLog';
import { postCashLog } from '@/services/PostCashLog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const LIMIT = 20;

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
        queryKey: ['cashlog', branchName, 1, LIMIT],
        queryFn: () => fetchCashLog(branchName, 1, LIMIT),
        enabled: !!branchName,
        refetchOnMount: false,
    });

    const records = useMemo<CashLog[]>(() => data?.data ?? [], [data?.data]);
    const pagination = data?.pagination;

    const invalidate = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['cashlog', branchName, 1, LIMIT] });
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
        setSheetOpen(true);
    }, []);

    const closeSheet = useCallback(() => {
        setSheetOpen(false);
    }, []);

    const handleSubmit = useCallback(() => {
        const amountNum = parseInt(formAmount.replace(/\D/g, ''), 10);
        if (!branchName.trim() || !userName.trim()) {
            return;
        }
        if (!Number.isFinite(amountNum) || amountNum < 0) {
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
    }, [formDate, formAmount, formType, branchName, userName, createMutation, closeSheet]);

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
    };
}

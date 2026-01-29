import { useAuth } from '@/context/AuthContext';

import { fetchTransactions } from '@/services/FetchTransactions';

import { useQuery } from '@tanstack/react-query';

import { useMemo, useState } from 'react';

export function useStateTransactios() {
    const [filter, setFilter] = useState<'all' | TxStatus>('all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const page = 1;
    const limit = 10;

    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['transactions', branchName, page, limit],
        queryFn: () => fetchTransactions(branchName, page, limit),
        enabled: !!branchName,
    });

    const records: TxRecord[] = useMemo(() => {
        const txs = data?.data ?? [];

        return txs.map((tx) => {
            let itemsCount = 0;
            try {
                const parsed = JSON.parse(tx.items ?? '[]');
                if (Array.isArray(parsed)) itemsCount = parsed.length;
            } catch {
                itemsCount = 0;
            }

            const created = tx.created_at ? new Date(tx.created_at) : null;
            const time = created
                ? created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                : '';

            const customerName = tx.customer_name?.trim() ? tx.customer_name : 'Transaksi Tamu';
            const paymentMethodLabel =
                tx.payment_method === 'cash' ? 'Cash' : tx.payment_method === 'kasbon' ? 'Kasbon' : tx.payment_method;

            return {
                id: tx.id,
                customerName,
                orderCode: tx.transaction_number,
                time,
                amount: tx.total,
                status: tx.status as TxStatus,
                paymentMethodLabel,
                itemsCount,
            };
        });
    }, [data?.data]);

    const stats = useMemo(() => {
        const today = new Date();
        const isSameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        const allTx = data?.data ?? [];

        // Transaksi hari ini
        const todayTx = allTx.filter((tx) => {
            if (!tx.created_at) return false;
            const d = new Date(tx.created_at);
            return isSameDay(d, today);
        });

        const completedToday = todayTx.filter((tx) => tx.status === 'completed');
        const totalSalesToday = completedToday.reduce((sum, tx) => sum + (tx.total ?? 0), 0);
        const ordersToday = completedToday.length;
        const avg = ordersToday > 0 ? totalSalesToday / ordersToday : 0;

        // Bandingkan dengan total sales kemarin untuk persentase naik/turun
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const yesterdayTx = allTx.filter((tx) => {
            if (!tx.created_at) return false;
            const d = new Date(tx.created_at);
            return isSameDay(d, yesterday);
        });

        const completedYesterday = yesterdayTx.filter((tx) => tx.status === 'completed');
        const totalSalesYesterday = completedYesterday.reduce((sum, tx) => sum + (tx.total ?? 0), 0);

        const trendPercent =
            totalSalesYesterday > 0
                ? ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100
                : null;

        return { totalSalesToday, ordersToday, avg, trendPercent };
    }, [data?.data]);

    const filtered = useMemo(() => {
        let result = records;

        // Apply status filter
        if (filter !== 'all') {
            result = result.filter((r) => r.status === filter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase();
            result = result.filter((r) => {
                const customerNameMatch = r.customerName.toLowerCase().includes(query);
                const orderCodeMatch = r.orderCode.toLowerCase().includes(query);
                return customerNameMatch || orderCodeMatch;
            });
        }

        return result;
    }, [filter, records, searchQuery]);

    return {
        // State
        filter,
        setFilter,
        isFilterSheetOpen,
        setIsFilterSheetOpen,
        searchQuery,
        setSearchQuery,

        // Query
        isLoading,
        error,
        refetch,
        isRefetching,

        // Computed
        records,
        stats,
        filtered,
    };
}

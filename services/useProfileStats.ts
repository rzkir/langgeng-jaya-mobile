import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';

import { fetchTransactions } from '@/services/FetchTransactions';

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function useProfileStats() {
    const { user } = useAuth();
    const branchName = user?.branchName ?? '';
    const userName = user?.name ?? '';

    const { data, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ['profile-stats', branchName, userName],
        queryFn: async () => {
            let allTransactions: {
                id: string;
                created_by: string;
                customer_name: string;
                branch_name: string;
                total: number;
                status: string;
                created_at: string;
            }[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await fetchTransactions(branchName, page, 100);
                if (response.success && response.data) {
                    allTransactions = [...allTransactions, ...response.data];
                    hasMore = response.pagination?.hasNext ?? false;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            const userTransactions = allTransactions.filter(
                (tx) => tx.created_by === userName && tx.branch_name === branchName
            );

            const today = new Date();
            const todayCompletedTransactions = userTransactions.filter((tx) => {
                if (!tx.created_at || tx.status !== 'completed') return false;
                const txDate = new Date(tx.created_at);
                return isSameDay(txDate, today);
            });

            const salesManaged = todayCompletedTransactions.reduce(
                (sum, tx) => sum + (tx.total ?? 0),
                0
            );

            const uniqueCustomers = new Set(
                todayCompletedTransactions.map((tx) =>
                    tx.customer_name?.trim() ? tx.customer_name.trim() : 'Transaksi Tamu'
                )
            );
            const clientsServed = uniqueCustomers.size;

            return { salesManaged, clientsServed };
        },
        enabled: !!branchName && !!userName,
    });

    return {
        salesManaged: data?.salesManaged ?? 0,
        clientsServed: data?.clientsServed ?? 0,
        isLoading,
        isRefetching,
        refetch,
    };
}

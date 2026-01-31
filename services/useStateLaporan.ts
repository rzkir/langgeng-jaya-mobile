import { useAuth } from '@/context/AuthContext';
import { fetchLaporan } from '@/services/FetchLaporan';
import { postLaporan } from '@/services/PostLaporan';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const LIMIT = 10;

export function useStateLaporan() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const branchName = user?.branchName || '';
    const userName = user?.name || user?.email || '';

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['laporan', branchName, 1, LIMIT],
        queryFn: () => fetchLaporan(branchName, 1, LIMIT),
        enabled: !!branchName,
    });

    const records: StoreExpense[] = data?.data ?? [];
    const pagination = data?.pagination;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['laporan', branchName, 1, LIMIT] });
    };

    const createMutation = useMutation({
        mutationFn: postLaporan,
        onSuccess: invalidate,
    });

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
    };
}

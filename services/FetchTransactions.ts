import { API_CONFIG } from '@/lib/config';

import { apiFetch } from '@/lib/apiFetch';

type TransactionsResponse = ApiResponse<Transaction[]>;

export async function fetchTransactions(
    branchName: string,
    page: number = 1,
    limit: number = 10,
): Promise<TransactionsResponse> {
    try {
        if (!branchName || branchName.trim() === '') {
            throw new Error('Branch name is required');
        }

        const data = await apiFetch<TransactionsResponse>(
            API_CONFIG.ENDPOINTS.karyawan.transactions.list(branchName, page, limit),
        );

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch transactions');
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        };
    } catch (error) {
        console.error('Fetch transactions error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as any).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Failed to fetch transactions');
    }
}

export async function fetchTransactionDetail(id: string): Promise<TransactionDetail> {
    try {
        const data = await apiFetch<ApiResponse<TransactionDetail>>(
            API_CONFIG.ENDPOINTS.karyawan.transactions.byId(id),
        );

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch transaction detail');
        }

        return data.data as TransactionDetail;
    } catch (error) {
        console.error('Fetch transaction detail error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as any).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Failed to fetch transaction detail');
    }
}
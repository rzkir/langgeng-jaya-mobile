import { apiFetch } from '@/lib/apiFetch';

import { API_CONFIG } from '@/lib/config';

export async function fetchCashLog(
    branchName: string,
    page: number = 1,
    limit: number = 20,
    type?: string,
): Promise<CashLogListResponse> {
    try {
        if (!branchName || branchName.trim() === '') {
            throw new Error('Branch name is required');
        }

        const data = await apiFetch<CashLogListResponse>(
            API_CONFIG.ENDPOINTS.karyawan.cashlog.list(branchName, page, limit, type),
        );

        if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil cash log');
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        };
    } catch (error) {
        console.error('Fetch cash log error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Gagal mengambil cash log');
    }
}

export async function fetchCashLogById(id: string): Promise<CashLog> {
    try {
        const data = await apiFetch<CashLogResponse>(
            API_CONFIG.ENDPOINTS.karyawan.cashlog.byId(id),
        );

        if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil detail cash log');
        }

        return data.data as CashLog;
    } catch (error) {
        console.error('Fetch cash log by id error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Gagal mengambil detail cash log');
    }
}

import { apiFetch } from '@/lib/apiFetch';

import { API_CONFIG } from '@/lib/config';

export async function fetchLaporan(
    branchName: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
): Promise<LaporanListResponse> {
    try {
        if (!branchName || branchName.trim() === '') {
            throw new Error('Branch name is required');
        }

        const data = await apiFetch<LaporanListResponse>(
            API_CONFIG.ENDPOINTS.karyawan.laporan.list(branchName, page, limit, status),
        );

        if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil laporan');
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        };
    } catch (error) {
        console.error('Fetch laporan error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Gagal mengambil laporan');
    }
}

export async function fetchLaporanById(id: string): Promise<StoreExpense> {
    try {
        const data = await apiFetch<ApiResponse<StoreExpense>>(
            API_CONFIG.ENDPOINTS.karyawan.laporan.byId(id),
        );

        if (!data.success) {
            throw new Error(data.message || 'Gagal mengambil detail laporan');
        }

        return data.data as StoreExpense;
    } catch (error) {
        console.error('Fetch laporan by id error:', error);
        if (error && typeof error === 'object' && 'status' in error && (error as { status?: number }).status === 401) {
            throw new Error('Unauthorized');
        }
        throw error instanceof Error ? error : new Error('Gagal mengambil detail laporan');
    }
}

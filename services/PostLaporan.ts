import { API_CONFIG } from '@/lib/config';

export async function postLaporan(payload: CreateLaporanPayload): Promise<LaporanResponse<StoreExpense>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.laporan.base, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: JSON.stringify(payload),
    });

    let data: LaporanResponse<StoreExpense>;

    try {
        data = (await response.json()) as LaporanResponse<StoreExpense>;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Gagal menambah laporan');
    }

    return data;
}

export async function putLaporan(id: string, payload: UpdateLaporanPayload): Promise<LaporanResponse<StoreExpense>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.laporan.byId(id), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: JSON.stringify(payload),
    });

    let data: LaporanResponse<StoreExpense>;

    try {
        data = (await response.json()) as LaporanResponse<StoreExpense>;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Gagal mengubah laporan');
    }

    return data;
}

export async function deleteLaporan(id: string): Promise<LaporanResponse<void>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.laporan.byId(id), {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
    });

    let data: LaporanResponse<void>;

    try {
        data = (await response.json()) as LaporanResponse<void>;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Gagal menghapus laporan');
    }

    return data;
}

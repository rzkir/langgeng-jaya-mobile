import { API_CONFIG } from '@/lib/config';

export async function postCashLog(payload: CreateCashLogPayload): Promise<CashLogResponse<CashLog>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.cashlog.base, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: JSON.stringify(payload),
    });

    let data: CashLogResponse<CashLog>;

    try {
        data = (await response.json()) as CashLogResponse<CashLog>;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Gagal menambah cash log');
    }

    return data;
}

import { API_CONFIG } from '@/lib/config';

export async function postTransaction<TData = any>(
    payload: CreateTransactionPayload,
): Promise<TransactionResponse<TData>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.transactions.base, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: JSON.stringify({
            tax: 0,
            status: payload.is_credit ? 'pending' : 'completed',
            ...payload,
        }),
    });

    let data: TransactionResponse<TData>;

    try {
        data = (await response.json()) as TransactionResponse<TData>;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Gagal membuat transaksi');
    }

    return data;
}


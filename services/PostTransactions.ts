import { API_CONFIG } from '@/lib/config';

export type TransactionItemPayload = {
    product_id: string;
    product_name: string;
    image_url?: string | null;
    quantity: number;
    price: number;
    subtotal: number;
    unit?: string | null;
};

export type CreateTransactionPayload = {
    customer_name: string;
    created_by?: string;
    subtotal: number;
    tax?: number;
    total: number;
    discount: number;
    paid_amount: number;
    is_credit: boolean;
    branch_name: string;
    payment_method: 'cash' | 'kasbon';
    status?: 'pending' | 'completed';
    items: TransactionItemPayload[];
};

export type TransactionResponse<TData = any> = {
    success: boolean;
    message?: string;
    data?: TData;
};

export async function postTransaction<TData = any>(
    payload: CreateTransactionPayload,
): Promise<TransactionResponse<TData>> {
    const response = await fetch(API_CONFIG.ENDPOINTS.transactions.base, {
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


import { API_CONFIG } from '@/lib/config';

// Backend (point-of-sales) returns { url, fileId }, not { success, data: { url } }
interface UploadReceiptResponse {
    url?: string;
    fileId?: string;
    success?: boolean;
    message?: string;
    data?: { url: string };
    error?: string;
}

export async function uploadLaporanReceipt(uri: string): Promise<string> {
    const fileName = uri.split('/').pop() || 'receipt.jpg';
    const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
        uri,
        type: mimeType,
        name: fileName,
    } as unknown as Blob);

    const response = await fetch(API_CONFIG.ENDPOINTS.karyawan.laporan.upload, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: formData,
    });

    let data: UploadReceiptResponse;

    try {
        data = (await response.json()) as UploadReceiptResponse;
    } catch {
        throw new Error('Gagal membaca respons dari server');
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Gagal mengunggah bukti');
    }

    const url = data.url ?? data.data?.url;
    if (!url || typeof url !== 'string') {
        throw new Error('URL bukti tidak ditemukan dari server');
    }

    return url;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API

const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET

export const API_CONFIG = {
    ENDPOINTS: {
        base: API_BASE_URL,
        auth: {
            login: `${API_BASE_URL}/karyawan`,
            session: `${API_BASE_URL}/auth/session`,
        },
        karyawan: {
            products: {
                list: (branchName: string, page: number = 1, limit: number = 100) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/karyawan/products?${params.toString()}`;
                },
                search: (branchName: string, page: number = 1, limit: number = 10) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/karyawan/products/search?${params.toString()}`;
                },
                details: (id: string) => `${API_BASE_URL}/karyawan/products/${encodeURIComponent(String(id))}`,
                popular: (branchName: string, limit: number = 100) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/karyawan/products/popular?${params.toString()}`;
                },
            },
            categories: {
                list: `${API_BASE_URL}/categories`,
                byId: (id: string | number) => `${API_BASE_URL}/categories/${encodeURIComponent(String(id))}`,
            },
            transactions: {
                base: `${API_BASE_URL}/transactions`,
                list: (branchName: string, page: number = 1, limit: number = 10) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/karyawan/transaction?${params.toString()}`;
                },
                byId: (id: string | number) =>
                    `${API_BASE_URL}/karyawan/transaction/${encodeURIComponent(String(id))}`,
            },
            laporan: {
                base: `${API_BASE_URL}/laporan`,
                upload: `${API_BASE_URL}/laporan/upload`,
                list: (branchName: string, page: number = 1, limit: number = 20, status?: string) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    if (status && status.trim() !== '') params.set('status', status.trim());
                    return `${API_BASE_URL}/laporan?${params.toString()}`;
                },
                byId: (id: string | number) =>
                    `${API_BASE_URL}/laporan/${encodeURIComponent(String(id))}`,
            },
            cashlog: {
                base: `${API_BASE_URL}/cashlog`,
                list: (branchName: string, page: number = 1, limit: number = 20, type?: string) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        page: String(page),
                        limit: String(limit),
                    });
                    if (type && type.trim() !== '') params.set('type', type.trim());
                    return `${API_BASE_URL}/cashlog?${params.toString()}`;
                },
                byId: (id: string | number) =>
                    `${API_BASE_URL}/cashlog/${encodeURIComponent(String(id))}`,
            },
        },
    },
    SECRET: API_SECRET,
}
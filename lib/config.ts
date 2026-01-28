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
                details: (id: string) => `${API_BASE_URL}/karyawan/products/${encodeURIComponent(String(id))}`,
                popular: (branchName: string, limit: number = 100) => {
                    const params = new URLSearchParams({
                        branch_name: branchName.trim(),
                        limit: String(limit),
                    });
                    return `${API_BASE_URL}/karyawan/products/popular?${params.toString()}`;
                },
            },
        },
        categories: {
            list: `${API_BASE_URL}/categories`,
            byId: (id: string | number) => `${API_BASE_URL}/categories/${encodeURIComponent(String(id))}`,
        },
        customers: {
            base: `${API_BASE_URL}/customers`,
            byId: (id: string | number) => `${API_BASE_URL}/customers/${encodeURIComponent(String(id))}`,
        },
        transactions: {
            base: `${API_BASE_URL}/transactions`,
            byId: (id: string | number) => `${API_BASE_URL}/transactions/${encodeURIComponent(String(id))}`,
        },
    },
    SECRET: API_SECRET,
}
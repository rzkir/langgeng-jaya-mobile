const API_BASE_URL = process.env.EXPO_PUBLIC_API
const API_SECRET = process.env.EXPO_PUBLIC_API_SECRET

export const API_CONFIG = {
    ENDPOINTS: {
        base: API_BASE_URL,
        auth: {
            login: `${API_BASE_URL}/auth/login`,
            session: `${API_BASE_URL}/auth/session`,
            logout: `${API_BASE_URL}/auth/logout`,
        },
        products: {
            base: `${API_BASE_URL}/products`,
            byId: (id: string | number) => `${API_BASE_URL}/products/${encodeURIComponent(String(id))}`,
        },
        categories: {
            base: `${API_BASE_URL}/categories`,
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
import { API_CONFIG } from '@/lib/config';

import { apiFetch } from '@/lib/apiFetch';

type KaryawanProductsResponse = ApiResponse<Product[]>;

type CategoriesResponse = ApiResponse<Category[]>;

export async function fetchKaryawanProducts(
    branchName: string,
    page: number = 1,
    limit: number = 100,
): Promise<KaryawanProductsResponse> {
    try {
        if (!branchName || branchName.trim() === "") {
            throw new Error("Branch name is required")
        }

        const data = await apiFetch<KaryawanProductsResponse>(
            API_CONFIG.ENDPOINTS.karyawan.products.list(branchName, page, limit),
        )

        if (!data.success) {
            throw new Error(data.message || "Failed to fetch products")
        }

        return {
            success: true,
            message: data.message,
            data: data.data || [],
            pagination: data.pagination,
        }
    } catch (error) {
        console.error("Fetch karyawan products error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch products")
    }
}

export async function fetchCategories(): Promise<CategoriesResponse> {
    try {
        const data = await apiFetch<CategoriesResponse>(API_CONFIG.ENDPOINTS.categories.list)
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch categories")
        }
        return {
            success: true,
            message: data.message,
            data: data.data || [],
        }
    } catch (error) {
        console.error("Fetch categories error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch categories")
    }
}
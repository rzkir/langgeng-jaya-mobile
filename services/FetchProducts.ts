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
        const data = await apiFetch<CategoriesResponse>(API_CONFIG.ENDPOINTS.karyawan.categories.list)
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

export async function fetchProductsSearch(branchName: string, page: number = 1, limit: number = 10): Promise<ProductsSearchResponse> {
    try {
        if (!branchName || branchName.trim() === '') {
            throw new Error('Branch name is required');
        }
        const data = await apiFetch<ProductsSearchResponse>(API_CONFIG.ENDPOINTS.karyawan.products.search(branchName, page, limit))
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch products search")
        }
        return data
    }
    catch (error) {
        console.error("Fetch products search error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch products search")
    }
}

export async function fetchProductsPopular(branchName: string, limit: number = 100): Promise<ProductsPopularResponse> {
    try {
        const data = await apiFetch<ProductsPopularResponse>(API_CONFIG.ENDPOINTS.karyawan.products.popular(branchName, limit))
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch products popular")
        }
        return data
    } catch (error) {
        console.error("Fetch products popular error:", error)
        throw error instanceof Error ? error : new Error("Failed to fetch products popular")
    }
}

export async function fetchProductDetails(id: string): Promise<ProductDetails> {
    try {
        const data = await apiFetch<ApiResponse<ProductDetails> | ProductDetails>(
            API_CONFIG.ENDPOINTS.karyawan.products.details(id)
        )

        // Check if response is wrapped in ApiResponse
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
            const response = data as ApiResponse<ProductDetails>
            if (!response.success) {
                throw new Error(response.message || "Failed to fetch product details")
            }
            return response.data
        }

        // Otherwise return data directly
        return data as ProductDetails
    } catch (error) {
        console.error("Fetch product details error:", error)
        if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
            throw new Error("Unauthorized")
        }
        throw error instanceof Error ? error : new Error("Failed to fetch product details")
    }
}
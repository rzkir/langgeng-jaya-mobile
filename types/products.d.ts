interface Product {
    id: string;
    price: number;
    name: string;
    image_url: string;
    category_name: string;
    barcode: string;
    branch_name: string;
    unit: string;
}

interface ApiPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    pagination?: ApiPagination;
}
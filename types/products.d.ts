// Products
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

// Products Popular
interface ProductPopular {
    id: string;
    name: string;
    price: number;
    image_url: string;
    category_name: string;
    barcode: string;
    branch_name: string;
    unit: string;
    sold: number;
    stock: number;
}

interface ProductsPopularMeta {
    branch_name: string;
    limit: number;
    total_in_branch: number;
}

interface ProductsPopularResponse extends ApiResponse<ProductPopular[]> {
    meta: ProductsPopularMeta;
}

// Products Details
interface ProductDetails {
    id: string;
    price: number;
    name: string;
    image_url: string;
    category_name: string;
    barcode: string;
    size: number;
    unit: string;
    stock: number;
    sold: number;
    min_stock: number;
    description: string;
    branch_name: string;
    supplier_name: string;
    expiration_date: string;
}

// Products Search (list products with sold & stock)
interface ProductsSearchResponse extends ApiResponse<ProductPopular[]> {
    pagination: ApiPagination;
}
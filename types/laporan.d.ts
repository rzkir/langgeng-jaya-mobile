interface StoreExpense {
    id: string;
    date: string;
    category: "operasional" | "listrik" | "air" | "pembelian" | "lainnya";
    amount: number;
    description?: string;
    branch_name: string;
    cashier_name: string;
    approved_by?: string;
    receipt_url?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    updated_at: string;
}

interface LaporanPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface LaporanListResponse {
    success: boolean;
    message?: string;
    data: StoreExpense[];
    pagination?: LaporanPagination;
}

type CreateLaporanPayload = {
    date: string;
    category: StoreExpense["category"];
    amount: number;
    description?: string;
    branch_name: string;
    cashier_name: string;
    receipt_url?: string;
};

type UpdateLaporanPayload = Partial<CreateLaporanPayload>;

type LaporanResponse<TData = StoreExpense> = {
    success: boolean;
    message?: string;
    data?: TData;
};
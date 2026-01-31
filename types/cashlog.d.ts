interface CashLog {
    id: string;
    date: string;
    amount: number;
    cashier_name: string;
    branch_name: string;
    status: "pending" | "approved" | "rejected";
    approved_by?: string;
    approved_at?: string;
    type: "opening_cash" | "closing_cash";
    created_at: string;
    updated_at: string;
}

interface CashLogPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

interface CashLogListResponse {
    success: boolean;
    message?: string;
    data: CashLog[];
    pagination?: CashLogPagination;
}

type CreateCashLogPayload = {
    date: string;
    amount: number;
    branch_name: string;
    cashier_name: string;
    type: CashLog["type"];
};

type CashLogResponse<TData = CashLog> = {
    success: boolean;
    message?: string;
    data?: TData;
};
interface Transaction {
    id: number;
    transaction_number: string;

    // Customer (wajib jika kasbon)
    customer_name?: string;

    // Financial
    subtotal: number;
    discount: number;
    total: number;

    paid_amount: number;     // jumlah yang sudah dibayar
    due_amount: number;      // sisa yang belum dibayar
    is_credit: boolean;      // true = kasbon

    // Payment
    payment_method: "cash" | "kasbon";
    payment_status: "paid" | "unpaid" | "partial";
    items?: string | {
        product_id?: string | number;
        product_name: string;
        image_url?: string;
        quantity: number;
        price: number;
        subtotal?: number;
        unit?: string;
    }[]; // JSON string or array from API

    // Transaction lifecycle
    status: "pending" | "completed" | "cancelled" | "return";

    // Branch & audit
    branch_name: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

type TransactionItemPayload = {
    product_id: string;
    product_name: string;
    image_url?: string | null;
    quantity: number;
    price: number;
    subtotal: number;
    unit?: string | null;
};

type CreateTransactionPayload = {
    customer_name: string;
    created_by?: string;
    subtotal: number;
    tax?: number;
    total: number;
    discount: number;
    paid_amount: number;
    is_credit: boolean;
    branch_name: string;
    payment_method: 'cash' | 'kasbon';
    status?: 'pending' | 'completed';
    items: TransactionItemPayload[];
};

type TransactionResponse<TData = any> = {
    success: boolean;
    message?: string;
    data?: TData;
};

type PaymentMethod = 'cash' | 'kasbon';

type UseStateCheckoutResult = {
    // cart/auth derived
    userName: string;
    branchName: string;

    // cart
    items: { product: Product; quantity: number }[];
    totalItems: number;
    totalPrice: number;
    removeItem: (productId: string) => void;
    updateItemQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    addItem: (product: Product, quantity?: number) => void;

    // ui state
    isAddItemSheetVisible: boolean;
    setAddItemSheetVisible: (v: boolean) => void;
    customQuantities: Record<string, string>;
    setCustomQuantities: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    searchQuery: string;
    setSearchQuery: (v: string) => void;

    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;

    isPaymentSheetVisible: boolean;
    setPaymentSheetVisible: (v: boolean) => void;
    customerName: string;
    setCustomerName: (v: string) => void;
    discountInput: string;
    setDiscountInput: (v: string) => void;
    paymentMethod: PaymentMethod;
    setPaymentMethod: (v: PaymentMethod) => void;
    receivedInput: string;
    setReceivedInput: (v: string) => void;
    isSubmitting: boolean;

    // derived
    subtotal: number;
    discount: number;
    subtotalAfterDiscount: number;
    total: number;
    receivedAmount: number;
    change: number;
    quickAmounts: number[];
    paidAmount: number;
    amountDue: number;
    isEmpty: boolean;

    // products
    products: Product[];
    filteredProducts: Product[];
    isProductsLoading: boolean;
    productsError: Error | null;

    // helpers
    isCustomUnit: (unit?: string | null) => boolean;
    lines: {
        id: string;
        name: string;
        unit: string;
        image_url: string;
        price: number;
        quantity: number;
    }[];

    // actions
    handleSubmitTransaction: () => Promise<void>;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;
};

type AddProductsProps = {
    visible: boolean;
    onClose: () => void;

    searchQuery: string;
    onChangeSearchQuery: (value: string) => void;

    isProductsLoading: boolean;
    productsError: unknown;
    products: any[];
    filteredProducts: any[];

    onPressScan: () => void;
};

type PaymentProps = {
    visible: boolean;
    onClose: () => void;

    customerName: string;
    onChangeCustomerName: (value: string) => void;

    paymentMethod: PaymentMethod;
    onChangePaymentMethod: (value: PaymentMethod) => void;

    discountInput: string;
    onChangeDiscountInput: (value: string) => void;

    receivedInput: string;
    onChangeReceivedInput: (value: string) => void;

    quickAmounts: number[];

    subtotal: number;
    discount: number;
    total: number;
    receivedAmount: number;
    change: number;
    amountDue: number;

    isSubmitting: boolean;
    onSubmit: () => void;
};

type ScannerProps = {
    visible: boolean;
    onClose: () => void;
    ScannerComponent: React.ComponentType<any>;
    onBarCodeScanned: (data: any) => void;
};
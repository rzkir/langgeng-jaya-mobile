//====================== Bottom Sheets ======================//
type BottomSheetsProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

//====================== Welcome Screen ======================//
interface OnboardingSlide {
    id: number;
    icon: string;
    title: string;
    description: string;
    color: string;
}

//====================== Template Struk ======================//
type BuildStrukOptions = {
    transactionNumber: string;
    branchName: string;
    customerName: string;
    cashierName: string;
    paymentMethodText: string;
    formattedTotal: string;
    formattedReceivedAmount: string;
    formattedChange: string;
    formattedAmountDue?: string;
    isCredit?: boolean;
    items: TransactionItemPayload[];
    formatRupiah: (value: number) => string;
};

//====================== Badge ======================//
type BadgeStatus = 'success' | 'failed' | 'pending' | 'canceled';

type BadgeProps = {
    status: BadgeStatus;
    label?: string;
    className?: string;
};

//====================== Success Screen State ======================//
type UseStateSuccessResult = {
    total: number;
    receivedAmount: number;
    change: number;

    transactionNumber: string;
    customerName: string;
    cashierName: string;
    branchName: string;

    formattedTotal: string;
    formattedReceivedAmount: string;
    formattedChange: string;

    paymentMethodText: string;

    transactionItems: TransactionItemPayload[];

    handleShare: () => Promise<void>;
    handlePrint: () => void;
};

//====================== Partial Payment Screen State ======================//
type UseStatePartialResult = {
    total: number;
    receivedAmount: number;
    change: number;
    paidAmount: number;
    amountDue: number;

    transactionNumber: string;
    customerName: string;
    cashierName: string;
    branchName: string;

    formattedTotal: string;
    formattedReceivedAmount: string;
    formattedChange: string;
    formattedAmountDue: string;

    paymentMethodText: string;
    paymentStatusText: string;

    transactionItems: TransactionItemPayload[];

    handleShare: () => Promise<void>;
    handlePrint: () => void;
};

//====================== Beranda Screen State ======================//
type UseStateBerandaResult = {
    branchName: string;

    // cart
    totalItems: number;
    totalPrice: number;
    clearCart: () => void;
    addItem: (product: Product, quantity?: number) => void;

    // products
    products: Product[];
    isLoading: boolean;
    error: Error | null;
    errorMessage: string;

    // popular products
    popularProducts: ProductPopular[];
    popularLoading: boolean;
    popularError: Error | null;
    popularErrorMessage: string;

    // categories
    categories: Category[];
    categoriesLoading: boolean;
    categoriesError: Error | null;
    categoriesErrorMessage: string;

    // category filter
    selectedCategory: string | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
    filteredProducts: Product[];

    // delete cart confirm
    isConfirmVisible: boolean;
    setIsConfirmVisible: (v: boolean) => void;
    handleConfirmDelete: () => void;

    // refresh
    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;

    // scanner
    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;
};

//====================== Products Screen State ======================//
type UseStateProductsResult = {
    branchName: string;

    // cart
    addItem: (product: Product, quantity?: number) => void;
    totalItems: number;
    totalPrice: number;
    clearCart: () => void;

    // products
    products: Product[];
    isLoading: boolean;
    error: Error | null;
    errorMessage: string;
    refetch: () => Promise<any>;

    // refresh
    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;

    // scanner
    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;

    // delete cart confirm
    isConfirmVisible: boolean;
    setIsConfirmVisible: (v: boolean) => void;
    handleConfirmDelete: () => void;
};

//====================== Header Props ======================//
interface HeaderProps {
    onMenuPress?: () => void;
}
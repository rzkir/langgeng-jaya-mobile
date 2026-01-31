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

    totalItems: number;
    totalPrice: number;
    clearCart: () => void;
    addItem: (product: Product, quantity?: number) => void;

    products: Product[];
    isLoading: boolean;
    error: Error | null;
    errorMessage: string;

    popularProducts: ProductPopular[];
    popularLoading: boolean;
    popularError: Error | null;
    popularErrorMessage: string;

    categories: Category[];
    categoriesLoading: boolean;
    categoriesError: Error | null;
    categoriesErrorMessage: string;

    selectedCategory: string | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
    filteredProducts: Product[];

    isConfirmVisible: boolean;
    setIsConfirmVisible: (v: boolean) => void;
    handleConfirmDelete: () => void;

    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;

    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;
};

//====================== Products Screen State ======================//
type UseStateProductsResult = {
    branchName: string;

    addItem: (product: Product, quantity?: number) => void;
    totalItems: number;
    totalPrice: number;
    clearCart: () => void;

    products: Product[];
    isLoading: boolean;
    error: Error | null;
    errorMessage: string;
    refetch: () => Promise<any>;

    isRefreshing: boolean;
    handleRefresh: () => Promise<void>;

    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;

    isConfirmVisible: boolean;
    setIsConfirmVisible: (v: boolean) => void;
    handleConfirmDelete: () => void;
};

//====================== Products Search Screen State ======================//
type UseStateSearchResult = {
    branchName: string;

    totalItems: number;
    totalPrice: number;
    clearCart: () => void;
    addItem: (product: Product | ProductPopular, quantity?: number) => void;

    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    selectedCategory: string | null;
    setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
    isCategorySheetVisible: boolean;
    setIsCategorySheetVisible: (v: boolean) => void;
    categories: Category[];

    products: ProductPopular[];
    filteredProducts: ProductPopular[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    errorMessage: string;
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
    isRefetching: boolean;
    refetch: () => Promise<any>;

    isConfirmVisible: boolean;
    setIsConfirmVisible: (v: boolean) => void;
    handleConfirmDelete: () => void;

    isScannerVisible: boolean;
    setScannerVisible: (v: boolean) => void;
    ScannerComponent: any | null;
    handleOpenScanner: () => Promise<void>;
    handleBarCodeScanned: ({ data }: { data: string }) => void;
};

//====================== Filter Laporan Props ======================//
interface FilterLaporanProps {
    visible: boolean;
    onClose: () => void;
    filterStatus: StoreExpense['status'] | 'all';
    setFilterStatus: (s: StoreExpense['status'] | 'all') => void;
    filterCategory: StoreExpense['category'] | 'all';
    setFilterCategory: (c: StoreExpense['category'] | 'all') => void;
    filterDateFrom: string;
    filterDateTo: string;
    showFilterDateFrom: boolean;
    setShowFilterDateFrom: (v: boolean) => void;
    showFilterDateTo: boolean;
    setShowFilterDateTo: (v: boolean) => void;
    onFilterDateFromChange: (event: { type: string }, date?: Date) => void;
    onFilterDateToChange: (event: { type: string }, date?: Date) => void;
    clearFilters: () => void;
    closeFilterSheet: () => void;
}

//====================== Create Laporan Props ======================//
interface CreateLaporanProps {
    visible: boolean;
    onClose: () => void;
    branchName: string;
    userName: string;
    formDate: string;
    formCategory: StoreExpense['category'];
    setFormCategory: (c: StoreExpense['category']) => void;
    formAmount: string;
    setFormAmount: (v: string) => void;
    formDescription: string;
    setFormDescription: (v: string) => void;
    formReceiptUrl: string;
    setFormReceiptUrl: (v: string) => void;
    showDatePicker: boolean;
    setShowDatePicker: (v: boolean) => void;
    formDateAsDate: () => Date;
    onDateChange: (event: { type: string }, date?: Date) => void;
    uploadReceiptLoading: boolean;
    pickReceiptImage: () => void;
    handleSubmit: () => void;
    isSubmitting: boolean;
}

//====================== Header Props ======================//
interface HeaderProps {
    onMenuPress?: () => void;
}
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

import { Ionicons } from '@expo/vector-icons';

export const onboardingData: OnboardingSlide[] = [
    {
        id: 1,
        icon: 'storefront',
        title: 'Kelola Produk dengan Mudah',
        description: 'Tambah, edit, dan kelola produk Anda dengan cepat dan efisien. Pantau stok barang secara real-time.',
        color: '#FF9228'
    },
    {
        id: 2,
        icon: 'receipt',
        title: 'Transaksi Cepat & Akurat',
        description: 'Proses transaksi penjualan dengan cepat. Cetak struk langsung dari aplikasi untuk kemudahan Anda.',
        color: '#10B981'
    },
    {
        id: 3,
        icon: 'analytics',
        title: 'Laporan Lengkap',
        description: 'Dapatkan insight bisnis Anda dengan laporan penjualan, stok, dan keuntungan yang detail dan real-time.',
        color: '#3B82F6'
    },
    {
        id: 4,
        icon: 'phone-portrait',
        title: 'Akses Dimana Saja',
        description: 'Akses aplikasi POS Anda kapan saja dan dimana saja. Kelola bisnis Anda dengan mudah dari smartphone.',
        color: '#8B5CF6'
    }
];

export const STATUS_STYLES: Record<
    BadgeStatus,
    {
        container: string;
        text: string;
        defaultLabel: string;
    }
> = {
    success: {
        container: 'bg-emerald-100',
        text: 'text-emerald-700',
        defaultLabel: 'Success',
    },
    failed: {
        container: 'bg-red-100',
        text: 'text-red-700',
        defaultLabel: 'Failed',
    },
    pending: {
        container: 'bg-amber-100',
        text: 'text-amber-700',
        defaultLabel: 'Pending',
    },
    canceled: {
        container: 'bg-gray-100',
        text: 'text-gray-700',
        defaultLabel: 'Canceled',
    },
};

export const getCategoryIcon = (categoryName: string): keyof typeof Ionicons.glyphMap => {
    const name = categoryName.toLowerCase();

    if (name.includes('sembako')) {
        return 'storefront-outline';
    } else if (name.includes('minuman')) {
        return 'water-outline';
    } else if (name.includes('material')) {
        return 'construct-outline';
    } else if (name.includes('kebutuhan rumah') || name.includes('rumah')) {
        return 'home-outline';
    }

    return 'cube-outline';
};

export const HeaderData: {
    id: number;
    title: string;
    link: string;
    icon: keyof typeof Ionicons.glyphMap;
}[] = [
        {
            id: 1,
            title: "Semua Transaksi",
            link: "/transactions",
            icon: "receipt-outline",
        },
        {
            id: 2,
            title: "Rekaputasi",
            link: "/transactions/rekap",
            icon: "stats-chart-outline",
        },
        {
            id: 3,
            title: "Partial",
            link: "/transactions/partial",
            icon: "pricetag-outline",
        },
        {
            id: 4,
            title: "Laporan",
            link: "/transactions/laporan",
            icon: "document-text-outline",
        },
        {
            id: 5,
            title: "Pembayaran",
            link: "/transactions/pembayaran",
            icon: "wallet-outline",
        },
    ]

export const STATUS_OPTIONS: { value: FilterStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'all', label: 'Semua Status', icon: 'list-outline' },
    { value: 'pending', label: 'Pending', icon: 'time-outline' },
    { value: 'completed', label: 'Completed', icon: 'checkmark-done-outline' },
    { value: 'cancelled', label: 'Cancelled', icon: 'close-circle-outline' },
    { value: 'return', label: 'Return', icon: 'return-down-back-outline' },
]

export const PAYMENT_STATUS_OPTIONS: { value: FilterPaymentStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'all', label: 'Semua Pembayaran', icon: 'wallet-outline' },
    { value: 'paid', label: 'Lunas', icon: 'checkmark-circle-outline' },
    { value: 'unpaid', label: 'Belum Bayar', icon: 'alert-circle-outline' },
    { value: 'partial', label: 'Sebagian', icon: 'pricetag-outline' },
]

export function formatShortAmount(n: number): string {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)} jt`
    if (n >= 1e3) return `${Math.round(n / 1e3)} rb`
    return Math.round(n).toString()
}
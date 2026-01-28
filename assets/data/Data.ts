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
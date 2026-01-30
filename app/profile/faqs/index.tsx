import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import React, { useCallback, useState } from 'react';

import {
    LayoutAnimation,
    Linking,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';

const SUPPORT_EMAIL = 'hallo@rizkiramadhan.web.id';

const SUPPORT_WHATSAPP = '+6281398632939';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = {
    id: string;
    question: string;
    answer: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
};

const FAQ_DATA: FaqItem[] = [
    {
        id: '1',
        question: 'Bagaimana cara melakukan transaksi penjualan?',
        answer:
            'Buka tab Beranda atau Checkout, tambahkan produk ke keranjang dengan mengetuk produk atau scan barcode. Isi nama pelanggan (opsional), pilih metode pembayaran, lalu ketuk Bayar untuk menyelesaikan transaksi.',
        icon: 'cart-outline',
        iconBg: 'bg-primary-100',
        iconColor: '#FF9228',
    },
    {
        id: '2',
        question: 'Bagaimana cara menambah produk ke keranjang?',
        answer:
            'Dari halaman Checkout, ketuk tombol "Tambah Produk" atau gunakan scanner barcode. Anda bisa mencari produk by nama atau scan barcode. Ketuk produk lalu atur jumlah yang ingin dibeli.',
        icon: 'add-circle-outline',
        iconBg: 'bg-info-100',
        iconColor: '#3B82F6',
    },
    {
        id: '3',
        question: 'Bagaimana cara mencetak struk?',
        answer:
            'Setelah transaksi berhasil, struk dapat dicetak jika perangkat terhubung dengan printer. Pastikan printer Bluetooth atau thermal sudah dipasang. Struk berisi detail transaksi, total, dan pembayaran.',
        icon: 'receipt-outline',
        iconBg: 'bg-success-100',
        iconColor: '#10B981',
    },
    {
        id: '4',
        question: 'Bagaimana cara mengubah lokasi/cabang toko?',
        answer:
            'Lokasi toko ditampilkan di header utama. Untuk mengubah cabang, hubungi admin atau atur dari menu pengaturan akun. Setiap transaksi akan tercatat sesuai cabang yang aktif.',
        icon: 'location-outline',
        iconBg: 'bg-error-100',
        iconColor: '#EF4444',
    },
    {
        id: '5',
        question: 'Apa yang harus dilakukan jika stok habis?',
        answer:
            'Sistem dapat mengirim notifikasi saat stok rendah. Kelola stok dari menu Produk: perbarui jumlah stok atau nonaktifkan sementara produk yang kosong hingga restok.',
        icon: 'archive-outline',
        iconBg: 'bg-warning-100',
        iconColor: '#F59E0B',
    },
    {
        id: '6',
        question: 'Bagaimana cara melihat riwayat transaksi?',
        answer:
            'Buka tab Transaksi untuk melihat rekap dan riwayat penjualan. Anda bisa filter berdasarkan tanggal dan status (sukses, pending, dibatalkan). Statistik hari ini juga tersedia di Profil.',
        icon: 'list-outline',
        iconBg: 'bg-slate-100',
        iconColor: '#475569',
    },
    {
        id: '7',
        question: 'Bagaimana cara mengatur diskon?',
        answer:
            'Di halaman Checkout, sebelum membayar, gunakan field diskon untuk memasukkan nominal atau persen diskon. Total akan otomatis terhitung setelah diskon diterapkan.',
        icon: 'pricetag-outline',
        iconBg: 'bg-primary-100',
        iconColor: '#FF9228',
    },
    {
        id: '8',
        question: 'Siapa yang bisa saya hubungi untuk bantuan?',
        answer:
            'Untuk bantuan teknis atau pertanyaan akun, hubungi tim support atau admin cabang Anda. Informasi kontak biasanya tersedia dari atasan atau melalui email resmi perusahaan.',
        icon: 'headset-outline',
        iconBg: 'bg-info-100',
        iconColor: '#3B82F6',
    },
];

function FaqCard({
    item,
    isExpanded,
    onPress,
}: {
    item: FaqItem;
    isExpanded: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                onPress();
            }}
            className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-3"
        >
            <View className="flex-row items-center px-4 py-4">
                <View
                    className={`w-10 h-10 rounded-2xl items-center justify-center ${item.iconBg}`}
                >
                    <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>
                <View className="flex-1 ml-3 pr-2">
                    <Text className="text-sm font-semibold text-slate-900" numberOfLines={isExpanded ? 10 : 2}>
                        {item.question}
                    </Text>
                </View>
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#64748B"
                    />
                </View>
            </View>
            {isExpanded && (
                <View className="px-4 pb-4 pt-0 border-t border-slate-100">
                    <Text className="text-sm text-slate-600 leading-5 pt-3">
                        {item.answer}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export default function FaqsScreen() {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleToggle = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleEmail = useCallback(() => {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Bantuan POS`);
    }, []);

    const handleWhatsApp = useCallback(() => {
        Linking.openURL(
            `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Halo, saya membutuhkan bantuan terkait aplikasi POS.')}`
        );
    }, []);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-2xl bg-gray-100 items-center justify-center"
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chevron-back" size={22} color="#111827" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">Bantuan & FAQ</Text>
                    <View className="w-11" />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {FAQ_DATA.map((item) => (
                    <FaqCard
                        key={item.id}
                        item={item}
                        isExpanded={expandedId === item.id}
                        onPress={() => handleToggle(item.id)}
                    />
                ))}

                {/* CTA Email & WhatsApp */}
                <View className="mt-6 mb-2">
                    <Text className="text-sm font-semibold text-slate-700 mb-3">
                        Butuh bantuan lebih lanjut? Hubungi kami
                    </Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleEmail}
                            activeOpacity={0.85}
                            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 border border-slate-200"
                        >
                            <Ionicons name="mail-outline" size={20} color="#475569" />
                            <Text className="text-sm font-semibold text-slate-700">Email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleWhatsApp}
                            activeOpacity={0.85}
                            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366]"
                        >
                            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                            <Text className="text-sm font-semibold text-white">WhatsApp</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

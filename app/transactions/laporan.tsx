import React, { useMemo, useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheets from '@/components/BottomSheets';
import { uploadLaporanReceipt } from '@/services/UploadLaporan';
import { useStateLaporan } from '@/services/useStateLaporan';

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { router } from 'expo-router';

const CATEGORIES: StoreExpense['category'][] = ['operasional', 'listrik', 'air', 'pembelian', 'lainnya'];

const CATEGORY_LABELS: Record<StoreExpense['category'], string> = {
    operasional: 'Operasional',
    listrik: 'Listrik',
    air: 'Air',
    pembelian: 'Pembelian',
    lainnya: 'Lainnya',
};

const STATUS_LABELS: Record<StoreExpense['status'], string> = {
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const STATUS_COLORS: Record<StoreExpense['status'], string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

function formatRupiahInput(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits === '') return '';
    const num = parseInt(digits, 10);
    return num.toLocaleString('id-ID');
}

export default function Laporan() {
    const {
        records,
        isLoading,
        error,
        refetch,
        isRefetching,
        branchName,
        userName,
        createMutation,
    } = useStateLaporan();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [formDate, setFormDate] = useState(getTodayISO());
    const [formCategory, setFormCategory] = useState<StoreExpense['category']>('lainnya');
    const [formAmount, setFormAmount] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formReceiptUrl, setFormReceiptUrl] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [uploadReceiptLoading, setUploadReceiptLoading] = useState(false);

    // Filter state
    const [filterStatus, setFilterStatus] = useState<StoreExpense['status'] | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<StoreExpense['category'] | 'all'>('all');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [showFilterDateFrom, setShowFilterDateFrom] = useState(false);
    const [showFilterDateTo, setShowFilterDateTo] = useState(false);

    const formDateAsDate = (): Date => {
        const trimmed = formDate.trim();
        if (!trimmed) return new Date();
        const parts = trimmed.split('-').map(Number);
        const [y, m, d] = parts;
        if (parts.length < 3 || !Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
            return new Date();
        }
        const date = new Date(y, m - 1, d);
        return Number.isNaN(date.getTime()) ? new Date() : date;
    };

    const filteredRecords = useMemo(() => {
        return records.filter((r) => {
            if (filterStatus !== 'all' && r.status !== filterStatus) return false;
            if (filterCategory !== 'all' && r.category !== filterCategory) return false;
            const itemDate = r.date.split('T')[0];
            if (filterDateFrom.trim() && itemDate < filterDateFrom.trim()) return false;
            if (filterDateTo.trim() && itemDate > filterDateTo.trim()) return false;
            return true;
        });
    }, [records, filterStatus, filterCategory, filterDateFrom, filterDateTo]);

    const resetForm = () => {
        setFormDate(getTodayISO());
        setFormCategory('lainnya');
        setFormAmount('');
        setFormDescription('');
        setFormReceiptUrl('');
        setShowDatePicker(false);
    };

    const onDateChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFormDate(date.toISOString().split('T')[0]);
    };

    const onFilterDateFromChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowFilterDateFrom(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFilterDateFrom(date.toISOString().split('T')[0]);
    };

    const onFilterDateToChange = (event: { type: string }, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowFilterDateTo(false);
            if (event.type === 'dismissed') return;
        }
        if (date) setFilterDateTo(date.toISOString().split('T')[0]);
    };

    const clearFilters = () => {
        setFilterStatus('all');
        setFilterCategory('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterDateFrom.trim() !== '' || filterDateTo.trim() !== '';

    const pickReceiptImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk memilih foto struk.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (result.canceled || !result.assets[0]?.uri) return;
        setUploadReceiptLoading(true);
        try {
            const url = await uploadLaporanReceipt(result.assets[0].uri);
            setFormReceiptUrl(url);
        } catch (e) {
            Alert.alert('Gagal mengunggah', e instanceof Error ? e.message : 'Gagal mengunggah foto struk');
        } finally {
            setUploadReceiptLoading(false);
        }
    };

    const openCreate = () => {
        resetForm();
        setSheetOpen(true);
    };

    const closeSheet = () => {
        setSheetOpen(false);
        resetForm();
    };

    const handleSubmit = async () => {
        const amount = Number(formAmount.replace(/\D/g, ''));
        if (!formDate.trim()) {
            Alert.alert('Tanggal wajib', 'Pilih atau isi tanggal.');
            return;
        }
        if (!amount || amount <= 0) {
            Alert.alert('Nominal wajib', 'Isi nominal pengeluaran.');
            return;
        }
        if (!branchName.trim()) {
            Alert.alert('Cabang tidak ditemukan', 'Login ulang atau pilih cabang.');
            return;
        }

        createMutation.mutate(
            {
                date: formDate.trim(),
                category: formCategory,
                amount,
                description: formDescription.trim() || undefined,
                branch_name: branchName,
                cashier_name: userName,
                receipt_url: formReceiptUrl.trim() || undefined,
            },
            {
                onSuccess: () => {
                    closeSheet();
                },
                onError: (e) => {
                    Alert.alert('Gagal menambah', e instanceof Error ? e.message : 'Terjadi kesalahan');
                },
            },
        );
    };

    const isSubmitting = createMutation.isPending;

    if (isLoading && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="mt-3 text-gray-500">Memuat laporan...</Text>
            </View>
        );
    }

    if (error && records.length === 0) {
        return (
            <View className="flex-1 bg-gray-50 px-5 justify-center">
                <View className="bg-white rounded-2xl p-6 border border-gray-100">
                    <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center self-center mb-4">
                        <Ionicons name="alert-circle-outline" size={28} color="#DC2626" />
                    </View>
                    <Text className="text-center text-gray-900 font-semibold text-base">Gagal memuat laporan</Text>
                    <Text className="text-center text-gray-500 text-sm mt-1">
                        {error instanceof Error ? error.message : 'Terjadi kesalahan'}
                    </Text>
                    <Pressable onPress={() => refetch()} className="mt-6 bg-[#7C3AED] py-3 rounded-2xl active:opacity-80">
                        <Text className="text-center text-white font-semibold">Coba lagi</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const totalAmount = filteredRecords.reduce((sum, r) => sum + r.amount, 0);

    return (
        <View className="flex-1 bg-white">
            <View className="bg-white border-b border-gray-100 px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center active:opacity-70"
                    >
                        <Ionicons name="arrow-back" size={22} color="#374151" />
                    </Pressable>
                    <Text className="flex-1 ml-3 text-lg font-bold text-gray-900">Laporan</Text>
                    <TouchableOpacity
                        onPress={openCreate}
                        activeOpacity={0.8}
                        className="flex-row items-center px-4 py-2.5 rounded-2xl bg-[#7C3AED]"
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text className="ml-2 text-sm font-semibold text-white">Tambah</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={['#7C3AED']} />
                }
            >
                {records.length > 0 && (
                    <>
                        <View className="mb-4 bg-gray-50 rounded-2xl border border-gray-100 p-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-sm font-semibold text-gray-700">Filter</Text>
                                {hasActiveFilters && (
                                    <TouchableOpacity onPress={clearFilters} activeOpacity={0.8}>
                                        <Text className="text-xs font-semibold text-[#7C3AED]">Reset</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text className="text-xs font-medium text-gray-500 mb-2">Status</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
                                <View className="flex-row gap-2 px-1">
                                    {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setFilterStatus(s)}
                                            activeOpacity={0.8}
                                            className={`px-3 py-2 rounded-xl ${filterStatus === s ? 'bg-[#7C3AED]' : 'bg-white border border-gray-200'}`}
                                        >
                                            <Text className={`text-xs font-medium ${filterStatus === s ? 'text-white' : 'text-gray-600'}`}>
                                                {s === 'all' ? 'Semua' : STATUS_LABELS[s]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            <Text className="text-xs font-medium text-gray-500 mb-2">Kategori</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
                                <View className="flex-row gap-2 px-1 flex-wrap">
                                    {(['all', ...CATEGORIES] as const).map((c) => (
                                        <TouchableOpacity
                                            key={c}
                                            onPress={() => setFilterCategory(c)}
                                            activeOpacity={0.8}
                                            className={`px-3 py-2 rounded-xl ${filterCategory === c ? 'bg-[#7C3AED]' : 'bg-white border border-gray-200'}`}
                                        >
                                            <Text className={`text-xs font-medium ${filterCategory === c ? 'text-white' : 'text-gray-600'}`}>
                                                {c === 'all' ? 'Semua' : CATEGORY_LABELS[c]}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            <Text className="text-xs font-medium text-gray-500 mb-2">Tanggal</Text>
                            <View className="flex-row gap-2">
                                <Pressable
                                    onPress={() => setShowFilterDateFrom(true)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 flex-row items-center justify-between"
                                >
                                    <Text className={filterDateFrom ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                                        {filterDateFrom ? formatDate(filterDateFrom) : 'Dari'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                                </Pressable>
                                <Pressable
                                    onPress={() => setShowFilterDateTo(true)}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 flex-row items-center justify-between"
                                >
                                    <Text className={filterDateTo ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                                        {filterDateTo ? formatDate(filterDateTo) : 'Sampai'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                                </Pressable>
                            </View>
                            {showFilterDateFrom && (
                                <DateTimePicker
                                    value={filterDateFrom ? new Date(filterDateFrom + 'T12:00:00') : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onFilterDateFromChange}
                                />
                            )}
                            {showFilterDateFrom && Platform.OS === 'ios' && (
                                <Pressable onPress={() => setShowFilterDateFrom(false)} className="py-2">
                                    <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                                </Pressable>
                            )}
                            {showFilterDateTo && (
                                <DateTimePicker
                                    value={filterDateTo ? new Date(filterDateTo + 'T12:00:00') : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onFilterDateToChange}
                                />
                            )}
                            {showFilterDateTo && Platform.OS === 'ios' && (
                                <Pressable onPress={() => setShowFilterDateTo(false)} className="py-2">
                                    <Text className="text-[#7C3AED] font-semibold text-center text-sm">Selesai</Text>
                                </Pressable>
                            )}
                        </View>
                        <View className="mb-5 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <View className="flex-row">
                                <View className="w-1.5 bg-[#7C3AED]" />
                                <View className="flex-1 px-5 py-5">
                                    <Text className="text-xs tracking-widest text-gray-400 font-bold">TOTAL PENGELUARAN</Text>
                                    <Text className="mt-2 text-2xl font-extrabold text-gray-900">
                                        Rp {Math.round(totalAmount).toLocaleString('id-ID')}
                                    </Text>
                                    <Text className="mt-1 text-sm text-gray-500">
                                        {filteredRecords.length} entri{hasActiveFilters ? ` (dari ${records.length})` : ''}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {records.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Belum ada data laporan</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Data pengeluaran toko akan tampil di sini
                        </Text>
                        <TouchableOpacity
                            onPress={openCreate}
                            activeOpacity={0.8}
                            className="mt-6 flex-row items-center px-5 py-3 rounded-2xl bg-[#7C3AED]"
                        >
                            <Ionicons name="add" size={20} color="#fff" />
                            <Text className="ml-2 font-semibold text-white">Tambah Laporan</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredRecords.length === 0 ? (
                    <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
                        <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                            <Ionicons name="filter-outline" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 font-semibold text-center">Tidak ada hasil</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Tidak ada laporan yang sesuai filter. Coba ubah filter atau reset.
                        </Text>
                        <TouchableOpacity onPress={clearFilters} activeOpacity={0.8} className="mt-6 px-5 py-3 rounded-2xl bg-[#7C3AED]">
                            <Text className="font-semibold text-white">Reset Filter</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="gap-3">
                        <Text className="text-base font-bold text-gray-900">Daftar Laporan</Text>
                        {filteredRecords.map((item) => (
                            <View
                                key={item.id}
                                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                            >
                                <View className="flex-row items-center gap-2 flex-wrap">
                                    <View className="px-2.5 py-1 rounded-lg bg-violet-100">
                                        <Text className="text-xs font-semibold text-[#7C3AED]">
                                            {CATEGORY_LABELS[item.category]}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-lg ${STATUS_COLORS[item.status]}`}>
                                        <Text className="text-xs font-semibold">
                                            {STATUS_LABELS[item.status]}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="mt-2 text-lg font-bold text-gray-900">
                                    Rp {Math.round(item.amount).toLocaleString('id-ID')}
                                </Text>
                                {item.description ? (
                                    <Text className="mt-1 text-sm text-gray-600" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                ) : null}
                                <Text className="mt-2 text-xs text-gray-500">
                                    {formatDate(item.date)} • {item.cashier_name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <BottomSheets
                visible={sheetOpen}
                onClose={closeSheet}
                title="Tambah Laporan"
            >
                <View style={{ minHeight: Dimensions.get('window').height * 0.7 }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ flex: 1 }}
                    >
                        <ScrollView
                            style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingBottom: 24 }}
                        >
                            <Text className="text-sm font-medium text-gray-700 mb-1">Cabang</Text>
                            <TextInput
                                value={branchName}
                                editable={false}
                                placeholder="Nama cabang"
                                className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text className="text-sm font-medium text-gray-700 mb-1">Kasir</Text>
                            <TextInput
                                value={userName}
                                editable={false}
                                placeholder="Nama kasir"
                                className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text className="text-sm font-medium text-gray-700 mb-1">Tanggal</Text>
                            <Pressable
                                onPress={() => setShowDatePicker(true)}
                                className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 flex-row items-center justify-between"
                            >
                                <Text className="text-gray-900">{formatDate(formDate)}</Text>
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            </Pressable>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={formDateAsDate()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                            )}
                            {showDatePicker && Platform.OS === 'ios' && (
                                <Pressable onPress={() => setShowDatePicker(false)} className="mb-4 py-2">
                                    <Text className="text-[#7C3AED] font-semibold text-center">Selesai</Text>
                                </Pressable>
                            )}

                            <Text className="text-sm font-medium text-gray-700 mb-2">Kategori</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {CATEGORIES.map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setFormCategory(cat)}
                                        activeOpacity={0.8}
                                        className={`px-4 py-2.5 rounded-xl border ${formCategory === cat ? 'border-[#7C3AED] bg-violet-50' : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-medium ${formCategory === cat ? 'text-[#7C3AED]' : 'text-gray-600'
                                                }`}
                                        >
                                            {CATEGORY_LABELS[cat]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</Text>
                            <TextInput
                                value={formAmount}
                                onChangeText={(t) => setFormAmount(formatRupiahInput(t))}
                                placeholder="0"
                                keyboardType="numeric"
                                className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text className="text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</Text>
                            <TextInput
                                value={formDescription}
                                onChangeText={setFormDescription}
                                placeholder="Keterangan pengeluaran"
                                multiline
                                numberOfLines={3}
                                className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 min-h-[80px]"
                                placeholderTextColor="#9CA3AF"
                                textAlignVertical="top"
                            />

                            <Text className="text-sm font-medium text-gray-700 mb-1">Foto struk (opsional)</Text>
                            {formReceiptUrl ? (
                                <View className="mb-6 rounded-xl border border-gray-200 overflow-hidden">
                                    <View className="relative w-full" style={{ aspectRatio: 4 / 3 }}>
                                        <Image source={{ uri: formReceiptUrl }} className="absolute inset-0 w-full h-full bg-gray-100" resizeMode="cover" />
                                        <View className="absolute top-2 right-2 flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={pickReceiptImage}
                                                disabled={uploadReceiptLoading}
                                                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-gray-200"
                                            >
                                                {uploadReceiptLoading ? (
                                                    <ActivityIndicator size="small" color="#7C3AED" />
                                                ) : (
                                                    <Ionicons name="refresh-outline" size={22} color="#374151" />
                                                )}
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setFormReceiptUrl('')}
                                                disabled={uploadReceiptLoading}
                                                className="w-10 h-10 rounded-full bg-red-50/95 items-center justify-center border border-red-200"
                                            >
                                                <Ionicons name="trash-outline" size={22} color="#DC2626" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={pickReceiptImage}
                                    disabled={uploadReceiptLoading}
                                    activeOpacity={0.8}
                                    className="mb-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 items-center"
                                >
                                    {uploadReceiptLoading ? (
                                        <ActivityIndicator size="small" color="#7C3AED" />
                                    ) : (
                                        <>
                                            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                                            <Text className="mt-2 text-gray-500 font-medium">Pilih foto struk</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <View className="border-t border-gray-100 bg-white pt-4 pb-2">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={closeSheet}
                                    activeOpacity={0.8}
                                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 bg-white"
                                >
                                    <Text className="text-center font-semibold text-gray-700">Batal</Text>
                                </TouchableOpacity>
                                <Pressable
                                    onPress={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3.5 rounded-2xl bg-[#7C3AED] items-center justify-center disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text className="font-semibold text-white">Tambah</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </BottomSheets>
        </View>
    );
}

import React from 'react';

import {
    ActivityIndicator,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import BottomSheets from '@/components/BottomSheets';

import { CATEGORIES, CATEGORY_LABELS, formatDate, formatRupiahInput } from '@/services/useStateLaporan';

import { Ionicons } from '@expo/vector-icons';

export default function CreateLaporan({
    visible,
    onClose,
    branchName,
    userName,
    formDate,
    formCategory,
    setFormCategory,
    formAmount,
    setFormAmount,
    formDescription,
    setFormDescription,
    formReceiptUrl,
    setFormReceiptUrl,
    showDatePicker,
    setShowDatePicker,
    formDateAsDate,
    onDateChange,
    uploadReceiptLoading,
    pickReceiptImage,
    handleSubmit,
    isSubmitting,
}: CreateLaporanProps) {
    return (
        <BottomSheets visible={visible} onClose={onClose} title="Tambah Laporan">
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
                                    <Image
                                        source={{ uri: formReceiptUrl }}
                                        className="absolute inset-0 w-full h-full bg-gray-100"
                                        resizeMode="cover"
                                    />
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
                                onPress={onClose}
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
    );
}

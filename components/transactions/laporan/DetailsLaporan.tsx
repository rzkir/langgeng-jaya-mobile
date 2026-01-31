import React from 'react';

import { Image, ScrollView, Text, View } from 'react-native';

import BottomSheets from '@/components/BottomSheets';

import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS, formatDate } from '@/services/useStateLaporan';

export default function DetailsLaporan({
    visible,
    onClose,
    item,
}: {
    visible: boolean;
    onClose: () => void;
    item: StoreExpense | null;
}) {
    if (!item) return null;

    return (
        <BottomSheets visible={visible} onClose={onClose} title="Detail Laporan">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
            >
                <View className="flex-row items-center gap-2 flex-wrap mb-4">
                    <View className="px-2.5 py-1 rounded-lg bg-violet-100">
                        <Text className="text-xs font-semibold text-[#7C3AED]">
                            {CATEGORY_LABELS[item.category]}
                        </Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-lg ${STATUS_COLORS[item.status]}`}>
                        <Text className="text-xs font-semibold">{STATUS_LABELS[item.status]}</Text>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Nominal
                    </Text>
                    <Text className="mt-1 text-2xl font-bold text-gray-900">
                        Rp {Math.round(item.amount).toLocaleString('id-ID')}
                    </Text>
                </View>

                {item.description ? (
                    <View className="mb-4">
                        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Keterangan
                        </Text>
                        <Text className="mt-1 text-sm text-gray-700">{item.description}</Text>
                    </View>
                ) : null}

                <View className="mb-4">
                    <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Tanggal
                    </Text>
                    <Text className="mt-1 text-sm text-gray-700">{formatDate(item.date)}</Text>
                </View>

                <View className="mb-4">
                    <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Kasir
                    </Text>
                    <Text className="mt-1 text-sm text-gray-700">{item.cashier_name}</Text>
                </View>

                {item.approved_by ? (
                    <View className="mb-4">
                        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                            Disetujui oleh
                        </Text>
                        <Text className="mt-1 text-sm text-gray-700">{item.approved_by}</Text>
                    </View>
                ) : null}

                {item.receipt_url ? (
                    <View className="mb-2">
                        <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                            Foto struk
                        </Text>
                        <Image
                            source={{ uri: item.receipt_url }}
                            className="w-full rounded-xl bg-gray-100"
                            style={{ aspectRatio: 4 / 3 }}
                            resizeMode="cover"
                        />
                    </View>
                ) : null}
            </ScrollView>
        </BottomSheets>
    );
}

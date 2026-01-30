import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { Ionicons } from '@expo/vector-icons'

import Toast from 'react-native-toast-message'

import { router } from 'expo-router'

import { usePrinter } from '@/lib/usePrinter'

import { generateReceiptText } from './template'

export default function Printer() {
    const {
        devices: classicDevices,
        connectedAddress: classicConnected,
        loading,
        enableAndListDevices: enableClassicAndList,
        connectToPrinter: connectClassic,
        printText
    } = usePrinter()

    const testPrintClassic = async () => {
        if (!classicConnected) {
            Toast.show({ type: 'info', text1: 'Hubungkan printer Classic dulu' })
            return
        }
        try {
            const testTransaction: Transaction = {
                id: '1',
                transaction_number: 'TEST-001',
                customer_name: 'Pelanggan Test',
                subtotal: 30000,
                discount: 0,
                total: 30000,
                paid_amount: 30000,
                due_amount: 0,
                is_credit: false,
                payment_method: 'cash',
                payment_status: 'paid',
                items: '',
                status: 'completed',
                branch_name: 'Cabang Test',
                created_by: 'system',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            const testItems: (TransactionItemPayload & { product?: { name: string; id?: string } })[] = [
                {
                    product_id: '1',
                    product_name: 'Produk A',
                    quantity: 1,
                    price: 10000,
                    subtotal: 10000,
                    product: { name: 'Produk A', id: '1' },
                },
                {
                    product_id: '2',
                    product_name: 'Produk B',
                    quantity: 2,
                    price: 10000,
                    subtotal: 20000,
                    product: { name: 'Produk B', id: '2' },
                },
            ]

            const data = await generateReceiptText({
                transaction: testTransaction,
                items: testItems
            })

            await printText(data)
            Toast.show({ type: 'success', text1: 'Tes cetak Classic terkirim' })
        } catch (e: any) {
            console.error(e)
            Toast.show({ type: 'error', text1: 'Gagal cetak (Classic)', text2: e.message || 'Terjadi kesalahan' })
        }
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white border-b border-slate-200/80 pt-2 pb-4 px-5">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center active:opacity-80"
                    >
                        <Ionicons name="arrow-back" size={22} color="#334155" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center pr-10">
                        <Text className="text-lg font-bold text-slate-800">Printer ESC/POS</Text>
                        <Text className="text-slate-500 text-sm mt-0.5">Bluetooth Classic</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero card */}
                <View className="mx-4 mt-5 rounded-3xl overflow-hidden" style={{ elevation: 4, shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 }}>
                    <LinearGradient
                        colors={['#0f172a', '#1e293b', '#334155']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-6"
                    >
                        <View className="flex-row items-center">
                            <View className="w-14 h-14 rounded-2xl bg-white/15 items-center justify-center">
                                <Ionicons name="print-outline" size={28} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-white text-lg font-bold">Printer Bluetooth</Text>
                                <Text className="text-slate-300 text-sm mt-1">Pair & sambungkan perangkat, lalu tes cetak struk</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={enableClassicAndList}
                            disabled={loading}
                            activeOpacity={0.85}
                            className="mt-5 bg-white rounded-xl py-3 flex-row items-center justify-center"
                        >
                            <Ionicons name={loading ? 'hourglass-outline' : 'bluetooth'} size={20} color="#0f172a" />
                            <Text className="text-slate-900 font-semibold ml-2">
                                {loading ? 'Memuat perangkat...' : 'Muat daftar perangkat'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>

                {/* Device list */}
                <View className="mx-4 mt-6">
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Perangkat tersedia</Text>
                    <View className="bg-white rounded-2xl overflow-hidden" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }}>
                        {classicDevices.length === 0 ? (
                            <View className="py-10 px-5 items-center">
                                <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
                                    <Ionicons name="bluetooth-outline" size={24} color="#94a3b8" />
                                </View>
                                <Text className="text-slate-500 text-center">Belum ada perangkat. Tap tombol di atas untuk memuat.</Text>
                            </View>
                        ) : (
                            classicDevices.map((d: { address: string; name?: string }, i: number) => {
                                const isConnected = classicConnected === d.address
                                return (
                                    <View
                                        key={d.address}
                                        className={`flex-row items-center justify-between px-4 py-4 ${i < classicDevices.length - 1 ? 'border-b border-slate-100' : ''}`}
                                    >
                                        <View className="flex-1 mr-3">
                                            <Text className="text-slate-800 font-semibold">{d.name || 'Printer'}</Text>
                                            <Text className="text-slate-400 text-xs mt-0.5 font-mono" numberOfLines={1}>{d.address}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => connectClassic(d.address)}
                                            activeOpacity={0.8}
                                            className={`flex-row items-center px-4 py-2.5 rounded-xl ${isConnected ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                        >
                                            <Ionicons name={isConnected ? 'link' : 'link-outline'} size={16} color="white" />
                                            <Text className="text-white text-sm font-semibold ml-2">
                                                {isConnected ? 'Putuskan' : 'Hubungkan'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )
                            })
                        )}
                    </View>
                </View>

                {/* Test print */}
                <View className="mx-4 mt-6">
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Tes cetak</Text>
                    <TouchableOpacity
                        onPress={testPrintClassic}
                        activeOpacity={0.9}
                        className="rounded-2xl overflow-hidden"
                        style={{ elevation: 3, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }}
                    >
                        <LinearGradient
                            colors={['#059669', '#047857', '#065f46']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-5 flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                                <Ionicons name="document-text" size={24} color="white" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-white font-bold text-base">Tes cetak struk</Text>
                                <Text className="text-emerald-100 text-sm mt-0.5">Kirim struk contoh ke printer</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Template custom */}
                <View className="mx-4 mt-6">
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Template struk</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/profile/printer/template/custom')}
                        activeOpacity={0.9}
                        className="rounded-2xl overflow-hidden"
                        style={{ elevation: 3, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 }}
                    >
                        <LinearGradient
                            colors={['#7c3aed', '#6d28d9', '#5b21b6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-5 flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                                <Ionicons name="create-outline" size={24} color="white" />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="text-white font-bold text-base">Custom template</Text>
                                <Text className="text-violet-200 text-sm mt-0.5">Nama toko, alamat, footer struk</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

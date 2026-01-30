import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { usePushNotifications } from '@/lib/PushNotifications'

export default function Notifications() {
    const {
        settings,
        notificationPermission,
        loading: notificationsLoading,
        updatePushEnabled,
        updateSoundEnabled,
        updateLowStockAlerts,
        updateTransactionNotifications,
        updateSelectedSound,
        registerForPushNotifications,
    } = usePushNotifications()

    const handlePushNotificationsChange = async (enabled: boolean) => {
        try {
            // Jika mengaktifkan dan izin belum diberikan, minta izin terlebih dahulu
            if (enabled && !notificationPermission) {
                const result = await registerForPushNotifications()

                if (!result) {
                    Toast.show({
                        type: 'error',
                        text1: 'Izin Ditolak',
                        text2: 'Notifikasi memerlukan izin untuk berfungsi. Silakan aktifkan di pengaturan perangkat.'
                    })
                    return
                }
            }

            await updatePushEnabled(enabled)
            Toast.show({
                type: enabled ? 'success' : 'info',
                text1: enabled ? 'Push Notifications Diaktifkan' : 'Push Notifications Dinonaktifkan',
                text2: enabled
                    ? 'Anda akan menerima notifikasi dari aplikasi'
                    : 'Notifikasi telah dinonaktifkan'
            })
        } catch (error) {
            console.error('Error updating push notifications:', error)
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: 'Gagal mengubah pengaturan push notifications'
            })
        }
    }

    const handleLowStockAlertsChange = async (enabled: boolean) => {
        try {
            await updateLowStockAlerts(enabled)
            Toast.show({
                type: 'success',
                text1: enabled ? 'Alert Stok Rendah Diaktifkan' : 'Alert Stok Rendah Dinonaktifkan'
            })
        } catch {
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: 'Gagal mengubah pengaturan alert stok rendah'
            })
        }
    }

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Pengaturan',
            'Apakah Anda yakin ingin mengembalikan semua pengaturan ke default?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updatePushEnabled(true)
                            await updateSoundEnabled(true)
                            await updateLowStockAlerts(true)
                            await updateTransactionNotifications(true)
                            await updateSelectedSound('default')

                            Toast.show({
                                type: 'success',
                                text1: 'Pengaturan Direset',
                                text2: 'Semua pengaturan telah dikembalikan ke default'
                            })
                        } catch {
                            Toast.show({
                                type: 'error',
                                text1: 'Gagal',
                                text2: 'Gagal mereset pengaturan'
                            })
                        }
                    }
                }
            ]
        )
    }

    const cardShadow = {
        elevation: 3,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    }

    return (
        <View className="flex-1 bg-white">
            {/* Header with gradient */}
            <View
                className="py-6 px-4"
            >
                <View className="flex-row justify-between items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-600 items-center justify-center active:opacity-80"
                    >
                        <Ionicons name="arrow-back" size={22} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center pr-10">
                        <Text className="text-xl font-bold text-gray-600">Pengaturan Notifikasi</Text>
                        <Text className="text-gray-600 text-sm mt-0.5">Konfigurasi notifikasi aplikasi</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >
                {/* Hero card */}
                <View className="mx-4 mt-5 rounded-3xl overflow-hidden" style={cardShadow}>
                    <LinearGradient
                        colors={['#2b3784', '#2b3784', '#2b3784']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-5 flex-row items-center"
                    >
                        <View className="w-14 h-14 rounded-2xl bg-white/10 items-center justify-center">
                            <Ionicons name="notifications-outline" size={28} color="white" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white text-base font-bold">Pengaturan Notifikasi</Text>
                            <Text className="text-white/90 text-sm mt-0.5">
                                Aktifkan atau nonaktifkan notifikasi sesuai kebutuhan
                            </Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Settings cards */}
                <View className="px-4 mt-6">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Opsi Notifikasi
                    </Text>
                    <View className="flex-col gap-3">
                        {/* Push Notifications */}
                        <View className="bg-white rounded-2xl overflow-hidden" style={cardShadow}>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center flex-1 mr-3">
                                    <View className="w-11 h-11 rounded-xl bg-primary-100 items-center justify-center">
                                        <Ionicons name="notifications" size={22} color="#FF9228" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-base font-semibold text-gray-900">Push Notifications</Text>
                                        <Text className="text-gray-500 text-sm mt-0.5" numberOfLines={2}>
                                            {notificationPermission
                                                ? 'Terima notifikasi push dari aplikasi'
                                                : 'Izin notifikasi belum diberikan'}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={settings.pushEnabled && notificationPermission}
                                    onValueChange={handlePushNotificationsChange}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={settings.pushEnabled && notificationPermission ? '#fff' : '#F3F4F6'}
                                    disabled={notificationsLoading}
                                />
                            </View>
                        </View>

                        {/* Sound Settings */}
                        <View className="bg-white rounded-2xl overflow-hidden" style={cardShadow}>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center flex-1 mr-3">
                                    <View className="w-11 h-11 rounded-xl bg-warning-100 items-center justify-center">
                                        <Ionicons name="volume-high" size={22} color="#D97706" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-base font-semibold text-gray-900">Suara Notifikasi</Text>
                                        <Text className="text-gray-500 text-sm mt-0.5">Aktifkan suara untuk notifikasi</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={settings.soundEnabled}
                                    onValueChange={updateSoundEnabled}
                                    trackColor={{ false: '#E5E7EB', true: '#F59E0B' }}
                                    thumbColor={settings.soundEnabled ? '#fff' : '#F3F4F6'}
                                    disabled={notificationsLoading}
                                />
                            </View>
                        </View>

                        {/* Low Stock Alerts */}
                        <View className="bg-white rounded-2xl overflow-hidden" style={cardShadow}>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center flex-1 mr-3">
                                    <View className="w-11 h-11 rounded-xl bg-error-100 items-center justify-center">
                                        <Ionicons name="warning" size={22} color="#DC2626" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-base font-semibold text-gray-900">Alert Stok Rendah</Text>
                                        <Text className="text-gray-500 text-sm mt-0.5">Notifikasi ketika stok produk rendah</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={settings.lowStockAlerts}
                                    onValueChange={handleLowStockAlertsChange}
                                    trackColor={{ false: '#E5E7EB', true: '#F97316' }}
                                    thumbColor={settings.lowStockAlerts ? '#fff' : '#F3F4F6'}
                                    disabled={notificationsLoading}
                                />
                            </View>
                        </View>

                        {/* Transaction Notifications */}
                        <View className="bg-white rounded-2xl overflow-hidden" style={cardShadow}>
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center flex-1 mr-3">
                                    <View className="w-11 h-11 rounded-xl bg-emerald-100 items-center justify-center">
                                        <Ionicons name="receipt-outline" size={22} color="#059669" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-base font-semibold text-gray-900">Notifikasi Transaksi</Text>
                                        <Text className="text-gray-500 text-sm mt-0.5">Notifikasi saat transaksi berhasil atau kasbon</Text>
                                    </View>
                                </View>
                                <Switch
                                    value={settings.transactionNotifications !== false}
                                    onValueChange={async (enabled) => {
                                        try {
                                            await updateTransactionNotifications(enabled)
                                            Toast.show({
                                                type: 'success',
                                                text1: enabled ? 'Notifikasi Transaksi Diaktifkan' : 'Notifikasi Transaksi Dinonaktifkan',
                                            })
                                        } catch {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Gagal',
                                                text2: 'Gagal mengubah pengaturan notifikasi transaksi',
                                            })
                                        }
                                    }}
                                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                                    thumbColor={settings.transactionNotifications !== false ? '#fff' : '#F3F4F6'}
                                    disabled={notificationsLoading}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Reset */}
                <View className="px-4 mt-8">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Lainnya
                    </Text>
                    <TouchableOpacity
                        onPress={handleResetSettings}
                        activeOpacity={0.8}
                        className="bg-white rounded-2xl overflow-hidden flex-row items-center p-4 border border-gray-200"
                        style={cardShadow}
                    >
                        <View className="w-11 h-11 rounded-xl bg-error-100 items-center justify-center">
                            <Ionicons name="refresh" size={22} color="#DC2626" />
                        </View>
                        <View className="flex-1 ml-3">
                            <Text className="text-gray-900 text-base font-semibold">Reset Pengaturan</Text>
                            <Text className="text-gray-500 text-sm mt-0.5">Kembalikan semua pengaturan ke default</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}
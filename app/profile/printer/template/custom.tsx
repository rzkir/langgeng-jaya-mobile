import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { Ionicons } from '@expo/vector-icons'

import { router } from 'expo-router'

import { useStateTemplatePrinter } from '@/lib/TemplatePrinter'

const cardShadow = {
    elevation: 3,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
}

export default function CustomTemplate() {
    const {
        settings,
        setSettings,
        loading,
        saving,
        saveSettings,
        resetToDefault,
    } = useStateTemplatePrinter()

    if (loading) {
        return (
            <View className="flex-1 bg-slate-50 items-center justify-center">
                <View className="w-12 h-12 rounded-full bg-slate-200 items-center justify-center mb-4">
                    <Ionicons name="hourglass-outline" size={28} color="#64748b" />
                </View>
                <Text className="text-slate-500 font-medium">Memuat pengaturan...</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-slate-50">
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
                        <Text className="text-lg font-bold text-slate-800">Custom Template</Text>
                        <Text className="text-slate-500 text-sm mt-0.5">Nama toko, alamat & footer struk</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-4 pt-5">
                    {/* Informasi Toko */}
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Informasi toko</Text>
                    <View className="bg-white rounded-2xl p-5 mb-6 overflow-hidden" style={cardShadow}>
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-xl bg-violet-500/10 items-center justify-center mr-3">
                                <Ionicons name="storefront-outline" size={22} color="#7c3aed" />
                            </View>
                            <Text className="text-slate-800 font-bold text-base">Data toko</Text>
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 text-sm font-medium mb-1.5">Nama toko *</Text>
                            <TextInput
                                className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                                placeholder="Masukkan nama toko"
                                placeholderTextColor="#94a3b8"
                                value={settings.storeName}
                                onChangeText={(text) => setSettings({ ...settings, storeName: text })}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 text-sm font-medium mb-1.5">Alamat toko</Text>
                            <TextInput
                                className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                                placeholder="Masukkan alamat toko"
                                placeholderTextColor="#94a3b8"
                                value={settings.storeAddress}
                                onChangeText={(text) => setSettings({ ...settings, storeAddress: text })}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-600 text-sm font-medium mb-1.5">No. telepon</Text>
                            <TextInput
                                className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                                placeholder="Masukkan nomor telepon"
                                placeholderTextColor="#94a3b8"
                                value={settings.storePhone}
                                onChangeText={(text) => setSettings({ ...settings, storePhone: text })}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-slate-600 text-sm font-medium mb-1.5">Website</Text>
                            <TextInput
                                className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                                placeholder="Contoh: www.tokokasir.com"
                                placeholderTextColor="#94a3b8"
                                value={settings.storeWebsite}
                                onChangeText={(text) => setSettings({ ...settings, storeWebsite: text })}
                                keyboardType="url"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Footer Message */}
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Pesan footer</Text>
                    <View className="bg-white rounded-2xl p-5 mb-6 overflow-hidden" style={cardShadow}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center mr-3">
                                    <Ionicons name="document-text-outline" size={22} color="#059669" />
                                </View>
                                <Text className="text-slate-800 font-bold text-base">Footer struk</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setSettings({ ...settings, showFooter: !settings.showFooter })}
                                activeOpacity={0.8}
                                className={`px-4 py-2.5 rounded-xl ${settings.showFooter ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <Text className={`text-sm font-semibold ${settings.showFooter ? 'text-white' : 'text-slate-600'}`}>
                                    {settings.showFooter ? 'Aktif' : 'Nonaktif'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-600 text-sm font-medium mb-1.5">Pesan footer</Text>
                        <TextInput
                            className="bg-slate-50 rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                            placeholder="Gunakan \n untuk baris baru"
                            placeholderTextColor="#94a3b8"
                            value={settings.footerMessage}
                            onChangeText={(text) => setSettings({ ...settings, footerMessage: text })}
                            multiline
                            numberOfLines={4}
                            editable={settings.showFooter}
                        />
                        <Text className="text-xs text-slate-400 mt-2">Gunakan \n untuk baris baru di struk</Text>
                    </View>

                    {/* Preview */}
                    <Text className="text-slate-700 font-semibold text-sm uppercase tracking-wider mb-3">Preview</Text>
                    <View className="bg-white rounded-2xl p-5 mb-6 overflow-hidden" style={cardShadow}>
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
                                <Ionicons name="eye-outline" size={22} color="#3b82f6" />
                            </View>
                            <Text className="text-slate-800 font-bold text-base">Tampilan struk</Text>
                        </View>

                        <View className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <Text className="text-center font-bold text-slate-800 mb-2" style={{ fontSize: 18 }}>
                                {settings.storeName || 'Nama Toko'}
                            </Text>
                            {settings.storeAddress ? (
                                <Text className="text-center text-slate-600 text-sm mb-1">{settings.storeAddress}</Text>
                            ) : null}
                            {settings.storePhone ? (
                                <Text className="text-center text-slate-600 text-sm mb-1">Telp: {settings.storePhone}</Text>
                            ) : null}
                            {settings.storeWebsite ? (
                                <Text className="text-center text-slate-600 text-sm mb-3">{settings.storeWebsite}</Text>
                            ) : null}
                            <View className="h-px bg-slate-200 my-3" />
                            {settings.showFooter && settings.footerMessage ? (
                                <>
                                    <Text className="text-center text-slate-600 text-xs" style={{ lineHeight: 18 }}>
                                        {settings.footerMessage.split('\\n').map((line, i) => (
                                            <Text key={i}>{line}{'\n'}</Text>
                                        ))}
                                    </Text>
                                </>
                            ) : null}
                        </View>
                    </View>

                    {/* Reset */}
                    <TouchableOpacity
                        onPress={resetToDefault}
                        activeOpacity={0.8}
                        className="bg-white rounded-2xl py-4 flex-row items-center justify-center mb-6 border border-slate-200"
                        style={cardShadow}
                    >
                        <Ionicons name="refresh-outline" size={20} color="#64748b" />
                        <Text className="text-slate-600 font-semibold ml-2">Reset ke default</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save */}
            <View className="px-4 py-4 bg-white border-t border-slate-200">
                <TouchableOpacity
                    onPress={saveSettings}
                    disabled={saving || !settings.storeName.trim()}
                    activeOpacity={0.9}
                    className="rounded-2xl overflow-hidden"
                    style={{
                        elevation: 4,
                        shadowColor: '#7c3aed',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: saving || !settings.storeName.trim() ? 0 : 0.25,
                        shadowRadius: 10,
                    }}
                >
                    <LinearGradient
                        colors={saving || !settings.storeName.trim() ? ['#94a3b8', '#64748b'] : ['#7c3aed', '#6d28d9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="py-4 flex-row items-center justify-center"
                    >
                        {saving ? (
                            <Text className="text-white font-semibold">Menyimpan...</Text>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={22} color="white" />
                                <Text className="text-white font-semibold ml-2">Simpan pengaturan</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    )
}

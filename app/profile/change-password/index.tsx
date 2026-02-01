import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import React from 'react';

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

import { useChangePassword } from '@/services/ChangePassword';

export default function ChangePasswordScreen() {
    const { user } = useAuth();
    const {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showCurrent,
        setShowCurrent,
        showNew,
        setShowNew,
        showConfirm,
        setShowConfirm,
        loading,
        handleSubmit,
    } = useChangePassword(user?.id);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-white border-b border-slate-200 px-4 pt-4 pb-3">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center"
                        activeOpacity={0.85}
                    >
                        <Ionicons name="chevron-back" size={22} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">Ubah kata sandi</Text>
                    <View className="w-11" />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text className="text-sm text-slate-500 mb-4">
                        Masukkan password saat ini dan password baru. Password baru minimal 8 karakter.
                    </Text>

                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-slate-700 mb-1.5">Password saat ini</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 border border-slate-200">
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="••••••••"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showCurrent}
                                className="flex-1 py-3 text-slate-900 text-base"
                                editable={!loading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowCurrent((v) => !v)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons
                                    name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-slate-700 mb-1.5">Password baru</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 border border-slate-200">
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Min. 8 karakter"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showNew}
                                className="flex-1 py-3 text-slate-900 text-base"
                                editable={!loading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNew((v) => !v)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons
                                    name={showNew ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi password baru</Text>
                        <View className="flex-row items-center bg-slate-100 rounded-xl px-4 border border-slate-200">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Ulangi password baru"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={!showConfirm}
                                className="flex-1 py-3 text-slate-900 text-base"
                                editable={!loading}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirm((v) => !v)}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Ionicons
                                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color="#64748B"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSubmit}
                        disabled={loading}
                        className="bg-purple-600 rounded-xl py-3.5 items-center"
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text className="text-white font-semibold text-base">Ubah kata sandi</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
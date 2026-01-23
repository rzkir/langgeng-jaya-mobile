import { usePermissions } from '@/context/PermissionContext';

import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

import React, { useEffect, useRef, useState } from 'react';

import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function PermissionsScreen() {
    const {
        requestPermissions,
        loading,
        allPermissionsGranted,
        cameraPermission
    } = usePermissions();
    const hasRedirected = useRef(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const checkPermissionVisit = async () => {
            try {
                const hasVisitedPermissions = await AsyncStorage.getItem('has_visited_permissions');
                if (hasVisitedPermissions === 'true' && !hasRedirected.current) {
                    hasRedirected.current = true;
                    router.replace('/welcome');
                }
            } catch {
                // ignore
            }
        };

        checkPermissionVisit();
    }, []);

    // Check if permissions are already granted and redirect
    useEffect(() => {
        if (allPermissionsGranted && !hasRedirected.current) {
            hasRedirected.current = true;
            AsyncStorage.setItem('has_visited_permissions', 'true');
            router.replace('/welcome');
        }
    }, [allPermissionsGranted]);

    const handleGrantPermissions = async () => {
        if (isProcessing) return; // Prevent multiple clicks

        try {
            setIsProcessing(true);

            // Add timeout to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Permission request timeout')), 10000)
            );

            await Promise.race([requestPermissions(), timeoutPromise]);

            await AsyncStorage.setItem('has_visited_permissions', 'true');
            router.replace('/welcome');
        } catch (error) {
            console.error('Permission request error:', error);
            // Still navigate even if permission request fails
            await AsyncStorage.setItem('has_visited_permissions', 'true');
            router.replace('/welcome');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('has_visited_permissions', 'true');
        router.replace('/welcome');
    };

    const getPermissionStatus = () => {
        if (cameraPermission === true) return 'granted';
        if (cameraPermission === false) return 'denied';
        return 'not_requested';
    };

    const permissionStatus = getPermissionStatus();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View className="items-center mb-10">
                    <View className="w-[120px] h-[120px] rounded-full bg-primary-50 justify-center items-center mb-6">
                        <Ionicons name="shield-checkmark" size={80} color="#FF9228" />
                    </View>
                    <Text className="text-[28px] font-bold text-gray-800 mb-3 text-center">
                        Izin yang Diperlukan
                    </Text>
                    <Text className="text-base text-gray-500 text-center leading-6 px-5">
                        Aplikasi memerlukan beberapa izin untuk berfungsi dengan optimal
                    </Text>
                </View>

                {/* Permissions List */}
                <View className="mb-6">
                    {/* Camera Permission */}
                    <View className="flex-row bg-gray-50 rounded-2xl p-5 mb-4 border border-gray-200">
                        <View className="w-14 h-14 rounded-full bg-white justify-center items-center mr-4">
                            <Ionicons
                                name="camera"
                                size={32}
                                color={cameraPermission ? "#10B981" : "#6B7280"}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-800 mb-1">
                                Kamera
                            </Text>
                            <Text className="text-sm text-gray-500 leading-5 mb-3">
                                Untuk mengambil foto produk dan dokumen
                            </Text>
                            <View className="mt-1">
                                {permissionStatus === 'granted' && (
                                    <View className="flex-row items-center self-start bg-success-100 px-3 py-1.5 rounded-xl">
                                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                        <Text className="text-xs font-semibold text-success-600 ml-1">
                                            Diizinkan
                                        </Text>
                                    </View>
                                )}
                                {permissionStatus === 'denied' && (
                                    <View className="flex-row items-center self-start bg-error-100 px-3 py-1.5 rounded-xl">
                                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                                        <Text className="text-xs font-semibold text-error-600 ml-1">
                                            Ditolak
                                        </Text>
                                    </View>
                                )}
                                {permissionStatus === 'not_requested' && (
                                    <View className="flex-row items-center self-start bg-warning-100 px-3 py-1.5 rounded-xl">
                                        <Ionicons name="time-outline" size={16} color="#F59E0B" />
                                        <Text className="text-xs font-semibold text-warning-600 ml-1">
                                            Belum Diizinkan
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View className="flex-row bg-info-50 rounded-xl p-4 mb-6 border border-info-200">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text className="flex-1 text-[13px] text-info-800 ml-3 leading-5">
                        Anda dapat mengubah izin ini kapan saja melalui pengaturan perangkat
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-6 pb-6 pt-4 bg-white border-t border-gray-200">
                <TouchableOpacity
                    className={`flex-row justify-center items-center py-4 rounded-xl mb-3 ${loading || isProcessing ? 'opacity-60' : ''
                        }`}
                    style={{
                        backgroundColor: '#FF9228', // primary-500
                        shadowColor: '#FF9228',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                    }}
                    onPress={handleGrantPermissions}
                    disabled={loading || isProcessing}
                    activeOpacity={0.8}
                >
                    {loading || isProcessing ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                            <Text className="text-white text-base font-semibold ml-2">
                                {cameraPermission ? 'Lanjutkan' : 'Izinkan Semua'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="rounded-xl py-4 items-center justify-center"
                    onPress={handleSkip}
                    disabled={loading || isProcessing}
                    activeOpacity={0.8}
                >
                    <Text className="text-gray-500 text-base font-medium">Lewati</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}


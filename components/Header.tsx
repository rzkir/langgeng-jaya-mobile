import { useAuth } from '@/context/AuthContext';

import { Ionicons } from '@expo/vector-icons';

import { HeaderData } from '@/assets/data/Data';

import BottomSheets from '@/components/BottomSheets';

import { router } from 'expo-router';

import { MotiView } from 'moti';

import React, { useCallback, useMemo, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { CloseSvg } from "@/components/CloseSvg";

import { HamburgerSvg } from "@/components/HamburgerSvg";

export function Header({ onMenuPress }: HeaderProps) {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    const handleMenuPress = useCallback(() => {
        if (onMenuPress) return onMenuPress();
        setIsMenuOpen((prev) => !prev);
    }, [onMenuPress]);

    const menuIcon = useMemo(() => {
        const duration = 180;
        return (
            <View style={{ width: 24, height: 24 }}>
                <MotiView
                    animate={{
                        opacity: isMenuOpen ? 0 : 1,
                        transform: [
                            { scale: isMenuOpen ? 0.8 : 1 },
                            { rotate: isMenuOpen ? '20deg' : '0deg' },
                        ],
                    }}
                    transition={{ type: 'timing', duration }}
                >
                    <HamburgerSvg />
                </MotiView>

                <MotiView
                    style={{ position: 'absolute', left: 0, top: 0 }}
                    animate={{
                        opacity: isMenuOpen ? 1 : 0,
                        transform: [
                            { scale: isMenuOpen ? 1 : 0.8 },
                            { rotate: isMenuOpen ? '0deg' : '-20deg' },
                        ],
                    }}
                    transition={{ type: 'timing', duration }}
                >
                    <CloseSvg />
                </MotiView>
            </View>
        );
    }, [isMenuOpen]);

    return (
        <>
            <View className="bg-white px-4 shadow-sm pb-2">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={handleMenuPress}
                        className="items-center justify-center left-1"
                    >
                        {menuIcon}
                    </TouchableOpacity>

                    <View className="items-center flex-1">
                        <Text className="text-[11px] text-gray-400">Lokasi Toko</Text>
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={16} color="#EF4444" />
                            <Text className="text-gray-900 text-sm font-semibold mx-1">
                                {user?.branchName || 'Pilih cabang'}
                            </Text>
                        </View>
                    </View>

                    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                        <Text className="text-gray-700 font-semibold text-sm">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
            </View>

            <BottomSheets visible={isMenuOpen} onClose={closeMenu} title="Menu">
                <View className="pb-6">
                    {HeaderData.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.8}
                            className="py-3 border-b border-gray-100"
                            onPress={() => {
                                closeMenu();
                                router.push(item.link as any);
                            }}
                        >
                            <Text className="text-gray-900 font-medium">{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </BottomSheets>
        </>
    );
}

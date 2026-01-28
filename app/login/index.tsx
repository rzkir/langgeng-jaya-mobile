import { useAuth } from '@/context/AuthContext';

import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { router } from 'expo-router';

import React, { useState } from 'react';

import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import Logo from '@/assets/images/langgeng-jaya.png';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<'identifier' | 'password' | null>(null);

    const { login, isLoading, error, clearError } = useAuth();

    const handleSignIn = async () => {
        const identifier = email.trim();
        const pwd = password;

        if (!identifier || !pwd) return;

        // Clear last error before attempting again
        if (error) clearError();

        const credentials =
            identifier.includes('@')
                ? { email: identifier, password: pwd }
                : { name: identifier, password: pwd };

        const user = await login(credentials);
        if (user) {
            router.replace('/(tabs)/beranda');
        }
    };

    const handleGetStarted = () => {
        router.push('/welcome');
    };

    const handleForgotPassword = () => {
        // Handle forgot password logic here
        console.log('Forgot password');
    };

    return (
        <View className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Gradient Header Section */}
                    <View className="relative" style={{ height: 400 }}>
                        <LinearGradient
                            colors={['#2b3784', '#2b3784']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="absolute inset-0"
                        />

                        {/* Curved Bottom Edge */}
                        <View
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                                height: 40,
                                backgroundColor: 'white',
                                borderTopLeftRadius: 40,
                                borderTopRightRadius: 40,
                            }}
                        />

                        {/* Header Content */}
                        <View className="flex-1 px-6 items-center justify-center">
                            <TouchableOpacity onPress={handleGetStarted} className="absolute top-6 left-4 p-2 bg-white/10 rounded-full">
                                <Ionicons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>

                            <Image source={Logo} className="w-32 h-32" resizeMode="contain" />

                            <Text className="text-white text-4xl font-bold">
                                Langgeng Jaya
                            </Text>
                        </View>
                    </View>

                    {/* White Card Section */}
                    <View className="flex-1 bg-white px-6 pt-8 pb-8">
                        {/* Title and Subtitle */}
                        <View className="mb-8">
                            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                                Selamat Datang
                            </Text>
                            <Text className="text-base text-gray-500 text-center">
                                Silahkan masukkan email / username dan password Anda
                            </Text>
                        </View>

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-sm text-gray-500 mb-2">Email / Username</Text>
                            <View
                                className="border rounded-xl px-4 py-3 bg-white"
                                style={{
                                    borderColor: focusedField === 'identifier' ? '#2b3784' : '#D1D5DB',
                                }}
                            >
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Masukkan email / username Anda"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setFocusedField('identifier')}
                                    onBlur={() => setFocusedField(null)}
                                    className="text-base text-gray-900"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <Text className="text-sm text-gray-500 mb-2">Kata Sandi</Text>
                            <View
                                className="border rounded-xl px-4 py-3 bg-white flex-row items-center"
                                style={{
                                    borderColor: focusedField === 'password' ? '#2b3784' : '#D1D5DB',
                                }}
                            >
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Masukkan kata sandi Anda"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="flex-1 text-base text-gray-900"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="ml-2"
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Error Message */}
                        {!!error && (
                            <View className="mb-4">
                                <Text className="text-error text-sm text-center">
                                    {error}
                                </Text>
                            </View>
                        )}

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={handleSignIn}
                            className={`mb-6 ${isLoading ? 'opacity-70' : ''}`}
                            activeOpacity={0.8}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#2b3784', '#2b3784']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-xl overflow-hidden py-4 items-center justify-center"
                            >
                                <Text className="text-white text-base font-semibold">
                                    {isLoading ? 'Memuat...' : 'Masuk'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Forgot Password Divider */}
                        <View className="flex-row items-center gap-2">
                            <View className="flex-1 h-px bg-gray-300" />
                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                onPress={handleForgotPassword}
                            >
                                <Text className="text-gray-600 text-center text-sm">
                                    Lupa kata sandi?
                                </Text>
                            </TouchableOpacity>
                            <View className="flex-1 h-px bg-gray-300" />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

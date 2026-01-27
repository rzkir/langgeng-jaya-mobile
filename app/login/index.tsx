import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
export default function LoginScreen() {
    const [email, setEmail] = useState('nicholas@ergemla.com');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

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

    const handleSocialLogin = (provider: 'google' | 'facebook') => {
        // Handle social login logic here
        console.log('Social login:', provider);
    };

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Gradient Header Section */}
                    <View className="relative" style={{ height: 280 }}>
                        <LinearGradient
                            colors={['#6B46C1', '#3B82F6']}
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
                        <View className="flex-1 px-6 pt-12">
                            {/* Top Bar */}
                            <View className="flex-row items-center justify-between mb-8">
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    className="w-10 h-10 items-center justify-center"
                                >
                                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                                </TouchableOpacity>

                                <View className="flex-row items-center">
                                    <Text className="text-white text-sm mr-2">
                                        Don&apos;t have an account?
                                    </Text>
                                    <TouchableOpacity
                                        onPress={handleGetStarted}
                                        className="px-4 py-2 bg-white/20 rounded-lg border border-white/30"
                                    >
                                        <Text className="text-white text-sm font-semibold">
                                            Get Started
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* App Name */}
                            <View className="flex-1 items-center justify-center">
                                <Text className="text-white text-4xl font-bold">
                                    Jobsly
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* White Card Section */}
                    <View className="flex-1 bg-white px-6 pt-8 pb-8">
                        {/* Title and Subtitle */}
                        <View className="mb-8">
                            <Text className="text-3xl font-bold text-gray-900 text-center mb-2">
                                Welcome Back
                            </Text>
                            <Text className="text-base text-gray-500 text-center">
                                Enter your details below
                            </Text>
                        </View>

                        {/* Email Input */}
                        <View className="mb-4">
                            <Text className="text-sm text-gray-500 mb-2">Email Address</Text>
                            <View className="border border-gray-300 rounded-xl px-4 py-3 bg-white">
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    className="text-base text-gray-900"
                                />
                            </View>
                        </View>

                        {/* Password Input */}
                        <View className="mb-6">
                            <Text className="text-sm text-gray-500 mb-2">Password</Text>
                            <View className="border border-gray-300 rounded-xl px-4 py-3 bg-white flex-row items-center">
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
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
                            className={`mb-4 ${isLoading ? 'opacity-70' : ''}`}
                            activeOpacity={0.8}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#EC4899']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="rounded-xl py-4 items-center justify-center"
                            >
                                <Text className="text-white text-base font-semibold">
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Forgot Password Link */}
                        <TouchableOpacity
                            onPress={handleForgotPassword}
                            className="mb-8"
                        >
                            <Text className="text-gray-600 text-center text-sm">
                                Forgot your password?
                            </Text>
                        </TouchableOpacity>

                        {/* Social Login Divider */}
                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 h-px bg-gray-300" />
                            <Text className="mx-4 text-gray-400 text-sm">
                                Or sign in with
                            </Text>
                            <View className="flex-1 h-px bg-gray-300" />
                        </View>

                        {/* Social Login Buttons */}
                        <View className="flex-row gap-4">
                            {/* Google Button */}
                            <TouchableOpacity
                                onPress={() => handleSocialLogin('google')}
                                className="flex-1 border border-gray-300 rounded-xl py-4 flex-row items-center justify-center bg-white"
                                activeOpacity={0.7}
                            >
                                <View className="w-6 h-6 items-center justify-center mr-2">
                                    <Text className="text-lg font-bold" style={{ color: '#4285F4' }}>
                                        G
                                    </Text>
                                </View>
                                <Text className="text-gray-700 text-base font-medium">
                                    Google
                                </Text>
                            </TouchableOpacity>

                            {/* Facebook Button */}
                            <TouchableOpacity
                                onPress={() => handleSocialLogin('facebook')}
                                className="flex-1 border border-gray-300 rounded-xl py-4 flex-row items-center justify-center bg-white"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                                <Text className="text-gray-700 text-base font-medium ml-2">
                                    Facebook
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

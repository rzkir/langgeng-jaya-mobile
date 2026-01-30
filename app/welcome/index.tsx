import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

import React, { useRef, useState } from 'react';

import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


import { onboardingData } from '@/assets/data/Data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            handleGetStarted();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
            setCurrentIndex(prevIndex);
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
        router.replace('/login');
    };

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('has_seen_onboarding', 'true');
        router.replace('/login');
    };

    const renderSlide = ({ item }: { item: OnboardingSlide }) => {
        return (
            <View className="flex-1 items-center justify-center px-8" style={{ width: SCREEN_WIDTH }}>
                {/* Icon Container */}
                <View
                    className="w-32 h-32 rounded-full items-center justify-center mb-8"
                    style={{ backgroundColor: `${item.color}20` }}
                >
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={64} color={item.color} />
                </View>

                {/* Title */}
                <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                    {item.title}
                </Text>

                {/* Description */}
                <Text className="text-base text-gray-500 text-center leading-6 px-4">
                    {item.description}
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Skip Button */}
            {currentIndex < onboardingData.length - 1 && (
                <View className="absolute top-4 right-4 z-10">
                    <TouchableOpacity
                        onPress={handleSkip}
                        className="px-4 py-2"
                    >
                        <Text className="text-gray-500 text-base font-medium">Lewati</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* FlatList for Slides */}
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                keyExtractor={(item) => item.id.toString()}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Bottom Section */}
            <View className="px-6 pb-8">
                {/* Indicator Dots */}
                <View className="flex-row justify-center items-center mb-8">
                    {onboardingData.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full mx-1 ${index === currentIndex
                                ? 'bg-[#2b3784] w-8'
                                : 'bg-gray-300 w-2'
                                }`}
                        />
                    ))}
                </View>

                {/* Navigation Buttons */}
                <View className="flex-row items-center justify-between">
                    {/* Previous Button */}
                    {currentIndex > 0 ? (
                        <TouchableOpacity
                            onPress={handlePrevious}
                            className="flex-row items-center px-6 py-3 rounded-xl border border-gray-300"
                        >
                            <Ionicons name="chevron-back" size={20} color="#6B7280" />
                            <Text className="text-gray-600 text-base font-medium ml-1">
                                Sebelumnya
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="flex-1" />
                    )}

                    {/* Next/Get Started Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        className="flex-row items-center px-8 py-3 rounded-xl bg-[#2b3784] shadow-lg shadow-black/10"
                    >
                        <Text className="text-base font-semibold mr-2 text-white">
                            {currentIndex === onboardingData.length - 1 ? 'Mulai' : 'Selanjutnya'}
                        </Text>
                        <Ionicons
                            name={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'chevron-forward'}
                            size={20}
                            color="#FFFFFF"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
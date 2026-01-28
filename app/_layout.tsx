import { useEffect, useRef } from 'react';

import { Stack } from 'expo-router';

import { Platform } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import * as SystemUI from 'expo-system-ui';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Constants from 'expo-constants';

import "@/global.css";

import Toast from 'react-native-toast-message';

import { AuthProvider } from '@/context/AuthContext';

import { PermissionProvider } from '@/context/PermissionContext';

import { CartProvider } from '@/context/CartContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: 'index',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('transparent').catch(() => { });
    }

    (async () => {
      if (Constants.appOwnership === 'expo') return;
      try {
        const Notifications = await import('expo-notifications');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: 'transparent',
            sound: 'default',
          }).catch(() => { });

          Notifications.setNotificationChannelAsync('low_stock', {
            name: 'Low Stock Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: 'transparent',
            sound: 'default',
          }).catch(() => { });
        }

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          if (notification.request.content.data) {
            const data = notification.request.content.data as any;
            if (data.type === 'low_stock') {
            }
          }
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data as any;
          if (data?.type === 'low_stock') {
          }
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <AuthProvider>
            <PermissionProvider>
              <CartProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom']}>
                  <Stack
                    initialRouteName="index"
                    screenOptions={{
                      headerShown: false,
                      animation: 'slide_from_right',
                      animationDuration: 300,
                      contentStyle: { backgroundColor: '#ffffff' },
                    }}
                  >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="checkout" />
                  </Stack>
                </SafeAreaView>
              </CartProvider>
            </PermissionProvider>
          </AuthProvider>
        </SafeAreaProvider>
        <Toast />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
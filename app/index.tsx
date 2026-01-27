import { router, usePathname } from 'expo-router';

import { useEffect, useRef } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/context/AuthContext';

import { usePermissions } from '@/context/PermissionContext';

export default function Index() {
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const { allPermissionsGranted } = usePermissions();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    let rafId: number | null = null;
    const checkUserAndRedirect = async () => {
      if (hasRedirected.current) return;
      if (pathname !== '/') return;

      // Tunggu hydrate AuthContext dulu (native)
      if (isLoading) return;

      // Redirect ke halaman perizinan jika izin belum diberikan
      if (!allPermissionsGranted) {
        hasRedirected.current = true;
        router.replace('/permissions');
        return;
      }

      const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');

      if (isAuthenticated) {
        hasRedirected.current = true;
        router.replace('/(tabs)/beranda');
      } else if (hasSeenOnboarding === 'true') {
        hasRedirected.current = true;
        router.replace('/login');
      } else {
        hasRedirected.current = true;
        router.replace('/welcome');
      }
    };
    rafId = requestAnimationFrame(() => {
      checkUserAndRedirect();
    });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname, allPermissionsGranted, isAuthenticated, isLoading]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  return null;
}
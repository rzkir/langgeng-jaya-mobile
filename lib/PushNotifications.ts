import { useEffect, useRef, useState } from "react";

import { Platform } from "react-native";

import Constants from "expo-constants";

import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_STORAGE_KEY = process.env
    .EXPO_PUBLIC_PUSH_NOTIFICATIONS as string;

let Notifications: typeof import("expo-notifications") | null = null;

const loadNotifications = async () => {
    if (Notifications) return Notifications;
    try {
        const mod = await import("expo-notifications");
        Notifications = mod;
        return Notifications;
    } catch {
        return null;
    }
};

export const usePushNotifications = () => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notificationPermission, setNotificationPermission] =
        useState<boolean>(false);
    const [settings, setSettings] = useState<NotificationSettings>({
        pushEnabled: true,
        soundEnabled: true,
        lowStockAlerts: true,
        transactionNotifications: true,
        selectedSound: "default",
    });
    const [loading, setLoading] = useState(true);
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        const initialize = async () => {
            await loadSettings();
            // Check existing permission status
            const notif = await loadNotifications();
            if (!notif) {
                setNotificationPermission(false);
                return;
            }
            const { status } = await notif.getPermissionsAsync();
            setNotificationPermission(status === "granted");
        };
        initialize();
    }, []);

    const loadSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                const parsedSettings = JSON.parse(stored);
                if (!parsedSettings.selectedSound) {
                    parsedSettings.selectedSound = "default";
                }
                if (parsedSettings.transactionNotifications === undefined) {
                    parsedSettings.transactionNotifications = true;
                }
                setSettings(parsedSettings);
            }
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings: NotificationSettings) => {
        try {
            await AsyncStorage.setItem(
                SETTINGS_STORAGE_KEY,
                JSON.stringify(newSettings)
            );
            setSettings(newSettings);
        } catch (error) {
            throw error;
        }
    };

    const registerForPushNotifications = async () => {
        try {
            setLoading(true);

            const notif = await loadNotifications();
            if (!notif) return null;

            const { status: existingStatus } = await notif.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await notif.requestPermissionsAsync();
                finalStatus = status;
            }

            const hasPermission = finalStatus === "granted";
            setNotificationPermission(hasPermission);

            if (!hasPermission) {
                return null;
            }

            // In Expo Go, remote push tokens are not supported.
            // We still consider permission granted and return a placeholder token
            // so the UI can enable notification settings without error.
            if (Constants.appOwnership === "expo") {
                const placeholderToken = "expo-go-local";
                setExpoPushToken(placeholderToken);
                return placeholderToken;
            }

            const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
            const tokenData = projectId
                ? await notif.getExpoPushTokenAsync({ projectId })
                : await notif.getExpoPushTokenAsync();
            const token = typeof tokenData === "string" ? tokenData : tokenData.data;
            setExpoPushToken(token);

            await AsyncStorage.setItem(
                process.env.EXPO_PUBLIC_PUSH_TOKEN as string,
                token
            );

            if (Platform.OS === "android") {
                await notif.setNotificationChannelAsync("default", {
                    name: "Default",
                    importance: (await loadNotifications())!.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF9228",
                    sound: "default",
                });

                await notif.setNotificationChannelAsync("low_stock", {
                    name: "Low Stock Alerts",
                    importance: (await loadNotifications())!.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF9228",
                    sound: "default",
                });

                await notif.setNotificationChannelAsync("transactions", {
                    name: "Notifikasi Transaksi",
                    importance: (await loadNotifications())!.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#10B981",
                    sound: "default",
                });
            }

            return token;
        } catch (error) {
            console.error("Error registering for push notifications:", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const unregisterPushNotifications = async () => {
        try {
            await AsyncStorage.removeItem(
                process.env.EXPO_PUBLIC_PUSH_TOKEN as string
            );
            setExpoPushToken(null);
            // Don't change notificationPermission here, as it's about system permission
            // Only clear the token and expoPushToken
        } catch { }
    };

    const updatePushEnabled = async (enabled: boolean) => {
        const newSettings = { ...settings, pushEnabled: enabled };
        await saveSettings(newSettings);

        if (enabled) {
            await registerForPushNotifications();
        } else {
            await unregisterPushNotifications();
        }
    };

    const updateSoundEnabled = async (enabled: boolean) => {
        const newSettings = { ...settings, soundEnabled: enabled };
        await saveSettings(newSettings);
    };

    const updateSelectedSound = async (soundId: string) => {
        const newSettings = { ...settings, selectedSound: soundId };
        await saveSettings(newSettings);
    };

    const getSoundValue = (): string | undefined => {
        if (!settings.soundEnabled) {
            return undefined;
        }
        return "default";
    };

    const updateLowStockAlerts = async (enabled: boolean) => {
        const newSettings = { ...settings, lowStockAlerts: enabled };
        await saveSettings(newSettings);
    };

    const updateTransactionNotifications = async (enabled: boolean) => {
        const newSettings = { ...settings, transactionNotifications: enabled };
        await saveSettings(newSettings);
    };

    // Setup notification listeners (guarded by availability)
    useEffect(() => {
        let mounted = true;
        (async () => {
            const notif = await loadNotifications();
            if (!mounted || !notif) return;
            notificationListener.current = notif.addNotificationReceivedListener(
                () => { }
            );
            responseListener.current = notif.addNotificationResponseReceivedListener(
                () => { }
            );
        })();

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
            mounted = false;
        };
    }, []);

    // Register for push notifications if enabled (only when settings are loaded)
    useEffect(() => {
        if (!loading && settings.pushEnabled && notificationPermission) {
            // Only get token if permission is already granted
            const getToken = async () => {
                try {
                    const notif = await loadNotifications();
                    if (!notif) return;
                    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
                    const tokenData = projectId
                        ? await notif.getExpoPushTokenAsync({ projectId })
                        : await notif.getExpoPushTokenAsync();
                    const token =
                        typeof tokenData === "string" ? tokenData : tokenData.data;
                    setExpoPushToken(token);
                    await AsyncStorage.setItem(
                        process.env.EXPO_PUBLIC_PUSH_TOKEN as string,
                        token
                    );
                } catch (error) {
                    console.error("Error getting push token:", error);
                }
            };
            getToken();
        }
    }, [loading, settings.pushEnabled, notificationPermission]);

    const sendLowStockAlert = async (
        productName: string,
        currentStock: number
    ) => {
        if (
            !settings.lowStockAlerts ||
            !settings.pushEnabled ||
            !notificationPermission
        ) {
            return;
        }

        const notif = await loadNotifications();
        if (!notif) return;
        await notif.scheduleNotificationAsync({
            content: {
                title: "⚠️ Stok Rendah",
                body: `${productName} tersisa ${currentStock} unit`,
                sound: getSoundValue(),
                data: { type: "low_stock", productName, currentStock },
            },
            trigger: null,
            identifier: `low_stock_${Date.now()}`,
            ...(Platform.OS === "android" && { channelId: "low_stock" }),
        });
    };

    const testNotification = async () => {
        if (!settings.pushEnabled || !notificationPermission) {
            throw new Error("Notifikasi belum diaktifkan atau izin belum diberikan");
        }

        const notif = await loadNotifications();
        if (!notif) throw new Error("Modul notifikasi tidak tersedia");
        await notif.scheduleNotificationAsync({
            content: {
                title: "🔔 Test Notifikasi",
                body: "Ini adalah notifikasi uji coba. Pengaturan notifikasi Anda berfungsi dengan baik!",
                sound: getSoundValue(),
                data: { type: "test" },
            },
            trigger: null,
            identifier: `test_${Date.now()}`,
            ...(Platform.OS === "android" && { channelId: "default" }),
        });
    };

    const sendTransactionNotification = async (
        transactionNumber: string,
        total: number,
        isPartial?: boolean
    ): Promise<boolean> => {
        if (
            !transactionNumber ||
            transactionNumber === "-" ||
            settings.transactionNotifications !== true ||
            !settings.pushEnabled ||
            !notificationPermission
        ) {
            return false;
        }

        const notif = await loadNotifications();
        if (!notif) return false;

        const formatRupiah = (n: number) =>
            new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(n);

        const title = isPartial
            ? "📋 Transaksi Kasbon"
            : "✅ Transaksi Berhasil";
        const body = isPartial
            ? `${transactionNumber} - ${formatRupiah(total)} (Pembayaran sebagian)`
            : `${transactionNumber} - ${formatRupiah(total)}`;

        try {
            await notif.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: getSoundValue(),
                    data: {
                        type: "transaction",
                        transactionNumber,
                        total,
                        isPartial: !!isPartial,
                    },
                },
                trigger: null,
                identifier: `transaction_${transactionNumber}_${Date.now()}`,
                ...(Platform.OS === "android" && { channelId: "transactions" }),
            });
            return true;
        } catch {
            return false;
        }
    };

    return {
        expoPushToken,
        notificationPermission,
        settings,
        loading,
        registerForPushNotifications,
        unregisterPushNotifications,
        updatePushEnabled,
        updateSoundEnabled,
        updateLowStockAlerts,
        updateTransactionNotifications,
        updateSelectedSound,
        getSoundValue,
        sendLowStockAlert,
        sendTransactionNotification,
        testNotification,
    };
};
import { MaterialIcons } from '@expo/vector-icons';

import { Tabs } from 'expo-router';

import { Header } from '@/components/Header';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: true,
                header: () => <Header />,
                tabBarActiveTintColor: '#2b3784',
                tabBarInactiveTintColor: '#6B7280',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#D1D5DB',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="beranda"
                options={{
                    title: 'Beranda',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="inventory" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="transaction"
                options={{
                    title: 'Transaction',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="receipt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

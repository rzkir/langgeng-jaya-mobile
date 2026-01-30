import { Stack } from 'expo-router';

export default function TransactionsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="laporan" />
            <Stack.Screen name="rekap" />
            <Stack.Screen name="partial" />
            <Stack.Screen name="pembayaran" />
        </Stack>
    );
}
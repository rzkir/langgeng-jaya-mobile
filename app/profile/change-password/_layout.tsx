import { Stack } from 'expo-router';

export default function ChangePasswordLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
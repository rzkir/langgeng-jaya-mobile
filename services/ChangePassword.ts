import { router } from 'expo-router';

import { useCallback, useState } from 'react';

import { Alert } from 'react-native';

import { API_CONFIG } from '@/lib/config';

const MIN_PASSWORD_LENGTH = 8;

export function useChangePassword(userId: string | undefined) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        const cur = currentPassword.trim();
        const newP = newPassword.trim();
        const conf = confirmPassword.trim();

        if (!cur) {
            Alert.alert('Perhatian', 'Masukkan password saat ini.');
            return;
        }
        if (!newP) {
            Alert.alert('Perhatian', 'Masukkan password baru.');
            return;
        }
        if (newP.length < MIN_PASSWORD_LENGTH) {
            Alert.alert('Perhatian', `Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.`);
            return;
        }
        if (newP !== conf) {
            Alert.alert('Perhatian', 'Password baru dan konfirmasi tidak sama.');
            return;
        }
        if (!userId) {
            Alert.alert('Error', 'Sesi tidak valid. Silakan login ulang.');
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                id: userId,
                currentPassword: cur,
                newPassword: newP,
            });
            Alert.alert('Berhasil', 'Password berhasil diubah. Silakan login ulang dengan password baru.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            Alert.alert(
                'Gagal mengubah password',
                e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.'
            );
        } finally {
            setLoading(false);
        }
    }, [currentPassword, newPassword, confirmPassword, userId]);

    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        showCurrent,
        setShowCurrent,
        showNew,
        setShowNew,
        showConfirm,
        setShowConfirm,
        loading,
        handleSubmit,
    };
}

/**
 * POST /api/profile/password
 * Body: { id, currentPassword, newPassword }
 * newPassword minimal 8 karakter.
 */
export async function changePassword(params: {
    id: string;
    currentPassword: string;
    newPassword: string;
}): Promise<void> {
    const { id, currentPassword, newPassword } = params;
    if (!id?.trim()) throw new Error('User ID is required');
    if (!currentPassword?.trim()) throw new Error('Password saat ini wajib diisi');
    if (!newPassword?.trim()) throw new Error('Password baru wajib diisi');
    if (newPassword.trim().length < 8) throw new Error('Password baru minimal 8 karakter');

    const response = await fetch(API_CONFIG.ENDPOINTS.profile.password, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
        },
        body: JSON.stringify({
            id: id.trim(),
            currentPassword: currentPassword.trim(),
            newPassword: newPassword.trim(),
        }),
    });

    const text = await response.text();
    let data: ChangePasswordResponse = {};
    try {
        data = text ? (JSON.parse(text) as ChangePasswordResponse) : {};
    } catch {
        if (!response.ok) {
            throw new Error(`${response.status}: ${text?.slice(0, 150) || response.statusText}`);
        }
    }

    if (!response.ok) {
        throw new Error(data?.message || `Gagal mengubah password: ${response.status}`);
    }
}

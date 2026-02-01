import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { API_CONFIG } from '@/lib/config';

export function useEditProfile(
    userId: string | undefined,
    userName: string | undefined,
    updateUser: (data: Partial<User>) => void
) {
    const [editSheetVisible, setEditSheetVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhotoUri, setEditPhotoUri] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    const openEditSheet = useCallback(() => {
        setEditName(userName ?? '');
        setEditPhotoUri('');
        setEditSheetVisible(true);
    }, [userName]);

    const pickPhoto = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk memilih foto profil.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled || !result.assets[0]?.uri) return;
        setEditPhotoUri(result.assets[0].uri);
    }, []);

    const handleSaveProfile = useCallback(async () => {
        const nameTrim = editName.trim();
        if (!nameTrim) {
            Alert.alert('Nama wajib', 'Isi nama Anda.');
            return;
        }
        if (!userId) {
            Alert.alert('Error', 'Sesi tidak valid. Silakan login ulang.');
            return;
        }
        setSubmitLoading(true);
        try {
            const updated = await uploadProfile({
                userId,
                name: nameTrim,
                photoUri: editPhotoUri || undefined,
            });
            updateUser(updated);
            setEditSheetVisible(false);
        } catch (e) {
            Alert.alert(
                'Gagal memperbarui',
                e instanceof Error ? e.message : 'Gagal memperbarui profil.'
            );
        } finally {
            setSubmitLoading(false);
        }
    }, [editName, editPhotoUri, updateUser, userId]);

    return {
        editSheetVisible,
        setEditSheetVisible,
        editName,
        setEditName,
        editPhotoUri,
        submitLoading,
        openEditSheet,
        pickPhoto,
        handleSaveProfile,
    };
}

export async function uploadProfile(params: {
    userId: string;
    name?: string;
    photoUri?: string;
}): Promise<Partial<User>> {
    const { userId, name, photoUri } = params;
    if (!userId?.trim()) {
        throw new Error('User ID is required');
    }
    let avatarUrl: string | undefined;

    if (photoUri?.trim()) {
        const formData = new FormData();
        const fileName = photoUri.split('/').pop() || 'photo.jpg';
        const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        formData.append('file', {
            uri: photoUri,
            type: mimeType,
            name: fileName,
        } as unknown as Blob);

        const uploadRes = await fetch(API_CONFIG.ENDPOINTS.profile.upload, {
            method: 'POST',
            headers: { Authorization: `Bearer ${API_CONFIG.SECRET}` },
            body: formData,
        });

        const uploadText = await uploadRes.text();
        let uploadJson: { url?: string; fileId?: string; error?: string } = {};
        try {
            uploadJson = uploadText ? JSON.parse(uploadText) : {};
        } catch {
            if (!uploadRes.ok) {
                throw new Error(`${uploadRes.status}: ${uploadText?.slice(0, 150) || uploadRes.statusText}`);
            }
        }
        if (!uploadRes.ok) {
            throw new Error(uploadJson?.error || `Upload gagal: ${uploadRes.status}`);
        }
        avatarUrl = uploadJson.url;
    }

    const body: Record<string, string> = { id: userId.trim() };
    if (typeof name === 'string' && name.trim()) body.name = name.trim();
    if (avatarUrl) body.avatar = avatarUrl;

    if (Object.keys(body).length === 0) {
        return {};
    }

    const putRes = await fetch(API_CONFIG.ENDPOINTS.profile.base, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${API_CONFIG.SECRET}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const putText = await putRes.text();
    let putData: ApiResponse<User> = {};
    try {
        putData = putText ? (JSON.parse(putText) as ApiResponse<User>) : {};
    } catch {
        if (!putRes.ok) {
            throw new Error(`${putRes.status}: ${putText?.slice(0, 150) || putRes.statusText}`);
        }
    }
    if (!putRes.ok) {
        throw new Error(putData?.message || putData?.error || `Update profil gagal: ${putRes.status}`);
    }

    const updated: Partial<User> = {};
    const data = putData.data as Record<string, unknown> | undefined;
    if (data?.name !== undefined) updated.name = data.name as string;
    if (data?.avatar !== undefined) updated.avatar = data.avatar as string;
    if (body.name !== undefined) updated.name = body.name;
    if (body.avatar !== undefined) updated.avatar = body.avatar;

    return updated;
}

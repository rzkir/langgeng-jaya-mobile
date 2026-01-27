import React from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

type DeleteModalProps = {
    visible: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function DeleteModal({
    visible,
    title = 'Hapus data?',
    message = 'Apakah kamu yakin ingin menghapus data ini?',
    confirmText = 'Hapus',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
}: DeleteModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/40 items-center justify-center px-8">
                <View className="bg-white rounded-3xl px-6 py-5 w-full">
                    <Text className="text-lg font-semibold text-gray-900 mb-2">
                        {title}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-5">
                        {message}
                    </Text>
                    <View className="flex-row justify-end gap-2">
                        <TouchableOpacity
                            onPress={onCancel}
                            className="px-4 py-2 rounded-2xl bg-gray-100"
                        >
                            <Text className="text-sm text-gray-700 font-medium">
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            className="px-4 py-2 rounded-2xl bg-red-500"
                        >
                            <Text className="text-sm text-white font-semibold">
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}


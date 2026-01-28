import React from 'react';

import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { MotiView } from 'moti';

export default function Scanner({
    visible,
    onClose,
    ScannerComponent: ScannerView,
    onBarCodeScanned,
}: ScannerProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1">
                {/* Close button */}
                <View className="mt-4 mx-6 flex-row justify-between items-center">
                    <TouchableOpacity
                        className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                        activeOpacity={0.85}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={18} color="#111827" />
                    </TouchableOpacity>

                    <Text className="text-gray-500 text-base">Scanning</Text>
                </View>

                {/* Scanner frame */}
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-full max-w-xs aspect-[3/4] rounded-3xl overflow-hidden bg-black/90">
                        <ScannerView
                            style={{ flex: 1 }}
                            // Dukungan untuk API lama (Camera.onBarCodeScanned) dan baru (CameraView.onBarcodeScanned)
                            onBarCodeScanned={onBarCodeScanned}
                            onBarcodeScanned={onBarCodeScanned}
                            barcodeScannerSettings={{
                                // tipe-tipe barcode umum, bisa disesuaikan kebutuhan
                                barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'],
                            }}
                        />

                        {/* Overlay scan line with animation */}
                        <View className="absolute inset-0 items-stretch justify-center">
                            <MotiView
                                from={{
                                    translateY: -80,
                                    opacity: 0.2,
                                }}
                                animate={{
                                    translateY: 80,
                                    opacity: 1,
                                }}
                                transition={{
                                    loop: true,
                                    repeatReverse: true,
                                    type: 'timing',
                                    duration: 1600,
                                }}
                                className="h-[3px] bg-emerald-500 mx-6 rounded-full"
                            />
                        </View>

                        {/* Frame corners */}
                        <View className="absolute inset-0">
                            <View className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-emerald-400 rounded-tl-3xl" />
                            <View className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-emerald-400 rounded-tr-3xl" />
                            <View className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-emerald-400 rounded-bl-3xl" />
                            <View className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-emerald-400 rounded-br-3xl" />
                        </View>
                    </View>

                    {/* Scanning icon */}
                    <View className="mt-4 items-center">
                        <View className="w-14 h-14 rounded-full bg-emerald-500 items-center justify-center shadow-lg">
                            <Ionicons name="scan-outline" size={26} color="#FFFFFF" />
                        </View>
                    </View>

                    {/* Scanning label */}
                    <View className="mt-4 items-center">
                        <Text className="text-gray-500 text-base mt-1">Arahkan barcode ke dalam kotak hijau</Text>
                    </View>

                    {/* Next steps */}
                    <View className="mt-8 w-full max-w-xs">
                        <Text className="text-gray-900 font-semibold text-base mb-3">Next Steps</Text>

                        <View className="flex-row items-center mb-3">
                            <View className="w-2 h-2 rounded-full bg-emerald-500  mr-2" />
                            <Text className="text-gray-600 text-base flex-1">
                                Aktifkan izin kamera di pengaturan perangkat.
                            </Text>
                        </View>

                        <View className="flex-row items-start mb-3">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mt-1 mr-2" />
                            <Text className="text-gray-600 text-base flex-1">
                                Posisikan barcode produk di tengah area pemindaian.
                            </Text>
                        </View>

                        <View className="flex-row items-start">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mt-1 mr-2" />
                            <Text className="text-gray-600 text-base flex-1">
                                Tunggu sebentar, sistem akan mengenali produk secara otomatis.
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

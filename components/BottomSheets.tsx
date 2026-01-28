import React, { ReactNode, useEffect, useRef } from 'react';

import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BottomSheetsProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

export default function BottomSheets({ visible, onClose, title, children }: BottomSheetsProps) {
    const translateY = useRef(new Animated.Value(300)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 220,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 220,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 300,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, translateY, backdropOpacity]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.backdropWrapper}
                    onPress={onClose}
                >
                    <Animated.View
                        style={[
                            styles.backdrop,
                            {
                                opacity: backdropOpacity,
                            },
                        ]}
                    />
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {title ? (
                        <View className="mb-3 border-b border-gray-200 pb-3">
                            <Text className="text-gray-900 font-semibold text-xl text-center">{title}</Text>
                        </View>
                    ) : null}

                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdropWrapper: {
        ...StyleSheet.absoluteFillObject,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
});


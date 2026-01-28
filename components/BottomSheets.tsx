import React, { useCallback, useEffect, useRef } from 'react';

import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';

export default function BottomSheets({ visible, onClose, title, children }: BottomSheetsProps) {
    const translateY = useRef(new Animated.Value(300)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const dragY = useRef(new Animated.Value(0)).current;

    const resetPosition = useCallback(() => {
        Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    }, [dragY]);

    const closeSheet = useCallback(() => {
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
        ]).start(({ finished }) => {
            if (finished) {
                onClose();
            }
        });
    }, [backdropOpacity, onClose, translateY]);

    const onGestureEvent = Animated.event(
        [
            {
                nativeEvent: {
                    translationY: dragY,
                },
            },
        ],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY } = event.nativeEvent;
            const shouldClose = translationY > 100;

            if (shouldClose) {
                closeSheet();
            } else {
                resetPosition();
            }
        }
    };

    useEffect(() => {
        if (visible) {
            // buka sheet dengan animasi
            translateY.setValue(300);
            dragY.setValue(0);

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
            // kalau visible=false dari parent, jangan panggil onClose lagi
            // cukup reset posisi & backdrop tanpa trigger re-render berulang
            translateY.setValue(300);
            dragY.setValue(0);
            backdropOpacity.setValue(0);
        }
    }, [visible, translateY, backdropOpacity, dragY]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={styles.container}>
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
                            transform: [
                                {
                                    translateY: Animated.add(translateY, dragY.interpolate({
                                        inputRange: [0, 300],
                                        outputRange: [0, 300],
                                        extrapolate: 'clamp',
                                    })),
                                },
                            ],
                        },
                    ]}
                >
                    <PanGestureHandler
                        onGestureEvent={onGestureEvent}
                        onHandlerStateChange={onHandlerStateChange}
                    >
                        <Animated.View>
                            <View style={styles.dragHandleContainer}>
                                <View style={styles.dragHandle} />
                            </View>

                            {title ? (
                                <View className="mb-3 border-b border-gray-200 pb-3">
                                    <Text className="text-gray-900 font-semibold text-xl text-center">{title}</Text>
                                </View>
                            ) : null}
                        </Animated.View>
                    </PanGestureHandler>

                    {children}
                </Animated.View>
            </GestureHandlerRootView>
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
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
    },
});


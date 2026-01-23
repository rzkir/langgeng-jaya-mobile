import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Beranda() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Beranda</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
// src/features/zones/components/ZoneCard.web.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../../../shared/constants/theme';

export default function ZoneCard({ zone, onPress, onDelete }) {
    const {
        name,
        description,
        reportsCount = 0,
        priority = "Normal",
        isActive = true,
        latitude,
        longitude
    } = zone;

    const isAlert = priority === "Alerta" || priority === "ALERTA" || priority === "HIGH";

    return (
        <TouchableOpacity
            style={[styles.card, isAlert && styles.cardAlertBorder]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/* Vista previa del mapa en Web */}
            <View style={styles.previewContainer}>
                {latitude && longitude ? (
                    React.createElement('iframe', {
                        title: `Mapa de ${name}`,
                        src: `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`,
                        width: "100%",
                        height: "150",
                        style: { border: 0, display: 'block' },
                        loading: "lazy"
                    })
                ) : (
                    <Text style={styles.noCoordinatesText}>SIN COORDENADAS</Text>
                )}
                {isActive && (
                    <View style={[styles.badgeActive, isAlert && styles.badgeAlert]}>
                        <Text style={styles.badgeText}>
                            {isAlert ? "ZONA CRÍTICA" : "ZONA ACTIVA"}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.titleRow}>
                    <Text style={styles.zoneTitle}>{name}</Text>
                    <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                        <Text style={styles.deleteIconText}>🗑️</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.zoneDescription}>{description || "Sin descripción asignada"}</Text>

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <View>
                        <Text style={styles.footerLabel}>REPORTES</Text>
                        <Text style={styles.footerValueNumber}>{reportsCount}</Text>
                    </View>

                    <View style={styles.rightAlign}>
                        <Text style={styles.footerLabelRight}>PRIORIDAD</Text>
                        <Text style={[
                            styles.priorityValue,
                            isAlert ? styles.priorityAlertText : styles.priorityNormalText
                        ]}>
                            {isAlert ? "Alerta" : priority}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: radius.lg || 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: spacing.md || 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardAlertBorder: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
    },
    previewContainer: {
        height: 150,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    webMapPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    mapEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    webMapCoords: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    webMapSubtitle: {
        fontSize: 10,
        color: '#9CA3AF',
        marginTop: 2,
    },
    badgeActive: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: '#2563EB',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
        zIndex: 10,
    },
    badgeAlert: {
        backgroundColor: '#EF4444',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    noCoordinatesText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 1,
    },
    infoContainer: {
        padding: spacing.md || 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    zoneTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.brandDark || '#08316d',
    },
    deleteButton: {
        padding: 4,
    },
    deleteIconText: {
        fontSize: 16,
        opacity: 0.5,
    },
    zoneDescription: {
        fontSize: 14,
        color: '#4B5563',
        marginTop: 4,
        marginBottom: spacing.sm || 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: spacing.sm || 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    footerLabelRight: {
        fontSize: 10,
        fontWeight: '700',
        color: '#9CA3AF',
        letterSpacing: 0.5,
        marginBottom: 2,
        textAlign: 'right',
    },
    footerValueNumber: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111827',
    },
    rightAlign: {
        alignItems: 'flex-end',
    },
    priorityValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    priorityNormalText: {
        color: '#2563EB',
    },
    priorityAlertText: {
        color: '#EF4444',
    },
});
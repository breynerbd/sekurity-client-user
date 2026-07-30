import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userClient } from "../../../shared/api/userClient";

export default function MyReportsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetchReports = async () => {
        try {
            setError(null);
            const data = await userClient.getMyReports();
            const sortedData = Array.isArray(data)
                ? [...data].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
                : [];
            setReports(sortedData);
        } catch (err) {
            setError(err?.response?.data?.message || "No se pudieron cargar tus reportes");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReports();
    }, []);

    const handleDeleteReport = (reportId) => {
        Alert.alert(
            "Eliminar reporte",
            "¿Estás seguro de que deseas eliminar este reporte? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setDeletingId(reportId);
                            if (typeof userClient.deleteReport === "function") {
                                await userClient.deleteReport(reportId);
                            } else if (typeof userClient.deleteMyReport === "function") {
                                await userClient.deleteMyReport(reportId);
                            }
                            setReports((prevReports) => prevReports.filter((r) => r.id !== reportId));
                        } catch (err) {
                            Alert.alert("Error", err?.response?.data?.message || "No se pudo eliminar el reporte.");
                        } finally {
                            setDeletingId(null);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
                <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </Pressable>
                <Text style={styles.title}>Mis reportes</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchReports}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : reports.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="document-text-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Sin reportes</Text>
                    <Text style={styles.emptySubtitle}>Aún no has creado ningún reporte de incidencia.</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => {
                        const statusText = item.status || "En proceso";
                        const isResolved = statusText === "Resuelto" || statusText === "RESOLVED";
                        const isDeleting = deletingId === item.id;
                        const incidentType = item.incident_type || item.incidentType;
                        const reportDate = new Date(item.createdAt || item.date);

                        return (
                            <View style={styles.card}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.cardTitle}>{item.title}</Text>
                                    <View style={styles.badgesContainer}>
                                        {incidentType ? (
                                            <View style={styles.typeBadge}>
                                                <Text style={styles.typeBadgeText}>{incidentType}</Text>
                                            </View>
                                        ) : null}
                                        <View style={[styles.badge, isResolved ? styles.badgeSuccess : styles.badgeWarning]}>
                                            <Text style={[styles.badgeText, isResolved ? styles.badgeTextSuccess : styles.badgeTextWarning]}>
                                                {statusText}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.rowBetweenFooter}>
                                    <Text style={styles.cardDate}>
                                        Creado el {reportDate.toLocaleDateString()} | {reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    <Pressable
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteReport(item.id)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <ActivityIndicator size="small" color="#DC2626" />
                                        ) : (
                                            <Ionicons name="trash-outline" size={18} color="#DC2626" />
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F8FAFC" },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
    fixedHeader: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#F8FAFC", zIndex: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
    title: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
    backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#F1F5F9" },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, gap: 8 },
    rowBetweenFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
    cardTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A", flex: 1 },
    cardDate: { fontSize: 12, color: "#94A3B8" },
    badgesContainer: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "#EFF6FF" },
    typeBadgeText: { fontSize: 11, fontWeight: "700", color: "#1D4ED8" },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeSuccess: { backgroundColor: "#F0FDF4" },
    badgeWarning: { backgroundColor: "#FEFCE8" },
    badgeText: { fontSize: 11, fontWeight: "700" },
    badgeTextSuccess: { color: "#16A34A" },
    badgeTextWarning: { color: "#CA8A04" },
    deleteButton: { padding: 4, borderRadius: 8, backgroundColor: "#FEF2F2", justifyContent: "center", alignItems: "center" },
    errorText: { fontSize: 14, color: "#DC2626", marginVertical: 12, textAlign: "center" },
    retryButton: { backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 4 }
});
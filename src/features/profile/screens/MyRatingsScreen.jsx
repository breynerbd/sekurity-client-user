import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userClient } from "../../../shared/api/userClient";

export default function MyRatingsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchRatings = async () => {
        try {
            setError(null);
            const data = await userClient.getMyRatings();
            setRatings(data);
        } catch (err) {
            setError(err?.response?.data?.message || "No se pudieron cargar tus reseñas");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRatings();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRatings();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
                <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </Pressable>
                <Text style={styles.title}>Mis reseñas y valoraciones</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchRatings}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : ratings.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="star-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Sin reseñas</Text>
                    <Text style={styles.emptySubtitle}>Aún no has calificado ninguna zona o reporte.</Text>
                </View>
            ) : (
                <FlatList
                    data={[...ratings].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => {
                        const targetName = item.zone?.name || item.report?.title || (item.zone_id ? `Zona #${item.zone_id}` : `Reporte #${item.report_id}`);

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.targetText} numberOfLines={1}>
                                        Calificación en: {targetName}
                                    </Text>
                                </View>

                                <View style={styles.starsRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Ionicons
                                            key={star}
                                            name={star <= item.score ? "star" : "star-outline"}
                                            size={16}
                                            color="#F59E0B"
                                        />
                                    ))}
                                    <Text style={styles.scoreText}>({item.score}/5)</Text>
                                </View>

                                {item.comment ? (
                                    <Text style={styles.commentContent}>"{item.comment}"</Text>
                                ) : null}

                                <Text style={styles.cardDate}>
                                    {new Date(item.createdAt || item.date).toLocaleDateString()}
                                </Text>
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
    title: { fontSize: 18, fontWeight: "800", color: "#0F172A", flex: 1 },
    backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#F1F5F9" },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    targetText: { fontSize: 12, fontWeight: "700", color: "#2563EB", flex: 1, marginRight: 8 },
    starsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 },
    scoreText: { fontSize: 12, fontWeight: "600", color: "#64748B", marginLeft: 4 },
    commentContent: { fontSize: 14, color: "#0F172A", marginBottom: 10, lineHeight: 20 },
    cardDate: { fontSize: 12, color: "#94A3B8" },
    errorText: { fontSize: 14, color: "#DC2626", marginVertical: 12, textAlign: "center" },
    retryButton: { backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 4 }
});
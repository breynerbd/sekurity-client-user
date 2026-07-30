import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userClient } from "../../../shared/api/userClient";

const levels = [
    { id: 1, label: "Leve", color: "#EAB308", icon: "alert-circle-outline", activeIcon: "alert-circle", bg: "#FEFCE8" },
    { id: 2, label: "Modio", color: "#F97316", icon: "warning-outline", activeIcon: "warning", bg: "#FFF7ED" },
    { id: 3, label: "Grave", color: "#DC2626", icon: "flame-outline", activeIcon: "flame", bg: "#FEF2F2" },
];

export default function MyReactionsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [commentReactions, setCommentReactions] = useState([]);
    const [reportReactions, setReportReactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("ALL");

    const fetchReactions = async () => {
        try {
            setError(null);

            const [commentsData, reportsData] = await Promise.all([
                typeof userClient.getMyComments === "function" ? userClient.getMyComments() : Promise.resolve([]),
                typeof userClient.getMyReports === "function" ? userClient.getMyReports() : Promise.resolve([])
            ]);

            const parsedComments = Array.isArray(commentsData) ? commentsData.flatMap(comment => {
                const reactions = comment.comment_reactions || comment.commentReactions;
                if (!reactions) return [];

                const reactionList = Array.isArray(reactions) ? reactions : [reactions];
                return reactionList.map(reaction => ({
                    id: `comment-${reaction.id}`,
                    source: "COMMENT",
                    type: reaction.type,
                    title: comment.content ? `"${comment.content}"` : `"Comentario"`,
                    date: reaction.createdAt || comment.createdAt || comment.date
                }));
            }) : [];

            const parsedReports = Array.isArray(reportsData) ? reportsData.flatMap(report => {
                const reactions = report.report_reactions || report.reportReactions;
                if (!reactions) return [];

                const reactionList = Array.isArray(reactions) ? reactions : [reactions];
                return reactionList.map(reaction => {
                    const matchedLevel = levels.find(l => l.id === reaction.type) || levels[0];
                    return {
                        id: `report-${reaction.id}`,
                        source: "REPORT",
                        type: "REPORT_LEVEL",
                        levelData: matchedLevel,
                        title: report.title ? `${report.title}` : `Reporte de incidencia`,
                        date: reaction.createdAt || report.createdAt || report.date
                    };
                });
            }) : [];

            setCommentReactions(parsedComments);
            setReportReactions(parsedReports);
        } catch (err) {
            setError(err?.response?.data?.message || "No se pudieron cargar tus reacciones");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReactions();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchReactions();
    }, []);

    const filteredData = useMemo(() => {
        let combined = [];
        if (filter === "ALL" || filter === "COMMENTS") {
            combined = [...combined, ...commentReactions];
        }
        if (filter === "ALL" || filter === "REPORTS") {
            combined = [...combined, ...reportReactions];
        }
        return combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }, [filter, commentReactions, reportReactions]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
                <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </Pressable>
                <Text style={styles.title}>Mis reacciones</Text>
            </View>

            {/* Filtros */}
            <View style={styles.filterContainer}>
                <Pressable
                    style={[styles.filterChip, filter === "ALL" && styles.filterChipActive]}
                    onPress={() => setFilter("ALL")}
                >
                    <Text style={[styles.filterText, filter === "ALL" && styles.filterTextActive]}>Todo</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, filter === "COMMENTS" && styles.filterChipActive]}
                    onPress={() => setFilter("COMMENTS")}
                >
                    <Text style={[styles.filterText, filter === "COMMENTS" && styles.filterTextActive]}>Comentarios</Text>
                </Pressable>
                <Pressable
                    style={[styles.filterChip, filter === "REPORTS" && styles.filterChipActive]}
                    onPress={() => setFilter("REPORTS")}
                >
                    <Text style={[styles.filterText, filter === "REPORTS" && styles.filterTextActive]}>Reportes</Text>
                </Pressable>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchReactions}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : filteredData.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="heart-dislike-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Sin reacciones</Text>
                    <Text style={styles.emptySubtitle}>Aún no has reaccionado a ningún contenido.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => {
                        const isComment = item.source === "COMMENT";
                        const isLike = isComment && item.type === "LIKE";
                        const reactionDate = item.date ? new Date(item.date) : null;
                        const levelData = item.levelData || levels[0];

                        const iconName = isComment
                            ? (isLike ? "thumbs-up" : "thumbs-down")
                            : levelData.activeIcon;

                        const iconColor = isComment
                            ? (isLike ? "#16A34A" : "#DC2626")
                            : levelData.color;

                        const iconBg = isComment
                            ? (isLike ? styles.likeBg : styles.dislikeBg)
                            : { backgroundColor: levelData.bg };

                        return (
                            <View style={styles.card}>
                                <View style={styles.row}>
                                    <View style={[styles.iconWrap, iconBg]}>
                                        <Ionicons
                                            name={iconName}
                                            size={16}
                                            color={iconColor}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.cardHeaderRow}>
                                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                                            <View style={[styles.sourceBadge, isComment ? styles.commentSource : styles.reportSource]}>
                                                <Text style={styles.sourceText}>{isComment ? "Comentario" : "Reporte"}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.cardDate}>
                                            Otorgado el {reactionDate ? `${reactionDate.toLocaleDateString()} a las ${reactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Fecha desconocida"}
                                        </Text>
                                    </View>
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
    filterContainer: { flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0" },
    filterChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
    filterText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
    filterTextActive: { color: "#FFFFFF" },
    listContent: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
    card: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#F1F5F9" },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    iconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginTop: 2 },
    likeBg: { backgroundColor: "#F0FDF4" },
    dislikeBg: { backgroundColor: "#FEF2F2" },
    cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 },
    cardTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A", flex: 1 },
    cardDate: { fontSize: 12, color: "#94A3B8" },
    sourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    commentSource: { backgroundColor: "#F1F5F9" },
    reportSource: { backgroundColor: "#EFF6FF" },
    sourceText: { fontSize: 10, fontWeight: "700", color: "#475569" },
    errorText: { fontSize: 14, color: "#DC2626", marginVertical: 12, textAlign: "center" },
    retryButton: { backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 4 }
});
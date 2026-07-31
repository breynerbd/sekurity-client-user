import React from "react";
import { Modal, View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState } from "../../../shared/components/Common";

export default function ZoneReviewsModal({ visible, onClose, ratings = [], zoneName }) {
    const avgRating =
        ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
            : null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    <View style={styles.grabber} />

                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.title} numberOfLines={1}>
                                Reseñas
                            </Text>
                            {zoneName ? (
                                <Text style={styles.subtitle} numberOfLines={1}>
                                    {zoneName}
                                </Text>
                            ) : null}
                        </View>

                        <Pressable onPress={onClose} hitSlop={10}>
                            <Ionicons name="close-circle" size={30} color="#94A3B8" />
                        </Pressable>
                    </View>


                    <View style={styles.summaryRow}>
                        <View style={styles.summaryChip}>
                            <Ionicons name="star" size={13} color="#F59E0B" />
                            <Text style={styles.summaryChipText}>
                                {ratings.length} {ratings.length === 1 ? "reseña" : "reseñas"}
                            </Text>
                        </View>
                    </View>


                    <FlatList
                        data={ratings}
                        keyExtractor={(item) => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <EmptyState
                                description="Sé el primero en calificar esta zona"
                            />
                        }
                        renderItem={({ item }) => {
                            const userInfo = item.User || item.user;

                            const userName = userInfo
                                ? `${userInfo.name || ""} ${userInfo.surname || ""}`.trim() || userInfo.username || userInfo.email
                                : "Usuario Anónimo";

                            return (
                                <View style={styles.ratingCard}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.userName} numberOfLines={1}>
                                            {userName}
                                        </Text>
                                        <Text style={styles.scoreBadge}>{item.score}/5</Text>
                                    </View>

                                    <View style={styles.starsInline}>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Ionicons
                                                key={i}
                                                name={i <= item.score ? "star" : "star-outline"}
                                                size={13}
                                                color="#F59E0B"
                                            />
                                        ))}
                                    </View>

                                    <Text style={styles.cardComment}>{item.comment}</Text>
                                </View>
                            );
                        }}
                    />

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(15,23,42,0.45)",
        justifyContent: "flex-end",
    },
    modal: {
        backgroundColor: "#F8FAFC",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: "85%",
        minHeight: "40%",
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    grabber: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#E2E8F0",
        alignSelf: "center",
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0F172A",
    },
    subtitle: {
        fontSize: 13,
        color: "#64748B",
        marginTop: 2,
    },
    summaryRow: {
        flexDirection: "row",
        marginBottom: 16,
    },
    summaryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#FFFBEB",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    summaryChipText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#92400E",
    },
    listContent: {
        paddingBottom: 24,
    },
    ratingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    starsInline: {
        flexDirection: "row",
        gap: 2,
    },
    scoreBadge: {
        fontSize: 11,
        fontWeight: "700",
        color: "#475569",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    cardComment: {
        fontSize: 14,
        color: "#334155",
        lineHeight: 20,
    },
    userName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
        flex: 1,
        marginRight: 8,
    },
});
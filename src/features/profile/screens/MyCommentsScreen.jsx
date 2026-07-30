import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { userClient } from "../../../shared/api/userClient";

export default function MyCommentsScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Estados para el Modal de Edición
    const [modalVisible, setModalVisible] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [newContent, setNewContent] = useState("");
    const [updating, setUpdating] = useState(false);

    const fetchComments = async () => {
        try {
            setError(null);
            const data = await userClient.getMyComments();
            setComments(data);
        } catch (err) {
            setError(err?.response?.data?.message || "No se pudieron cargar tus comentarios");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchComments();
    }, []);

    const handleDeleteComment = (commentId) => {
        Alert.alert(
            "Eliminar comentario",
            "¿Estás seguro de que deseas eliminar esta opinión?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await userClient.deleteComment(commentId);
                            setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
                        } catch (err) {
                            Alert.alert("Error", err?.response?.data?.message || "No se pudo eliminar el comentario");
                        }
                    },
                },
            ]
        );
    };

    const handleOpenEditModal = (item) => {
        setEditingComment(item);
        setNewContent(item.content);
        setModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!newContent.trim()) {
            Alert.alert("Aviso", "El comentario no puede estar vacío");
            return;
        }

        try {
            setUpdating(true);
            const updated = await userClient.updateComment(editingComment.id, { content: newContent });

            // Actualizamos localmente el estado de la lista
            setComments((prevComments) =>
                prevComments.map((c) => (c.id === editingComment.id ? { ...c, content: updated.content } : c))
            );

            setModalVisible(false);
            setEditingComment(null);
        } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || "No se pudo actualizar el comentario");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
                <Pressable onPress={() => navigation?.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={20} color="#0F172A" />
                </Pressable>
                <Text style={styles.title}>Mis comentarios y opiniones</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : error ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable style={styles.retryButton} onPress={fetchComments}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </Pressable>
                </View>
            ) : comments.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="chatbubbles-outline" size={48} color="#94A3B8" />
                    <Text style={styles.emptyTitle}>Sin comentarios</Text>
                    <Text style={styles.emptySubtitle}>Aún no has escrito opiniones en las publicaciones.</Text>
                </View>
            ) : (
                <FlatList
                    data={[...comments].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => {
                        const isReply = item.parent_id !== null && item.parent_id !== undefined;
                        const reportTitle = item.report?.title && item.report.title.trim() !== ""
                            ? item.report.title
                            : `Reporte #${item.report_id}`;

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.targetText}>
                                        {isReply ? "Respuesta en: " : "Comentario en: "}
                                        {reportTitle}
                                    </Text>
                                    <View style={styles.actionButtons}>
                                        <Pressable onPress={() => handleOpenEditModal(item)} style={styles.iconActionBtn}>
                                            <Ionicons name="pencil-outline" size={17} color="#2563EB" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteComment(item.id)} style={styles.iconActionBtn}>
                                            <Ionicons name="trash-outline" size={17} color="#DC2626" />
                                        </Pressable>
                                    </View>
                                </View>
                                <Text style={styles.commentContent}>"{item.content}"</Text>
                                <Text style={styles.cardDate}>
                                    {new Date(item.createdAt || item.date).toLocaleDateString()}
                                </Text>
                            </View>
                        );
                    }}
                />
            )}

            {/* Modal Pequeño de Edición */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar comentario</Text>
                        <TextInput
                            style={styles.textInput}
                            multiline
                            value={newContent}
                            onChangeText={setNewContent}
                            placeholder="Escribe tu nuevo comentario..."
                            placeholderTextColor="#94A3B8"
                        />
                        <View style={styles.modalButtonsRow}>
                            <Pressable
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                                disabled={updating}
                            >
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSaveEdit}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Guardar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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
    actionButtons: { flexDirection: "row", gap: 8 },
    iconActionBtn: { padding: 4 },
    commentContent: { fontSize: 14, color: "#0F172A", marginBottom: 10, lineHeight: 20 },
    cardDate: { fontSize: 12, color: "#94A3B8" },
    errorText: { fontSize: 14, color: "#DC2626", marginVertical: 12, textAlign: "center" },
    retryButton: { backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
    retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginTop: 12 },
    emptySubtitle: { fontSize: 13, color: "#94A3B8", textAlign: "center", marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
    modalContent: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20, width: "100%", maxWidth: 340, borderWidth: 1, borderColor: "#E2E8F0" },
    modalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A", marginBottom: 12 },
    textInput: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, padding: 12, fontSize: 14, color: "#0F172A", minHeight: 90, textAlignVertical: "top", marginBottom: 16 },
    modalButtonsRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
    modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, minWidth: 90, alignItems: "center" },
    cancelBtn: { backgroundColor: "#F1F5F9" },
    cancelBtnText: { color: "#475569", fontWeight: "700", fontSize: 13 },
    saveBtn: { backgroundColor: "#2563EB" },
    saveBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 }
});
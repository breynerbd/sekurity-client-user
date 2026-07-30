import React, { useState } from "react";
import { Text, View, StyleSheet, ScrollView, StatusBar, Pressable, KeyboardAvoidingView, Platform, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/Common";
import { useComments } from "../../comments/hooks/useComments";
import { useReportDetail } from "../hooks/useReports";
import { commentClient } from "../../../shared/api/commentClient";
import ZoneMap from "../../zones/components/ZoneMap";

const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const commentDate = new Date(dateString);
  const seconds = Math.floor((now - commentDate) / 1000);

  if (seconds < 60) return `hace ${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min${minutes > 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hr${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} día${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? "es" : ""}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years > 1 ? "s" : ""}`;
};

const getSeverityConfig = (level) => {
  const normalized = String(level || "").toUpperCase();
  switch (normalized) {
    case "HIGH":
    case "ALTA":
    case "CRITICAL":
      return { label: "Alta", bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5", icon: "alert-circle" };
    case "LOW":
    case "BAJA":
      return { label: "Baja", bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC", icon: "checkmark-circle" };
    case "MEDIUM":
    case "MEDIO":
    case "MODERATE":
    default:
      return { label: "Medio", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", icon: "warning" };
  }
};

const getStatusConfig = (status) => {
  const normalized = String(status || "").toUpperCase();
  switch (normalized) {
    case "PENDING":
    case "PENDIENTE":
      return { label: "Pendiente", bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", icon: "time-outline" };
    case "IN_PROGRESS":
    case "EN_PROCESO":
    case "PROCESANDO":
      return { label: "En Proceso", bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", icon: "sync-outline" };
    case "RESOLVED":
    case "RESUELTO":
    case "COMPLETED":
    case "COMPLETADO":
      return { label: "Resuelto", bg: "#F0FDF4", text: "#16A34A", border: "#86EFAC", icon: "checkmark-done-circle-outline" };
    case "REJECTED":
    case "RECHAZADO":
      return { label: "Rechazado", bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5", icon: "close-circle-outline" };
    default:
      return { label: status || "Desconocido", bg: "#F1F5F9", text: "#64748B", border: "#CBD5E1", icon: "help-circle-outline" };
  }
};

// Componente para manejar el texto colapsable de comentarios
function CollapsibleCommentText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const [numberOfLines, setNumberOfLines] = useState(undefined);

  return (
    <View>
      <Text
        style={styles.commentText}
        numberOfLines={expanded ? undefined : 2}
        onTextLayout={(e) => {
          if (!expanded && e.nativeEvent.lines.length > 2) {
            setNumberOfLines(e.nativeEvent.lines.length);
          }
        }}
      >
        {text}
      </Text>
      {numberOfLines > 2 && (
        <Pressable onPress={() => setExpanded(!expanded)} style={{ alignSelf: "flex-start", marginTop: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#2563EB" }}>
            {expanded ? "Ver menos" : "Ver más"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export default function ReportDetailScreen({ route, navigation }) {
  const { reportId } = route.params;
  const insets = useSafeAreaInsets();
  const { report, loading, error } = useReportDetail(reportId);
  const { comments, addComment, posting, setComments } = useComments(reportId);
  const [text, setText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  if (loading) return <LoadingState label="Cargando reporte..." />;
  if (error) return <ErrorState message={error} />;

  const handleSend = async () => {
    if (!text.trim() || posting) return;

    const result = await addComment(text, replyingTo ? replyingTo.id : null);

    if (result) {
      setText("");
      setReplyingTo(null);
      setIsModalVisible(false);
    }
  };

  const handleOpenCommentModal = (replyData = null) => {
    setReplyingTo(replyData);
    setIsModalVisible(true);
  };

  const handleReaction = async (targetId, type) => {
    if (!targetId) return;
    try {
      const response = await commentClient.react(targetId, type);

      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === targetId) {
            let reactions = comment.comment_reactions ? [...comment.comment_reactions] : [];
            reactions = updateReactionList(reactions, response, type);
            return { ...comment, comment_reactions: reactions };
          }

          if (comment.replies && comment.replies.length > 0) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id !== targetId) return reply;
              let replyReactions = reply.comment_reactions ? [...reply.comment_reactions] : [];
              replyReactions = updateReactionList(replyReactions, response, type);
              return { ...reply, comment_reactions: replyReactions };
            });
            return { ...comment, replies: updatedReplies };
          }

          return comment;
        })
      );
    } catch (err) {
      console.error("Error al reaccionar:", err?.response?.data || err.message);
    }
  };

  const updateReactionList = (reactions, response, type) => {
    if (!response || !response.action) return reactions;

    if (response.action === "removed") {
      return reactions.filter((r) => r.type !== type);
    } else if (response.action === "created") {
      return [...reactions, { id: response.reaction?.id || Date.now(), type, user_id: response.reaction?.user_id }];
    } else if (response.action === "updated") {
      let updated = reactions.map((r) => (r.type !== type ? { ...r, type } : r));
      if (!updated.some((r) => r.type === type)) {
        updated.push({ id: response.reaction?.id || Date.now(), type, user_id: response.reaction?.user_id });
      }
      return updated;
    }
    return reactions;
  };

  const safeComments = comments || [];

  const totalCommentsAndReplies = safeComments.reduce((acc, comment) => {
    const repliesCount = comment.replies ? comment.replies.length : 0;
    return acc + 1 + repliesCount;
  }, 0);

  const displayedComments = showAllComments ? safeComments : safeComments.slice(0, 3);

  const hiddenItemsCount = safeComments.slice(3).reduce((acc, comment) => {
    const repliesCount = comment.replies ? comment.replies.length : 0;
    return acc + 1 + repliesCount;
  }, 0);

  const hasCoordinates =
    report?.zone?.latitude != null &&
    report?.zone?.longitude != null;

  const severityConfig = getSeverityConfig(report?.severity_level);
  const statusConfig = getStatusConfig(report?.status);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={20} color="#0F172A" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.eyebrow}>DETALLE DE INCIDENCIA</Text>
            <Text style={styles.title} numberOfLines={1}>{"Reporte de " + report?.user?.name + " " + report?.user?.surname}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardForm}>
          <View style={styles.reportInfoSection}>
            <View style={styles.badgesRow}>
              <View style={styles.incidentBadge}>
                <Ionicons name="megaphone-outline" size={14} color="#2563EB" />
                <Text style={styles.incidentBadgeText}>{report?.incident_type || "Incidente"}</Text>
              </View>

              <View style={[styles.severityBadge, { backgroundColor: severityConfig.bg, borderColor: severityConfig.border }]}>
                <Ionicons name={severityConfig.icon} size={13} color={severityConfig.text} />
                <Text style={[styles.severityBadgeText, { color: severityConfig.text }]}>
                  {severityConfig.label}
                </Text>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
                <Ionicons name={statusConfig.icon} size={13} color={statusConfig.text} />
                <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <Text style={styles.reportTitle}>{report?.title}</Text>
            <Text style={styles.reportDescription}>{report?.description}</Text>
          </View>

          {hasCoordinates && (
            <View style={styles.mapCardWrapper}>
              <View style={{ flex: 1, width: "100%", height: "100%" }}>
                <ZoneMap
                  latitude={Number(report.zone.latitude)}
                  longitude={Number(report.zone.longitude)}
                  compact={false}
                />
              </View>
            </View>
          )}

          <View style={styles.commentsSection}>
            <View style={styles.commentsHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="chatbubbles-outline" size={16} color="#2563EB" />
                <Text style={styles.commentsSectionLabel}>Comentarios ({totalCommentsAndReplies})</Text>
              </View>
              <Pressable
                style={styles.actionHeaderButton}
                onPress={() => handleOpenCommentModal(null)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.actionHeaderText}>Comentar</Text>
              </Pressable>
            </View>

            {safeComments.length > 0 ? (
              <View style={styles.commentsListContainer}>
                {displayedComments.map((item) => {
                  const heartsCount = item.comment_reactions?.filter((r) => r.type === "HEART" || r.type === "LIKE").length || 0;
                  const brokenCount = item.comment_reactions?.filter((r) => r.type === "BROKEN" || r.type === "DISLIKE").length || 0;
                  const replies = item.replies || [];

                  const userData = item.user || item.usuario || item.author || item.account || {};
                  const rawFullName = `${userData.name || userData.nombre || userData.username || ""} ${userData.surname || userData.apellido || ""}`.trim();

                  const isCurrentAuthorMe =
                    item.isMe === true ||
                    rawFullName.toLowerCase().includes("ari diaz") ||
                    userData.name === "Tú" ||
                    userData.nombre === "Tú" ||
                    String(userData.id || userData.user_id || item.user_id) === String(global.currentUserId || report?.user_id);

                  const authorName = isCurrentAuthorMe ? "Ari Diaz" : (rawFullName || item.userName || item.authorName || "Usuario");

                  const isExpanded = !!expandedReplies[item.id];
                  const visibleReplies = isExpanded ? replies : replies.slice(0, 1);
                  const hiddenRepliesCount = replies.length - 1;

                  return (
                    <View key={String(item.id)} style={styles.commentCard}>
                      <View style={styles.commentTopRow}>
                        <View style={styles.commentUserContainer}>
                          <View style={styles.commentAvatar}>
                            <Ionicons name="person" size={12} color="#2563EB" />
                          </View>
                          <Text style={styles.commentUser}>{authorName}</Text>
                        </View>
                        <Text style={styles.commentTime}>{getTimeAgo(item.createdAt)}</Text>
                      </View>

                      <CollapsibleCommentText text={item.content} />

                      <View style={styles.commentActionsRow}>
                        <View style={styles.reactionsRow}>
                          <Pressable
                            style={styles.reactionButton}
                            onPress={() => handleReaction(item.id, "LIKE")}
                          >
                            <Ionicons name="heart" size={13} color="#E11D48" />
                            <Text style={styles.reactionText}>{heartsCount}</Text>
                          </Pressable>

                          <Pressable
                            style={styles.reactionButton}
                            onPress={() => handleReaction(item.id, "DISLIKE")}
                          >
                            <Ionicons name="heart-dislike" size={13} color="#64748B" />
                            <Text style={styles.reactionText}>{brokenCount}</Text>
                          </Pressable>
                        </View>

                        <Pressable
                          style={styles.replyTriggerButton}
                          onPress={() => handleOpenCommentModal({ id: item.id, author: authorName })}
                        >
                          <Ionicons name="arrow-undo" size={12} color="#2563EB" />
                          <Text style={styles.replyTriggerText}>Responder</Text>
                        </Pressable>
                      </View>

                      {replies.length > 0 && (
                        <View style={styles.repliesContainer}>
                          {visibleReplies.map((reply) => {
                            const replyHearts = reply.comment_reactions?.filter((r) => r.type === "HEART" || r.type === "LIKE").length || 0;
                            const replyBroken = reply.comment_reactions?.filter((r) => r.type === "BROKEN" || r.type === "DISLIKE").length || 0;

                            const replyUserData = reply.user || reply.usuario || reply.author || reply.account || {};
                            const replyRawFullName = `${replyUserData.name || replyUserData.nombre || replyUserData.username || ""} ${replyUserData.surname || replyUserData.apellido || ""}`.trim();

                            const isReplyAuthorMe =
                              reply.isMe === true ||
                              replyRawFullName.toLowerCase().includes("ari diaz") ||
                              replyUserData.name === "Tú" ||
                              replyUserData.nombre === "Tú" ||
                              String(replyUserData.id || replyUserData.user_id || reply.user_id) === String(global.currentUserId || report?.user_id);

                            const replyAuthorName = isReplyAuthorMe ? "Ari Diaz (Tú)" : (replyRawFullName || reply.userName || reply.authorName || "Usuario");

                            return (
                              <View key={String(reply.id)} style={styles.replyCard}>
                                <View style={styles.commentTopRow}>
                                  <View style={styles.commentUserContainer}>
                                    <View style={[styles.commentAvatar, styles.replyAvatar]}>
                                      <Ionicons name="person" size={10} color="#64748B" />
                                    </View>
                                    <Text style={styles.commentUser}>{replyAuthorName}</Text>
                                  </View>
                                  <Text style={styles.commentTime}>{getTimeAgo(reply.createdAt)}</Text>
                                </View>
                                <CollapsibleCommentText text={reply.content} />

                                <View style={styles.commentActionsRow}>
                                  <View style={styles.reactionsRow}>
                                    <Pressable
                                      style={styles.reactionButton}
                                      onPress={() => handleReaction(reply.id, "LIKE")}
                                    >
                                      <Ionicons name="heart" size={12} color="#E11D48" />
                                      <Text style={styles.reactionText}>{replyHearts}</Text>
                                    </Pressable>

                                    <Pressable
                                      style={styles.reactionButton}
                                      onPress={() => handleReaction(reply.id, "DISLIKE")}
                                    >
                                      <Ionicons name="heart-dislike" size={12} color="#64748B" />
                                      <Text style={styles.reactionText}>{replyBroken}</Text>
                                    </Pressable>
                                  </View>
                                </View>
                              </View>
                            );
                          })}

                          {replies.length > 1 && (
                            <Pressable
                              style={styles.showMoreRepliesButton}
                              onPress={() => {
                                setExpandedReplies((prev) => ({
                                  ...prev,
                                  [item.id]: !isExpanded,
                                }));
                              }}
                            >
                              <Ionicons
                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                size={12}
                                color="#2563EB"
                              />
                              <Text style={styles.showMoreRepliesText}>
                                {isExpanded
                                  ? "Ocultar respuestas"
                                  : `Ver ${hiddenRepliesCount} respuesta${hiddenRepliesCount > 1 ? "s" : ""} más...`}
                              </Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}

                {safeComments.length > 3 && (
                  <Pressable
                    style={styles.showMoreButton}
                    onPress={() => setShowAllComments(!showAllComments)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllComments ? "Ver menos" : `Ver más (${hiddenItemsCount} más)`}
                    </Text>
                    <Ionicons
                      name={showAllComments ? "chevron-up" : "chevron-down"}
                      size={14}
                      color="#2563EB"
                    />
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <EmptyState title="Sin comentarios" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdropPress}
            onPress={() => {
              setIsModalVisible(false);
              setReplyingTo(null);
            }}
          />
          <View style={[styles.mInputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.mModalHeader}>
              <Text style={styles.mModalTitle}>
                {replyingTo ? "Responder comentario" : "Añadir comentario"}
              </Text>
              <Pressable
                onPress={() => {
                  setIsModalVisible(false);
                  setReplyingTo(null);
                }}
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color="#64748B" />
              </Pressable>
            </View>

            {replyingTo && (
              <View style={styles.mReplyingBanner}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                  <Ionicons name="arrow-undo" size={12} color="#2563EB" />
                  <Text style={styles.mReplyingText} numberOfLines={1}>
                    Respondiendo a <Text style={{ fontWeight: "700" }}>{replyingTo.author}</Text>
                  </Text>
                </View>
                <Pressable
                  onPress={() => setReplyingTo(null)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={14} color="#64748B" />
                </Pressable>
              </View>
            )}

            <View style={styles.mInputRow}>
              <TextInput
                style={styles.mTextInput}
                value={text}
                onChangeText={setText}
                placeholder={replyingTo ? "Escribe una respuesta..." : "Escribe un comentario..."}
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.mSendButton, (!text.trim() || posting) && styles.mSendButtonDisabled]}
                onPress={handleSend}
                disabled={!text.trim() || posting}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  eyebrow: { fontSize: 11, fontWeight: "700", color: "#2563EB", letterSpacing: 1.2, marginBottom: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: 20, paddingTop: 16 },
  cardForm: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, gap: 20, borderWidth: 1, borderColor: "#F1F5F9" },
  reportInfoSection: { gap: 8 },
  badgesRow: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },
  incidentBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#EFF6FF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  incidentBadgeText: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  severityBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, borderWidth: 1 },
  severityBadgeText: { fontSize: 12, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, borderWidth: 1 },
  statusBadgeText: { fontSize: 12, fontWeight: "700" },
  reportTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  reportDescription: { fontSize: 14, color: "#475569", lineHeight: 20 },
  mapCardWrapper: { flex: 1, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
  commentsSection: { gap: 14 },
  commentsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentsSectionLabel: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  actionHeaderButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#2563EB", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, gap: 6, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  actionHeaderText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  commentsListContainer: { gap: 12 },
  commentCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#E2E8F0", gap: 10, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  commentTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentUserContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  replyAvatar: { backgroundColor: "#F1F5F9" },
  commentUser: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  commentTime: { fontSize: 11, fontWeight: "500", color: "#94A3B8" },
  commentText: { fontSize: 13, color: "#334155", lineHeight: 19 },
  commentActionsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: "#F8FAFC" },
  reactionsRow: { flexDirection: "row", gap: 14 },
  reactionButton: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#F8FAFC", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#F1F5F9" },
  reactionText: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  replyTriggerButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4 },
  replyTriggerText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  repliesContainer: { marginTop: 8, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: "#E2E8F0", gap: 8 },
  replyCard: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#E2E8F0", gap: 6 },
  showMoreRepliesButton: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6, paddingHorizontal: 4 },
  showMoreRepliesText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  showMoreButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 10, backgroundColor: "#F1F5F9", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  showMoreText: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  emptyContainer: { paddingVertical: 16, alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.5)" },
  modalBackdropPress: { flex: 1 },
  mInputContainer: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#E2E8F0", gap: 10, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#0F172A", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10 },
  mModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  mModalTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  mReplyingBanner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#BFDBFE" },
  mReplyingText: { fontSize: 12, color: "#1E40AF" },
  mInputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingVertical: 4 },
  mTextInput: { flex: 1, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#0F172A", maxHeight: 100, minHeight: 42, textAlignVertical: "center" },
  mSendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 1, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  mSendButtonDisabled: { backgroundColor: "#94A3B8", opacity: 0.7, shadowOpacity: 0 }
});
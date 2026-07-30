import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, StatusBar, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/Common";
import { useReports } from "../hooks/useReports";
import ZoneMap from "../../zones/components/ZoneMap";

const INCIDENT_TYPES = [
  { label: "Accidente vial", value: "Accidente vial" },
  { label: "Asalto", value: "Asalto" },
  { label: "Robo", value: "Robo" },
  { label: "Tiroteo", value: "Tiroteo" },
  { label: "Vandalismo", value: "Vandalismo" },
  { label: "Asistencia Médica", value: "Asistencia Médica" },
  { label: "Otro", value: "Otro" },
];

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

export default function ReportsScreen({ navigation }) {
  const { reports, loading, error, refetch, rateReport } = useReports();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState("");
  const [localRatings, setLocalRatings] = useState({});
  const [selectedIncidentType, setSelectedIncidentType] = useState(null);

  const filteredReports = useMemo(() => {
    const safeReports = reports || [];
    const term = searchTerm.toLowerCase().trim();

    const sorted = [...safeReports].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (dateA !== dateB) {
        return dateB - dateA;
      }
      return Number(b.id || 0) - Number(a.id || 0);
    });

    return sorted.filter((r) => {
      const matchesSearch =
        !term ||
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.incident_type?.toLowerCase().includes(term);

      const matchesType =
        !selectedIncidentType ||
        r.incident_type?.toLowerCase() === selectedIncidentType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [reports, searchTerm, selectedIncidentType]);

  if (loading && (!reports || reports.length === 0)) return <LoadingState label="Cargando reportes..." />;
  if (error && (!reports || reports.length === 0)) return <ErrorState message={error} />;

  const getReportCurrentRating = (item) => {
    if (localRatings[item.id] !== undefined) {
      return localRatings[item.id];
    }
    const reactions = item.report_reactions || item.ReportReactions || [];
    const userReaction = reactions.find(
      (r) => r.user_id === item.currentUserId || r.userId === item.currentUserId || r.is_mine === true
    ) || reactions[0];

    const rawRating = userReaction?.type || userReaction?.severity_level;
    if (rawRating === 1 || rawRating === "1" || rawRating === "LOW") return 1;
    if (rawRating === 2 || rawRating === "2" || rawRating === "MEDIUM") return 2;
    if (rawRating === 3 || rawRating === "3" || rawRating === "HIGH") return 3;
    return null;
  };

  const renderDangerRatingPicker = (item) => {
    const currentRating = getReportCurrentRating(item);

    const levels = [
      { id: 1, label: "Leve", color: "#EAB308", icon: "alert-circle-outline", activeIcon: "alert-circle", bg: "#FEFCE8" },
      { id: 2, label: "Modio", color: "#F97316", icon: "warning-outline", activeIcon: "warning", bg: "#FFF7ED" },
      { id: 3, label: "Grave", color: "#DC2626", icon: "flame-outline", activeIcon: "flame", bg: "#FEF2F2" },
    ];

    return (
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarTitle}>Opina:</Text>
        <View style={styles.ratingButtonsRow}>
          {levels.map((lvl) => {
            const isActive = currentRating === lvl.id;
            return (
              <Pressable
                key={lvl.id}
                style={[
                  styles.ratingOptionBtn,
                  { borderColor: isActive ? lvl.color : "#E2E8F0", backgroundColor: isActive ? lvl.bg : "#FFFFFF" },
                ]}
                onPress={async () => {
                  try {
                    const newValue = isActive ? null : lvl.id;
                    setLocalRatings(prev => ({ ...prev, [item.id]: newValue }));
                    await rateReport(item.id, newValue);
                  } catch (err) {
                    console.error("Error al actualizar la calificación:", err);
                    const reactions = item.report_reactions || item.ReportReactions || [];
                    const userReaction = reactions.find(
                      (r) => r.user_id === item.currentUserId || r.userId === item.currentUserId || r.is_mine === true
                    ) || reactions[0];
                    const rawRating = userReaction?.type || userReaction?.severity_level;
                    let fallback = null;
                    if (rawRating === 1 || rawRating === "1" || rawRating === "LOW") fallback = 1;
                    if (rawRating === 2 || rawRating === "2" || rawRating === "MEDIUM") fallback = 2;
                    if (rawRating === 3 || rawRating === "3" || rawRating === "HIGH") fallback = 3;

                    setLocalRatings(prev => ({ ...prev, [item.id]: fallback }));
                  }
                }}
              >
                <Ionicons
                  name={isActive ? lvl.activeIcon : lvl.icon}
                  size={14}
                  color={isActive ? lvl.color : "#64748B"}
                />
                <Text
                  style={[
                    styles.ratingOptionText,
                    { color: isActive ? lvl.color : "#64748B", fontWeight: isActive ? "800" : "600" },
                  ]}
                >
                  {lvl.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const comments = item.comments || item.Comments || [];
    const latestComment = comments.length > 0 ? comments[comments.length - 1] : null;

    const reportAuthorName = item.user
      ? `${item.user.name || ""} ${item.user.surname || ""}`.trim()
      : "Ciudadano";

    const hasCoordinates =
      item.zone?.latitude != null &&
      item.zone?.longitude != null;

    const formattedDateTime = item.createdAt
      ? `${new Date(item.createdAt).toLocaleDateString()} | ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : "Reciente";

    const commentAuthorName = latestComment?.user
      ? `${latestComment.user.name || ""} ${latestComment.user.surname || ""}`.trim()
      : "Usuario";

    const severityConfig = getSeverityConfig(item.severity_level);
    const commentCountText = comments.length === 1
      ? "1 comentario"
      : `${comments.length} comentarios`;

    return (
      <View style={styles.fbCard}>
        <View style={styles.fbCardHeader}>
          <View style={styles.fbCardUserRow}>
            <View style={styles.fbAvatarSmall}>
              <Ionicons name="person" size={14} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.fbCardAuthor}>{reportAuthorName || "Ciudadano"}</Text>
              <Text style={styles.fbCardTime}>{formattedDateTime}</Text>
            </View>
          </View>

          <View style={styles.badgesRow}>
            <View style={styles.incidentBadge}>
              <Ionicons name="megaphone-outline" size={12} color="#2563EB" />
              <Text style={styles.incidentBadgeText}>{item.incident_type || "Incidencia"}</Text>
            </View>

            <View style={[styles.severityBadge, { backgroundColor: severityConfig.bg, borderColor: severityConfig.border }]}>
              <Ionicons name={severityConfig.icon} size={11} color={severityConfig.text} />
              <Text style={[styles.severityBadgeText, { color: severityConfig.text }]}>
                {severityConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <Pressable onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}>
          <Text style={styles.fbCardTitle}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.fbCardDescription} numberOfLines={3}>{item.description}</Text>
          ) : null}
        </Pressable>

        <View style={styles.dangerBadgeContainer}>
          {renderDangerRatingPicker(item)}
        </View>

        {hasCoordinates && (
          <Pressable
            style={styles.mapCardWrapper}
            onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
          >
            <View style={{ flex: 1, width: "100%", height: "100%" }} pointerEvents="none">
              <ZoneMap
                latitude={Number(item.zone?.latitude)}
                longitude={Number(item.zone?.longitude)}
                compact
              />
            </View>
          </Pressable>
        )}

        {/* Sección del Comentario Destacado */}
        {latestComment && (
          <View style={styles.fbCommentsSection}>
            <View style={styles.fbCommentItem}>
              <View style={styles.fbCommentAvatar}>
                <Ionicons name="person-outline" size={10} color="#64748B" />
              </View>
              <View style={styles.fbCommentBubble}>
                <Text style={styles.fbCommentUser}>{commentAuthorName}</Text>
                <Text style={styles.fbCommentText}>{latestComment.content}</Text>
              </View>
            </View>

            {comments.length > 1 && (
              <Pressable
                onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
                style={styles.fbMoreCommentsButton}
              >
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.userContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={15} color="#64748B" />
            <Text style={styles.userText} numberOfLines={1}>
              {commentCountText}
            </Text>
          </View>
          <Pressable
            style={styles.fbActionButtonInline}
            onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
          >
            <Ionicons name="chatbubble-outline" size={15} color="#2563EB" />
            <Text style={styles.fbActionBtnTextActive}>Comentar</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderFixedHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>REGISTRO DE INCIDENCIAS</Text>
          <Text style={styles.title}>Reportes</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.searchIconButton, pressed && styles.searchIconPressed]}
          onPress={() => {
            setIsSearching(!isSearching);
            if (isSearching) setSearchTerm("");
          }}
        >
          <Ionicons name={isSearching ? "close" : "search"} size={20} color="#0F172A" />
        </Pressable>
      </View>

      {isSearching && (
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput
            autoFocus
            placeholder="Buscar reporte por título o descripción..."
            placeholderTextColor="#94A3B8"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContainer}
        style={styles.filterScroll}
      >
        <Pressable
          style={[styles.filterChip, !selectedIncidentType && styles.filterChipActive]}
          onPress={() => setSelectedIncidentType(null)}
        >
          <Text style={[styles.filterChipText, !selectedIncidentType && styles.filterChipTextActive]}>
            Todos
          </Text>
        </Pressable>
        {INCIDENT_TYPES.map((type) => {
          const isSelected = selectedIncidentType === type.value;
          return (
            <Pressable
              key={type.value}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setSelectedIncidentType(isSelected ? null : type.value)}
            >
              <Ionicons
                name={type.icon}
                size={13}
                color={isSelected ? "#FFFFFF" : "#64748B"}
              />
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderListHeader = () => (
    <View style={styles.fbPostBoxContainer}>
      <Pressable
        style={({ pressed }) => [styles.fbPostBox, pressed && styles.fbPostBoxPressed]}
        onPress={() => navigation.navigate("CreateReport")}
      >
        <View style={styles.fbAvatar}>
          <Ionicons name="person" size={16} color="#2563EB" />
        </View>
        <View style={styles.fbInputPlaceholder}>
          <Text style={styles.fbPlaceholderText}>¿Te ha pasado algo? Reportarlo...</Text>
        </View>
      </Pressable>
      <View style={styles.fbActionsRow}>
        <Pressable
          style={styles.fbActionItem}
          onPress={() => navigation.navigate("CreateReport")}
        >
          <Ionicons name="camera" size={18} color="#10B981" />
          <Text style={styles.fbActionText}>Foto / Evidencia</Text>
        </Pressable>
        <View style={styles.fbDividerVertical} />
        <Pressable
          style={styles.fbActionItem}
          onPress={() => navigation.navigate("CreateReport")}
        >
          <Ionicons name="location" size={18} color="#EF4444" />
          <Text style={styles.fbActionText}>Ubicación</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {renderFixedHeader()}

      <FlatList
        data={filteredReports}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} colors={["#2563EB"]} />}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
          filteredReports.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            description={
              searchTerm || selectedIncidentType
                ? `¡Oops! No encontramos nada.`
                : "¡Oops! Aquí no hay nada."
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  searchIconButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  searchIconPressed: { opacity: 0.8 },
  eyebrow: { fontSize: 11, fontWeight: "700", color: "#2563EB", letterSpacing: 1.2, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  filterScroll: { marginTop: 12 },
  filterScrollContainer: { gap: 8, paddingRight: 20 },
  filterChip: { flexDirection: "row", alignItems: "center", gap: 0, backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  filterChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  filterChipText: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  filterChipTextActive: { color: "#FFFFFF", fontWeight: "700" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F1F5F9", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A", padding: 0 },
  fbPostBoxContainer: { backgroundColor: "#FFFFFF", marginHorizontal: 20, marginTop: 16, borderRadius: 22, padding: 12, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#F1F5F9", marginBottom: 15 },
  fbPostBox: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  fbPostBoxPressed: { opacity: 0.85 },
  fbAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  fbInputPlaceholder: { flex: 1, backgroundColor: "#F1F5F9", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 },
  fbPlaceholderText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  fbActionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", paddingTop: 10 },
  fbActionItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  fbActionText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  fbDividerVertical: { width: 1, height: 16, backgroundColor: "#E2E8F0" },
  list: { flex: 1 },
  listContent: { paddingTop: 0 },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  fbCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, marginHorizontal: 20, marginBottom: 12, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#F1F5F9", gap: 12 },
  fbCardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  fbCardUserRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  fbAvatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#EFF6FF", justifyContent: "center", alignItems: "center" },
  fbCardAuthor: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  fbCardTime: { fontSize: 11, color: "#94A3B8" },
  fbCardTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  fbCardDescription: { fontSize: 14, color: "#475569", lineHeight: 20 },
  dangerBadgeContainer: { width: "100%" },
  ratingBarContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 8, borderWidth: 1, borderColor: "#F1F5F9" },
  ratingBarTitle: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  ratingButtonsRow: { flexDirection: "row", gap: 6 },
  ratingOptionBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  ratingOptionText: { fontSize: 11 },
  mapCardWrapper: { height: 140, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
  fbCommentsSection: { backgroundColor: "#F8FAFC", borderRadius: 14, padding: 10, gap: 8, borderWidth: 1, borderColor: "#F1F5F9" },
  fbCommentItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  fbCommentAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E2E8F0", justifyContent: "center", alignItems: "center", marginTop: 2 },
  fbCommentBubble: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 10, padding: 8, borderWidth: 1, borderColor: "#E2E8F0", gap: 2 },
  fbCommentUser: { fontSize: 11, fontWeight: "700", color: "#1E293B" },
  fbCommentText: { fontSize: 12, color: "#475569" },
  fbMoreCommentsButton: { paddingVertical: -2, paddingLeft: 4 },
  fbMoreCommentsText: { fontSize: 11, fontWeight: "700", color: "#2563EB" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12 },
  userContainer: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginRight: 8 },
  userText: { fontSize: 12, fontWeight: "600", color: "#64748B", flex: 1 },
  fbActionButtonInline: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  fbActionBtnTextActive: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  badgesRow: { flexDirection: "row", gap: 4, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "55%" },
  incidentBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#EFF6FF", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, gap: 3 },
  incidentBadgeText: { fontSize: 10, fontWeight: "700", color: "#2563EB" },
  severityBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, gap: 3, borderWidth: 1 },
  severityBadgeText: { fontSize: 10, fontWeight: "700" }
});
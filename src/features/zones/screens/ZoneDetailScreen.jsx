import React, { useState, useLayoutEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../shared/components/Button";
import { ErrorState, LoadingState } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { useRatings } from "../../ratings/hooks/useRatings";
import { useZoneDetail } from "../hooks/useZones";
import ZoneMap from "../components/ZoneMap";
import ZoneReviewsModal from "../components/ZoneReviewsModal";
import { openMaps } from "../../../shared/constants/openMaps";

export default function ZoneDetailScreen({ route, navigation }) {
  const { zoneId, groupedZones } = route.params || {};
  const { zone, loading, error } = useZoneDetail(zoneId);
  const { ratings, submitRating, submitting } = useRatings(zoneId);

  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewsVisible, setReviewsVisible] = useState(false);
  const [showAllPoints, setShowAllPoints] = useState(false);

  useLayoutEffect(() => {
    if (!navigation) return;
    navigation.setOptions({ headerShown: true, title: "", headerStyle: { backgroundColor: "#F8FAFC", elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTintColor: "#0F172A", headerShadowVisible: false });
  }, [navigation]);

  const getSecurityLabel = (currentScore) => {
    switch (currentScore) {
      case 1: return "Lugar peligroso, evitar el área";
      case 2: return "Inseguro, reportes frecuentes";
      case 3: return "Regular, transitar con precaución";
      case 4: return "Zona segura y estable";
      case 5: return "Excelente seguridad";
      default: return "";
    }
  };

  const getSecurityIcon = (currentScore) => {
    if (currentScore <= 2) return "warning";
    if (currentScore === 3) return "alert-circle";
    return "shield-checkmark";
  };

  if (loading) return <LoadingState label="Cargando zona..." />;
  if (error) return <ErrorState message={error} />;

  const handleRatingSubmit = async () => {
    if (!comment.trim()) return;
    await submitRating(score, comment);
    setComment("");
  };

  const latitude = zone?.latitude != null ? Number(zone.latitude) : undefined;
  const longitude = zone?.longitude != null ? Number(zone.longitude) : undefined;
  const hasValidCoords = typeof latitude === "number" && !isNaN(latitude) && typeof longitude === "number" && !isNaN(longitude);

  const avgRating = ratings && ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1) : null;

  const coveredPoints = groupedZones && groupedZones.length > 0 ? groupedZones : (zone ? [zone] : []);

  const sortedCoveredPoints = [...coveredPoints].sort((a, b) => {
    const reportsA = Number(a.reportsCount ?? a.reports_count ?? a.totalReports ?? a.reports?.length ?? 0);
    const reportsB = Number(b.reportsCount ?? b.reports_count ?? b.totalReports ?? b.reports?.length ?? 0);
    return reportsB - reportsA;
  });

  const visiblePoints = showAllPoints ? sortedCoveredPoints : sortedCoveredPoints.slice(0, 3);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>{zone?.name}</Text>
          {zone?.description ? <Text style={styles.subTitle}>{zone.description}</Text> : null}

          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.summaryChipText}>{avgRating ? `${avgRating}` : "Sin calificaciones"}</Text>
            </View>
            <View style={[styles.summaryChip, styles.radiusChip]}>
              <Ionicons name="radio" size={13} color="#2563EB" />
              <Text style={styles.radiusChipText}>Radio de cobertura: 2 km</Text>
            </View>
          </View>
        </View>

        {hasValidCoords ? (
          <View style={styles.mapCard}>
            <ZoneMap latitude={latitude} longitude={longitude} />
            <Pressable style={styles.mapButton} onPress={() => openMaps(latitude, longitude)}>
              <Ionicons name="navigate" size={17} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>Ubicación</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.noLocationCard}>
            <Ionicons name="location-outline" size={22} color="#94A3B8" />
            <Text style={styles.noLocationText}>Ubicación no disponible</Text>
          </View>
        )}

        <View style={styles.clusteredPointsContainer}>
          <View style={styles.clusteredHeaderRow}>
            <Ionicons name="layers-outline" size={16} color="#2563EB" />
            <Text style={styles.clusteredTitle}>Puntos incluidos</Text>
          </View>
          <Text style={styles.clusteredSubtitle}>Esta zona unificada agrupa las siguientes incidencias y ubicaciones cercanas:</Text>

          {visiblePoints.map((item, index) => {
            const itemReportsCount = Number(item.reportsCount ?? item.reports_count ?? item.totalReports ?? item.reports?.length ?? 0);
            return (
              <Pressable key={item.id || index} style={styles.pointSubCard} onPress={() => navigation.push("ZoneDetail", { zoneId: item.id, groupedZones: item.groupedZones })}>
                <View style={styles.pointSubCardTop}>
                  <Ionicons name="location" size={14} color="#2563EB" />
                  <Text style={styles.pointSubCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.pointSubCardReports}>{itemReportsCount} reportes</Text>
                  <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
                </View>
                {item.description ? <Text style={styles.pointSubCardDesc} numberOfLines={2}>{item.description}</Text> : null}
              </Pressable>
            );
          })}

          {sortedCoveredPoints.length > 3 && (
            <Pressable style={styles.seeMoreButton} onPress={() => setShowAllPoints(!showAllPoints)}>
              <Text style={styles.seeMoreButtonText}>
                {showAllPoints ? "Ver menos" : `Ver más (${sortedCoveredPoints.length - 3} más)`}
              </Text>
              <Ionicons name={showAllPoints ? "chevron-up" : "chevron-down"} size={14} color="#2563EB" />
            </Pressable>
          )}
        </View>

        <Pressable style={styles.reviewsButton} onPress={() => setReviewsVisible(true)}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#2563EB" />
          <Text style={styles.reviewsButtonText}>Ver reseñas {ratings?.length ? `(${ratings.length})` : ""}</Text>
          <Ionicons name="chevron-forward" size={16} color="#2563EB" />
        </Pressable>

        <ZoneReviewsModal visible={reviewsVisible} onClose={() => setReviewsVisible(false)} ratings={ratings} zoneName={zone?.name} />

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Calificar esta zona</Text>

          <View style={styles.starsSelector}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setScore(star)} activeOpacity={0.7} style={styles.starTouch}>
                <Ionicons name={score >= star ? "star" : "star-outline"} size={34} color={score >= star ? "#F59E0B" : "#CBD5E1"} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.dynamicBox, score <= 2 ? styles.boxDanger : score === 3 ? styles.boxWarning : styles.boxSafe]}>
            <Ionicons name={getSecurityIcon(score)} size={16} color={score <= 2 ? "#DC2626" : score === 3 ? "#D97706" : "#16A34A"} />
            <Text style={[styles.dynamicText, score <= 2 ? styles.textDanger : score === 3 ? styles.textWarning : styles.textSafe]}>{getSecurityLabel(score)}</Text>
          </View>

          <Input label="Comentario u observación" value={comment} onChangeText={setComment} placeholder="Escribe detalles sobre la seguridad de esta zona..." multiline={true} numberOfLines={4} style={styles.customInputOverride} />

          <Button title="Guardar calificación" loading={submitting} onPress={handleRatingSubmit} disabled={!comment.trim() || submitting} />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, backgroundColor: "#F8FAFC" },
  titleBlock: { marginBottom: 20 },
  mainTitle: { fontSize: 26, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  subTitle: { fontSize: 14, color: "#64748B", marginTop: 4 },
  summaryRow: { flexDirection: "row", gap: 8, marginTop: 12, flexWrap: "wrap" },
  summaryChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFFBEB", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  summaryChipText: { fontSize: 12, fontWeight: "700", color: "#92400E" },
  radiusChip: { backgroundColor: "#EFF6FF" },
  radiusChipText: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  mapCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 12, marginBottom: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  mapButton: { marginTop: 12, backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 13, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  mapButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  noLocationCard: { backgroundColor: "#FFFFFF", borderRadius: 20, paddingVertical: 28, alignItems: "center", gap: 8, marginBottom: 16 },
  noLocationText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  clusteredPointsContainer: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1, gap: 10 },
  clusteredHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  clusteredTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  clusteredSubtitle: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  pointSubCard: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#F1F5F9", gap: 4 },
  pointSubCardTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  pointSubCardName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#0F172A" },
  pointSubCardReports: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  pointSubCardDesc: { fontSize: 11, color: "#64748B", marginLeft: 20 },
  seeMoreButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, marginTop: 4 },
  seeMoreButtonText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },
  reviewsButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 24, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  reviewsButtonText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#2563EB" },
  formContainer: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  formTitle: { fontSize: 13, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6, textAlign: "center", marginBottom: 14 },
  starsSelector: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4, marginBottom: 14 },
  starTouch: { padding: 4 },
  dynamicBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginBottom: 18 },
  boxDanger: { backgroundColor: "#FEF2F2" },
  boxWarning: { backgroundColor: "#FFFBEB" },
  boxSafe: { backgroundColor: "#F0FDF4" },
  dynamicText: { fontSize: 13, fontWeight: "700", flexShrink: 1 },
  textDanger: { color: "#DC2626" },
  textWarning: { color: "#D97706" },
  textSafe: { color: "#16A34A" },
  customInputOverride: { minHeight: 80, textAlignVertical: "top" }
});
import React, { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, StatusBar, TextInput, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/components/Common";
import { useZones } from "../hooks/useZones";
import { openMaps } from "../../../shared/constants/openMaps";
import ZoneMap from "../components/ZoneMap";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ZonesScreen({ navigation }) {
  const { zones, loading, error, refetch } = useZones();
  const insets = useSafeAreaInsets();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDynamicClusterName = (group) => {
    if (!group || group.length === 0) return "Zona General";
    if (group.length === 1) return group[0].name;

    const names = group.map((z) => z.name || "").join(" ");
    if (names.toLowerCase().includes("guatemala")) return "Ciudad de Guatemala";
    if (names.toLowerCase().includes("zona")) {
      const match = names.match(/zona\s*\d+/i);
      if (match) return `Área Metropolitana (${match[0]})`;
    }

    return `Zona Agrupada: ${group[0].name} (+${group.length - 1})`;
  };

  const getRiskDetails = (reportsCount) => {
    if (reportsCount < 2) {
      return { level: "Tranquilo", color: "#16A34A", bg: "#F0FDF4", isDangerous: false };
    } else if (reportsCount < 5) {
      return { level: "Sospechoso", color: "#CA8A04", bg: "#FEFCE8", isDangerous: false };
    } else if (reportsCount < 15) {
      return { level: "Cuidado", color: "#EA580C", bg: "#FFF7ED", isDangerous: true };
    } else {
      return { level: "Peligroso", color: "#DC2626", bg: "#FEF2F2", isDangerous: true };
    }
  };

  const clusteredZones = useMemo(() => {
    const safeZones = zones || [];
    const clusters = [];
    const visited = new Set();

    safeZones.forEach((zone, index) => {
      if (visited.has(index)) return;

      const hasCoords = zone.latitude != null && zone.longitude != null;

      const zoneReportsCount = Number(
        zone.reportsCount ?? zone.reports_count ?? zone.totalReports ?? zone.reports?.length ?? 0
      );
      const zoneAvgRating = Number(zone.averageRating ?? zone.average_rating ?? zone.rating ?? 0);

      if (!hasCoords) {
        const risk = getRiskDetails(zoneReportsCount);

        clusters.push({
          id: `cluster-${zone.id}`,
          name: zone.name,
          description: zone.description,
          latitude: null,
          longitude: null,
          reportsCount: zoneReportsCount,
          averageRating: zoneAvgRating,
          priority: zone.priority || "NORMAL",
          isDangerous: risk.isDangerous,
          riskLevel: risk.level,
          riskColor: risk.color,
          riskBg: risk.bg,
          groupedZones: [zone],
          radiusKm: 2.0
        });
        visited.add(index);
        return;
      }

      const group = [zone];
      visited.add(index);

      safeZones.forEach((otherZone, otherIndex) => {
        if (visited.has(otherIndex)) return;
        if (otherZone.latitude == null || otherZone.longitude == null) return;

        const distance = calculateDistanceKm(Number(zone.latitude), Number(zone.longitude), Number(otherZone.latitude), Number(otherZone.longitude));
        if (distance <= 2.0) {
          group.push(otherZone);
          visited.add(otherIndex);
        }
      });

      const totalReports = group.reduce((sum, z) => {
        const count = Number(z.reportsCount ?? z.reports_count ?? z.totalReports ?? z.reports?.length ?? 0);
        return sum + count;
      }, 0);

      const avgRating = group.reduce((sum, z) => {
        const rating = Number(z.averageRating ?? z.average_rating ?? z.rating ?? 0);
        return sum + rating;
      }, 0) / group.length;

      const clusterName = getDynamicClusterName(group);
      const risk = getRiskDetails(totalReports);

      clusters.push({
        id: `cluster-group-${zone.id}`,
        name: clusterName,
        description: group.length > 1 ? `${group.length} puntos cercanos en un radio de 2 km.` : (zone.description || "Zona monitoreada individualmente."),
        latitude: Number(zone.latitude),
        longitude: Number(zone.longitude),
        reportsCount: totalReports,
        averageRating: avgRating,
        isDangerous: risk.isDangerous,
        riskLevel: risk.level,
        riskColor: risk.color,
        riskBg: risk.bg,
        groupedCount: group.length,
        radiusKm: 2.0,
        groupedZones: group,
      });
    });

    return clusters;
  }, [zones]);

  const stats = useMemo(() => {
    let tranquilo = 0;
    let sospechoso = 0;
    let alertas = 0;

    clusteredZones.forEach((z) => {
      const lvl = z.riskLevel?.toLowerCase();
      if (lvl === 'tranquilo') tranquilo++;
      else if (lvl === 'sospechoso') sospechoso++;
      else if (z.isDangerous) alertas++;
    });

    return {
      total: clusteredZones.length,
      tranquilo,
      sospechoso,
      alertas
    };
  }, [clusteredZones]);

  const filteredZones = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    let dataToFilter = clusteredZones;
    if (activeFilter === 'tranquilo') {
      dataToFilter = clusteredZones.filter(z => z.riskLevel?.toLowerCase() === 'tranquilo');
    } else if (activeFilter === 'sospechoso') {
      dataToFilter = clusteredZones.filter(z => z.riskLevel?.toLowerCase() === 'sospechoso');
    } else if (activeFilter === 'alertas') {
      dataToFilter = clusteredZones.filter(z => z.isDangerous);
    }

    const searched = !term ? dataToFilter : dataToFilter.filter(
      (z) => z.name?.toLowerCase().includes(term) ||
        z.description?.toLowerCase().includes(term) ||
        z.riskLevel?.toLowerCase().includes(term)
    );

    return searched.sort((a, b) => {
      if (a.isDangerous !== b.isDangerous) return a.isDangerous ? -1 : 1;
      return b.reportsCount - a.reportsCount;
    });
  }, [clusteredZones, searchTerm, activeFilter]);

  const handleFilterSelect = (filterType) => {
    setActiveFilter(prev => (prev === filterType ? null : filterType));
  };

  if (loading && (!zones || zones.length === 0)) return <LoadingState label="Agrupando zonas por proximidad (2km)..." />;
  if (error && (!zones || zones.length === 0)) return <ErrorState message={error} />;

  const renderItem = ({ item }) => {
    const hasCoords = item.latitude != null && item.longitude != null;
    const targetZoneId = item.groupedZones?.[0]?.id;
    const isTranquilo = item.riskLevel?.toLowerCase() === 'tranquilo';
    const isSospechoso = item.riskLevel?.toLowerCase() === 'sospechoso';

    return (
      <View style={styles.fbCard}>
        <View style={styles.fbCardHeader}>
          <View style={styles.fbCardUserRow}>
            <View style={[styles.fbAvatarSmall, { backgroundColor: item.riskBg }]}>
              <Ionicons
                name={item.reportsCount >= 5 ? "warning" : "shield-checkmark"}
                size={14}
                color={item.riskColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fbCardAuthor} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.fbCardTime}>Radio de cobertura: {item.radiusKm} km</Text>
            </View>
          </View>

          {(!isTranquilo && !isSospechoso) && (
            <View style={[styles.alertPill, { backgroundColor: item.riskBg }]}>
              <Text style={[styles.alertPillText, { color: item.riskColor }]}>{item.riskLevel}</Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => targetZoneId && navigation.navigate("ZoneDetail", { zoneId: targetZoneId, groupedZones: item.groupedZones })}>
          <Text style={styles.fbCardDescription} numberOfLines={2}>{item.description}</Text>
        </Pressable>

        {hasCoords && (
          <Pressable style={styles.mapCardWrapper} onPress={() => targetZoneId && navigation.navigate("ZoneDetail", { zoneId: targetZoneId, groupedZones: item.groupedZones })}>
            <View style={{ flex: 1, width: "100%", height: "100%" }} pointerEvents="none">
              <ZoneMap latitude={item.latitude} longitude={item.longitude} compact />
            </View>
          </Pressable>
        )}

        <View style={styles.fbCardActions}>
          <View style={styles.fbActionButton}>
            <Ionicons name="layers-outline" size={16} color="#64748B" />
            <Text style={styles.fbActionBtnText}>{item.reportsCount} reportes activos en el área</Text>
          </View>

          <Pressable style={styles.fbActionButton} onPress={() => openMaps(item.latitude, item.longitude)}>
            <Ionicons name="navigate-outline" size={16} color="#2563EB" />
            <Text style={[styles.fbActionBtnText, { color: "#2563EB" }]}>Ubicación</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderFixedHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>RADAR DE PROXIMIDAD</Text>
          <Text style={styles.title}>Zonas</Text>
        </View>
        <Pressable style={({ pressed }) => [styles.searchIconButton, pressed && styles.searchIconPressed]} onPress={() => { setIsSearching(!isSearching); if (isSearching) setSearchTerm(""); }}>
          <Ionicons name={isSearching ? "close" : "search"} size={20} color="#0F172A" />
        </Pressable>
      </View>

      {isSearching && (
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={17} color="#94A3B8" />
          <TextInput autoFocus placeholder="Buscar zona agrupada..." placeholderTextColor="#94A3B8" value={searchTerm} onChangeText={setSearchTerm} style={styles.searchInput} />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.statsFilterRow}>
        <View style={styles.statChipBase}>
          <Ionicons name="radio" size={12} color="#64748B" />
          <Text style={styles.statChipTextBase}>{stats.total} unificadas</Text>
        </View>

        <View style={styles.filterPills}>
          <Pressable
            style={[styles.filterPill, activeFilter === 'tranquilo' && styles.filterPillActive]}
            onPress={() => handleFilterSelect('tranquilo')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'tranquilo' && styles.filterPillTextActive]}>Tranquilos</Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, activeFilter === 'sospechoso' && styles.filterPillActive]}
            onPress={() => handleFilterSelect('sospechoso')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'sospechoso' && styles.filterPillTextActive]}>Sospechosos</Text>
          </Pressable>

          <Pressable
            style={[styles.filterPill, activeFilter === 'alertas' && styles.filterPillActive]}
            onPress={() => handleFilterSelect('alertas')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'alertas' && styles.filterPillTextActive]}>Alertas</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {renderFixedHeader()}
      <FlatList
        data={filteredZones}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} colors={["#2563EB"]} />}
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }, filteredZones.length === 0 && styles.emptyListContent]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState description={searchTerm ? `¡Oye!, no encontramos lo que buscas` : activeFilter ? "No encontramos ninguna zona" : "¡Hey! Parece que no hay nada."} />}
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

  statsFilterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 },
  statChipBase: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statChipTextBase: { fontSize: 11, fontWeight: "600", color: "#475569" },

  filterPills: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  filterPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  filterPillActive: { backgroundColor: "#E2E8F0", borderColor: "#CBD5E1" },

  filterPillText: { fontSize: 11, fontWeight: "600", color: "#475569" },
  filterPillTextActive: { color: "#0F172A", fontWeight: "700" },

  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#F1F5F9", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginTop: 12, marginBottom: 4 },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A", padding: 0 },
  list: { flex: 1 },
  listContent: { paddingTop: 16 },
  emptyListContent: { flexGrow: 1, justifyContent: "center" },
  fbCard: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, marginHorizontal: 20, marginBottom: 12, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#F1F5F9", gap: 12 },
  fbCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fbCardUserRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginRight: 10 },
  fbAvatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0FDF4", justifyContent: "center", alignItems: "center" },
  fbCardAuthor: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  fbCardTime: { fontSize: 11, color: "#94A3B8" },
  fbCardDescription: { fontSize: 13, color: "#475569", lineHeight: 18 },
  mapCardWrapper: { height: 140, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0" },
  fbCardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 10 },
  fbActionButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  fbActionBtnText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  alertPill: { backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  alertPillText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
});
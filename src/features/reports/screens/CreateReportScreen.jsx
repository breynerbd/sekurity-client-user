import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { useReports } from "../hooks/useReports";
import { useZones } from "../../zones/hooks/useZones";
import ZoneMap from "../../zones/components/ZoneMap";

const SEVERITY_OPTIONS = [
  { label: "Baja", value: "LOW", color: "#10B981", bg: "#ECFDF5" },
  { label: "Media", value: "MEDIUM", color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Alta", value: "HIGH", color: "#DC2626", bg: "#FEF2F2" },
];

const INCIDENT_TYPES = [
  { label: "Accidente vial", value: "Accidente vial", icon: "car-sport-outline" },
  { label: "Asalto", value: "Asalto", icon: "skull-outline" },
  { label: "Robo", value: "Robo", icon: "warning-outline" },
  { label: "Tiroteo", value: "Tiroteo", icon: "radio-outline" },
  { label: "Vandalismo", value: "Vandalismo", icon: "brush-outline" },
  { label: "Asistencia Médica", value: "Asistencia Médica", icon: "medkit-outline" },
  { label: "Otro", value: "Otro", icon: "ellipsis-horizontal-outline" },
];

export default function CreateReportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [severityLevel, setSeverityLevel] = useState("LOW");

  const [selectedLat, setSelectedLat] = useState(14.6349);
  const [selectedLng, setSelectedLng] = useState(-90.5069);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { createReport } = useReports();
  const { createZone } = useZones();

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("El título del reporte es obligatorio");
      return;
    }
    if (!incidentType.trim()) {
      setError("Especifica el tipo de incidente");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const zoneName = `Zona - ${title.trim().substring(0, 30)}`;
      const createdZone = await createZone({
        name: zoneName,
        description: description.trim() || "Zona creada automáticamente desde el reporte",
        latitude: selectedLat,
        longitude: selectedLng,
      });

      const zoneId = createdZone?.id || createdZone?.zone?.id;

      if (!zoneId) {
        throw new Error("No se pudo registrar la zona automáticamente");
      }

      await createReport({
        title: title.trim(),
        description: description.trim(),
        incident_type: incidentType.trim(),
        severity_level: severityLevel,
        zone_id: Number(zoneId),
      });

      navigation.goBack();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "No se pudo crear el reporte");
    } finally {
      setSubmitting(false);
    }
  };

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
            <Text style={styles.eyebrow}>NUEVA INCIDENCIA</Text>
            <Text style={styles.title}>Crear reporte</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardForm}>
          <Input
            label="Título"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (error) setError(null);
            }}
            placeholder="Ej. Robo a mano armada"
          />

          <Input
            label="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
            placeholder="Describe detalladamente lo ocurrido..."
          />

          <View style={styles.incidentSection}>
            <Text style={styles.zoneSectionLabel}>Tipo de incidente</Text>
            <View style={styles.incidentGrid}>
              {INCIDENT_TYPES.map((option) => {
                const isSelected = incidentType === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.incidentOption,
                      isSelected && styles.incidentOptionSelected,
                    ]}
                    onPress={() => {
                      setIncidentType(option.value);
                      if (error) setError(null);
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={isSelected ? "#2563EB" : "#64748B"}
                    />
                    <Text
                      style={[
                        styles.incidentText,
                        isSelected && styles.incidentTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.severitySection}>
            <Text style={styles.zoneSectionLabel}>Nivel de gravedad</Text>
            <View style={styles.severityRow}>
              {SEVERITY_OPTIONS.map((option) => {
                const isSelected = severityLevel === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.severityOption,
                      isSelected && { backgroundColor: option.bg, borderColor: option.color },
                    ]}
                    onPress={() => setSeverityLevel(option.value)}
                  >
                    <View
                      style={[
                        styles.severityIndicator,
                        { backgroundColor: option.color },
                        isSelected && { transform: [{ scale: 1.2 }] },
                      ]}
                    />
                    <Text
                      style={[
                        styles.severityText,
                        isSelected && { color: option.color, fontWeight: "800" },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.zoneSection}>
            <View style={styles.zoneSectionHeaderRow}>
              <View style={styles.zoneSectionHeader}>
                <Ionicons name="map-outline" size={16} color="#2563EB" />
                <Text style={styles.zoneSectionLabel}>Selecciona la ubicación en el mapa</Text>
              </View>
            </View>

            <View style={styles.mapContainer}>
              <ZoneMap
                latitude={selectedLat}
                longitude={selectedLng}
                interactive={true}
                onLocationSelect={(coords) => {
                  setSelectedLat(coords.latitude);
                  setSelectedLng(coords.longitude);
                  if (error) setError(null);
                }}
              />
            </View>
            <Text style={styles.mapHintText}>
              Lat: {selectedLat.toFixed(4)}, Lng: {selectedLng.toFixed(4)} (Se creará una zona automáticamente aquí)
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              title="Enviar reporte"
              onPress={handleCreate}
              loading={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  headerTopRow: { flexDirection: "row", alignItems: "center" },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  eyebrow: { fontSize: 11, fontWeight: "700", color: "#2563EB", letterSpacing: 1.2, marginBottom: 2 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: 20, paddingTop: 16 },
  cardForm: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 16, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, gap: 16, borderWidth: 1, borderColor: "#F1F5F9" },
  incidentSection: { gap: 8 },
  incidentGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  incidentOption: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", gap: 8, width: "48%" },
  incidentOptionSelected: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  incidentText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  incidentTextSelected: { color: "#2563EB", fontWeight: "700" },
  severitySection: { gap: 8 },
  severityRow: { flexDirection: "row", gap: 8 },
  severityOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#F8FAFC", gap: 6 },
  severityIndicator: { width: 8, height: 8, borderRadius: 4 },
  severityText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  zoneSection: { gap: 8 },
  zoneSectionHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  zoneSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  zoneSectionLabel: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  mapContainer: { height: 220, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  mapHintText: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 2 },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF2F2", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 },
  errorText: { fontSize: 12, fontWeight: "700", color: "#DC2626", flex: 1 },
  buttonContainer: { marginTop: 8 },
});
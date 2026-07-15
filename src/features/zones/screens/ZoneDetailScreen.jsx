import React, { useState, useLayoutEffect } from "react";
import { FlatList, Text, View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Button from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { spacing, typography } from "../../../shared/constants/theme";
import { useRatings } from "../../ratings/hooks/useRatings";
import { useZoneDetail } from "../hooks/useZones";

export default function ZoneDetailScreen({ route, navigation }) {
  const { zoneId } = route.params;
  const { zone, loading, error } = useZoneDetail(zoneId);
  const { ratings, submitRating, submitting } = useRatings(zoneId);
  
  // Ahora manejamos la puntuación como un número directamente (inicia en 5)
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  // 1. Corregimos la barra superior blanca fantasma por una premium oscura con texto blanco
  useLayoutEffect(() => {
    if (navigation) {
      navigation.setOptions({
        headerShown: true,
        title: "Detalle de Zona",
        headerStyle: {
          backgroundColor: "#0F172A", // Tono oscuro premium unificado
          borderBottomWidth: 1,
          borderColor: "#1E293B",
        },
        headerTintColor: "#FFFFFF", // Flecha de retorno y título en blanco
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 17,
        },
      });
    }
  }, [navigation]);

  // Función inteligente para calcular la etiqueta de seguridad basada en el score
  const getSecurityLabel = (currentScore) => {
    switch (currentScore) {
      case 1: return "⚠️ Lugar peligroso / Evitar área";
      case 2: return "🛑 Inseguro / Reportes frecuentes";
      case 3: return "🟡 Regular / Precaución";
      case 4: return "🔷 Zona segura / Estable";
      case 5: return "🟢 Muy buen lugar / Excelente seguridad";
      default: return "";
    }
  };

  if (loading) return <LoadingState label="Cargando zona..." />;
  if (error) return <ErrorState message={error} />;

  // Manejo del envío usando tu hook real
  const handleRatingSubmit = async () => {
    if (!comment.trim()) return;
    await submitRating(score, comment);
    setComment(""); // Limpiamos el comentario tras enviar con éxito
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Screen style={styles.screenPadding}>
          
          {/* Título e Información de la Zona */}
          <Text style={styles.mainTitle}>{zone?.name}</Text>
          <Text style={styles.subTitle}>{zone?.address || "Sin dirección registrada"}</Text>

          {/* SECCIÓN 1: Historial de Calificaciones Recientes */}
          <Text style={[typography.subtitle, styles.sectionHeader]}>Comentarios de la comunidad</Text>
          <FlatList
            data={ratings}
            keyExtractor={(item) => String(item.id)}
            style={styles.ratingsList}
            scrollEnabled={false} // Al estar dentro de un ScrollView, dejamos que el contenedor maneje el scroll general
            ListEmptyComponent={
              <EmptyState title="Sin calificaciones" description="Sé el primero en calificar esta zona" />
            }
            renderItem={({ item }) => (
              <View style={styles.ratingCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.starsRow}>{"⭐".repeat(item.score)}</Text>
                  <Text style={styles.scoreBadge}>{item.score} / 5</Text>
                </View>
                <Text style={styles.cardComment}>{item.comment}</Text>
              </View>
            )}
          />

          {/* SECCIÓN 2: Formulario Premium de Calificación */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Calificar esta zona</Text>

            {/* Selector Interactivo de Estrellas */}
            <View style={styles.starsSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setScore(star)}
                  activeOpacity={0.7}
                  style={styles.starTouch}
                >
                  <Text style={[styles.starCharacter, score >= star ? styles.starActive : styles.starInactive]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recuadro Dinámico de Nivel de Peligro */}
            <View style={[
              styles.dynamicBox,
              score <= 2 ? styles.boxDanger : score === 3 ? styles.boxWarning : styles.boxSafe
            ]}>
              <Text style={[
                styles.dynamicText,
                score <= 2 ? styles.textDanger : score === 3 ? styles.textWarning : styles.textSafe
              ]}>
                {getSecurityLabel(score)}
              </Text>
            </View>

            {/* Input personalizado de Comentario Adaptado a Multilínea */}
            <Input 
              label="Comentario u observación" 
              value={comment} 
              onChangeText={setComment}
              placeholder="Escribe detalles sobre la seguridad de esta zona..."
              multiline={true}
              numberOfLines={4}
              style={styles.customInputOverride}
            />

            {/* Botón personalizado de tu sistema */}
            <Button
              title="Guardar Calificación"
              loading={submitting}
              onPress={handleRatingSubmit}
              disabled={!comment.trim() || submitting}
            />
          </View>

        </Screen>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: spacing.md || 16,
    paddingBottom: 32,
    backgroundColor: "#F8FAFC",
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
    marginTop: 20,
  },
  subTitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  sectionHeader: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  ratingsList: {
    marginBottom: 24,
  },
  ratingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  starsRow: {
    fontSize: 13,
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
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 12,
  },
  starsSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  starTouch: {
    paddingHorizontal: 4,
  },
  starCharacter: {
    fontSize: 40,
  },
  starActive: {
    color: "#F59E0B",
  },
  starInactive: {
    color: "#CBD5E1",
  },
  dynamicBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 16,
  },
  boxDanger: { backgroundColor: "#FEF2F2" },
  boxWarning: { backgroundColor: "#FFFBEB" },
  boxSafe: { backgroundColor: "#F0FDF4" },
  dynamicText: {
    fontSize: 13,
    fontWeight: "700",
  },
  textDanger: { color: "#EF4444" },
  textWarning: { color: "#D97706" },
  textSafe: { color: "#16A34A" },
  customInputOverride: {
    minHeight: 80,
    textAlignVertical: "top", // Evita que en Android el texto empiece centrado verticalmente
  }
});
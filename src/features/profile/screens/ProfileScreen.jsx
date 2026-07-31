import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LoadingState } from "../../../shared/components/Common";
import Input from "../../../shared/components/Input";
import { useAuthStore } from "../../../shared/store/authStore";
import { useUserProfile } from "../hooks/useUserProfile";

export default function ProfileScreen({ navigation }) {
  const { user, loading, error, saveProfile } = useUserProfile();
  const logout = useAuthStore((s) => s.logout);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setSurname(user.surname || "");
    }
  }, [user]);

  if (loading && !user) return <LoadingState label="Cargando perfil..." />;

  const initials =
    `${name?.charAt(0) || ""}${surname?.charAt(0) || ""}`.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "?";

  const fullName = [name, surname].filter(Boolean).join(" ") || user?.username || "Usuario";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={[styles.fixedHeader, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.eyebrow}>MI CUENTA</Text>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName} numberOfLines={1}>{fullName}</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi Actividad</Text>
          <View style={styles.card}>
            <Pressable style={styles.menuItem} onPress={() => navigation?.navigate("MyReports")}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="document-text-outline" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Mis reportes</Text>
                <Text style={styles.menuSubtitle}>Incidencias publicadas</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuItem} onPress={() => navigation?.navigate("MyComments")}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="chatbubbles-outline" size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Mis comentarios</Text>
                <Text style={styles.menuSubtitle}>Opiniones y respuestas dadas</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuItem} onPress={() => navigation?.navigate("MyReactions")}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#FEF2F2" }]}>
                <Ionicons name="heart-outline" size={18} color="#E11D48" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Mis reacciones</Text>
                <Text style={styles.menuSubtitle}>Likes y dislikes otorgados</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable style={styles.menuItem} onPress={() => navigation?.navigate("MyRatings")}>
              <View style={[styles.menuIconWrap, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="star-outline" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>Mis reseñas</Text>
                <Text style={styles.menuSubtitle}>Calificaciones y valoraciones</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de cuenta</Text>
          <View style={styles.card}>
            <Input label="Usuario" value={user?.username} editable={false} style={styles.readonlyInput} />
            <Input label="Correo" value={user?.email} editable={false} style={[styles.readonlyInput, { marginBottom: 0 }]} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <View style={styles.card}>
            <Input label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" />
            <Input label="Apellido" value={surname} onChangeText={setSurname} placeholder="Tu apellido" style={{ marginBottom: 0 }} />

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]} onPress={() => saveProfile({ nombre: name, apellido: surname })} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesión</Text>
          <View style={styles.card}>
            <View style={styles.dangerRow}>
              <View style={styles.dangerIconWrap}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitle}>Cerrar sesión</Text>
                <Text style={styles.dangerSubtitle}>Volverás a la pantalla de inicio de sesión</Text>
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]} onPress={logout}>
              <Ionicons name="log-out-outline" size={17} color="#DC2626" />
              <Text style={styles.dangerButtonText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  fixedHeader: { paddingHorizontal: 20, paddingBottom: 16, backgroundColor: "#F8FAFC", zIndex: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  eyebrow: { fontSize: 11, fontWeight: "700", color: "#2563EB", letterSpacing: 1.2, marginBottom: 4 },
  title: { fontSize: 30, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 },
  profileCard: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingVertical: 28, alignItems: "center", marginBottom: 24, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#F1F5F9" },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#FFFFFF" },
  profileName: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  profileEmail: { fontSize: 13, color: "#94A3B8", marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10, marginLeft: 4 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, shadowColor: "#0F172A", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1, borderWidth: 1, borderColor: "#F1F5F9" },
  readonlyInput: { backgroundColor: "#F1F5F9", color: "#64748B" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  menuIconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  menuTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  menuSubtitle: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FEF2F2", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginTop: 6, marginBottom: 4, borderWidth: 1, borderColor: "#FCA5A5" },
  errorText: { fontSize: 12, color: "#DC2626", fontWeight: "600", flexShrink: 1 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#2563EB", borderRadius: 14, paddingVertical: 14, marginTop: 16 },
  primaryButtonPressed: { backgroundColor: "#1D4ED8" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  dangerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dangerIconWrap: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#FEF2F2", justifyContent: "center", alignItems: "center" },
  dangerTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  dangerSubtitle: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
  dangerButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#FEF2F2", borderRadius: 14, paddingVertical: 14, marginTop: 14, borderWidth: 1, borderColor: "#FCA5A5" },
  dangerButtonPressed: { backgroundColor: "#FEE2E2" },
  dangerButtonText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
});
import React, { useLayoutEffect } from "react";
import { FlatList, RefreshControl, Text, StyleSheet } from "react-native";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import { spacing, typography } from "../../../shared/constants/theme";
import { useZones } from "../hooks/useZones";
import ZoneCard from "../components/ZoneCard";

export default function ZonesScreen({ navigation }) {
  const { zones, loading, error, refetch } = useZones();

  // 🌟 Arreglamos el header invisible de Expo convirtiéndolo en un diseño premium oscuro
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Sekurity Zones",
      headerStyle: {
        backgroundColor: "#0F172A", // Un tono azul de medianoche / oscuro premium muy elegante
        borderBottomWidth: 1,
        borderColor: "#1E293B",
      },
      headerTintColor: "#FFFFFF", // El texto ahora se lee perfectamente en blanco
      headerTitleStyle: {
        fontWeight: "800",
        fontSize: 17,
        letterSpacing: 0.5,
      },
    });
  }, [navigation]);

  if (loading && zones.length === 0) return <LoadingState label="Cargando zonas..." />;
  if (error && zones.length === 0) return <ErrorState message={error} />;

  return (
    <Screen style={styles.screenContainer}>
      <Text style={[typography.title, { marginVertical: spacing.md, textAlign: 'left' }]}>Zonas</Text>
      
      <FlatList
        data={zones}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <EmptyState
            title="Sin zonas registradas"
            description="Aún no hay zonas de seguridad disponibles"
          />
        }
        renderItem={({ item }) => {
          // 🚨 Lógica Dinámica de Alerta:
          // Si la prioridad de la API ya viene como "HIGH" o "Alerta", o si de casualidad 
          // el promedio de ratings (si tu API lo manda) es menor o igual a 1.
          const isCritical = 
            item.priority === "HIGH" || 
            item.priority === "Alerta" || 
            (item.averageRating !== undefined && item.averageRating <= 1);

          const finalPriority = isCritical ? "Alerta" : (item.priority || "Normal");

          return (
            <ZoneCard 
              zone={{
                name: item.name,
                description: item.address, 
                reportsCount: item.reportsCount || 0, 
                priority: finalPriority, // Le pasamos "Alerta" calculada si tiene malas calificaciones 🔴
                isActive: item.status === "Activa" || item.status === "ACTIVE",
                
                // 📍 Pasamos las coordenadas reales de la BD para pintar el mapa estilo client-admin
                latitude: item.latitude, 
                longitude: item.longitude,
                radius: item.radius || 150 // Radio de la cobertura en metros (por defecto 150m)
              }}
              // 🌟 Conectamos la navegación al apachar cualquier parte de la tarjeta
              onPress={() => navigation.navigate("ZoneDetail", { zoneId: item.id })}
              onDelete={() => {
                console.log("Borrar zona con ID:", item.id);
              }}
            />
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    paddingHorizontal: spacing.md || 16, 
    backgroundColor: "#FFFFFF",
  },
  listPadding: {
    paddingBottom: spacing.xl || 32, 
  }
});
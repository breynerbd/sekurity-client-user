import { FlatList, RefreshControl, Text } from "react-native";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import ListItem from "../../../shared/components/ListItem";
import { spacing, typography } from "../../../shared/constants/theme";
import { useZones } from "../hooks/useZones";

export default function ZonesScreen({ navigation }) {
  const { zones, loading, error, refetch } = useZones();

  if (loading && zones.length === 0) return <LoadingState label="Cargando zonas..." />;
  if (error && zones.length === 0) return <ErrorState message={error} />;

  return (
    <Screen>
      <Text style={[typography.title, { marginBottom: spacing.md }]}>Zonas</Text>
      <FlatList
        data={zones}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        ListEmptyComponent={
          <EmptyState
            title="Sin zonas registradas"
            description="Aún no hay zonas de seguridad disponibles"
          />
        }
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            subtitle={item.address}
            rightLabel={item.status}
            onPress={() => navigation.navigate("ZoneDetail", { zoneId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

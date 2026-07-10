import { FlatList, RefreshControl, Text } from "react-native";
import Button from "../../../shared/components/Button";
import { EmptyState, ErrorState, LoadingState, Screen } from "../../../shared/components/Common";
import ListItem from "../../../shared/components/ListItem";
import { colors, spacing, typography } from "../../../shared/constants/theme";
import { useReports } from "../hooks/useReports";

export default function ReportsScreen({ navigation }) {
  const { reports, loading, error, refetch } = useReports();

  if (loading && reports.length === 0) return <LoadingState label="Cargando reportes..." />;
  if (error && reports.length === 0) return <ErrorState message={error} />;

  return (
    <Screen>
      <Text style={[typography.title, { marginBottom: spacing.md }]}>Reportes</Text>
      <Button
        title="+ Nuevo reporte"
        onPress={() => navigation.navigate("CreateReport")}
        style={{ marginBottom: spacing.md }}
      />
      <FlatList
        data={reports}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        ListEmptyComponent={
          <EmptyState title="Sin reportes" description="Aún no has creado ningún reporte" />
        }
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={item.description}
            rightLabel={item.status}
            badgeColor={item.status === "resolved" ? colors.success : colors.warning}
            onPress={() => navigation.navigate("ReportDetail", { reportId: item.id })}
          />
        )}
      />
    </Screen>
  );
}

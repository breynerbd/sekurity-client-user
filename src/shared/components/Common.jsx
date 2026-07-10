import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../constants/theme";

export function Screen({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function LoadingState({ label = "Cargando..." }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[typography.caption, { marginTop: spacing.sm }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, description }) {
  return (
    <View style={styles.center}>
      <Text style={typography.subtitle}>{title}</Text>
      {description ? (
        <Text style={[typography.caption, { marginTop: spacing.xs, textAlign: "center" }]}>
          {description}
        </Text>
      ) : null}
    </View>
  );
}

export function ErrorState({ message = "Ocurrió un error inesperado" }) {
  return (
    <View style={styles.center}>
      <Text style={[typography.subtitle, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
});

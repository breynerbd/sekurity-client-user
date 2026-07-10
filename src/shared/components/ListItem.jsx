import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

export default function ListItem({ title, subtitle, rightLabel, badgeColor, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={typography.subtitle}>{title}</Text>
        {subtitle ? (
          <Text style={[typography.caption, { marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightLabel ? (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor || colors.surfaceAlt },
          ]}
        >
          <Text style={styles.badgeText}>{rightLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginLeft: spacing.sm,
  },
  badgeText: { ...typography.caption, color: colors.text, fontWeight: "600" },
});

// Paleta real de sekurity-client-admin (tema claro)
export const colors = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#16A34A",
  text: "#1F2937",
  textMuted: "#6B7280",
  border: "#E5E7EB",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20, // client-admin usa mucho rounded-2xl (16-20px)
};

export const typography = {
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  body: { fontSize: 14, fontWeight: "400", color: colors.text },
  caption: { fontSize: 12, fontWeight: "400", color: colors.textMuted },
};
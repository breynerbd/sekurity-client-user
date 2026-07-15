// src/shared/constants/theme.js

export const colors = {
  primary: "#2563EB",       // Azul brillante de los botones principales
  brandDark: "#08316d",     // Tu color principal --main-blue corporativo
  background: "#FFFFFF",
  surface: "#F9FAFB",       // Fondo gris claro para inputs
  border: "#E5E7EB",        // Bordes gris suave
  textPrimary: "#111827",   
  textMuted: "#9CA3AF",     
  danger: "#EF4444",        
  text: "#FFFFFF",          // Agregado para el color del ActivityIndicator en Button.jsx
};

// Agregado para solucionar el error del borderRadius: radius.md ✅
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,                  // Cambiado a 12 para que coincida con el redondeado moderno xl del admin
  lg: 16,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const typography = {
  formLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF", 
    textTransform: "uppercase",
    letterSpacing: 1.5, 
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#08316d", 
    textAlign: "center",
  },
  caption: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  // Agregado para solucionar el error del botón ✅
  subtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",       // Por defecto blanco para botones primarios/danger
    textAlign: "center",
  }
};
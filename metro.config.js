const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 1. Forzamos alias para que las librerías nativas apunten a sus versiones Web
config.resolver.alias = {
  "react-native": "react-native-web",
  "react-native-maps": "react-native-web-maps",
};

// 2. Aseguramos que Metro entienda las extensiones web
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "web.js",
  "web.jsx",
  "web.ts",
  "web.tsx",
];

module.exports = config;
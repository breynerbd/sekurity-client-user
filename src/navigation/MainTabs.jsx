import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import CreateReportScreen from "../features/reports/screens/CreateReportScreen";
import ReportDetailScreen from "../features/reports/screens/ReportDetailScreen";
import ReportsScreen from "../features/reports/screens/ReportsScreen";
import ZoneDetailScreen from "../features/zones/screens/ZoneDetailScreen";
import ZonesScreen from "../features/zones/screens/ZonesScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import { colors } from "../shared/constants/theme";

const Tab = createBottomTabNavigator();
const ZonesStackNav = createNativeStackNavigator();
const ReportsStackNav = createNativeStackNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

function ZonesStack() {
  return (
    <ZonesStackNav.Navigator screenOptions={stackScreenOptions}>
      <ZonesStackNav.Screen name="ZonesList" component={ZonesScreen} options={{ title: "Zonas" }} />
      <ZonesStackNav.Screen name="ZoneDetail" component={ZoneDetailScreen} options={{ title: "Detalle de zona" }} />
    </ZonesStackNav.Navigator>
  );
}

function ReportsStack() {
  return (
    <ReportsStackNav.Navigator screenOptions={stackScreenOptions}>
      <ReportsStackNav.Screen name="ReportsList" component={ReportsScreen} options={{ title: "Reportes" }} />
      <ReportsStackNav.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: "Detalle de reporte" }} />
      <ReportsStackNav.Screen name="CreateReport" component={CreateReportScreen} options={{ title: "Nuevo reporte" }} />
    </ReportsStackNav.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="Zones"
        component={ZonesStack}
        options={{ tabBarLabel: "Zonas", tabBarIcon: () => <Text>🗺️</Text> }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStack}
        options={{ tabBarLabel: "Reportes", tabBarIcon: () => <Text>📋</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil", tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CreateReportScreen from "../features/reports/screens/CreateReportScreen";
import ReportDetailScreen from "../features/reports/screens/ReportDetailScreen";
import ReportsScreen from "../features/reports/screens/ReportsScreen";
import ZoneDetailScreen from "../features/zones/screens/ZoneDetailScreen";
import ZonesScreen from "../features/zones/screens/ZonesScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import MyReportsScreen from "../features/profile/screens/MyReportsScreen";
import MyCommentsScreen from "../features/profile/screens/MyCommentsScreen";
import MyReactionsScreen from "../features/profile/screens/MyReactionsScreen";
import MyRatingsScreen from "../features/profile/screens/MyRatingsScreen";
import { colors } from "../shared/constants/theme";

const Tab = createBottomTabNavigator();
const ZonesStackNav = createNativeStackNavigator();
const ReportsStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();

const stackScreenOptions = {
  headerShown: false,
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={stackScreenOptions}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen name="MyReports" component={MyReportsScreen} />
      <ProfileStackNav.Screen name="MyComments" component={MyCommentsScreen} />
      <ProfileStackNav.Screen name="MyReactions" component={MyReactionsScreen} />
      <ProfileStackNav.Screen name="MyRatings" component={MyRatingsScreen} />
    </ProfileStackNav.Navigator>
  );
}

function ZonesStack() {
  return (
    <ZonesStackNav.Navigator screenOptions={stackScreenOptions}>
      <ZonesStackNav.Screen name="ZonesList" component={ZonesScreen} />
      <ZonesStackNav.Screen name="ZoneDetail" component={ZoneDetailScreen} />
    </ZonesStackNav.Navigator>
  );
}

function ReportsStack() {
  return (
    <ReportsStackNav.Navigator screenOptions={stackScreenOptions}>
      <ReportsStackNav.Screen name="ReportsList" component={ReportsScreen} />
      <ReportsStackNav.Screen name="ReportDetail" component={ReportDetailScreen} />
      <ReportsStackNav.Screen name="CreateReport" component={CreateReportScreen} />
    </ReportsStackNav.Navigator>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface || "#FFFFFF",
          borderTopColor: colors.border || "#E5E7EB",
          borderTopWidth: 1,
          height: 50 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 40 + (insets.bottom > 0 ? insets.bottom : 10),
              backgroundColor: colors.surface || "#FFFFFF",
            }}
          />
        ),
        tabBarActiveTintColor: colors.primary || "#2563EB",
        tabBarInactiveTintColor: colors.textMuted || "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Zones") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Reports") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Zones"
        component={ZonesStack}
        options={{ tabBarLabel: "Zonas" }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStack}
        options={{ tabBarLabel: "Reportes" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
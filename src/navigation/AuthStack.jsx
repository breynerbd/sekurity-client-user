import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPasswordScreen from "../features/auth/screens/ForgotPasswordScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import { colors } from "../shared/constants/theme";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

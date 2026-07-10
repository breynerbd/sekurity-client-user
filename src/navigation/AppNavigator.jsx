import { LoadingState } from "../shared/components/Common";
import { useAuthStore } from "../shared/store/authStore";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

export default function AppNavigator() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return <LoadingState label="Iniciando Sekurity..." />;
  }

  return token ? <MainTabs /> : <AuthStack />;
}

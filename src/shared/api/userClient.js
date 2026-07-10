import { userApi } from "./api";
import { USER_ENDPOINTS } from "../constants/endpoints";

export const userClient = {
  getProfile: () => userApi.get(USER_ENDPOINTS.PROFILE).then((r) => r.data),

  updateProfile: (payload) =>
    userApi.put(USER_ENDPOINTS.UPDATE_PROFILE, payload).then((r) => r.data),
};

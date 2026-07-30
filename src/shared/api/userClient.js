import { userApi } from "./api";
import { USER_ENDPOINTS } from "../constants/endpoints";

export const userClient = {
  getProfile: () => userApi.get(USER_ENDPOINTS.PROFILE).then((r) => r.data),

  updateProfile: (payload) =>
    userApi.put(USER_ENDPOINTS.UPDATE_PROFILE, payload).then((r) => r.data),

  getMyReports: () => userApi.get("/reports/myReports").then((r) => r.data),

  getMyComments: () => userApi.get("/comments/myComments").then((r) => r.data),

  deleteComment: (commentId) => userApi.delete(`/comments/${commentId}`).then((r) => r.data),

  updateComment: (commentId, payload) => userApi.put(`/comments/${commentId}`, payload).then((r) => r.data),

  deleteReport: (reportId) => userApi.delete(`/reports/${reportId}`).then((r) => r.data),

};
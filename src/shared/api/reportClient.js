import { userApi } from "./api";
import { REPORT_ENDPOINTS } from "../constants/endpoints";

export const reportClient = {
  getReports: (params) =>
    userApi.get(REPORT_ENDPOINTS.LIST, { params }).then((r) => r.data),

  getReportById: (id) =>
    userApi.get(REPORT_ENDPOINTS.DETAIL(id)).then((r) => r.data),

  createReport: (payload) =>
    userApi.post(REPORT_ENDPOINTS.CREATE, payload).then((r) => r.data),
};

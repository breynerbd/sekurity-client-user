import { userApi } from "./api";
import { ZONE_ENDPOINTS } from "../constants/endpoints";

export const zoneClient = {
  getZones: () => userApi.get(ZONE_ENDPOINTS.LIST).then((r) => r.data),
  getZoneById: (id) => userApi.get(ZONE_ENDPOINTS.DETAIL(id)).then((r) => r.data),
  createZone: (data) => userApi.post(ZONE_ENDPOINTS.CREATE || ZONE_ENDPOINTS.LIST, data).then((r) => r.data),
};
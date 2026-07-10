import { userApi } from "./api";
import { ZONE_ENDPOINTS } from "../constants/endpoints";

export const zoneClient = {
  getZones: () => userApi.get(ZONE_ENDPOINTS.LIST).then((r) => r.data),

  getZoneById: (id) => userApi.get(ZONE_ENDPOINTS.DETAIL(id)).then((r) => r.data),
};

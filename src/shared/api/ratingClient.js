import { userApi } from "./api";
import { RATING_ENDPOINTS } from "../constants/endpoints";

export const ratingClient = {
  getByZone: (zoneId) =>
    userApi.get(RATING_ENDPOINTS.BY_ZONE(zoneId)).then((r) => r.data),

  create: (zoneId, score, comment) =>
    userApi
      .post(RATING_ENDPOINTS.CREATE(zoneId), { score, comment })
      .then((r) => r.data),
};

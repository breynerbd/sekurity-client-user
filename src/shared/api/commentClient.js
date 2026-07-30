import { userApi } from "./api";
import { COMMENT_ENDPOINTS } from "../constants/endpoints";

export const commentClient = {
  getByReport: (reportId) =>
    userApi.get(COMMENT_ENDPOINTS.BY_REPORT(reportId)).then((r) => r.data),

  create: (reportId, content, parentId = null) =>
    userApi
      .post(COMMENT_ENDPOINTS.CREATE(), {
        report_id: reportId,
        content,
        parent_id: parentId
      })
      .then((r) => r.data),

  remove: (commentId) =>
    userApi.delete(COMMENT_ENDPOINTS.DELETE(commentId)).then((r) => r.data),

  react: (commentId, type) =>
    userApi.post(COMMENT_ENDPOINTS.REACT(commentId), { type }).then((r) => r.data),
};
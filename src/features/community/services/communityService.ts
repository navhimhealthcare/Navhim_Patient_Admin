import {
  CommunityPostCreateForm,
  CommunityPostParams,
  PostListResponse,
  PostSingleResponse,
} from "../types/community.types";

import axiosInstance from "../../../services/axiosConfig";

export const communityService = {
  // GET community/feed/filter  — server-side filter + pagination
  getAll: (params: CommunityPostParams) =>
    axiosInstance.get<PostListResponse>("/community/feed/filter", { params }),

  create: (form: CommunityPostCreateForm) => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("type", form.type);
    fd.append("category", form.category);
    if (form.tags) fd.append("tags", form.tags);
    fd.append("isAnonymous", String(form.isAnonymous));
    form.media.forEach((f) => fd.append("media", f));
    return axiosInstance.post<PostSingleResponse>("/community/post", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  remove: (id: string) => axiosInstance.delete(`/community/posts/${id}`),
};

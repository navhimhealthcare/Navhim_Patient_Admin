import axiosInstance from "../../services/axiosConfig";

export const loginAPI = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/auth/admin-login", {
    email,
    password,
  });
  return response.data;
};

export const registerAPI = async (formData: FormData) => {
  const response = await axiosInstance.post("/auth/admin-register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const stateApi = async () => {
  const response = await axiosInstance.get("/India/states");
  return response.data;
};
export const districtApi = async (state: string) => {
  const response = await axiosInstance.get(`/India/districts/${state}`);
  return response.data;
};
export const forgotPasswordAPI = async ({ email }: { email: string }) => {
  const response = await axiosInstance.post("/auth/forgot-password", {
    email,
  });
  return response.data;
};

export const resetPasswordAPI = async ({
  email,
  code,
  newPassword,
}: {
  email: string;
  code: string;
  newPassword: string;
}) => {
  const response = await axiosInstance.post("/auth/reset-password", {
    email,
    code,
    newPassword,
  });
  return response.data;
};
export const changePasswordAPI = async ({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await axiosInstance.post("/auth/change-password", {
    oldPassword,
    newPassword,
  });
  return response.data;
};

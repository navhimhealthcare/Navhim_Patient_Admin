import axiosInstance from "../../services/axiosConfig";

export const fetchHospitals = () =>
  axiosInstance.get("/hospitals/hospital-list");
export const createHospital = (data) => axiosInstance.post("/hospitals", data);
export const updateHospital = (id, data) =>
  axiosInstance.put(`/hospitals/${id}`, data);
export const deleteHospital = (id) => axiosInstance.delete(`/hospitals/${id}`);
export const toggleHospitalStatus = (id, isActive) =>
  axiosInstance.patch(`/hospitals/${id}/status`, { isActive });

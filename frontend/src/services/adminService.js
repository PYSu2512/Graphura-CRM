import apiClient from "./apiClient";

export const getProfile = async () => {
  const response = await apiClient.get("/admin/profile");
  return response.data;
};
export const updateProfile = async (profileData) => {
  const response = await apiClient.patch("/admin/profile", profileData);

  return response.data;
};

import axiosInstance from "../../../services/axiosConfig";

export interface PolicySection {
  icon: string;
  heading: string;
  content: string;
}

export interface PrivacyPolicyData {
  title: string;
  content: string;
  sections: PolicySection[];
}

export interface GenericResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

export interface PrivacyPolicyResponse {
  _id?: string;
  title: string;
  content: string;
  sections: PolicySection[];
  lastUpdated?: string;
  createdAt?: string;
}

// Get Privacy Policy data
export const getPrivacyPolicyData = async (): Promise<PrivacyPolicyData> => {
  try {
    const response = await axiosInstance.get<
      GenericResponse<PrivacyPolicyResponse>
    >("/admin/get-privacy-policy");
    // Access the actual data from the response wrapper
    const actualData = response.data.data;
    return {
      title: actualData?.title || "",
      content: actualData?.content || "",
      sections: actualData?.sections || [],
    };
  } catch (error) {
    console.error("Error fetching privacy policy data:", error);
    throw error;
  }
};

// Update/Save Privacy Policy data
export const updatePrivacyPolicyData = async (
  data: PrivacyPolicyData,
): Promise<PrivacyPolicyResponse> => {
  try {
    const response = await axiosInstance.post<
      GenericResponse<PrivacyPolicyResponse>
    >("/admin/privacy-policy", data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating privacy policy data:", error);
    throw error;
  }
};

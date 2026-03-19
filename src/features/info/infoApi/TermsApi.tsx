import axiosInstance from "../../../services/axiosConfig";

export interface TermPoint {
  text: string;
}

export interface TermSection {
  key: string;
  title: string;
  description: string;
  points: TermPoint[];
}

export interface TermsAndConditionsData {
  title: string;
  sections: TermSection[];
}

export interface TermsAndConditionsResponse {
  success?: boolean;
  status?: number;
  message?: string;
  data?: TermsAndConditionsData;
}

// Get Terms and Conditions data
export const getTermsAndConditionsData =
  async (): Promise<TermsAndConditionsData> => {
    try {
      const response = await axiosInstance.get<any>("/admin/get-terms");

      const responseData = response.data;

      // Handle nested data structure from API
      if (responseData.data) {
        const data = responseData.data;
        return {
          title: data.title,
          sections: data.sections,
        };
      }

      // Fallback: if data is directly in response
      if (responseData.title && responseData.sections) {
        return {
          title: responseData.title,
          sections: responseData.sections,
        };
      }

      throw new Error("Invalid response format from API");
    } catch (error: any) {
      console.error("Error fetching terms and conditions data:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch Terms and Conditions data";
      throw new Error(errorMessage);
    }
  };

// Update/Save Terms and Conditions data
export const updateTermsAndConditionsData = async (
  data: TermsAndConditionsData,
): Promise<TermsAndConditionsData> => {
  try {
    const response = await axiosInstance.post<any>(
      "/admin/terms_conditions",
      data,
    );

    const responseData = response.data;

    // Handle nested data structure from API
    if (responseData.data) {
      const respData = responseData.data;
      return {
        title: respData.title,
        sections: respData.sections,
      };
    }

    // If update was successful, return sent data
    if (responseData.success || responseData.status === 200) {
      return data;
    }

    // Fallback: if data is directly in response
    if (responseData.title && responseData.sections) {
      return {
        title: responseData.title,
        sections: responseData.sections,
      };
    }

    throw new Error("Invalid response format from API");
  } catch (error: any) {
    console.error("Error updating terms and conditions data:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to save Terms and Conditions data";
    throw new Error(errorMessage);
  }
};

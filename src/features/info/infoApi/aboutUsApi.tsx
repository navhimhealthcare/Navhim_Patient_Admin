import axiosInstance from "../../../services/axiosConfig";

export interface ExpertiseItem {
  title: string;
  description: string;
}

export interface AboutUsData {
  heading: string;
  intro: string;
  expertise: ExpertiseItem[];
  footerNote: string;
}

export interface AboutUsResponse {
  success?: boolean;
  status?: number;
  message?: string;
  data?: AboutUsData & {
    _id?: string;
    __v?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Get About Us data
export const getAboutUsData = async (): Promise<AboutUsData> => {
  try {
    const response = await axiosInstance.get<AboutUsResponse>(
      "/admin/get-about-us"
    );

    const responseData = response.data;

    // Handle nested data structure from API
    if (responseData.data) {
      const data = responseData.data;
      return {
        heading: data.heading,
        intro: data.intro,
        expertise: data.expertise,
        footerNote: data.footerNote,
      };
    }

    // Fallback: if data is directly in response
    if (
      responseData.heading &&
      responseData.intro &&
      responseData.expertise &&
      responseData.footerNote
    ) {
      return {
        heading: responseData.heading,
        intro: responseData.intro,
        expertise: responseData.expertise,
        footerNote: responseData.footerNote,
      };
    }

    throw new Error("Invalid response format from API");
  } catch (error: any) {
    console.error("Error fetching about us data:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch About Us data";
    throw new Error(errorMessage);
  }
};

// Update/Save About Us data
export const updateAboutUsData = async (
  data: AboutUsData
): Promise<AboutUsData> => {
  try {
    const response = await axiosInstance.post<AboutUsResponse>(
      "/admin/about-us",
      data
    );

    const responseData = response.data;

    // Handle nested data structure from API
    if (responseData.data) {
      const respData = responseData.data;
      return {
        heading: respData.heading,
        intro: respData.intro,
        expertise: respData.expertise,
        footerNote: respData.footerNote,
      };
    }

    // If update was successful, return sent data
    if (responseData.success || responseData.status === 200) {
      return data;
    }

    // Fallback: if data is directly in response
    if (
      responseData.heading &&
      responseData.intro &&
      responseData.expertise &&
      responseData.footerNote
    ) {
      return {
        heading: responseData.heading,
        intro: responseData.intro,
        expertise: responseData.expertise,
        footerNote: responseData.footerNote,
      };
    }

    throw new Error("Invalid response format from API");
  } catch (error: any) {
    console.error("Error updating about us data:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to save About Us data";
    throw new Error(errorMessage);
  }
};
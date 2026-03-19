import axiosInstance from "../../../services/axiosConfig";

export interface ApproachItem {
  title: string;
  description: string;
}

export interface WhyNavhimData {
  heading: string;
  intro: string;
  approach: ApproachItem[];
  footerNote: string;
}

export interface WhyNavhimResponse {
  status: number;
  data: WhyNavhimData;
}

// Get Why Navhim data
export const getWhyNavhimData = async (): Promise<WhyNavhimData> => {
  try {
    const response = await axiosInstance.get<WhyNavhimResponse>(
      "/admin/get-why-navhim",
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching why-navhim data:", error);
    throw error;
  }
};

// Update/Save Why Navhim data
export const updateWhyNavhimData = async (
  data: WhyNavhimData,
): Promise<WhyNavhimData> => {
  try {
    const response = await axiosInstance.post<WhyNavhimResponse>(
      "/admin/why-navhim",
      data,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating why-navhim data:", error);
    throw error;
  }
};

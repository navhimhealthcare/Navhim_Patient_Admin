import axiosInstance from "../../../services/axiosConfig";

export interface FAQ {
  question: string;
  answer: string;
}

export interface OfficeHours {
  weekday: string;
  saturday: string;
  sunday: string;
}

export interface SupportData {
  email: string;
  phone: string;
  message: string;
  officeHours: OfficeHours;
  faqs: FAQ[];
}

export interface SupportResponse {
  success: boolean;
  status: number;
  message: string;
  data: SupportData & {
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// Get Support data
export const getSupportData = async (): Promise<SupportData> => {
  try {
    const response =
      await axiosInstance.get<SupportResponse>("/admin/get-support");
    const data = response.data.data;
    return {
      email: data.email,
      phone: data.phone,
      message: data.message,
      officeHours: data.officeHours,
      faqs: data.faqs,
    };
  } catch (error) {
    console.error("Error fetching support data:", error);
    throw error;
  }
};

// Update/Save Support data
export const updateSupportData = async (
  data: SupportData,
): Promise<SupportData> => {
  try {
    const response = await axiosInstance.post<SupportResponse>(
      "/admin/support",
      data,
    );
    const responseData = response.data.data;
    return {
      email: responseData.email,
      phone: responseData.phone,
      message: responseData.message,
      officeHours: responseData.officeHours,
      faqs: responseData.faqs,
    };
  } catch (error) {
    console.error("Error updating support data:", error);
    throw error;
  }
};

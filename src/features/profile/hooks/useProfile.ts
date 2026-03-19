import { useContext } from "react";
import { ProfileContext } from "../../../components/Providers/ProfileProvider";

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }

  const { profile, loading, actionLoading, refreshProfile, updateProfile } = context;

  return { 
    profile, 
    loading, 
    actionLoading, 
    fetchProfile: refreshProfile, // keeping compatibility
    updateProfile 
  };
};

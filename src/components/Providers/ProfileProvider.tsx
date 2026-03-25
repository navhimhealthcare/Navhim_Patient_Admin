import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import { AdminProfile, AdminProfileUpdatePayload } from "../../features/profile/types/profile.types";
import { fetchProfileAPI, updateProfileAPI } from "../../features/profile/services/profileService";
import showToast from "../../utils/toast";

interface ProfileContextType {
  profile: AdminProfile | null;
  loading: boolean;
  actionLoading: boolean;
  refreshProfile: (force?: boolean) => Promise<void>;
  updateProfile: (payload: AdminProfileUpdatePayload) => Promise<boolean>;
}

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isFetching = useRef(false);

  const refreshProfile = useCallback(async (force = false) => {
    if (!force && isFetching.current) return;
    
    isFetching.current = true;
    setLoading(true);
    try {
      const res = await fetchProfileAPI();
      setProfile(res.data.data);
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateProfile = async (payload: AdminProfileUpdatePayload): Promise<boolean> => {
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", payload.name.trim());
      fd.append("email", payload.email.toLowerCase().trim());
      fd.append("mobile", payload.mobile.trim());
      fd.append("address", payload.address.trim());
      fd.append("state", payload.state);
      fd.append("district", payload.district);
      
      if (payload.avatar instanceof File) {
        fd.append("avatar", payload.avatar);
      }
      console.log('payload',payload);
      

      await updateProfileAPI(fd);
      await refreshProfile(true); // Force refresh after update
      showToast.success("Profile updated successfully!");
      return true;
    } catch (err: any) {
      showToast.error(err?.response?.data?.message || "Failed to update profile.");
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, actionLoading, refreshProfile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

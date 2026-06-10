import React, { useEffect, useState } from "react";
import Profile from "../profile/Profile";
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from "../../services/superAdminService";

const SuperAdminProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getSuperAdminProfile();
        setProfileData(data?.user || null);
      } catch (error) {
        console.error("Failed to fetch super admin profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2a465a] border-t-transparent" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-medium">
        Failed to load profile data.
      </div>
    );
  }

  return (
    <Profile
      photo="../../../public/Graphura_Logo_Sm.png"
      name={profileData.name}
      email={profileData.email}
      phone={profileData.phone || ""}
      role="Super Admin"
      department="Platform"
      onUpdateProfile={updateSuperAdminProfile}
    />
  );
};

export default SuperAdminProfile;

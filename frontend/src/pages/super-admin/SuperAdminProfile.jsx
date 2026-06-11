import React, { useEffect, useState } from "react";
import Profile from "../profile/Profile";
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
} from "../../services/superAdminService";

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6 max-w-4xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm mt-6">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
        <div className="w-24 h-24 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="h-7 w-48 bg-slate-200 rounded-xl mx-auto md:mx-0" />
          <div className="h-4 w-32 bg-slate-200 rounded-lg mx-auto md:mx-0" />
        </div>
      </div>
      {/* Form Fields Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="h-10 bg-slate-50 rounded-xl border border-slate-100" />
          </div>
        ))}
      </div>
      {/* Save Button Skeleton */}
      <div className="flex justify-end pt-4">
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

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
    return <ProfileSkeleton />;
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

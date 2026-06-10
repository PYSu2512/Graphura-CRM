import React, { useState, useEffect } from "react";
import Profile from "../../profile/Profile";
import { userService } from "../../../services/userService";

const SalesExecutiveProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        // Extract nested 'user' object from ApiResponse data
        setProfileData(response.data?.user);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-[#2a465a] font-semibold">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-rose-500 p-4 bg-rose-50 rounded-xl m-4 font-semibold">
        {error}
      </div>
    );
  }

  // Ensure robust fallback avoidance using explicit empty strings
  return (
    <Profile
      photo={profileData.profilePic || ""}
      name={profileData.name || ""}
      email={profileData.email || ""}
      phone={profileData.phone || ""}
      role={profileData.role || "Sales Executive"}
      department={
        profileData.department?.name || profileData.department || "Sales"
      }
      bankDetails={{
        name: profileData.bankDetails?.beneficiaryName || "",
        accountNumber: profileData.bankDetails?.accountNumber || "",
        bankName: profileData.bankDetails?.bankName || "",
        ifscCode: profileData.bankDetails?.ifscCode || "",
        branchName: profileData.bankDetails?.branch || "",
        upiId: profileData.bankDetails?.upiId || "",
      }}
    />
  );
};

export default SalesExecutiveProfile;

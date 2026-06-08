import React, { useState, useEffect } from "react";
import Profile from "../profile/Profile";
import { userService } from "../../services/userService";

const FinanceProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMe();
        setProfile(response.data.user);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return null;

  return (
    <div>
      <Profile
        photo={profile.profilePic}
        name={profile.name}
        email={profile.email}
        phone={profile.phone}
        role={profile.role}
        department={profile.department?.displayName || profile.department?.name}
        bankDetails={{
          name: profile.bankDetails?.beneficiaryName || "",
          accountNumber: profile.bankDetails?.accountNumber || "",
          bankName: profile.bankDetails?.bankName || "",
          ifscCode: profile.bankDetails?.ifscCode || "",
          branchName: profile.bankDetails?.branch || "",
          upiId: profile.bankDetails?.upiId || "",
        }}
      />
    </div>
  );
};

export default FinanceProfile;

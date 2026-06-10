import React, { useEffect, useState } from "react";
import Profile from "../profile/Profile";
import { getProfile, updateProfile } from "../../services/adminService";

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        if (response.success && response.data && response.data.admin) {
          setAdminData(response.data.admin);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error fetching admin profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading profile...
      </div>
    );
  }

  if (error || !adminData) {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        {error || "Failed to load profile"}
      </div>
    );
  }

  return (
    <Profile
      photo="https://i.pravatar.cc/150?img=12"
      name={adminData.name}
      email={adminData.email}
      phone={adminData.phone || "N/A"}
      role="Admin"
      department="Administration"
      companyInfo={{
        companyName: adminData.company?.name || "N/A",
        ownerName: adminData.name,
        companyEmail: adminData.company?.email || adminData.email,
        industry: "CRM Platform",
        foundedYear: new Date(adminData.createdAt).getFullYear(),
        website: adminData.company?.website || "N/A",
      }}
      onUpdateProfile={updateProfile}
    />
  );
};
console.log("ADMIN PROFILE MOUNTED");
export default AdminProfile;

import React from "react";
import Profile from "../profile/Profile";

const SuperAdminProfile = () => {
  return (
    <Profile
      photo="../../../public/Graphura_Logo_Sm.png"
      name="Kamal Yadav"
      email="kamal.yadav@superadmin.crm"
      phone="7378021327"
      employeeId="SA-2001"
      role="Super Admin"
      department="Platform"
    />
  );
};

export default SuperAdminProfile;

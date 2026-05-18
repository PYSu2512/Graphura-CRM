import React from "react";
import Profile from "../profile/Profile";

const AdminProfile = () => {
  return (
    <Profile
      photo="https://i.pravatar.cc/150?img=12"
      name="Amit Patel"
      email="amit.patel@crm.com"
      phone="9123456780"
      employeeId="AD-1001"
      role="Admin"
      department="Administration"
      companyInfo={{
        companyName: "Graphura CRM",
        ownerName: "Amit Patel",
        companyEmail: "admin@graphura.com",
        industry: "SaaS - CRM Platform",
        foundedYear: "2020",
        website: "https://graphura.in",
      }}
    />
  );
};

export default AdminProfile;

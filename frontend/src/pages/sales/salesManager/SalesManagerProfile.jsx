import React from "react";
import Profile from "../../profile/Profile";

const SalesManagerProfile = () => {
  return (
    <Profile
      photo="https://i.pravatar.cc/150?img=22"
      name="Rohit Singh"
      email="rohit.singh@salesmanager.crm"
      phone="9012345678"
      employeeId="SM-3003"
      role="Sales Manager"
      department="Sales"
      bankDetails={{
        name: "Rohit Singh",
        accountNumber: "50100234567890",
        bankName: "HDFC Bank",
        ifscCode: "HDFC0001234",
        branchName: "Andheri East",
        upiId: "rohit.s@hdfcbank",
      }}
    />
  );
};

export default SalesManagerProfile;

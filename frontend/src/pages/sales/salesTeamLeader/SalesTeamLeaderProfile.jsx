import React from "react";
import Profile from "../../profile/Profile";

const SalesTeamLeaderProfile = () => {
  return (
    <Profile
      photo="https://i.pravatar.cc/150?img=33"
      name="Neha Kulkarni"
      email="neha.kulkarni@salesteamleader.crm"
      phone="9876501234"
      employeeId="STL-4102"
      role="Sales Team Leader"
      department="Sales"
      bankDetails={{
        name: "Neha Kulkarni",
        accountNumber: "50100345678901",
        bankName: "ICICI Bank",
        ifscCode: "ICIC0001456",
        branchName: "Bandra",
        upiId: "neha.k@icici",
      }}
    />
  );
};

export default SalesTeamLeaderProfile;

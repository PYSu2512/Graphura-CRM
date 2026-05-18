import React from "react";
import Profile from "../../profile/Profile";

const SalesExecutiveProfile = () => {
  return (
    <Profile
      photo="https://i.pravatar.cc/150?img=44"
      name="Ananya Das"
      email="ananya.das@salesexecutive.crm"
      phone="9876512340"
      employeeId="SE-5201"
      role="Sales Executive"
      department="Sales"
      bankDetails={{
        name: "Ananya Das",
        accountNumber: "50100456789012",
        bankName: "Kotak Bank",
        ifscCode: "KKBK0001234",
        branchName: "Fort",
        upiId: "ananya.d@kotak",
      }}
    />
  );
};

export default SalesExecutiveProfile;

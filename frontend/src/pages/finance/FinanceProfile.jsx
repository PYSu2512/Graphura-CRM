import React from 'react'
import Profile from '../profile/Profile'

const FinanceProfile = () => {
  return (
    <div>
      <Profile
        photo="https://i.pravatar.cc/150?img=53"
        name="Riya Sharma"
        email="riya.sharma@finance.crm"
        phone="9876543210"
        employeeId="FN-1024"
        role="Finance Executive"
        department="Finance"
        bankDetails={{
          name: "Riya Sharma",
          accountNumber: "50100123456789",
          bankName: "Axis Bank",
          ifscCode: "UTIB0001234",
          branchName: "Juhu",
          upiId: "riya@axis",
        }}
      />
    </div>
  )
}

export default FinanceProfile
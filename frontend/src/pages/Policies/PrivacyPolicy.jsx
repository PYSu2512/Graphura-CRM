import PolicyLayout, {
  PolicySection,
  SubHeading,
  PolicyList,
} from "./PolicyLayout";

const LAST_UPDATED = "June 14, 2026";

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${LAST_UPDATED} · This policy explains how Graphura CRM collects, uses, and protects your data.`}
    >
      {/* 1. Information We Collect */}
      <PolicySection icon="🔍" title="1. Information We Collect">
        <p>
          Graphura CRM collects information necessary to provide you with a
          fully functional CRM experience. We collect data in three primary
          categories:
        </p>
        <PolicyList
          items={[
            "Company Information – details provided during admin registration and account setup.",
            "User Information – profile and account data for individual users within your organisation.",
            "Lead &amp; Prospect Data – business contact and interaction data managed by your team.",
            "Technical &amp; Usage Data – logs, session data, and analytics used to improve the Platform.",
          ]}
        />
      </PolicySection>

      {/* 2. Company Information */}
      <PolicySection icon="🏢" title="2. Company Information">
        <p>
          When a company registers on Graphura CRM, we collect the following
          information from the registering Admin:
        </p>
        <PolicyList
          items={[
            "Company name, industry, and registered address.",
            "Company email address (used as the primary account identifier).",
            "Company logo and branding assets uploaded to the Platform.",
            "Billing address and payment method details (processed securely via Razorpay — Graphura does not store raw card data).",
            "Subscription plan preferences and upgrade history.",
          ]}
        />
        <p>
          This information is used to set up and manage your organisation's
          account, process invoices, and communicate platform updates.
        </p>
      </PolicySection>

      {/* 3. User Information */}
      <PolicySection icon="👥" title="3. User Information">
        <p>
          For each user profile created within an organisation (Managers, Team
          Leaders, Sales Executives, Finance Staff, etc.), the following data
          may be collected:
        </p>
        <PolicyList
          items={[
            "Full name, employee ID, and job designation.",
            "Email address and phone number (for login and notifications).",
            "Profile photograph (optional, uploaded by the user or Admin).",
            "Department and team assignments.",
            "Login timestamps, session duration, and activity logs.",
            "Attendance records — check-in/check-out times and duration.",
            "Leave requests, approval history, and leave balance.",
            "Performance metrics including leads handled, follow-up completion rates, and sales targets.",
          ]}
        />
      </PolicySection>

      {/* 4. Lead Data Information */}
      <PolicySection icon="🎯" title="4. Lead Data Information">
        <p>
          Lead and prospect data is entered by your sales team or imported via
          CSV bulk upload. This data typically includes:
        </p>
        <PolicyList
          items={[
            "Lead name, company name, and industry.",
            "Contact details: email address, phone number, and location.",
            "Lead source, status, and pipeline stage.",
            "Interaction history: notes, follow-up records, and communication logs.",
            "Deal value, product/service interest, and expected close date.",
            "Documents or files attached to a lead (e.g. proposals, contracts).",
          ]}
        />
        <p>
          This data is owned entirely by your organisation. Graphura acts solely
          as the data processor and does not access, analyse, or sell lead data
          for any commercial purpose.
        </p>
      </PolicySection>

      {/* 5. How We Use Data */}
      <PolicySection icon="⚙️" title="5. How We Use Your Data">
        <p>We use collected data for the following purposes:</p>
        <SubHeading>Platform Operations</SubHeading>
        <PolicyList
          items={[
            "Providing and maintaining CRM functionality for your organisation.",
            "Processing logins, managing sessions, and enforcing access controls.",
            "Generating invoices, processing payments, and managing subscriptions.",
          ]}
        />
        <SubHeading>Communication</SubHeading>
        <PolicyList
          items={[
            "Sending transactional emails (OTP verification, invoice receipts, password resets).",
            "Push notifications for follow-up reminders, announcements, and system alerts.",
            "Service update communications and critical security notices.",
          ]}
        />
        <SubHeading>Improvement &amp; Analytics</SubHeading>
        <PolicyList
          items={[
            "Aggregated, anonymised usage analytics to improve Platform performance.",
            "Identifying and resolving bugs, errors, and security vulnerabilities.",
          ]}
        />
      </PolicySection>

      {/* 6. Data Storage */}
      <PolicySection icon="🗄️" title="6. Data Storage">
        <p>
          All data stored on Graphura CRM is hosted on secure cloud
          infrastructure. The following storage systems are used:
        </p>
        <PolicyList
          items={[
            "Primary Database: Encrypted cloud-hosted MongoDB database with automated daily backups.",
            "File Storage: Cloudinary is used for storing uploaded images, documents, and media files.",
            "Session &amp; Cache: Redis is used for temporary session data and performance caching.",
            "Notification Infrastructure: Firebase Cloud Messaging (FCM) for push notification delivery.",
          ]}
        />
        <p>
          Data is stored in compliance with applicable Indian data localisation
          requirements. Backups are retained for 30 days.
        </p>
      </PolicySection>

      {/* 7. Data Security */}
      <PolicySection icon="🔒" title="7. Data Security">
        <p>
          Graphura implements industry-standard security measures to protect
          your data:
        </p>
        <PolicyList
          items={[
            "All data in transit is encrypted using TLS 1.2 or higher.",
            "Passwords are hashed using bcrypt and are never stored in plain text.",
            "Sensitive tokens and API keys are encrypted at rest.",
            "Role-based access control (RBAC) ensures users can only access data relevant to their role.",
            "Rate limiting and brute-force protection are active on all authentication endpoints.",
            "Security audit logs are maintained and reviewed regularly.",
            "Regular vulnerability assessments and penetration testing are conducted.",
          ]}
        />
        <p>
          Despite these measures, no system is 100% secure. In the event of a
          data breach, affected organisations will be notified within 72 hours
          in accordance with applicable regulations.
        </p>
      </PolicySection>

      {/* 8. Cookies Usage */}
      <PolicySection icon="🍪" title="8. Cookies Usage">
        <p>
          Graphura CRM uses cookies and similar tracking technologies to
          maintain sessions, remember preferences, and understand usage
          patterns. Cookies are categorised as:
        </p>
        <PolicyList
          items={[
            "Essential Cookies – required for authentication and session management.",
            "Performance Cookies – used to monitor platform performance and detect errors.",
            "Functional Cookies – store user preferences such as language and display settings.",
            "Analytics Cookies – aggregated, anonymised data to improve the platform.",
          ]}
        />
        <p>
          For full details on cookie usage, please refer to our{" "}
          <a
            href="/cookie-policy"
            className="text-[#2a465a] hover:underline font-semibold"
          >
            Cookie Policy
          </a>
          .
        </p>
      </PolicySection>

      {/* 9. Third Party Services */}
      <PolicySection icon="🔗" title="9. Third-Party Services">
        <p>
          Graphura CRM integrates with trusted third-party service providers to
          deliver platform functionality. Each provider has their own privacy
          policy:
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3 rounded-tl-lg font-bold">
                  Service
                </th>
                <th className="text-left px-4 py-3 font-bold">Provider</th>
                <th className="text-left px-4 py-3 rounded-tr-lg font-bold">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Payment Gateway", "Razorpay", "Subscription billing & payment processing"],
                ["File Storage", "Cloudinary", "Image & document storage"],
                ["Push Notifications", "Firebase (Google)", "Real-time push notifications"],
                ["Email Delivery", "SMTP / Nodemailer", "Transactional email"],
                ["Session Cache", "Redis (Upstash)", "Session management & caching"],
              ].map(([service, provider, purpose]) => (
                <tr key={service} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {service}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{provider}</td>
                  <td className="px-4 py-3 text-slate-600">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PolicySection>

      {/* 10. Data Sharing Policy */}
      <PolicySection icon="🤝" title="10. Data Sharing Policy">
        <p>
          Graphura does not sell, rent, or trade your personal or business data
          to third parties. Data is shared only in the following limited
          circumstances:
        </p>
        <PolicyList
          items={[
            "With authorised service providers listed in Section 9, strictly for delivering platform functionality.",
            "With law enforcement or regulatory authorities when required by a valid legal order or applicable law.",
            "In the context of a merger, acquisition, or sale of company assets — affected users will be notified in advance.",
            "With your explicit written consent for any other purpose.",
          ]}
        />
        <p>
          All third-party service providers are bound by data processing
          agreements and are required to handle your data in compliance with
          applicable privacy regulations.
        </p>
      </PolicySection>

      {/* 11. User Rights */}
      <PolicySection icon="✅" title="11. Your Rights">
        <p>
          As a user of Graphura CRM, you have the following rights regarding
          your personal data:
        </p>
        <PolicyList
          items={[
            "Right of Access – request a copy of the personal data we hold about you.",
            "Right of Rectification – request correction of inaccurate or incomplete data.",
            "Right of Erasure – request deletion of your personal data (subject to legal and contractual obligations).",
            "Right to Data Portability – receive your data in a structured, machine-readable format.",
            "Right to Restrict Processing – request that we limit how we use your data in certain circumstances.",
            "Right to Object – object to data processing for direct marketing or profiling purposes.",
          ]}
        />
        <p>
          To exercise any of these rights, contact us at{" "}
          <a
            href="mailto:official@graphura.in"
            className="text-[#2a465a] hover:underline font-semibold"
          >
            official@graphura.in
          </a>
          . We will respond within 30 days.
        </p>
      </PolicySection>

      {/* 12. Data Retention */}
      <PolicySection icon="📅" title="12. Data Retention">
        <p>
          We retain personal and business data for as long as necessary to
          fulfil the purposes outlined in this policy and as required by law:
        </p>
        <PolicyList
          items={[
            "Active account data is retained for the duration of the subscription.",
            "Upon account termination, data is retained for 30 days to allow for export requests.",
            "After 30 days post-termination, all data is permanently deleted from our servers and backups.",
            "Financial and billing records may be retained for up to 7 years to comply with tax and accounting regulations.",
            "Security and audit logs are retained for 12 months.",
          ]}
        />
      </PolicySection>

      {/* 13. Children's Privacy */}
      <PolicySection icon="👶" title="13. Children's Privacy">
        <p>
          Graphura CRM is designed exclusively for business use by adults. The
          Platform is not directed at, and we do not knowingly collect personal
          data from, individuals under the age of 18.
        </p>
        <p>
          If we become aware that we have inadvertently collected data from a
          minor, we will take immediate steps to delete that information from
          our systems. If you believe a minor has provided us with personal
          data, please contact us at{" "}
          <a
            href="mailto:official@graphura.in"
            className="text-[#2a465a] hover:underline font-semibold"
          >
            official@graphura.in
          </a>
          .
        </p>
      </PolicySection>

      {/* 14. International Transfers */}
      <PolicySection icon="🌍" title="14. International Data Transfers">
        <p>
          Graphura CRM is operated from India. If you are accessing the
          Platform from outside India, your data may be transferred to and
          processed in India where data protection laws may differ from those
          in your country.
        </p>
        <p>
          Where we transfer data to third-party providers operating in other
          jurisdictions (e.g. Firebase in the United States), we ensure that
          appropriate data transfer safeguards are in place, including Standard
          Contractual Clauses or equivalent mechanisms.
        </p>
      </PolicySection>

      {/* 15. Contact Information */}
      <PolicySection icon="📬" title="15. Contact Information">
        <p>
          For any privacy-related questions, data access requests, or concerns,
          please contact our Data Protection team:
        </p>
        <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">Data Controller:</span>{" "}
            Graphura India Private Limited
          </p>
          <p>
            <span className="font-semibold text-slate-700">Email:</span>{" "}
            <a
              href="mailto:official@graphura.in"
              className="text-[#2a465a] hover:underline font-medium"
            >
              official@graphura.in
            </a>
          </p>
          <p>
            <span className="font-semibold text-slate-700">Phone:</span>{" "}
            +91 73780 21327
          </p>
          <p>
            <span className="font-semibold text-slate-700">Address:</span>{" "}
            Graphura India Private Limited, near RSF, Pataudi, Gurgaon, Haryana 122503
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          This Privacy Policy is governed by the laws of India, including the
          Information Technology Act, 2000 and applicable data protection rules.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

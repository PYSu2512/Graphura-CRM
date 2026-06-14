import PolicyLayout, {
  PolicySection,
  SubHeading,
  PolicyList,
} from "./PolicyLayout";

const LAST_UPDATED = "June 14, 2026";

export default function TermsAndConditions() {
  return (
    <PolicyLayout
      title="Terms &amp; Conditions"
      subtitle={`Last updated: ${LAST_UPDATED} · Please read these terms carefully before using Graphura CRM.`}
    >
      {/* 1. Acceptance of Terms */}
      <PolicySection icon="📋" title="1. Acceptance of Terms">
        <p>
          By accessing, registering, or using Graphura CRM ("the Platform"),
          you acknowledge that you have read, understood, and agree to be bound
          by these Terms and Conditions ("Terms") and our Privacy Policy. These
          Terms constitute a legally binding agreement between you (the
          "Customer" or "User") and Graphura Technologies ("Graphura", "we",
          "us", or "our").
        </p>
        <p>
          If you are accepting these Terms on behalf of a company or other legal
          entity, you represent that you have the authority to bind that entity
          to these Terms. If you do not agree to these Terms, you must
          immediately discontinue use of the Platform.
        </p>
      </PolicySection>

      {/* 2. Company Registration Rules */}
      <PolicySection icon="🏢" title="2. Company Registration Rules">
        <p>
          When registering your organisation on Graphura CRM, the following
          rules apply:
        </p>
        <PolicyList
          items={[
            "Each organisation may register only one primary Admin account. Additional roles must be created through the Admin panel.",
            "The registration email address must be a valid, actively monitored business email. Personal email domains (e.g. gmail.com, yahoo.com) may be restricted at Graphura's discretion.",
            "Company information provided during registration (name, address, industry, contact details) must be accurate and kept up to date.",
            "Registering the same organisation multiple times to circumvent subscription limits, trial periods, or any feature restrictions is strictly prohibited.",
            "Graphura reserves the right to verify company details and may request supporting documentation to validate registration.",
            "Organisations operating in prohibited industries (as defined in Section 10) will not be approved for registration.",
          ]}
        />
      </PolicySection>

      {/* 3. User Responsibilities */}
      <PolicySection icon="👤" title="3. User Responsibilities">
        <p>
          All users of the Platform — including Admins, Managers, Team Leaders,
          Sales Executives, Finance personnel, and Clients — are responsible for:
        </p>
        <PolicyList
          items={[
            "Providing accurate, complete, and current information when creating or updating their profile.",
            "Using the Platform only for its intended purpose — managing customer relationships, leads, team performance, and business operations.",
            "Complying with all applicable local, national, and international laws and regulations when using the Platform.",
            "Refraining from uploading, transmitting, or sharing any content that is unlawful, harmful, defamatory, or infringes third-party intellectual property rights.",
            "Not attempting to reverse engineer, decompile, or extract source code from the Platform.",
            "Reporting any bugs, security vulnerabilities, or suspicious activity to Graphura's support team immediately.",
          ]}
        />
      </PolicySection>

      {/* 4. Account Security */}
      <PolicySection icon="🔐" title="4. Account Security">
        <p>
          Maintaining the security of your account is your responsibility.
          Graphura implements robust security measures, but you must also take
          active steps to protect your credentials:
        </p>
        <PolicyList
          items={[
            "Keep your login credentials (username, password, OTP) strictly confidential. Do not share them with anyone, including Graphura support staff.",
            "Use a strong, unique password that is not reused across other services.",
            "Log out of your session when using shared or public devices.",
            "Immediately notify Graphura at security@graphura.com if you suspect any unauthorised access to your account.",
            "Graphura is not liable for any loss or damage resulting from your failure to maintain account security.",
            "Session management and automatic timeouts are in place to reduce risk from unattended sessions.",
          ]}
        />
      </PolicySection>

      {/* 5. CRM Usage Policy */}
      <PolicySection icon="💻" title="5. CRM Usage Policy">
        <p>
          Graphura CRM is a B2B SaaS platform designed for business operations
          management. Usage is subject to the following policy:
        </p>
        <SubHeading>Acceptable Use</SubHeading>
        <PolicyList
          items={[
            "Managing sales pipelines, leads, follow-ups, and prospect interactions.",
            "Internal team management, attendance tracking, and performance reporting.",
            "Invoice generation, payment processing, and financial oversight.",
            "Business communication through in-platform notifications and announcements.",
          ]}
        />
        <SubHeading>Prohibited Use</SubHeading>
        <PolicyList
          items={[
            "Using the Platform to spam, phish, or send unsolicited commercial communications.",
            "Storing or processing illegal, harmful, or privacy-violating data.",
            "Using automated bots or scripts to access the API beyond documented rate limits.",
          ]}
        />
      </PolicySection>

      {/* 6. Lead Management Policy */}
      <PolicySection icon="🎯" title="6. Lead Management Policy">
        <p>
          The lead management features of Graphura CRM are governed by the
          following rules:
        </p>
        <PolicyList
          items={[
            "Leads and prospect data imported or entered into the Platform belong to the Customer organisation.",
            "Leads must represent genuine business prospects. Fabricating lead data is prohibited.",
            "Bulk lead imports via CSV must comply with Graphura's import template and data format guidelines.",
            "Lead data containing personal information (name, email, phone) must be collected and managed in accordance with applicable privacy laws.",
            "Duplicate lead management is the Customer's responsibility. Graphura provides de-duplication tools, but the Customer must configure and use them appropriately.",
            "Archiving or deleting leads is irreversible. Customers are advised to export data before permanent deletion.",
          ]}
        />
      </PolicySection>

      {/* 7. Data Ownership */}
      <PolicySection icon="📦" title="7. Data Ownership">
        <p>
          All business data — including leads, contacts, deals, invoices, and
          reports — entered into Graphura CRM by the Customer remains the sole
          property of the Customer organisation.
        </p>
        <p>
          Graphura does not claim ownership over Customer data. Graphura acts as
          a data processor, storing and managing data strictly in accordance
          with our Privacy Policy and applicable data protection regulations.
        </p>
        <p>
          Upon account termination, Customers may request a full export of their
          data within 30 days. After this period, Graphura reserves the right to
          permanently delete all Customer data from our servers.
        </p>
      </PolicySection>

      {/* 8. Subscription & Billing */}
      <PolicySection icon="💳" title="8. Subscription &amp; Billing">
        <SubHeading>Subscription Plans</SubHeading>
        <p>
          Graphura CRM is offered on subscription-based pricing tiers. The
          features available depend on the plan selected by the Customer Admin
          during registration or plan upgrade.
        </p>
        <SubHeading>Billing</SubHeading>
        <PolicyList
          items={[
            "Subscriptions are billed in advance on a monthly or annual basis, as selected.",
            "All payments are processed through Razorpay, our authorised payment gateway. Graphura does not store card details.",
            "Invoices are issued electronically and are accessible within the platform.",
            "Prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.",
          ]}
        />
        <SubHeading>Refunds &amp; Cancellations</SubHeading>
        <PolicyList
          items={[
            "Subscription fees are non-refundable except where required by law.",
            "Customers may cancel their subscription at any time. Access remains active until the end of the current billing period.",
            "Downgrade requests will take effect at the next billing cycle.",
          ]}
        />
      </PolicySection>

      {/* 9. Service Availability */}
      <PolicySection icon="⚡" title="9. Service Availability">
        <p>
          Graphura strives to maintain 99.5% uptime on a monthly basis.
          However, we do not guarantee uninterrupted access to the Platform. The
          following conditions apply:
        </p>
        <PolicyList
          items={[
            "Scheduled maintenance windows will be communicated at least 24 hours in advance where possible.",
            "Unplanned outages due to infrastructure failures, third-party service disruptions, or force majeure events may occur.",
            "Graphura is not liable for any losses arising from service unavailability.",
            "Status updates during incidents are published at our status page.",
            "SLA credits, if applicable, are defined within your subscription plan documentation.",
          ]}
        />
      </PolicySection>

      {/* 10. Prohibited Activities */}
      <PolicySection icon="🚫" title="10. Prohibited Activities">
        <p>
          The following activities are strictly prohibited on Graphura CRM and
          will result in immediate account suspension:
        </p>
        <PolicyList
          items={[
            "Attempting to gain unauthorised access to other accounts, databases, or system resources.",
            "Uploading malware, viruses, trojans, or any malicious code.",
            "Conducting Denial of Service (DoS) attacks or excessive API calls that degrade performance for other users.",
            "Using the Platform to facilitate illegal activities, fraud, money laundering, or financing of illegal organisations.",
            "Scraping, harvesting, or extracting data from the Platform using automated tools without written permission.",
            "Reselling or sub-licensing access to the Platform without an authorised reseller agreement with Graphura.",
            "Misrepresenting your identity, organisation, or business purpose during registration or usage.",
            "Bypassing or attempting to bypass subscription limits, feature restrictions, or trial period limitations.",
          ]}
        />
      </PolicySection>

      {/* 11. Suspension & Termination */}
      <PolicySection icon="⚠️" title="11. Suspension &amp; Termination">
        <SubHeading>By Graphura</SubHeading>
        <p>
          Graphura reserves the right to suspend or terminate accounts at any
          time without prior notice if:
        </p>
        <PolicyList
          items={[
            "There is a breach of these Terms or our Acceptable Use Policy.",
            "Non-payment of subscription fees after a grace period.",
            "Account activity poses a security risk to the Platform or other users.",
            "We are required to do so by law or regulatory authority.",
          ]}
        />
        <SubHeading>By the Customer</SubHeading>
        <p>
          Customers may terminate their account at any time by contacting
          Graphura support or via the account settings. Termination does not
          entitle the Customer to a refund of any prepaid subscription fees.
        </p>
      </PolicySection>

      {/* 12. Limitation of Liability */}
      <PolicySection icon="⚖️" title="12. Limitation of Liability">
        <p>
          To the maximum extent permitted by applicable law, Graphura shall not
          be liable for:
        </p>
        <PolicyList
          items={[
            "Indirect, incidental, special, consequential, or punitive damages.",
            "Loss of profits, revenue, data, business opportunities, or goodwill.",
            "Service interruptions, data loss, or system failures beyond our reasonable control.",
            "Actions or omissions of third-party services integrated with the Platform (e.g. Razorpay, Cloudinary, Firebase).",
          ]}
        />
        <p>
          In all cases, Graphura's total aggregate liability shall not exceed
          the total subscription fees paid by the Customer in the three (3)
          months preceding the event giving rise to the claim.
        </p>
      </PolicySection>

      {/* 13. Intellectual Property */}
      <PolicySection icon="🛡️" title="13. Intellectual Property">
        <p>
          All intellectual property rights in the Graphura CRM platform —
          including but not limited to software code, user interface designs,
          logos, trademarks, documentation, and methodologies — are the
          exclusive property of Graphura Technologies.
        </p>
        <p>
          The Customer is granted a limited, non-exclusive, non-transferable,
          revocable licence to access and use the Platform solely for their
          internal business purposes during the active subscription period.
          This licence does not permit:
        </p>
        <PolicyList
          items={[
            "Copying, modifying, or creating derivative works of the Platform.",
            "Removing or altering any proprietary notices, labels, or branding.",
            "Using Graphura's name, logo, or trademarks without prior written consent.",
          ]}
        />
      </PolicySection>

      {/* 14. Changes to Terms */}
      <PolicySection icon="🔄" title="14. Changes to Terms">
        <p>
          Graphura reserves the right to modify these Terms at any time.
          Material changes will be communicated to registered Admins via email
          and/or an in-platform notification at least 14 days before the changes
          take effect.
        </p>
        <p>
          Continued use of the Platform after the effective date of the revised
          Terms constitutes your acceptance of the changes. If you do not agree
          with any changes, you must discontinue use and may request account
          termination.
        </p>
      </PolicySection>

      {/* 15. Contact Information */}
      <PolicySection icon="📬" title="15. Contact Information">
        <p>
          For any questions, concerns, or disputes regarding these Terms and
          Conditions, please contact us:
        </p>
        <div className="mt-3 bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">Company:</span>{" "}
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
            <span className="font-semibold text-slate-700">
              Registered Address:
            </span>{" "}
            Graphura India Private Limited, near RSF, Pataudi, Gurgaon, Haryana 122503
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          These Terms are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in India.
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

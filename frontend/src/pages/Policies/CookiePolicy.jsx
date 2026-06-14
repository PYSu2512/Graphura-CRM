import PolicyLayout, {
  PolicySection,
  SubHeading,
  PolicyList,
} from "./PolicyLayout";

const LAST_UPDATED = "June 14, 2026";

/* ── Cookie category table data ──────────────────────────────────────────── */
const COOKIE_CATEGORIES = [
  {
    type: "Authentication",
    category: "Essential",
    purpose: "Keeps you logged in across page navigation",
    duration: "Session",
    required: true,
  },
  {
    type: "CSRF Token",
    category: "Essential",
    purpose: "Prevents cross-site request forgery attacks",
    duration: "Session",
    required: true,
  },
  {
    type: "Session ID",
    category: "Essential",
    purpose: "Identifies your active user session on the server",
    duration: "24 hours",
    required: true,
  },
  {
    type: "User Preferences",
    category: "Functional",
    purpose: "Remembers sidebar state, theme, and display settings",
    duration: "30 days",
    required: false,
  },
  {
    type: "Language Setting",
    category: "Functional",
    purpose: "Stores your selected language preference",
    duration: "1 year",
    required: false,
  },
  {
    type: "Performance Monitor",
    category: "Performance",
    purpose: "Tracks page load times and error rates for debugging",
    duration: "7 days",
    required: false,
  },
  {
    type: "Error Tracking",
    category: "Performance",
    purpose: "Logs frontend errors to aid issue resolution",
    duration: "7 days",
    required: false,
  },
  {
    type: "Analytics",
    category: "Analytics",
    purpose: "Collects aggregated usage data for product improvement",
    duration: "90 days",
    required: false,
  },
  {
    type: "Firebase FCM Token",
    category: "Functional",
    purpose: "Enables push notification delivery to your browser",
    duration: "Persistent",
    required: false,
  },
];

const CATEGORY_COLORS = {
  Essential: "bg-emerald-100 text-emerald-700",
  Functional: "bg-blue-100 text-blue-700",
  Performance: "bg-amber-100 text-amber-700",
  Analytics: "bg-purple-100 text-purple-700",
  Marketing: "bg-rose-100 text-rose-700",
};

export default function CookiePolicy() {
  return (
    <PolicyLayout
      title="Cookie Policy"
      subtitle={`Last updated: ${LAST_UPDATED} · This policy explains what cookies are and how Graphura CRM uses them.`}
    >
      {/* 1. What Are Cookies */}
      <PolicySection icon="🍪" title="1. What Are Cookies?">
        <p>
          Cookies are small text files that are placed on your device (computer,
          tablet, or mobile) when you visit a website or use a web application.
          They are widely used to make websites and applications work efficiently
          and to provide operational and analytics information to the site owner.
        </p>
        <p>
          Cookies do not contain executable code and cannot access other
          information on your device. They are specific to the website or
          application that set them and can only be read by that origin.
        </p>
        <p>
          In addition to traditional cookies, Graphura CRM also uses similar
          technologies such as{" "}
          <span className="font-semibold">sessionStorage</span> and{" "}
          <span className="font-semibold">localStorage</span> (browser storage
          mechanisms) to store user session data and preferences locally on your
          device.
        </p>
      </PolicySection>

      {/* 2. Why We Use Cookies */}
      <PolicySection icon="💡" title="2. Why We Use Cookies">
        <p>
          Graphura CRM uses cookies and browser storage for the following
          reasons:
        </p>
        <PolicyList
          items={[
            "To authenticate users and maintain secure login sessions.",
            "To protect against Cross-Site Request Forgery (CSRF) attacks.",
            "To remember your application preferences such as sidebar state and role context.",
            "To monitor the performance and health of the Platform.",
            "To aggregate anonymised usage analytics for product development decisions.",
            "To deliver and manage push notifications via Firebase Cloud Messaging.",
          ]}
        />
        <p>
          We do not use cookies for advertising, behavioural tracking, or the
          sale of data to third parties.
        </p>
      </PolicySection>

      {/* 3. Essential Cookies */}
      <PolicySection icon="🔐" title="3. Essential Cookies">
        <p>
          Essential cookies are strictly necessary for Graphura CRM to function.
          Without these cookies, certain features — such as logging in and
          maintaining a secure session — would not work.
        </p>
        <p>
          Because these cookies are essential to the operation of the Platform,
          they cannot be disabled. By using Graphura CRM, you consent to the
          use of essential cookies.
        </p>
        <SubHeading>Examples of essential cookies we use:</SubHeading>
        <PolicyList
          items={[
            "Authentication token — stored in sessionStorage to keep you logged in during your current browser session.",
            "CSRF protection token — prevents malicious cross-origin requests.",
            "Role and permission data — cached locally to enforce access controls without repeated server calls.",
          ]}
        />
      </PolicySection>

      {/* 4. Performance Cookies */}
      <PolicySection icon="⚡" title="4. Performance Cookies">
        <p>
          Performance cookies help us understand how users interact with
          Graphura CRM so we can identify and fix issues quickly. These cookies
          collect information such as:
        </p>
        <PolicyList
          items={[
            "Page load times and rendering performance metrics.",
            "Error rates and JavaScript exception reports.",
            "API response times and failed network requests.",
            "Browser and device type information.",
          ]}
        />
        <p>
          All performance data is collected in aggregate and does not identify
          individual users. You can opt out of performance cookies in your
          browser settings.
        </p>
      </PolicySection>

      {/* 5. Analytics Cookies */}
      <PolicySection icon="📊" title="5. Analytics Cookies">
        <p>
          Analytics cookies allow Graphura to understand Platform usage patterns
          at an aggregated level. This information helps us prioritise features,
          improve user experience, and understand which modules are most
          valuable.
        </p>
        <p>
          Analytics data collected through these cookies is:
        </p>
        <PolicyList
          items={[
            "Fully anonymised — no personally identifiable information is included.",
            "Used solely for internal product development purposes.",
            "Never shared with advertising networks or third-party data brokers.",
            "Stored for a maximum of 90 days before being purged.",
          ]}
        />
      </PolicySection>

      {/* 6. Functional Cookies */}
      <PolicySection icon="⚙️" title="6. Functional Cookies">
        <p>
          Functional cookies enable enhanced features and personalisation within
          Graphura CRM. These cookies remember choices you make so you don't
          have to re-configure settings on every visit:
        </p>
        <PolicyList
          items={[
            "Sidebar expanded or collapsed state.",
            "Notification preferences and dismissed alerts.",
            "Table filter and sort preferences within modules.",
            "Firebase Cloud Messaging token for push notification delivery.",
            "Last visited module or page within your role's workspace.",
          ]}
        />
        <p>
          Disabling functional cookies will not prevent you from using the
          Platform, but some preferences may not be saved between sessions.
        </p>
      </PolicySection>

      {/* 7. Marketing Cookies */}
      <PolicySection icon="📢" title="7. Marketing Cookies">
        <p>
          Graphura CRM is a business productivity platform, not a consumer
          marketing website. We do not use marketing or advertising cookies
          within the CRM application.
        </p>
        <p>
          Our public-facing landing page (graphura.com) may use limited
          first-party analytics to understand page engagement. These are not
          connected to your CRM account data.
        </p>
        <p>
          Graphura does not serve targeted advertisements, retargeting pixels,
          or third-party advertising scripts within the Platform.
        </p>
      </PolicySection>

      {/* 8. Third-Party Cookies */}
      <PolicySection icon="🔗" title="8. Third-Party Cookies">
        <p>
          Some features of Graphura CRM rely on third-party services that may
          set their own cookies or use browser storage. These include:
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3 rounded-tl-lg font-bold">Provider</th>
                <th className="text-left px-4 py-3 font-bold">Purpose</th>
                <th className="text-left px-4 py-3 rounded-tr-lg font-bold">Privacy Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Razorpay", "Payment processing — may set session cookies during checkout", "razorpay.com/privacy"],
                ["Firebase (Google)", "Push notification token management", "firebase.google.com/support/privacy"],
                ["Cloudinary", "Media delivery and file management", "cloudinary.com/privacy"],
              ].map(([provider, purpose, policy]) => (
                <tr key={provider} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{provider}</td>
                  <td className="px-4 py-3 text-slate-600">{purpose}</td>
                  <td className="px-4 py-3">
                    <span className="text-[#2a465a] text-xs font-mono">{policy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          These third-party cookies are governed by each provider's own privacy
          and cookie policies. Graphura has no control over third-party cookies.
        </p>
      </PolicySection>

      {/* 9. Cookie Management */}
      <PolicySection icon="🛠️" title="9. Cookie Management">
        <p>
          You have several options to manage or disable cookies:
        </p>
        <SubHeading>Within Graphura CRM</SubHeading>
        <PolicyList
          items={[
            "Essential cookies cannot be disabled as they are required for the Platform to function.",
            "You can clear your browser's local storage and session storage to remove cached CRM session data.",
            "Notification preferences (including FCM tokens) can be managed in your user profile settings.",
          ]}
        />
        <SubHeading>Via Your Browser</SubHeading>
        <p>
          All major browsers allow you to view, manage, and delete cookies
          through their settings. Please note that disabling cookies may affect
          the functionality of Graphura CRM.
        </p>
        <SubHeading>Opt-Out Tools</SubHeading>
        <p>
          For analytics cookies, you may use your browser's "Do Not Track"
          setting. Graphura respects the DNT header where technically feasible.
        </p>
      </PolicySection>

      {/* 10. Browser Settings */}
      <PolicySection icon="🌐" title="10. Browser Settings">
        <p>
          Here is how to manage cookies in the most common browsers:
        </p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3 rounded-tl-lg font-bold">Browser</th>
                <th className="text-left px-4 py-3 rounded-tr-lg font-bold">Cookie Settings Path</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Google Chrome", "Settings → Privacy and Security → Cookies and other site data"],
                ["Mozilla Firefox", "Settings → Privacy &amp; Security → Cookies and Site Data"],
                ["Microsoft Edge", "Settings → Cookies and site permissions → Cookies and site data"],
                ["Apple Safari", "Preferences → Privacy → Manage Website Data"],
                ["Opera", "Settings → Advanced → Privacy &amp; Security → Cookies"],
              ].map(([browser, path]) => (
                <tr key={browser} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-800">{browser}</td>
                  <td
                    className="px-4 py-3 text-slate-600"
                    dangerouslySetInnerHTML={{ __html: path }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PolicySection>

      {/* 11. Cookie Retention */}
      <PolicySection icon="📅" title="11. Cookie Retention">
        <p>
          Cookies and browser storage items set by Graphura CRM are retained
          for different periods depending on their purpose:
        </p>
        <PolicyList
          items={[
            "Session cookies – deleted automatically when you close your browser.",
            "Authentication tokens (sessionStorage) – cleared when you log out or close the browser tab.",
            "Functional preferences (localStorage) – retained for up to 30 days or until manually cleared.",
            "Analytics identifiers – retained for up to 90 days.",
            "Firebase FCM tokens – persistent until the user revokes notification permission.",
          ]}
        />
      </PolicySection>

      {/* Cookie Category Table */}
      <PolicySection icon="📋" title="Cookie Category Reference Table">
        <p className="mb-4">
          The following table summarises the cookies and browser storage items
          used by Graphura CRM:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left px-4 py-3 font-bold rounded-tl-lg">Cookie / Item</th>
                <th className="text-left px-4 py-3 font-bold">Category</th>
                <th className="text-left px-4 py-3 font-bold">Purpose</th>
                <th className="text-left px-4 py-3 font-bold">Duration</th>
                <th className="text-left px-4 py-3 font-bold rounded-tr-lg">Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COOKIE_CATEGORIES.map((row) => (
                <tr key={row.type} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{row.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        CATEGORY_COLORS[row.category] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.purpose}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {row.duration}
                  </td>
                  <td className="px-4 py-3">
                    {row.required ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        ✓ Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PolicySection>

      {/* 12. Policy Updates */}
      <PolicySection icon="🔄" title="12. Policy Updates">
        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in technology, legislation, or our platform's functionality. When we
          make significant changes, we will:
        </p>
        <PolicyList
          items={[
            "Update the 'Last Updated' date at the top of this page.",
            "Notify registered Admin users via email for material changes.",
            "Display an in-platform notice for changes that affect active sessions.",
          ]}
        />
        <p>
          We encourage you to review this policy periodically. Continued use of
          Graphura CRM after changes are posted constitutes your acceptance of
          the updated Cookie Policy.
        </p>
      </PolicySection>

      {/* 13. Contact Information */}
      <PolicySection icon="📬" title="13. Contact Information">
        <p>
          If you have any questions about our use of cookies or this Cookie
          Policy, please get in touch:
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
            <span className="font-semibold text-slate-700">Address:</span>{" "}
            Graphura India Private Limited, near RSF, Pataudi, Gurgaon, Haryana 122503
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          For more details on how we handle your personal data, please read our{" "}
          <a
            href="/privacy-policy"
            className="text-[#2a465a] hover:underline font-semibold"
          >
            Privacy Policy
          </a>
          .
        </p>
      </PolicySection>
    </PolicyLayout>
  );
}

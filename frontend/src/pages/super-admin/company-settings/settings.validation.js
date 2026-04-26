// ─── Validation
const validate = (branding, limits) => {
  const errs = {};
  if (!branding.company_name.trim()) errs.company_name = "Required";
  if (!branding.email.trim()) errs.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(branding.email))
    errs.email = "Invalid email format";
  if (branding.phone && !/^\+?[\d\s\-()+]{7,15}$/.test(branding.phone))
    errs.phone = "Invalid phone number";
  if (branding.website_url && !/^https?:\/\//.test(branding.website_url))
    errs.website_url = "Must start with http:// or https://";
  if (limits.max_users < 1 || limits.max_users > 200)
    errs.max_users = "Must be 1–200";
  if (limits.exec_lead_limit < 1) errs.exec_lead_limit = "Min 1";
  if (limits.tl_lead_limit <= limits.exec_lead_limit)
    errs.tl_lead_limit = "Must be greater than exec limit";
  return errs;
};
export default validate;

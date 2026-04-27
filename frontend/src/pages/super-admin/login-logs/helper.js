// EXPORT HELPER  (converts filtered rows → CSV download)
export const exportCSV = (rows) => {
  const escapeCSV = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const headers = [
    "Name",
    "Email",
    "Role",
    "Date",
    "Time",
    "Latitude",
    "Longitude",
    "Device",
    "IP Address",
  ];
  const lines = [
    headers.map(escapeCSV).join(","),
    ...rows.map((r) =>
      [
        r.user,
        r.email,
        r.role,
        r.loginAt.split(" ")[0],
        r.loginAt.split(" ")[1],
        r.lat,
        r.lng,
        r.device,
        r.ip,
      ]
        .map(escapeCSV)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "login_logs.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

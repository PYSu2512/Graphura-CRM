import { useState } from "react";
import Announcements from "./Announcements";

export default function AnnouncementLayout() {
  // Announcements state lives here so it can be shared if needed
  const [announcements, setAnnouncements] = useState([]);

  return (
    <div className="flex flex-col gap-6">
      <Announcements
        announcements={announcements}
        setAnnouncements={setAnnouncements}
      />
    </div>
  );
}

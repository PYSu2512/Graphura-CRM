import React, { useState } from "react";

export default function ManagementEmployeeReminders() {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Submit UI Report",
      date: "2026-05-28",
      status: "Pending",
    },
    {
      id: 2,
      title: "Client Meeting",
      date: "2026-05-30",
      status: "Completed",
    },
  ]);

  const [newReminder, setNewReminder] = useState("");

  const handleAddReminder = () => {
    if (!newReminder.trim()) return;

    const reminder = {
      id: Date.now(),
      title: newReminder,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    setReminders([reminder, ...reminders]);
    setNewReminder("");
  };

  const handleDelete = (id) => {
    setReminders(reminders.filter((item) => item.id !== id));
  };

  const handleToggleStatus = (id) => {
    setReminders(
      reminders.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Pending"
                  ? "Completed"
                  : "Pending",
            }
          : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Reminders
        </h1>

        <p className="text-gray-500 mt-1">
          Manage your important reminders and tasks
        </p>
      </div>

      {/* ADD REMINDER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">

        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            placeholder="Enter reminder..."
            value={newReminder}
            onChange={(e) => setNewReminder(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={handleAddReminder}
            className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
          >
            + Add Reminder
          </button>

        </div>
      </div>

      {/* REMINDER LIST */}
      <div className="grid gap-4">

        {reminders.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
          >

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* LEFT */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Date: {item.date}
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3 flex-wrap">

                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.status}
                </span>

                <button
                  onClick={() => handleToggleStatus(item.id)}
                  className="px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  {item.status === "Pending"
                    ? "Mark Done"
                    : "Undo"}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Delete
                </button>

              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
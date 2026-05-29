import React, { useState } from "react";
import {
  Heading,
  DataField,
} from "../../../components/shared/Common_Components";

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
  const [showForm, setShowForm] = useState(false);

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
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setReminders(
      reminders.filter((item) => item.id !== id)
    );
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
    <div className="min-h-screen bg-[#f4f7fb] p-6">
      <Heading
        title="Reminders"
        subtitle="Manage your personal reminders and tasks"
      />

      {/* ADD BUTTON */}
      <div className="flex justify-end mt-6 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#2a465a] text-white px-5 py-2 rounded-lg hover:bg-[#1d3444] transition"
        >
          + Add Reminder
        </button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="space-y-4">
            <DataField
              label="Reminder"
              placeholder="Enter reminder..."
              value={newReminder}
              onChange={(e) =>
                setNewReminder(e.target.value)
              }
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="border px-5 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleAddReminder}
                className="bg-[#2a465a] text-white px-5 py-2 rounded-lg hover:bg-[#1d3444] transition"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REMINDER LIST */}
      <div className="grid gap-4">
        {reminders.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl shadow-sm p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#2a465a]">
                  {item.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Date: {item.date}
                </p>
              </div>

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
                  onClick={() =>
                    handleToggleStatus(item.id)
                  }
                  className="bg-[#2a465a] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1d3444] transition"
                >
                  {item.status === "Pending"
                    ? "Mark Done"
                    : "Undo"}
                </button>

                <button
                  onClick={() =>
                    handleDelete(item.id)
                  }
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
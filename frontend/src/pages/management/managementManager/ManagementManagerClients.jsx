import { useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import {
  Heading,
  Grid,
  DataTable,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";
import { clients } from "./clientsStore";
import { projects } from "./managementManagerStore";

export default function ManagementManagerClients() {
  const [selectedClient, setSelectedClient] = useState(null);

  const handleViewClient = (client) => {
    setSelectedClient(client);
    openModal("mm-client-view");
  };

  return (
    <div>
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Clients"
          secondaryText="Manage all clients and their projects"
          size={12}
        />
      </Grid>

      <Grid cols={12} gap={4}>
        <DataTable
          title="All Clients"
          columns={[
            { key: "id",           label: "ID"              },
            { key: "name",         label: "Client Name"     },
            { key: "mobile",       label: "Mobile"          },
            { key: "email",        label: "Email"           },
            { key: "projectCount", label: "Active Projects" },
          ]}
          rows={clients.map((c) => ({
            ...c,
            projectCount: projects.filter((p) => p.clientId === c.id).length,
          }))}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="clients_export"
          actions={[
            {
              icon: <LinkIcon size={15} />,
              tooltip: "View Projects",
              variant: "ghost",
              onClick: (row) => handleViewClient(row),
            },
          ]}
        />
      </Grid>

      <Modal id="mm-client-view" title="Client Details" size="lg">
        {selectedClient && (
          <>
            <ModalProfile
              name={selectedClient.name}
              subtitle={selectedClient.id}
              meta={`Mobile · ${selectedClient.mobile}`}
            />
            <ModalGrid title="Contact Information" cols={2}>
              <ModalData label="Mobile" value={selectedClient.mobile} />
              <ModalData label="Email"  value={selectedClient.email}  />
              <ModalData
                label="Drive Link"
                value={
                  <a
                    href={selectedClient.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon size={14} /> Open Drive
                  </a>
                }
              />
            </ModalGrid>

            <ModalGrid title="Associated Projects" cols={1}>
              <div className="space-y-3">
                {projects.filter((p) => p.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No projects found.</p>
                ) : (
                  projects
                    .filter((p) => p.clientId === selectedClient.id)
                    .map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">
                            {proj.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              proj.status === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : proj.status === "Delayed"
                                ? "bg-red-100 text-red-700"
                                : proj.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          {proj.driveLink && (
                            <a
                              href={proj.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              📁 Drive
                            </a>
                          )}
                          {proj.handoverLink && (
                            <a
                              href={proj.handoverLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              ✅ Handover
                            </a>
                          )}
                          {!proj.handoverLink && proj.status === "Delivered" && (
                            <span className="text-amber-500">
                              ⚠️ Handover link missing
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </ModalGrid>

            <Button
              text="Close"
              variant="ghost"
              size={3}
              onClick={() => closeModal("mm-client-view")}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
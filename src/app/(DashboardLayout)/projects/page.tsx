"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Tooltip,
  Stack,
  Chip,
  Paper,
} from "@mui/material";
import CenteredLoader from "@/components/CenteredLoader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { IconEdit, IconPlus, IconTrash, IconFolder } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import EmptyState from "@/app/(DashboardLayout)/components/shared/EmptyState";
import {
  listClients,
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  getSubscription,
  type Client,
  type Project,
  type SubscriptionInfo,
  ApiError,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-storage";
import { canCreateProjects } from "@/lib/planAccess";

type FormState = {
  clientId: string;
  title: string;
  description: string;
  status: "active" | "completed";
  notes: string;
};

const emptyForm = (clientId: string): FormState => ({
  clientId,
  title: "",
  description: "",
  status: "active",
  notes: "",
});

export default function ProjectsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [rows, setRows] = useState<Project[]>([]);
  const [filterClientId, setFilterClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(""));
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SubscriptionInfo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadClients = useCallback(async () => {
    const r = await listClients();
    setClients(r.clients);
    return r.clients;
  }, []);

  const loadProjects = useCallback(async (clientId?: string) => {
    const r = await listProjects(clientId || undefined);
    setRows(r.projects);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cl = await loadClients();
        if (cancelled) return;
        const first = cl[0]?.id ?? "";
        setForm((f) => ({ ...f, clientId: f.clientId || first }));
        try {
          const sub = await getSubscription();
          if (!cancelled) setPlan(sub);
        } catch {
          if (!cancelled) setPlan(null);
        }
        await loadProjects(filterClientId || undefined);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filterClientId, loadClients, loadProjects]);

  const listProjectsIsFullAccount = !filterClientId;

  function openCreate() {
    if (
      !canCreateProjects(
        plan,
        getStoredUser(),
        listProjectsIsFullAccount ? rows.length : undefined
      )
    )
      return;
    const def = clients[0]?.id ?? "";
    setEditing(null);
    setForm(emptyForm(def));
    setOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      clientId: p.clientId,
      title: p.title,
      description: p.description ?? "",
      status: p.status === "completed" ? "completed" : "active",
      notes: p.notes ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateProject(editing.id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          notes: form.notes.trim() || undefined,
        });
      } else {
        if (
          !canCreateProjects(
            plan,
            getStoredUser(),
            listProjectsIsFullAccount ? rows.length : undefined
          )
        ) {
          setError(
            "You’ve reached the free plan limit (3 projects). Upgrade to Pro on the Subscription page for unlimited projects."
          );
          return;
        }
        await createProject({
          clientId: form.clientId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          status: form.status,
          notes: form.notes.trim() || undefined,
        });
      }
      setOpen(false);
      await loadProjects(filterClientId || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteProject() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteProject(pendingDelete.id);
      setPendingDelete(null);
      await loadProjects(filterClientId || undefined);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  const clientName = (id: string) =>
    clients.find((c) => c.id === id)?.name ?? id;

  const allowNewProject = canCreateProjects(
    plan,
    getStoredUser(),
    listProjectsIsFullAccount ? rows.length : undefined
  );

  return (
    <PageContainer
      title="Projects"
      description="Track work for each client. Filter by client or add a new project when you land a gig."
      actions={
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <InputLabel id="fc">Client filter</InputLabel>
            <Select
              labelId="fc"
              label="Client filter"
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value as string)}
            >
              <MenuItem value="">All clients</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip
            title={
              clients.length === 0
                ? "Add a client first"
                : allowNewProject
                ? ""
                : plan
                ? "You’ve reached your free plan limit (3 projects). Upgrade to Pro to add more."
                : "Could not load subscription usage. Refresh the page or open Subscription."
            }
          >
            <span style={{ display: "inline-block" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<IconPlus size={20} />}
                onClick={openCreate}
                disabled={clients.length === 0 || !allowNewProject}
              >
                Add project
              </Button>
            </span>
          </Tooltip>
        </Stack>
      }
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {!loading && clients.length > 0 && !allowNewProject ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {plan ? (
            <>
              You’ve reached the free plan limit of 3 projects. Upgrade to{" "}
              <Typography
                component={Link}
                href="/subscription"
                fontWeight={700}
                color="primary"
              >
                Pro
              </Typography>{" "}
              for unlimited projects, or remove a project to add a new one. You
              can still edit existing projects.
            </>
          ) : (
            <>
              Could not load subscription usage, so new projects are blocked for
              safety.{" "}
              <Typography
                component={Link}
                href="/subscription"
                fontWeight={700}
                color="primary"
              >
                Open Subscription
              </Typography>{" "}
              or refresh the page.
            </>
          )}
        </Alert>
      ) : null}

      {clients.length === 0 && !loading ? (
        <EmptyState
          icon={IconFolder}
          title="Add a client first"
          description="Projects are tied to clients. Create at least one client, then you can add projects here."
          actionLabel="Go to clients"
          onAction={() => router.push("/clients")}
        />
      ) : loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 320,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <CenteredLoader embedded message="Loading projects…" />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={IconFolder}
          title="No projects yet"
          description={
            allowNewProject
              ? "Create a project to track status, notes, and related invoices."
              : "You’ve reached the 3-project limit on the free plan. Upgrade to Pro or remove a project to add more."
          }
          actionLabel={allowNewProject ? "Add project" : "View subscription"}
          onAction={() =>
            allowNewProject ? openCreate() : router.push("/subscription")
          }
        />
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, borderColor: "divider" }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" width={120}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{p.title}</Typography>
                    {p.description ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        noWrap
                        sx={{ maxWidth: 360 }}
                      >
                        {p.description}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {clientName(p.clientId)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={p.status}
                      color={p.status === "completed" ? "success" : "primary"}
                      variant={p.status === "completed" ? "filled" : "outlined"}
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(p)}
                        sx={{ mr: 0.5 }}
                      >
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setPendingDelete(p)}
                      >
                        <IconTrash size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete project?"
        description={
          pendingDelete
            ? `Remove “${pendingDelete.title}” from your projects? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete project"
        loading={deleteLoading}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        onConfirm={confirmDeleteProject}
      />

      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {editing ? "Edit project" : "New project"}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
            pt: 2,
            overflow: "visible",
          }}
        >
          {!editing ? (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="cl">Client</InputLabel>
              <Select
                labelId="cl"
                label="Client"
                value={form.clientId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, clientId: e.target.value as string }))
                }
              >
                {clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Title
            </Typography>
            <CustomTextField
              fullWidth
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Description
            </Typography>
            <CustomTextField
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel id="st">Status</InputLabel>
            <Select
              labelId="st"
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as "active" | "completed",
                }))
              }
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Notes
            </Typography>
            <CustomTextField
              fullWidth
              multiline
              minRows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={saving}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              !form.title.trim() ||
              (!editing && !form.clientId) ||
              (!editing && !allowNewProject)
            }
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

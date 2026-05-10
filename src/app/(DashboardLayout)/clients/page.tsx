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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Tooltip,
} from "@mui/material";
import CenteredLoader from "@/components/CenteredLoader";
import ConfirmDialog from "@/components/ConfirmDialog";
import { IconEdit, IconPlus, IconTrash, IconUsers } from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import EmptyState from "@/app/(DashboardLayout)/components/shared/EmptyState";
import {
  listClients,
  createClient,
  updateClient,
  deleteClient,
  getSubscription,
  type Client,
  type SubscriptionInfo,
  ApiError,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-storage";
import { canCreateClients } from "@/lib/planAccess";
import {
  validateClientFormFields,
  clientFormHasErrors,
  type ClientFormErrors,
} from "@/lib/validateClientForm";

const emptyForm = { name: "", email: "", phone: "" };

export default function ClientsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SubscriptionInfo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<ClientFormErrors>({});
  const [dialogError, setDialogError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const r = await listClients();
      setRows(r.clients);
      try {
        const sub = await getSubscription();
        setPlan(sub);
      } catch {
        setPlan(null);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    if (!canCreateClients(plan, getStoredUser(), rows.length)) return;
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setDialogError(null);
    setOpen(true);
  }

  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
    });
    setFormErrors({});
    setDialogError(null);
    setOpen(true);
  }

  function clearFieldError(field: keyof ClientFormErrors) {
    setFormErrors((er) => ({ ...er, [field]: undefined }));
  }

  async function handleSave() {
    setDialogError(null);
    const nextErrors = validateClientFormFields(form);
    if (clientFormHasErrors(nextErrors)) {
      setFormErrors(nextErrors);
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };
      if (editing) {
        await updateClient(editing.id, body);
      } else {
        if (!canCreateClients(plan, getStoredUser(), rows.length)) {
          setDialogError(
            "You’ve reached the free plan limit (3 clients). Upgrade to Pro on the Subscription page for unlimited clients."
          );
          return;
        }
        await createClient(body);
      }
      setOpen(false);
      setDialogError(null);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Save failed";
      if (msg === "Validation failed" || msg.toLowerCase().includes("validation")) {
        setDialogError("Please fix the highlighted fields and try again.");
      } else {
        setDialogError(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  const allowNewClient = canCreateClients(plan, getStoredUser(), rows.length);

  async function confirmDeleteClient() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteClient(pendingDelete.id);
      setPendingDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <PageContainer
      title="Clients"
      description="Keep contact details organized and link each account to projects and invoices."
      actions={
        <Tooltip
          title={
            allowNewClient
              ? ""
              : plan
                ? "You’ve reached your free plan limit (3 clients). Upgrade to Pro to add more."
                : "Could not load subscription usage. Refresh the page or open Subscription."
          }
        >
          <span style={{ display: "inline-block" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<IconPlus size={20} />}
              onClick={openCreate}
              disabled={!allowNewClient}
            >
              Add client
            </Button>
          </span>
        </Tooltip>
      }
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {!loading && !allowNewClient ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {plan ? (
            <>
              You’ve reached the free plan limit of 3 clients. Upgrade to{" "}
              <Typography component={Link} href="/subscription" fontWeight={700} color="primary">
                Pro
              </Typography>{" "}
              for unlimited clients, or remove a client to add a new one. You can still edit existing
              clients.
            </>
          ) : (
            <>
              Could not load subscription usage, so new clients are blocked for safety.{" "}
              <Typography component={Link} href="/subscription" fontWeight={700} color="primary">
                Open Subscription
              </Typography>{" "}
              or refresh the page.
            </>
          )}
        </Alert>
      ) : null}

      {loading ? (
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
          <CenteredLoader embedded message="Loading clients…" />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No clients yet"
          description={
            allowNewClient
              ? "Create your first client to start adding projects and sending invoices."
              : "You’ve reached the 3-client limit on the free plan. Upgrade to Pro or remove a client to add more."
          }
          actionLabel={allowNewClient ? "Add client" : "View subscription"}
          onAction={() =>
            allowNewClient ? openCreate() : router.push("/subscription")
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right" width={120}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{c.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {c.email || "-"}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {c.phone || "-"}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(c)} sx={{ mr: 0.5 }}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setPendingDelete(c)}
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
        title="Delete client?"
        description={
          pendingDelete
            ? `Remove “${pendingDelete.name}” from your clients? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete client"
        loading={deleteLoading}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        onConfirm={confirmDeleteClient}
      />

      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: { sx: { borderRadius: 3 } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {editing ? "Edit client" : "New client"}
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
          {dialogError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setDialogError(null)}>
              {dialogError}
            </Alert>
          ) : null}
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Name
            </Typography>
            <CustomTextField
              fullWidth
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                clearFieldError("name");
                setDialogError(null);
              }}
              required
              error={Boolean(formErrors.name)}
              helperText={formErrors.name}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Email
            </Typography>
            <CustomTextField
              fullWidth
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm((f) => ({ ...f, email: e.target.value }));
                clearFieldError("email");
                setDialogError(null);
              }}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Phone
            </Typography>
            <CustomTextField
              fullWidth
              value={form.phone}
              onChange={(e) => {
                setForm((f) => ({ ...f, phone: e.target.value }));
                clearFieldError("phone");
                setDialogError(null);
              }}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => {
              setOpen(false);
              setFormErrors({});
              setDialogError(null);
            }}
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
              !form.name.trim() ||
              (!editing && !allowNewClient)
            }
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

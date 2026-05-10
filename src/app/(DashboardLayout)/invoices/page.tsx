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
import {
  IconEdit,
  IconFileDownload,
  IconPlus,
  IconTrash,
  IconFileInvoice,
} from "@tabler/icons-react";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import EmptyState from "@/app/(DashboardLayout)/components/shared/EmptyState";
import {
  listProjects,
  listInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  getSubscription,
  type Project,
  type Invoice,
  type SubscriptionInfo,
  ApiError,
} from "@/lib/api";
import { getStoredUser } from "@/lib/auth-storage";
import { canCreateInvoices, canDownloadInvoicePdf } from "@/lib/planAccess";
import { formatInvoiceDueDate } from "@/lib/formatters";

type FormState = {
  projectId: string;
  amount: string;
  dueDate: string;
  status: "paid" | "unpaid";
};

const emptyForm = (projectId: string): FormState => ({
  projectId,
  amount: "",
  dueDate: new Date().toISOString().slice(0, 10),
  status: "unpaid",
});

export default function InvoicesPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [rows, setRows] = useState<Invoice[]>([]);
  const [filterProjectId, setFilterProjectId] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | "paid" | "unpaid">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(""));
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<SubscriptionInfo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    const r = await listProjects();
    setProjects(r.projects);
    return r.projects;
  }, []);

  const loadInvoices = useCallback(async () => {
    const r = await listInvoices({
      projectId: filterProjectId || undefined,
      status: filterStatus || undefined,
    });
    setRows(r.invoices);
  }, [filterProjectId, filterStatus]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pr = await loadProjects();
        if (cancelled) return;
        const first = pr[0]?.id ?? "";
        setForm((f) => ({ ...f, projectId: f.projectId || first }));
        try {
          const sub = await getSubscription();
          if (!cancelled) setPlan(sub);
        } catch {
          if (!cancelled) setPlan(null);
        }
        await loadInvoices();
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
  }, [filterProjectId, filterStatus, loadProjects, loadInvoices]);

  const listInvoicesIsFullAccount = !filterProjectId && !filterStatus;

  function openCreate() {
    if (
      !canCreateInvoices(
        plan,
        getStoredUser(),
        listInvoicesIsFullAccount ? rows.length : undefined
      )
    )
      return;
    const def = projects[0]?.id ?? "";
    setEditing(null);
    setForm(emptyForm(def));
    setOpen(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm({
      projectId: inv.projectId,
      amount: inv.amount != null ? String(inv.amount) : "",
      dueDate: inv.dueDate?.slice(0, 10) ?? "",
      status: inv.status === "paid" ? "paid" : "unpaid",
    });
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const amt = Number.parseFloat(form.amount);
      if (Number.isNaN(amt) || amt < 0) {
        setError("Enter a valid amount");
        setSaving(false);
        return;
      }
      if (editing) {
        await updateInvoice(editing.id, {
          amount: amt,
          dueDate: form.dueDate,
          status: form.status,
        });
      } else {
        if (
          !canCreateInvoices(
            plan,
            getStoredUser(),
            listInvoicesIsFullAccount ? rows.length : undefined
          )
        ) {
          setError(
            "You’ve reached the free plan limit (3 invoices). Upgrade to Pro on the Subscription page for unlimited invoices."
          );
          return;
        }
        await createInvoice({
          projectId: form.projectId,
          amount: amt,
          dueDate: form.dueDate,
          status: form.status,
        });
      }
      setOpen(false);
      await loadInvoices();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteInvoice() {
    if (!pendingDelete) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await deleteInvoice(pendingDelete.id);
      setPendingDelete(null);
      await loadInvoices();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handlePdf(inv: Invoice) {
    setError(null);
    try {
      const blob = await downloadInvoicePdf(inv.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${inv.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF download failed");
    }
  }

  const projectTitle = (id: string) =>
    projects.find((p) => p.id === id)?.title ?? id;

  const allowNewInvoice = canCreateInvoices(
    plan,
    getStoredUser(),
    listInvoicesIsFullAccount ? rows.length : undefined
  );
  const allowPdf = canDownloadInvoicePdf(plan, getStoredUser());

  return (
    <PageContainer
      title="Invoices"
      description="Create bills per project, track payment status, and download PDFs anytime."
      actions={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 } }}>
            <InputLabel id="fp">Project</InputLabel>
            <Select
              labelId="fp"
              label="Project"
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value as string)}
            >
              <MenuItem value="">All</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 130 } }}>
            <InputLabel id="fs">Status</InputLabel>
            <Select
              labelId="fs"
              label="Status"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "" | "paid" | "unpaid")
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
          <Tooltip
            title={
              projects.length === 0
                ? "Create a project first"
                : allowNewInvoice
                  ? ""
                  : plan
                    ? "You’ve reached your free plan limit (3 invoices). Upgrade to Pro to add more."
                    : "Could not load subscription usage. Refresh the page or open Subscription."
            }
          >
            <span style={{ display: "inline-block" }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<IconPlus size={20} />}
                onClick={openCreate}
                disabled={projects.length === 0 || !allowNewInvoice}
              >
                Add invoice
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

      {!loading && projects.length > 0 && !allowNewInvoice ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {plan ? (
            <>
              You’ve reached the free plan limit of 3 invoices. Upgrade to{" "}
              <Typography component={Link} href="/subscription" fontWeight={700} color="primary">
                Pro
              </Typography>{" "}
              for unlimited invoices, or remove an invoice to add a new one. You can still edit
              existing invoices.
            </>
          ) : (
            <>
              Could not load subscription usage, so new invoices are blocked for safety.{" "}
              <Typography component={Link} href="/subscription" fontWeight={700} color="primary">
                Open Subscription
              </Typography>{" "}
              or refresh the page.
            </>
          )}
        </Alert>
      ) : null}

      {projects.length === 0 && !loading ? (
        <EmptyState
          icon={IconFileInvoice}
          title="Create a project first"
          description="Invoices belong to projects. Add a project, then you can bill against it."
          actionLabel="Go to projects"
          onAction={() => router.push("/projects")}
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
          <CenteredLoader embedded message="Loading invoices…" />
        </Box>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={IconFileInvoice}
          title="No invoices yet"
          description={
            allowNewInvoice
              ? "Issue your first invoice with an amount and due date. Mark it paid when you collect."
              : "You’ve reached the 3-invoice limit on the free plan. Upgrade to Pro or remove an invoice to add more."
          }
          actionLabel={allowNewInvoice ? "Add invoice" : "View subscription"}
          onAction={() =>
            allowNewInvoice ? openCreate() : router.push("/subscription")
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
                <TableCell>Amount</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right" width={140}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((inv) => (
                <TableRow key={inv.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{projectTitle(inv.projectId)}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {inv.amount != null
                      ? new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: "USD",
                        }).format(Number.parseFloat(inv.amount))
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {formatInvoiceDueDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={inv.status}
                      color={inv.status === "paid" ? "success" : "warning"}
                      variant={inv.status === "paid" ? "filled" : "outlined"}
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip
                      title={
                        allowPdf ? "Download PDF" : "PDF export is included with Pro"
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handlePdf(inv)}
                          disabled={!allowPdf}
                          sx={{ mr: 0.25 }}
                        >
                          <IconFileDownload size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(inv)} sx={{ mr: 0.25 }}>
                        <IconEdit size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setPendingDelete(inv)}
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
        title="Delete invoice?"
        description={
          pendingDelete
            ? `Remove this invoice for ${projectTitle(pendingDelete.projectId)}? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete invoice"
        loading={deleteLoading}
        onClose={() => !deleteLoading && setPendingDelete(null)}
        onConfirm={confirmDeleteInvoice}
      />

      <Dialog
        open={open}
        onClose={() => !saving && setOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {editing ? "Edit invoice" : "New invoice"}
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
              <InputLabel id="pr">Project</InputLabel>
              <Select
                labelId="pr"
                label="Project"
                value={form.projectId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectId: e.target.value as string }))
                }
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Amount (USD)
            </Typography>
            <CustomTextField
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={0.75}>
              Due date
            </Typography>
            <CustomTextField
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              required
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
                  status: e.target.value as "paid" | "unpaid",
                }))
              }
            >
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} disabled={saving} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              saving ||
              (!editing && !form.projectId) ||
              !form.dueDate ||
              form.amount === "" ||
              (!editing && !allowNewInvoice)
            }
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

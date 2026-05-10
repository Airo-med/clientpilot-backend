"use client";

import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";
import type { Project } from "@/lib/api";

export type ProductPerformanceProps = {
  projects: Project[];
  clientNameById: Record<string, string>;
};

const ProductPerformance = ({
  projects,
  clientNameById,
}: ProductPerformanceProps) => {
  const rows = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6);

  return (
    <DashboardCard
      title="Recent projects"
      subtitle="Latest updates across your workspace"
    >
      <Box sx={{ overflow: "auto", width: { xs: "100%", sm: "auto" }, mx: -0.5 }}>
        {rows.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2, px: 0.5 }}>
            No projects yet.
          </Typography>
        ) : (
          <TableContainer>
            <Table aria-label="Recent projects" size="medium" sx={{ minWidth: 520 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Project</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell width={120}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{p.title}</Typography>
                      {p.description ? (
                        <Typography
                          color="text.secondary"
                          variant="caption"
                          display="block"
                          noWrap
                          sx={{ maxWidth: 280 }}
                        >
                          {p.description}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {clientNameById[p.clientId] || "-"}
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </DashboardCard>
  );
};

export default ProductPerformance;

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import clientsRoutes from "./routes/clientsRoutes";
import projectsRoutes from "./routes/projectsRoutes";
import invoicesRoutes from "./routes/invoicesRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { stripeWebhook } from "./controllers/stripeWebhookController";

const app = express();

app.use(cors());

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/subscription", subscriptionRoutes);

export default app;

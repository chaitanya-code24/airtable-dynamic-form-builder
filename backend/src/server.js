import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import airtableRoutes from "./routes/airtable.routes.js";
import formRoutes from "./routes/form.routes.js";
import responseRoutes from "./routes/response.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

dotenv.config();
connectDB();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/airtable", airtableRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);
app.use("/webhooks", webhookRoutes);
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

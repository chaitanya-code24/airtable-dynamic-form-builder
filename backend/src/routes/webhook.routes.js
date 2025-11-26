import { Router } from "express";
import { airtableWebhookHandler } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/airtable", airtableWebhookHandler);

export default router;

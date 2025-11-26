import { Router } from "express";
import {
  airtableLogin,
  airtableCallback,
} from "../controllers/auth.controller.js";

const router = Router();

router.get("/airtable/login", airtableLogin);
router.get("/airtable/callback", airtableCallback);

export default router;

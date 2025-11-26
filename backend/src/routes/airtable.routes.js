import { Router } from "express";
import {
  getBases,
  getTables,
  getFields,
} from "../controllers/airtable.controller.js";

const router = Router();

router.get("/bases", getBases);
router.get("/bases/:baseId/tables", getTables);
router.get("/bases/:baseId/tables/:tableId/fields", getFields);

export default router;

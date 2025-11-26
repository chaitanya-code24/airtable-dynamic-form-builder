import { Router } from "express";
import {
  createForm,
  getFormById,
  getAllForms,
} from "../controllers/form.controller.js";
import {
  getResponsesByForm,
  exportResponses,
} from "../controllers/response.controller.js";

const router = Router();

router.get("/", getAllForms);
router.post("/", createForm);
router.get("/:formId", getFormById);

router.get("/:formId/responses", getResponsesByForm);
router.get("/:formId/responses/export", exportResponses); // ✅ EXPORT

export default router;

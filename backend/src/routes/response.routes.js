import { Router } from "express";
import { submitResponse } from "../controllers/response.controller.js";

const router = Router();

router.post("/", submitResponse);

export default router;

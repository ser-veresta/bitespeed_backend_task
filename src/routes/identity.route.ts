import express, { Router } from "express";
import { identity } from "../controllers/identity.controller";

const router: Router = express.Router();

router.post("/", identity);

export default router;

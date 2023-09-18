import express from "express";
import { isAuthenticated } from "../middleware/authentication.js";
const router = express.Router();

import { login, register } from "../controllers/auth.js";

router.post("/register" /* , isAuthenticated */, register);
router.post("/login", login);

export { router };

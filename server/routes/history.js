import express from "express";
import { getAllHistory, handleHistory, handleView } from "../controllers/history.js";

const router = express.Router();
router.get("/:userId", getAllHistory);
router.post("/views/:videoId", handleView);
router.post("/:videoId", handleHistory);

export default router;
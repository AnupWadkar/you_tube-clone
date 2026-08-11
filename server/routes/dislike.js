import express from "express";
import { handleDislike, getAllDislikedVideos } from "../controllers/dislike.js";

const routes = express.Router();

routes.get("/:userId", getAllDislikedVideos);
routes.post("/:videoId", handleDislike);

export default routes;
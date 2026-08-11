import express from "express";
import {
  getallvideo,
  getvideobyid,
  getvideosbychannel,
  searchvideo,
  uploadvideo,
} from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/search", searchvideo);
routes.get("/channel/:uploaderId", getvideosbychannel);
routes.get("/:id", getvideobyid);

export default routes;

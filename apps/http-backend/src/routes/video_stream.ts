import { Router } from "express";
import { videoStream } from "../controller/videoStream";
import { upload } from "../middleware/multer_middleware";

const streamRouter: Router = Router();

streamRouter.post("/upload/video", upload.single("file"), videoStream);
export { streamRouter };

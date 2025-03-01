import { Router } from "express";
import { videoStream, uploadVideoStream } from "../controller/videoStream";
import { upload } from "../middleware/multer_middleware";

const streamRouter: Router = Router();

streamRouter.post("/upload/video", upload.single("file"), videoStream);
// streamRouter.get("/video", videoStream);
export { streamRouter };

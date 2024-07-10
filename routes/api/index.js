const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { upload } = require("./s3");

// 환경설정 정보 조회
// router.get("/env", async (req, res) => {
//   res.status(200).send(process.env);
// });

// s3 파일 업로드
router.post("/s3upload", upload.single("image"), controller.fileS3Upload);
router.post("/download", controller.getDownload);

module.exports = router;

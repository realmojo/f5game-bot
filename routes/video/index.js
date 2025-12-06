const express = require("express");
const router = express.Router();
const xController = require("./x");
const tiktokController = require("./tiktok");

router.get("/x", xController.getXInfo);
router.get("/x/download", xController.getXDownload);
router.get("/tiktok", tiktokController.getTiktokInfo);
router.get("/tiktok/download", tiktokController.getTiktokDownload);

module.exports = router;

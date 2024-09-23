const express = require("express");
const router = express.Router();
const controller = require("./controller");

// 유튜브 스크립트 텍스트 가져오기
router.get("/list", controller.getList);
router.get("/qrCreate", controller.doCreateQrUrl);
router.get("/getCookie", controller.getCookie);

module.exports = router;

// const getCookie = async () => {
//   const response = await fetch(`http://localhost:3001/naver/getCookie`, {
//     method: "GET", // 또는 'POST'
//     credentials: "include", // 쿠키를 요청에 포함
//   });

//   if (response.ok) {
//     return response.json();
//   } else {
//     return "";
//   }
// };

// (async function () {
//   "use strict";
//   const items = await getCookie();
//   console.log(items);
// })();

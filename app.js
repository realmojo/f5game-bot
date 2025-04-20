const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
const moment = require("moment");
const port = process.env.PORT || 3001;

server.setTimeout(500000);

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());
app.use((req, res, next) => {
  // console.log("origin: ", req.headers.origin);
  res.header("Access-Control-Allow-Origin", req.headers.origin); // 클라이언트의 정확한 도메인 설정
  res.header("Access-Control-Allow-Credentials", "true"); // 쿠키 허용
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use("/api", require("./routes/api"));
app.use("/cpnow", require("./routes/cpnow"));
app.use("/downsoft", require("./routes/downsoft"));
app.use("/keywordegg", require("./routes/keywordegg"));
app.use("/instagram", require("./routes/instagram"));
app.use("/mindpang", require("./routes/mindpang"));
app.use("/naver", require("./routes/naver"));
app.use("/newstiz", require("./routes/newstiz"));
app.use("/storypickup", require("./routes/storypickup"));
app.use("/techtoktok", require("./routes/techtoktok"));
app.use("/techupbox", require("./routes/techupbox"));
app.use("/tistory", require("./routes/tistory"));
app.use("/twitter", require("./routes/twitter"));
app.use("/youtube", require("./routes/youtube"));
app.use("/wp", require("./routes/wp"));
app.get("/ping", function (req, res) {
  res.send({
    status: "ok",
    result: {
      message: "pong",
      time: moment().format("YYYY-MM-DD HH:mm:ss"),
    },
  });
});

server.listen(port, () => {
  console.log(`F5Game-Bot Server Open Port: ${port}`);
});

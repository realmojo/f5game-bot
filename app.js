const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").createServer(app);
const port = process.env.PORT || 3001;
server.setTimeout(500000);

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

app.use("/api", require("./routes/api"));
app.use("/downsoft", require("./routes/downsoft"));
app.use("/mindpang", require("./routes/mindpang"));
app.use("/storypickup", require("./routes/storypickup"));
app.use("/twitter", require("./routes/twitter"));
app.use("/youtube", require("./routes/youtube"));
app.use("/wp", require("./routes/wp"));
app.get("/ping", function (req, res) {
  res.send({
    status: "ok",
    result: {
      message: "pong",
    },
  });
});

server.listen(port, () => {
  console.log(`F5Game-Bot Server Open Port: ${port}`);
});

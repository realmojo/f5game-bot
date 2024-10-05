const {
  doTheqooPost,
  doBobaedreamPost,
  doNatepannPost,
  doTeamblindPost,
  doDdanziPost,
  doInstizPost,
  getLinks,
} = require("./community");
const cron = require("node-cron");
const { replaceAll, toSingleLine, delay } = require("../../utils/util");

cron.schedule("0 */3 * * *", async () => {
  try {
    const links = await getLinks();
    let wpLink = "";
    for (const link of links) {
      console.log(link);
      if (link.type === "theqoo") {
        wpLink = await doTheqooPost(link);
      } else if (link.type === "bobaedream") {
        wpLink = await doBobaedreamPost(link);
      } else if (link.type === "natepann") {
        wpLink = await doNatepannPost(link);
      } else if (link.type === "teamblind") {
        wpLink = await doTeamblindPost(link);
      } else if (link.type === "ddanzi") {
        wpLink = await doDdanziPost(link);
      } else if (link.type === "instiz") {
        wpLink = await doInstizPost(link);
      }
      console.log(`${link.type}: (${link.link} / ${wpLink}) 포스팅 완료.`);
      await delay(10000);
    }
    console.log("good~");
  } catch (e) {
    console.log(e);
  }
});

const doUploadS3 = async (req, res) => {
  try {
    const { location } = req.file;
    const { idx } = req.query;
    if (idx && location) {
      return res.status(200).send(location);
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getCrawl = async (req, res) => {
  try {
    const links = await getLinks();
    let wpLink = "";
    for (const link of links) {
      console.log(link);
      if (link.type === "theqoo") {
        wpLink = await doTheqooPost(link);
      } else if (link.type === "bobaedream") {
        wpLink = await doBobaedreamPost(link);
      } else if (link.type === "natepann") {
        wpLink = await doNatepannPost(link);
      } else if (link.type === "teamblind") {
        wpLink = await doTeamblindPost(link);
      } else if (link.type === "ddanzi") {
        wpLink = await doDdanziPost(link);
      } else if (link.type === "instiz") {
        wpLink = await doInstizPost(link);
      }
      console.log(`${link.type}: (${link.link} / ${wpLink}) 포스팅 완료.`);
      await delay(10000);
    }
    return res.status(200).send("ok");
  } catch (e) {
    console.log(e);
    return res.status(500).send({ status: "err" });
  }
};

module.exports = {
  doUploadS3,
  getCrawl,
};

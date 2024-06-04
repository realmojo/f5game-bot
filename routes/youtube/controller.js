const axios = require("axios");
// const ytdl = require("ytdl-core");
const ytdl = require("ytdl-core-discord");
const { convertSecondsToMMSS } = require("../../utils/util");

const getInfo = (html) => {
  const startOf = html.indexOf("<title>");

  const t = html.substr(startOf + 7, 200);
  const d = t.split("</title>");
  const title = d[0];

  const thumbStartOf = html.indexOf('image_src" href="');

  const s = html.substr(thumbStartOf + 17, 200);
  const f = s.split('">');
  const thumbnail = f[0];

  return {
    title,
    thumbnail,
  };
};

const getYoutubeTransKey = (html) => {
  const startOf = html.indexOf("INNERTUBE_API_KEY");

  const t = html.substr(startOf, 100);
  const d = t.split('KEY":"');
  const a = d[1].split('","');

  return a[0];
};

const getYoutubeTransParams = (html) => {
  const startOf = html.indexOf("getTranscriptEndpoint");

  const t = html.substr(startOf, 300);
  const d = t.split('"params":"');
  const a = d[1].split('"}}}}');

  return a[0];
};

const getYoutubeTransScriptItems = (obj) => {
  const { actions } = obj;
  const scriptItems =
    actions[0].updateEngagementPanelAction.content.transcriptRenderer.content
      .transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer
      .initialSegments;

  const items = [];
  let full = "";
  for (const item of scriptItems) {
    if (item.transcriptSegmentRenderer) {
      items.push({
        time: item.transcriptSegmentRenderer.startTimeText.simpleText,
        text: item.transcriptSegmentRenderer.snippet.runs[0].text,
      });
      full += `${item.transcriptSegmentRenderer.snippet.runs[0].text} `;
    }
  }
  return { items, full };
};

const getYoutubeTransUrl = (key) => {
  return `https://www.youtube.com/youtubei/v1/get_transcript?key=${key}&prettyPrint=false`;
};

const getYoutubeScript = async (req, res) => {
  try {
    if (
      req.headers.referer !== "https://ytsubdownload.f5game.co.kr/" &&
      req.headers.referer !== "https://f5game.co.kr/" &&
      req.headers.referer !== "https://mindpang.com/" &&
      req.headers.referer !== "http://127.0.0.1:5173/" &&
      req.headers.referer !== "http://localhost:5173/" &&
      req.headers.referer !== "http://localhost:8000/" &&
      req.headers.referer !== "http://localhost:3000/" &&
      req.headers.referer !== "http://localhost:3001/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }
    const { url } = req.query;
    if (!url) {
      throw new Error("error");
    }
    const ytRes = await axios.get(url);
    const html = ytRes.data;

    const { title, thumbnail } = getInfo(html);
    const key = getYoutubeTransKey(html);
    const params = getYoutubeTransParams(html);

    const data = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20230103.01.00",
        },
      },
      params,
    };
    const response = await axios.post(getYoutubeTransUrl(key), data);
    const scriptItems = getYoutubeTransScriptItems(response.data);

    return res.status(200).send({ ...scriptItems, title, thumbnail });
  } catch (e) {
    return res.status(200).send("no data");
  }
};

const getYoutubeDownloadInfo = async (req, res) => {
  const { url } = req.query;
  try {
    if (
      req.headers.referer !== "https://ss.f5game.co.kr/" &&
      req.headers.referer !== "https://f5game.co.kr/" &&
      req.headers.referer !== "https://mindpang.com/" &&
      req.headers.referer !== "http://127.0.0.1:5173/" &&
      req.headers.referer !== "http://localhost:5173/" &&
      req.headers.referer !== "http://localhost:8000/" &&
      req.headers.referer !== "http://localhost:3001/" &&
      req.headers.referer !== "http://localhost:3000/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }
    if (!url) {
      throw new Error("url required");
    }
    if (url.indexOf("youtube") === -1 && url.indexOf("youtu.be") === -1) {
      throw new Error("Invalid url.");
    }

    let id = "";

    if (url.indexOf("shorts") !== -1) {
      const split = url.split("?");
      const t = split[0].split("/");
      id = t[t.length - 1];
    } else {
      const split = url.split("v=");
      id = split.length === 2 ? split[1] : "";
    }

    const { formats, related_videos, videoDetails } = await ytdl.getInfo(id);

    const urls = [];
    formats.map((item) => {
      let type = "";
      if (item.hasAudio && item.hasVideo) {
        type = "Video";
      } else if (item.hasAudio && !item.hasVideo) {
        type = "Audio";
      }
      if (type) {
        let label = "";
        if (type === "Video") {
          label = `${type} / ${
            item.qualityLabel ? item.qualityLabel : item.audioQuality
          } / ${item.bitrate / 1000}Kbps`;
        } else {
          label = `${type} / ${item.bitrate / 1000}Kbps`;
        }
        urls.push({
          value: `${item.url}&title=${encodeURI(videoDetails.title)}`,
          label: label,
          type: item.container,
          title: `${videoDetails.title}.${type}`,
        });
      }
    });

    const info = {
      title: videoDetails.title,
      description: videoDetails.description,
      second: convertSecondsToMMSS(videoDetails.lengthSeconds),
      keyword: videoDetails.keywords,
      thumbnail:
        videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
      urls: urls,
      related_videos,
    };
    return res.status(200).send(info);
  } catch (e) {
    return res
      .status(200)
      .send({ status: "err", message: e.message, url: url });
  }
};

const getYoutubeJson = async (req, res) => {
  const { url } = req.query;
  try {
    if (!url) {
      throw new Error("url required");
    }
    if (url.indexOf("youtube") === -1 && url.indexOf("youtu.be") === -1) {
      throw new Error("Invalid url.");
    }

    let id = "";

    if (url.indexOf("shorts") !== -1) {
      const split = url.split("?");
      const t = split[0].split("/");
      id = t[t.length - 1];
    } else {
      const split = url.split("v=");
      id = split.length === 2 ? split[1] : "";
    }

    const { formats, related_videos, videoDetails } = await ytdl.getInfo(id);

    return res.status(200).send(formats, related_videos, videoDetails);
  } catch (e) {
    return res
      .status(200)
      .send({ status: "err", message: e.message, url: url });
  }
};

module.exports = {
  getYoutubeScript,
  getYoutubeDownloadInfo,
  getYoutubeJson,
};

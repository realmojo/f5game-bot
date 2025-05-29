const axios = require("axios");
// const ytdl = require("ytdl-core");
const ytdl = require("ytdl-core-discord");
const cheerio = require("cheerio");
const FormData = require("form-data");
const fs = require("fs");
const { ensureHttps } = require("../../utils/util");

const getYoutubeTransKey = (html) => {
  const startOf = html.indexOf("INNERTUBE_API_KEY");

  const t = html.substr(startOf, 100);
  const d = t.split('KEY":"');
  const a = d[1].split('","');

  return a[0];
};

const getYoutubeTransParams = (html) => {
  try {
    const startOf = html.indexOf("getTranscriptEndpoint");

    const t = html.substr(startOf, 300);
    const d = t.split('"params":"');
    const a = d[1].split('"}}}}');

    return a[0];
  } catch (e) {
    console.log("error: ", e.message);
  }
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
    const { url } = req.query;
    if (!url) {
      throw new Error("url required");
    }
    if (!isYouTubeURL(url)) {
      throw new Error("Invalid url.");
    }
    let id = "";

    if (url.indexOf("shorts") !== -1 || url.indexOf("youtu.be") !== -1) {
      const split = url.split("?");
      const t = split[0].split("/");
      id = t[t.length - 1];
    } else {
      const split = url.split("v=");
      id = split.length === 2 ? split[1] : "";
    }

    const reUrl = `https://www.youtube.com/watch?v=${id}`;
    const { data } = await axios.get(reUrl);

    const $ = cheerio.load(data);

    let title = "Youtube";
    let thumbnail = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    const ytInitialData = await getytInitialData($);
    if (ytInitialData) {
      title =
        ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
          ?.contents[0].videoPrimaryInfoRenderer.title.runs[0].text;
    }

    const key = getYoutubeTransKey(data);
    const params = getYoutubeTransParams(data);

    const postParams = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20230103.01.00",
        },
      },
      params,
    };
    const response = await axios.post(getYoutubeTransUrl(key), postParams);
    const scriptItems = getYoutubeTransScriptItems(response.data);

    return res.status(200).send({ ...scriptItems, title, thumbnail });
  } catch (e) {
    return res.status(200).send("no data");
  }
};

const getytInitialData = ($) => {
  const scriptTags = $("script");
  let ytInitialData;

  scriptTags.each((index, element) => {
    const scriptContent = $(element).html();
    if (scriptContent.includes("ytInitialData")) {
      const ytInitialDataString = scriptContent.match(
        /var ytInitialData = ({.*?});/s
      );
      if (ytInitialDataString && ytInitialDataString.length > 1) {
        ytInitialData = JSON.parse(ytInitialDataString[1]);
      }
    }
  });

  if (ytInitialData) {
    return ytInitialData;
  } else {
    console.log("ytInitialData not found.");
    return null;
  }
};

const isYouTubeURL = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
};

const getYoutubeDownloadInfo = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      throw new Error("url required");
    }
    if (!isYouTubeURL(url)) {
      throw new Error("Invalid url.");
    }
    let id = "";

    if (url.indexOf("shorts") !== -1 || url.indexOf("youtu.be") !== -1) {
      const split = url.split("?");
      const t = split[0].split("/");
      id = t[t.length - 1];
    } else {
      const split = url.split("v=");
      id = split.length === 2 ? split[1] : "";
    }

    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    let title = "Youtube";
    let thumbnail = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    const keywords = $('meta[name="keywords"]').attr("content")
      ? $('meta[name="keywords"]').attr("content").split(", ")
      : [];

    const ytInitialData = await getytInitialData($);
    let related_videos = [];
    if (ytInitialData) {
      title =
        ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
          ?.contents[0].videoPrimaryInfoRenderer.title.runs[0].text;

      const df =
        ytInitialData?.contents?.twoColumnWatchNextResults?.secondaryResults
          ?.secondaryResults?.results;

      if (df) {
        df.map((item) => {
          if (item?.compactVideoRenderer) {
            const f = item.compactVideoRenderer;
            related_videos.push({
              id: f.videoId,
              title: f.title.simpleText,
              thumbnail: `https://i.ytimg.com/vi/${f.videoId}/maxresdefault.jpg`,
            });
          }
        });
      }
    }

    const info = {
      title,
      thumbnail,
      keywords,
      related_videos,
    };

    return res.status(200).send(info);
  } catch (e) {
    return res.status(200).send(`no data: ${e.message}`);
  }
};

const getProgressId = async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      throw new Error("url required");
    }
    if (url.indexOf("youtube") === -1 && url.indexOf("youtu.be") === -1) {
      throw new Error("Invalid url.");
    }
    const axiosUrl = `https://ab.cococococ.com/ajax/download.php?copyright=0&format=${format}&url=${ensureHttps(
      url
    )}?si=GgDJYw0ivOIY-5SG&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
    const { data } = await axios.get(axiosUrl);
    return res.status(200).send(data.id);
  } catch (e) {
    return res.status(200).send("no-data");
  }
};

const getProgressing = async (req, res) => {
  try {
    const { id } = req.query;

    if (
      id.includes("getProgress") ||
      id.includes("no-data") ||
      id.includes("no")
    ) {
      console.log(`${id}값이 잘못되어 다시 호출하지 않음`);
      return res.status(200).send({
        progress: 0,
        downloadUrl: null,
        message: "유튜브를 다시 다운로드 해주시길 바랍니다.",
      });
    }

    //  https://p.oceansaver.in/ajax/progress.php?id=FYD7PDosJ1XjiZoCud0JJuE
    const url = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
    const { data } = await axios.get(url);

    const a = {
      progress: data.progress,
      downloadUrl: data.download_url,
      message: "",
    };

    console.log(a);

    return res.status(200).send(a);
  } catch (e) {
    return res.status(200).send({
      progress: 0,
      downloadUrl: null,
      message: "유튜브를 다시 다운로드 해주시길 바랍니다.",
    });
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

const getSSYoutubeDownload = async (req, res) => {
  try {
    // console.log(123);
    // let formData = new FormData();
    // formData.append("videoURL", "https://www.youtube.com/watch?v=IKHJAGX1Jzg");

    // let config = {
    //   method: "post",
    //   maxBodyLength: Infinity,
    //   url: "https://ssyoutube.online/yt-video-detail/",
    //   headers: {
    //     Referer: "https://ssyoutube.online/ko/youtube-video-downloader-ko/",
    //     // ...formData.getHeaders(),
    //   },
    //   formData: formData,
    // };

    // const dd = await axios.request(config);
    // console.log(dd.data);

    const myHeaders = new Headers();
    myHeaders.append(
      "Referer",
      "https://ssyoutube.online/ko/youtube-video-downloader-ko/"
    );
    myHeaders.append("Host", "ssyoutube.online");

    const formdata = new FormData();
    formdata.append("videoURL", "https://www.youtube.com/watch?v=IKHJAGX1Jzg");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("https://ssyoutube.online/yt-video-detail/", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        fs.writeFile("./ttt.html", result, () => {});
      })
      .catch((error) => console.error(error));

    // const $ = cheerio.load(data);
    // const results = [];
    // console.log($(".list").html());

    // fs.writeFile("./ttt.html", $.html(), () => {
    //   console.log("done");
    // });
    // // console.log($(".list").html());
    // $(".list tbody tr").each((i, row) => {
    //   const $cells = $(row).find("td");

    //   // 예시 기준 (필요에 따라 인덱스 조정):
    //   // type → 첫 번째 열 (0)
    //   // size → 두 번째 열 (1)
    //   // downloadUrl → 세 번째 열 내부 <a href="">

    //   const type = $cells.eq(0).text().trim();
    //   const size = $cells.eq(1).text().trim();
    //   const downloadUrl = $cells.eq(2).find("button").attr("data-url");

    //   console.log(type, size, downloadUrl);
    //   if (type && size && downloadUrl) {
    //     results.push({
    //       type,
    //       size,
    //       downloadUrl,
    //     });
    //   }
    // });
    // console.log(results);
    return res.status(200).send({ success: "true", result: "11" });
  } catch (e) {
    return res.status(200).send({ status: "err", message: e.message });
  }
};

module.exports = {
  getYoutubeScript,
  getYoutubeDownloadInfo,
  getYoutubeJson,
  getProgressId,
  getProgressing,
  getSSYoutubeDownload,
};

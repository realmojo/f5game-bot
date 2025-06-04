const axios = require("axios");
// const ytdl = require("ytdl-core");
const ytdl = require("ytdl-core-discord");
const cheerio = require("cheerio");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");

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
    let thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
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

    const reUrl = `https://www.youtube.com/watch?v=${id}`;
    const { data } = await axios.get(reUrl);

    const $ = cheerio.load(data);

    let title = "Youtube";
    let thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const keywords = $('meta[name="keywords"]').attr("content")
      ? $('meta[name="keywords"]').attr("content").split(", ")
      : [];

    const ytInitialData = await getytInitialData($);

    // console.log(ytInitialData);
    // fs.writeFileSync(
    //   "./test.json",
    //   JSON.stringify(ytInitialData, null, 2),
    //   () => {}
    // );
    let related_videos = [];
    if (ytInitialData) {
      title = ytInitialData?.playerOverlays?.playerOverlayRenderer?.videoDetails
        ?.playerOverlayVideoDetailsRenderer?.title?.simpleText
        ? ytInitialData?.playerOverlays?.playerOverlayRenderer?.videoDetails
            ?.playerOverlayVideoDetailsRenderer?.title?.simpleText
        : ytInitialData?.contents?.twoColumnWatchNextResults?.results?.results
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
              thumbnail: `https://i.ytimg.com/vi/${f.videoId}/hqdefault.jpg`,
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

const getYoutubeDownloadListInfo = ($) => {
  const results = [];

  // 모든 script 태그 중에 audioUrl이 포함된 스크립트 찾기
  let audioUrl = null;
  let nonce = null;

  $("script").each((_, script) => {
    const scriptContent = $(script).html();
    const match = scriptContent.match(
      /const\s+audioUrl\s*=\s*['"]([^'"]+)['"]/
    );
    if (match) {
      audioUrl = match[1];
    }
    const nonceMatch = scriptContent.match(
      /['"]X-WP-Nonce['"]\s*:\s*['"]([a-zA-Z0-9]+)['"]/
    );
    if (nonceMatch) {
      nonce = nonceMatch[1];
    }
  });

  if (audioUrl) {
    console.log("🔊 Audio URL 추출 성공:", audioUrl);
  } else {
    console.log("❌ audioUrl을 찾을 수 없습니다.");
  }
  if (nonce) {
    console.log("🔊 nonce 추출 성공:", nonce);
  } else {
    console.log("❌ nonce을 찾을 수 없습니다.");
  }

  // 테이블 안의 각 행(tr)을 순회
  $("table.list tbody tr").each((_, tr) => {
    const $tr = $(tr);

    // 화질 (1번째 칼럼)
    const qualityText = $tr.find("td").eq(0).text().trim().replace(/\s+/g, " ");

    // 용량 (2번째 칼럼)
    const sizeText = $tr.find("td").eq(1).text().trim();

    // 다운로드 URL (3번째 칼럼 내 button 태그의 data-url)
    const downloadUrl = $tr.find("td").eq(2).find("button").attr("data-url");

    if (qualityText && sizeText && downloadUrl) {
      results.push({
        quality: qualityText,
        size: sizeText,
        url: downloadUrl,
      });
    }
  });

  return { results, audioUrl, nonce };
};

const getAjaxInfo = async (req, res) => {
  try {
    const { nonce, jsonBody } = req.body;

    const ajaxurl = "https://ssyoutube.online/wp-admin/admin-ajax.php";
    // 인증서 무시하는 https 에이전트 생성
    const agent = new https.Agent({
      rejectUnauthorized: false, // 인증서 검증 무시
    });

    const form = new FormData();
    form.append("action", "process_video_merge");
    form.append("nonce", nonce);
    form.append("request_data", JSON.stringify(jsonBody));

    const headers = {
      ...form.getHeaders(), // FormData용 Content-Type 자동 설정
      Referer: "https://ssyoutube.online/yt-video-detail/",
      Origin: "https://ssyoutube.online",
      Accept: "*/*",
      "Cache-Control": "no-cache",
      Host: "ssyoutube.online", // 이 값은 실제 요청 시 domain과 맞지 않아 오류가 날 수 있음
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "X-WP-Nonce": nonce,
      "Content-Type":
        "multipart/form-data; boundary=----WebKitFormBoundaryQPMbJAQBgBBCDgb3",
    };

    const { data } = await axios.post(ajaxurl, form, {
      headers,
      httpsAgent: agent,
    });

    return res.status(200).send({ success: "true", data });
  } catch (e) {
    return res.status(200).send({ status: "err", message: e.message });
  }
};

const getSSYoutubeDownload = async (req, res) => {
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
    // 인증서 무시하는 https 에이전트 생성
    const agent = new https.Agent({
      rejectUnauthorized: false, // 인증서 검증 무시
    });

    const form = new FormData();
    form.append("videoURL", reUrl);

    const headers = {
      ...form.getHeaders(), // FormData용 Content-Type 자동 설정
      Referer: "https://ssyoutube.online/ko/youtube-video-downloader-ko/",
      Origin: "https://ssyoutube.online",
      Accept: "*/*",
      "Cache-Control": "no-cache",
      Host: "ssyoutube.online", // 이 값은 실제 요청 시 domain과 맞지 않아 오류가 날 수 있음
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    };

    const { data } = await axios.post(
      "https://ssyoutube.online/yt-video-detail/",
      form,
      {
        headers,
        httpsAgent: agent,
      }
    );
    const $ = cheerio.load(data);

    const { results, audioUrl, nonce } = await getYoutubeDownloadListInfo($);

    return res.status(200).send({ success: "true", results, audioUrl, nonce });
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
  getAjaxInfo,
};

const axios = require("axios");

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
    items.push({
      time: item.transcriptSegmentRenderer.startTimeText.simpleText,
      text: item.transcriptSegmentRenderer.snippet.runs[0].text,
    });
    full += `${item.transcriptSegmentRenderer.snippet.runs[0].text} `;
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
      req.headers.referer !== "http://127.0.0.1:5173/"
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
  console.log(url);
  try {
    if (
      req.headers.referer !== "https://ss.f5game.co.kr/" &&
      req.headers.referer !== "http://127.0.0.1:5173/" &&
      req.headers.referer !== "http://localhost:5173/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }
    if (!url) {
      throw new Error("url required");
    }
    if (url.indexOf("youtube") === -1) {
      throw new Error("Invalid url.");
    }
    const { data } = await axios.get(url);

    const startIndex = data.indexOf("var ytInitialPlayerResponse") + 30;
    const endIndex = data.indexOf('<div id="player"') - 10 - startIndex;

    const filterString = data.substr(startIndex, endIndex);

    const json = JSON.parse(filterString);

    const filterFormatStremingData = json.streamingData.formats.filter(
      (item) => item.audioQuality
    );
    const filterAdaptiveStremingData =
      json.streamingData.adaptiveFormats.filter((item) => item.audioQuality);

    const filterData = filterFormatStremingData.concat(
      filterAdaptiveStremingData
    );

    const filterStreamingData = filterData.map((item) => {
      return {
        url: item.url,
        quality: item.quality,
        audioQuality: item.audioQuality,
        mimeType: item.mimeType.indexOf("mp4") !== -1 ? "MP4" : "MP3",
      };
    });

    const info = {
      title: json.videoDetails.title,
      second: json.videoDetails.lengthSeconds,
      thumbnail:
        json.videoDetails.thumbnail.thumbnails[
          json.videoDetails.thumbnail.thumbnails.length - 1
        ].url,
      urls: filterStreamingData,
    };
    return res.status(200).send(info);
  } catch (e) {
    return res.status(200).send({ status: "err", message: e.message });
  }
};

module.exports = {
  getYoutubeScript,
  getYoutubeDownloadInfo,
};

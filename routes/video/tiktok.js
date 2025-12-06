const { getQualityForBitrate } = require("../../utils/util");

const getTtChainToken = (response) => {
  const cookies = response.headers.get("set-cookie");

  if (!cookies) {
    return null;
  }

  // set-cookie 헤더는 여러 쿠키가 쉼표로 구분된 문자열
  // tt_chain_token=값; attributes 형식에서 값을 추출
  const match = cookies.match(/tt_chain_token=([^;]+)/);

  if (!match || !match[1]) {
    return null;
  }

  return match[1];
};

const getTiktokInfo = async (req, res) => {
  try {
    const url = req.query.url;
    const all = req.query.all === "true";

    if (!url) {
      return res.status(400).send({ error: "url required" });
    }

    const tiktokId = url.split("/")[url.split("/").length - 1];

    const response = await fetch(url);

    const ttChainToken = getTtChainToken(response);
    const html = await response.text();

    // __UNIVERSAL_DATA_FOR_REHYDRATION__ 스크립트 태그에서 JSON 추출
    const scriptRegex =
      /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)<\/script>/s;
    const match = html.match(scriptRegex);

    if (!match || !match[1]) {
      return res.status(200).send({
        error: "Could not find __UNIVERSAL_DATA_FOR_REHYDRATION__ script tag",
      });
    }

    try {
      // JSON 파싱
      const jsonData = JSON.parse(match[1]);
      const data = jsonData.__DEFAULT_SCOPE__["webapp.video-detail"];

      if (all) {
        return res.status(200).send(data);
      }

      // TikTok 데이터 추출
      const itemStruct = data?.itemInfo?.itemStruct || {};
      const author = itemStruct.author || {};
      const video = itemStruct.video || {};
      const stats = itemStruct.stats || {};

      // 사용자 정보 추출
      const rawUserName = author.nickname || "";
      // 이모지 제거
      const userName = rawUserName
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
        .replace(/[\u{2600}-\u{26FF}]/gu, "")
        .replace(/[\u{2700}-\u{27BF}]/gu, "")
        .replace(/[^\w\s]/g, "")
        .trim();
      const userScreenName = author.uniqueId || "";
      const userAvatar = author.avatarLarger || "";

      // 트윗 정보 추출
      const content = itemStruct.desc || "";
      const createdAt = itemStruct.createTime
        ? new Date(parseInt(itemStruct.createTime) * 1000).toISOString()
        : "";
      const thumbnail = video.cover || "";
      const favoriteCount = parseInt(stats.diggCount) || 0;
      const shareCount = parseInt(stats.shareCount) || 0;
      const replyCount = parseInt(stats.commentCount) || 0;
      const quoteCount = 0; // TikTok에는 quoteCount가 없음
      const viewCount = parseInt(stats.playCount) || 0;

      // 비디오 정보 추출
      let videoItems = [];
      if (video.bitrateInfo && Array.isArray(video.bitrateInfo)) {
        videoItems = video.bitrateInfo
          .filter(
            (item) => item.PlayAddr?.UrlList && item.PlayAddr.UrlList.length > 0
          )
          .map((item) => {
            const bitrate = item.Bitrate || 0;
            const url = item.PlayAddr.UrlList[0] || "";
            const content_type = video.format || "video/mp4";

            return {
              // ...item,
              url: encodeURIComponent(`${url}&tt_chain_token=${ttChainToken}`),
              content_type,
              bitrate: getQualityForBitrate(bitrate),
            };
          });
      }

      // X 형식과 동일하게 반환
      const result = {
        id: itemStruct.id || tiktokId,
        user: {
          name: userName,
          screenName: userScreenName,
          avatar: userAvatar,
        },
        content,
        thumbnail,
        videoItems,
        stats: {
          favoriteCount,
          shareCount,
          replyCount,
          quoteCount,
          viewCount: Number(viewCount),
        },
        createdAt,
        tt_chain_token: ttChainToken,
      };

      return res.status(200).send(result);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res
        .status(200)
        .send({ error: "Failed to parse JSON", message: parseError.message });
    }
  } catch (e) {
    console.log(e);
    return res.status(200).send({ error: "no data", message: e.message });
  }
};

const getTiktokDownload = async (req, res) => {
  try {
    const videoUrl = req.query.videoUrl;
    // o0gUlRcIBCokeAjdnJQAsLIDPCGfDk6rWec3co video url
    // http://localhost:3001/video/tiktok/download?videoUrl=https%3A%2F%2Fv19-webapp-prime.tiktok.com%2Fvideo%2Ftos%2Falisg%2Ftos-alisg-pve-0037c001%2Fo0gUlRcIBCokeAjdnJQAsLIDPCGfDk6rWec3co%2F%3Fa%3D1988%26bti%3DODszNWYuMDE6%26ch%3D0%26cr%3D3%26dr%3D0%26lr%3Dall%26cd%3D0%257C0%257C0%257C%26cv%3D1%26br%3D1554%26bt%3D777%26cs%3D2%26ds%3D3%26ft%3DytpHh9DfxxOusd.cfpjt8lcLVWOuRx_HFKKSCSf3YorsC2z7T%26mime_type%3Dvideo_mp4%26qs%3D14%26rc%3DcnF8b2hsc2d3SkBwaHIxaDFybndmOGllOjQ7aTVnODM4Z2c3ZUBpajM8c3M5cnhuNjMzODczNEBjRl5Nc3FePmJKYSNvYF90aHFmOiNgMTYtXzI2NS8xLTNfL2EvYSNvYm5uMmRzMDFhLS1kMTFzcw%253D%253D%26btag%3De000b0000%26expire%3D1765190345%26l%3D20251206183856B601FF83225C7FDC541B%26ply_type%3D2%26policy%3D2%26signature%3D138168f0faf2dc25c3795b6394004bb6%26tk%3Dtt_chain_token
    if (!videoUrl) {
      return res.status(400).send({ error: "videoUrl required" });
    }

    // videoUrl 파라미터 분리
    const videoUrlParams = new URL(videoUrl);
    const baseUrl = `${videoUrlParams.origin}${videoUrlParams.pathname}`;
    const expire = videoUrlParams.searchParams.get("expire");
    const l = videoUrlParams.searchParams.get("l");
    const policy = videoUrlParams.searchParams.get("policy");
    const signature = videoUrlParams.searchParams.get("signature");
    const tk = videoUrlParams.searchParams.get("tk");
    const tt_chain_token = videoUrlParams.searchParams
      .get("tt_chain_token")
      .replaceAll(" ", "+");

    // URL 파라미터들을 개별 변수로 분리
    // const baseUrl =
    //   "https://v16-webapp-prime.tiktok.com/video/tos/alisg/tos-alisg-pve-0037c001/owiKZCy0lA9UA9CQi7m9UIpAudvfEWlICmkwIB/";
    // const a = "1988"; // 필요없고
    // const bti = "ODszNWYuMDE6"; // 필요없고
    // const ch = "0"; // 필요없고
    // const cr = "3"; // 필요없고
    // const dr = "0"; // 필요없고
    // const lr = "all"; // 필요없고
    // const cd = "0|0|0|"; // 필요없고
    // const cv = "1"; // 필요없고
    // const br = "1062"; // 필요없고
    // const bt = "531"; // 필요없고
    // const cs = "2"; // 필요없고
    // const ds = "3"; // 필요없고
    // const ft = "-Csk_mfMPD12NOpjMd-UxBM5XY6e3wv25AcAp"; // 필요없고
    // const mime_type = "video_mp4"; // 필요없고
    // const qs = "14"; // 필요없고
    // const rc =
    //   "aTxlNzk2ODc5OTk2aGllZ0BpM3dvPHU5cjR0NzMzODczNEA1LzYtMzEwXzAxNC80LTYwYSNmNmhnMmRjXmthLS1kMWBzcw=="; // 필요없고
    // const btag = "e00088000"; // 필요없고
    // const expire = "1765200171";
    // const l = "20251206212218D38D3827B22660ED24C7";
    // const ply_type = "2"; // 필요없고
    // const policy = "2";
    // const signature = "117975126d6df8683b8427899dfcdd73";
    // const tk = "tt_chain_token";

    // URL 조합
    // 아래 파라미터는 쿠키 값을 사용해야 함
    // expire, l, policy, signature, tk 5개의 값과  tt_chain_token 값을 비교함
    const TIKTOK_VIDEO_URL = `${baseUrl}?expire=${expire}&l=${l}&policy=${policy}&signature=${signature}&tk=${tk}`;

    // 쿠키 값들을 개별 변수로 분리
    // const tt_csrf_token = "";
    // const tt_chain_token = tt_chain_token;
    // const odin_tt = "";
    // const ttwid = "";
    // const msToken = "";

    // 쿠키 문자열 조합
    // const TIKTOK_COOKIE = `tt_csrf_token=${tt_csrf_token}; tt_chain_token=${tt_chain_token}; odin_tt=${odin_tt}; ttwid=${ttwid}; msToken=${msToken}`;
    const TIKTOK_COOKIE = `tt_chain_token=${tt_chain_token};`;

    console.log("TIKTOK_COOKIE: ", TIKTOK_COOKIE);
    console.log("TIKTOK_VIDEO_URL: ", TIKTOK_VIDEO_URL);
    const response = await fetch(TIKTOK_VIDEO_URL, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        cookie: TIKTOK_COOKIE,
        origin: "https://www.tiktok.com",
        pragma: "no-cache",
        priority: "u=1, i",
        referer: "https://www.tiktok.com/",
        "sec-ch-ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      },
    });

    // 비디오 파일이므로 바이너리 데이터로 처리
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "video/mp4"
    );
    res.setHeader("Content-Length", buffer.length);
    return res.send(buffer);
  } catch (e) {
    console.log(e);
    return res.status(200).send({ error: "no data", message: e.message });
  }
};
module.exports = {
  getTiktokInfo,
  getTiktokDownload,
};

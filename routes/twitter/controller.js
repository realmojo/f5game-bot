const axios = require("axios");
const twitterServerURL = "http://115.85.182.17";

const getTwitterVideos = async (req, res) => {
  try {
    if (
      req.headers.referer !== "https://twitterdownload.f5game.co.kr/" &&
      req.headers.referer !== "http://127.0.0.1:5173/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }

    const { url } = req.query;
    const { data } = await axios.get(`${twitterServerURL}/videos?url=${url}`);
    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

const getTwitterTrends = async (req, res) => {
  try {
    const url = `https://twitter.com/i/api/2/guide.json?include_profile_interstitial_type=1&include_blocking=1&include_blocked_by=1&include_followed_by=1&include_want_retweets=1&include_mute_edge=1&include_can_dm=1&include_can_media_tag=1&include_ext_has_nft_avatar=1&include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&skip_status=1&cards_platform=Web-12&include_cards=1&include_ext_alt_text=true&include_ext_limited_action_results=true&include_quote_count=true&include_reply_count=1&tweet_mode=extended&include_ext_views=true&include_entities=true&include_user_entities=true&include_ext_media_color=true&include_ext_media_availability=true&include_ext_sensitive_media_warning=true&include_ext_trusted_friends_metadata=true&send_error_codes=true&simple_quoted_tweet=true&count=20&requestContext=launch&candidate_source=trends&include_page_configuration=false&entity_tokens=false&ext=mediaStats%2ChighlightedLabel%2ChasNftAvatar%2CvoiceInfo%2CbirdwatchPivot%2CsuperFollowMetadata%2CunmentionInfo%2CeditControl`;
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
        "X-Csrf-Token":
          "3eea7decccc6ad80c1c6448bfbfdbb37b971ef8107a444762d1c7bae815afb5004ad4470c7b4bec7c80c42f044007a03d731057a3391b09a77b40a523fa2ac6762a3104705d1918f861ba569532ef913",
        Cookie:
          '_ga=GA1.2.389820050.1695648054; g_state={"i_l":0}; guest_id=v1%3A169669349691734041; kdt=po4jBS5AhZgJ9cjzS6bxDLT3RgDmuD4dsFyPoUDI; auth_token=7513db1692d84a23cacaa4777b0ec0c86f73a3e2; ct0=3eea7decccc6ad80c1c6448bfbfdbb37b971ef8107a444762d1c7bae815afb5004ad4470c7b4bec7c80c42f044007a03d731057a3391b09a77b40a523fa2ac6762a3104705d1918f861ba569532ef913; guest_id_ads=v1%3A169669349691734041; guest_id_marketing=v1%3A169669349691734041; twid=u%3D1486249437466750977; lang=ko; _gid=GA1.2.1121373731.1699533732; personalization_id="v1_LOo150anV+jrYw/K3vfh4Q=="',
      },
    });

    const d =
      data.timeline.instructions[1].addEntries.entries[1].content.timelineModule
        .items;

    const f = [];
    for (const item of d) {
      let name = item.item.content.trend.name.replace("#", "");
      name = name.replace("_", "");
      name = name.replace("_", "");
      name = name.replace("_", "");
      name = name.replace(" ", "");
      name = name.replace(" ", "");
      name = name.replace(" ", "");
      f.push(name);
    }

    return res.status(200).send(f);
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

module.exports = {
  getTwitterVideos,
  getTwitterTrends,
};

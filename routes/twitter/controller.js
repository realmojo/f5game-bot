const axios = require("axios");
const getTwitterVideos = async (req, res) => {
  try {
    const { url } = req.query;
    if (
      req.headers.referer !== "https://twitterdownload.f5game.co.kr/" &&
      req.headers.referer !== "https://f5game.co.kr/" &&
      req.headers.referer !== "http://127.0.0.1:5173/" &&
      req.headers.referer !== "http://localhost:5173/" &&
      req.headers.referer !== "http://localhost:3000/"
    ) {
      return res.status(200).send({ message: "no hack" });
    }

    const f = url.split("/");
    const tweetId = f[f.length - 1];

    const durl = `https://twitter.com/i/api/graphql/BbmLpxKh8rX8LNe2LhVujA/TweetDetail?variables=%7B%22focalTweetId%22%3A%22${tweetId}%22%2C%22with_rux_injections%22%3Afalse%2C%22includePromotedContent%22%3Atrue%2C%22withCommunity%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withBirdwatchNotes%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_home_pinned_timelines_enabled%22%3Atrue%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22tweetypie_unmention_optimization_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Afalse%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_media_download_video_enabled%22%3Afalse%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticleRichContentState%22%3Afalse%7D`;

    const { data } = await axios.get(durl, {
      headers: {
        Authorization: `Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA`,
        "X-Csrf-Token":
          "edaca42391b50c201c2cd879b2a0dbf7a448e0dbc22b60d54749af5539f97016eeaa16605321fb8b6a7ca7c1201cd5fafe391f9e4ad535421fe3d87db59e5604a2e2ba590950d27f45ef083776541ba0",
        Cookie:
          'guest_id=v1%3A167158975189415270; auth_token=22a34bbb7d986487072a6db3bd24a51562c742be; twid=u%3D1486249437466750977; guest_id_marketing=v1%3A167158975189415270; guest_id_ads=v1%3A167158975189415270; ct0=edaca42391b50c201c2cd879b2a0dbf7a448e0dbc22b60d54749af5539f97016eeaa16605321fb8b6a7ca7c1201cd5fafe391f9e4ad535421fe3d87db59e5604a2e2ba590950d27f45ef083776541ba0; _ga=GA1.2.566592255.1691995485; lang=ko; external_referer=padhuUp37zjgzgv1mFWxJ12Ozwit7owX|0|8e8t2xd8A2w%3D; _gid=GA1.2.1890311150.1699575784; personalization_id="v1_2jTNbFUL0z9s7Wdn8JmiSA=="',
      },
    });
    const a =
      data.data.threaded_conversation_with_injections_v2.instructions[0]
        .entries[0].content.itemContent.tweet_results.result.legacy.entities
        .media[0].video_info.variants;
    const content =
      data.data.threaded_conversation_with_injections_v2.instructions[0]
        .entries[0].content.itemContent.tweet_results.result.legacy.full_text;
    const filter = a.filter((item) => item.bitrate);
    const filterMap = filter.map((item) => {
      return {
        ...item,
        value: item.url,
        label: `${item.bitrate} / ${item.content_type}`,
      };
    });

    const thumbnail =
      data.data.threaded_conversation_with_injections_v2.instructions[0]
        .entries[0].content.itemContent.tweet_results.result.legacy
        .extended_entities.media[0].media_url_https;

    const t = {
      content,
      thumbnail,
      videoItems: filterMap,
    };

    return res.status(200).send(t);
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

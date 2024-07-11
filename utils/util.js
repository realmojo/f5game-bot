const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

const convertSecondsToMMSS = (seconds) => {
  // Check if the input is a valid number
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Pad minutes and seconds with leading zeros if necessary
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the result as a formatted string
  return `${paddedMinutes}:${paddedSeconds}`;
};

// bitrate -> p 변환 트위터에서 사용
const getQualityForBitrate = (bitrate) => {
  if (bitrate <= 150 * 1024) {
    return "144p";
  } else if (bitrate <= 432 * 1024) {
    return "240p";
  } else if (bitrate <= 832 * 1024) {
    return "360p";
  } else if (bitrate <= 2.5 * 1024 * 1024) {
    return "480p";
  } else if (bitrate <= 5 * 1024 * 1024) {
    return "720p";
  } else if (bitrate <= 8 * 1024 * 1024) {
    return "1080p";
  } else {
    return "4K";
  }
};

const ensureHttps = (url) => {
  if (!url.startsWith("https://")) {
    if (url.startsWith("http://")) {
      url = "https://" + url.substring(7);
    } else {
      url = "https://" + url;
    }
  }
  url = replaceAll(url, "www.", "");
  return url;
};

module.exports = {
  replaceAll,
  convertSecondsToMMSS,
  getQualityForBitrate,
  ensureHttps,
};

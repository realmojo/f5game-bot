const axios = require("axios");
const AWS = require("aws-sdk");
const path = require("path");
const moment = require("moment");

// AWS S3 설정
const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_SECRET_KEY,
  region: "ap-northeast-2",
});

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

// 이미지 다운로드 및 S3 업로드 함수
const uploadImageToS3 = async (
  imageUrl,
  bucketName = "techtoktok",
  fileName
) => {
  try {
    // fileName = path.basename(imageUrl);
    // 이미지 URL에서 데이터 다운로드
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const fileContent = Buffer.from(response.data, "binary");

    // S3에 파일 업로드
    const params = {
      Bucket: bucketName,
      Key: fileName, // S3에 저장될 파일명
      Body: fileContent,
      ContentType: response.headers["content-type"], // 컨텐츠 타입을 설정 (예: 'image/jpeg')
    };

    const data = await s3.upload(params).promise();
    return data.Location; // 업로드된 파일의 URL 반환
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    // 0부터 i까지의 무작위 인덱스를 선택
    const j = Math.floor(Math.random() * (i + 1));
    // 배열 요소 교환
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

module.exports = {
  replaceAll,
  convertSecondsToMMSS,
  getQualityForBitrate,
  ensureHttps,
  delay,
  uploadImageToS3,
  shuffle,
};

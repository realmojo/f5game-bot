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
module.exports = {
  replaceAll,
  convertSecondsToMMSS,
};

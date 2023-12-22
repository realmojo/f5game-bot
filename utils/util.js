const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};
module.exports = {
  replaceAll,
};

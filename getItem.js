const url = location.href;

let title = "";
let content = "";

if (url.includes("theqoo") !== -1) {
  title = document.getElementsByClassName("title")[0].innerText;
  content = document.getElementsByTagName("article")[0].innerText;
}

return {
  title,
  content,
};

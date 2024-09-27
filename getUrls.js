const titles = document.querySelectorAll("#au_board_list > tr > .title > a");
const urls = [];
titles.forEach((item) => {
  urls.push(item.href);
});
return urls;

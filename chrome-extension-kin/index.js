const getKeywords = async (keyword) => {
  const response = await fetch(
    `https://f5game-bot.herokuapp.com/naver/list?keyword=${keyword}`
  );
  if (response.ok) {
    return response.json();
  } else {
    return "";
  }
};

const setLiHtml = (items) => {
  let liHtml =
    '<tr><td style="padding: 4px 0; border-bottom: 1px solid #ddd">검색어</td><td style="border-bottom: 1px solid #ddd">PC</td><td style="border-bottom: 1px solid #ddd">Mobile</td><td style="border-bottom: 1px solid #ddd">클릭률</td></tr>';

  for (const item of items) {
    const url = `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=${encodeURIComponent(
      item.keyword
    )}`;
    liHtml += `<tr><td style="padding: 3px 0;"><a href="${url}" style="color: #55a13b">${item.keyword}</a></td><td>${item.pc}</td><td>${item.mobile}</td><td>${item.mobileCtr}</td></tr>`;
  }

  let html = `<div style="padding: 19px 19px 16px"><table style="width: 100%;"><tbody>${liHtml}</tbody></table></div>`;
  return html;
};

const setPreviewHtml = (keyword) => {
  let html = `<section class="sc_new sp_related" id="nx_right_related_count_keywords">
    <div class="api_subject_bx _related_box">
        <div id="keyword-egg" class="mod_title_area">
            <div class="title_wrap">
                <h2 class="title">[${keyword}] 연관 검색어 카운트</h2>
            </div>
        </div>
    </div>
  
    </section>`;

  document.getElementById("sub_pack").insertAdjacentHTML("afterbegin", html);
};

const setHtml = (items) => {
  document
    .getElementById("keyword-egg")
    .insertAdjacentHTML("afterend", setLiHtml(items));
};

const run = async () => {
  console.log(123123123);
  console.log(chrome);
  chrome.cookies.get(
    {
      url: "https://naver.com",
      name: "NID_AUT",
    },
    function (cookie) {
      if (cookie) {
        console.log("쿠키 값:", cookie.value);
      } else {
        console.log("쿠키를 찾을 수 없습니다.");
      }
    }
  );
  // const url = location.href;
  // if (url.indexOf('https://search.naver.com/search.naver') !== -1) {
  //   const keyword = document.getElementsByName('oquery')[0].value;
  //   setPreviewHtml(keyword);
  //   const items = await getKeywords(keyword);

  //   if (items.items.length > 0) {
  //     const d = items.items.slice(0, 50);
  //     setHtml(d);
  //   }
  // }
};

run();

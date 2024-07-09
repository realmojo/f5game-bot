const init = () => {
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js";
  head.appendChild(script);
  var script1 = document.createElement("script");
  script1.type = "text/javascript";
  script1.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
  head.appendChild(script1);
};

const updateImageSrc = () => {
  // rd_body 클래스를 가진 요소를 선택
  const rdBodyElements = document.querySelectorAll(".rd_body");

  // 각 rd_body 요소를 순회
  rdBodyElements.forEach(function (element) {
    // rd_body 요소 안의 모든 img 태그를 선택
    const imgElements = element.querySelectorAll("img");

    // 각 img 태그의 src 속성을 새로운 URL로 변경
    imgElements.forEach(function (img) {
      img.src = `https://f5game-bot.herokuapp.com/techupbox/proxy?url=${img.src}`;
    });
  });
};

const loadAllImages = () => {
  const images = Array.from(document.querySelectorAll("img"));
  const promises = images.map((img) => {
    return new Promise((resolve, reject) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = reject;
      }
    });
  });
  return Promise.all(promises);
};

setTimeout(() => {
  init();
  updateImageSrc();

  console.log("이미지 다운로드");
  loadAllImages()
    .then(() => {
      html2canvas(document.getElementsByTagName("article")[0], {
        useCORS: true,
        proxy: "https://f5game-bot.herokuapp.com/techupbox/proxy",
      }).then((canvas) => {
        document.body.appendChild(canvas);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "capture.png";
        link.click();
      });
    })
    .catch((error) => {
      console.error("Error loading images:", error);
    });
}, 2000);

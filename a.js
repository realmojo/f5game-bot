// ==UserScript==
// @name         네이버 지식인 자동화
// @namespace    http://tampermonkey.net/
// @version      2024-09-23
// @description  try to take over the world!
// @author       You
// @match        https://kin.naver.com/qna/detail*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

// var token = "";
// var mdu = "";
// var tempField = "";
// var userId = "";
// var NID_AUT = "";
// var NID_SES = "";
// var fetchRetry = 0;
var kinGlobalItem = {
  token: "",
  mdu: "",
  tempField: "",
  userId: "",
  NID_AUT: "",
  NID_SES: "",
  fetchRetry: 0,
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const loadingText = (text) => {
  const answerHtml = document.getElementById("doAnswer");
  answerHtml.innerHTML = text;
  document.title = text;
  console.log(text);
};

const generateSEId = () => {
  // crypto.randomUUID()를 사용하여 UUID 생성
  const uuid = crypto.randomUUID();
  return `SE-${uuid}`;
};

const getQueryParam = (key) => {
  const urlParams = new URLSearchParams(window.location.search);
  const values = urlParams.getAll(key);

  if (values.length === 0) {
    return null; // 키에 해당하는 매개변수가 없는 경우
  } else if (values.length === 1) {
    return values[0]; // 하나의 값만 있는 경우
  } else {
    return values; // 여러 개의 값이 있는 경우 배열로 반환
  }
};

const getKinTitle = () => {
  // endTitleSection 요소 선택
  const endTitleSection = document.querySelector(".endTitleSection");

  if (!endTitleSection) {
    console.warn("endTitleSection 클래스를 가진 요소를 찾을 수 없습니다.");
    return "";
  }

  // iconQuestion 요소 선택
  const iconQuestion = endTitleSection.querySelector(".iconQuestion");

  if (iconQuestion) {
    // iconQuestion 요소 제거
    iconQuestion.remove();
  } else {
    console.warn(
      "iconQuestion 클래스를 가진 요소를 endTitleSection 내에서 찾을 수 없습니다."
    );
  }

  // 남은 텍스트 추출 (공백을 제거하기 위해 trim 사용)
  const text = endTitleSection.textContent.trim();

  return text;
};

const mergeComponent = (ogLinkItem, componentJson) => {
  componentJson.push({
    id: generateSEId(),
    layout: "large_image",
    title: ogLinkItem.oglink.summary.title,
    domain: ogLinkItem.oglink.summary.domain,
    link: ogLinkItem.oglink.url,
    thumbnail: {
      src: ogLinkItem.oglink.summary.image.url,
      width: ogLinkItem.oglink.summary.image.width,
      height: ogLinkItem.oglink.summary.image.height,
      "@ctype": "thumbnail",
    },
    description: ogLinkItem.oglink.summary.description,
    video: false,
    oglinkSign: ogLinkItem.oglinkSign,
    "@ctype": "oglink",
  });
  let json = {
    document: {
      version: "2.5.0",
      theme: "default",
      language: "ko-KR",
      components: componentJson,
    },
    documentId: "",
  };
  return json;
};

const registerAnswerForSmartEditorOne = (mergeJson) => {
  return new Promise((resolve) => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Cookie",
      `NID_AUT=${kinGlobalItem.NID_AUT}; NID_SES=${kinGlobalItem.NID_SES}`
    );

    const formdata = new FormData();
    formdata.append("clientAppCode", "kinpc001");
    formdata.append("dirId", getQueryParam("dirId"));
    formdata.append("docId", getQueryParam("docId"));
    formdata.append("svc", "KIN");
    formdata.append("title", getKinTitle());
    formdata.append("documentJson", JSON.stringify(mergeJson));
    formdata.append("openYn", "Y");
    formdata.append("rssYn", "Y");
    formdata.append("inputDevice", "PC");
    formdata.append("tempField", kinGlobalItem.tempField);
    formdata.append("mdu", kinGlobalItem.mdu);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      "https://kin.naver.com/ajax/detail/registerAnswerForSmartEditorOne.naver",
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => {
        resolve("ok");
      })
      .catch((error) => console.error(error));
  });
};

var countdownInterval = null;

const updateCountdownDisplay = (seconds) => {
  const countdownText = `캡챠 걸림 ${seconds}초 대기`;
  document.title = countdownText;
};

const startCountdown = (seconds) => {
  // 기존에 실행 중인 타이머가 있다면 중지
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  let remaining = seconds;

  // 초기 타이틀 및 화면 표시 설정
  updateCountdownDisplay(remaining);

  // 카운트다운 시작
  countdownInterval = setInterval(() => {
    remaining--;

    if (remaining > 0) {
      updateCountdownDisplay(remaining);
    } else {
      // 타이머가 끝나면 타이틀 및 화면 표시를 기본 상태로 복원하고 타이머 중지
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }, 1000);
};

const createKinContent = async (NID_AUT, NID_SES) => {
  const answerHtml = document.getElementById("doAnswer");

  const { title, description, content, answer, techupboxUrl } =
    await getGenerateContent();
  const { qrLink } = await getQRLink(techupboxUrl, NID_AUT, NID_SES);
  const ogLinkItem = await getOgLink(qrLink);

  const desciptionHtml = description
    ? `[질문]<br/>${description}<br/><br/>`
    : "";
  const finalAnswer = `${desciptionHtml}[답변]<br/>${
    answer ? answer.trim() : ""
  }`;

  const componentJson = await getComponentJson(finalAnswer);
  const mergeJson = mergeComponent(ogLinkItem, componentJson);

  document.title = "지식인 답변 생성 완료";
  answerHtml.innerHTML = `${finalAnswer}<br/>${qrLink}`;

  while (1) {
    const captcha = await getIssueCaptcha();
    if (captcha.result.result.captcha === null) {
      loadingText("지식인 자동 포스팅 등록");
      await registerAnswerForSmartEditorOne(mergeJson);
      window.close();
    } else {
      document.title = "캡챠 걸림 60초 대기";
      startCountdown(30);
    }
    await delay(30000);
  }
};

const setButtonHtml = (NID_AUT, NID_SES, message = "") => {
  const buttonHtml = `<div class="asideMenu" style="width: 100%; margin-bottom: 10px;">
	<button type="button" class="asideMenuItem _notification_toggle_button" aria-current="false" id="doKinCreate" aria-controls="notificationLayer">
	<span class="asideMenuItem__text">
		지식인 답변 만들기
	</span>
	</button>
    <button type="button" class="asideMenuItem _notification_toggle_button" aria-current="false" id="copyContent" aria-controls="notificationLayer">
	<span class="asideMenuItem__text">
		내용복사
	</span>
	</button>
</div>
<div class="asideMenu" id="doAnswer" style="width: 100%; margin-bottom: 10px; padding: 20px; color: #333;
    font-size: 17px;
    line-height: 27px;
    letter-spacing: -0.3px;
    word-break: break-all;
    word-wrap: break-word;">${message ? message : "답변 나오는 곳"} </div>`;

  document
    .querySelector(".qna_answer_editor")
    .insertAdjacentHTML("beforebegin", buttonHtml);

  const createButton = document.getElementById("doKinCreate");
  const copyButton = document.getElementById("copyContent");

  createButton.addEventListener("click", () => {
    createKinContent(NID_AUT, NID_SES);
  });

  copyButton.addEventListener("click", async () => {
    const element = document.getElementById("doAnswer"); // 해당 id의 요소를 찾음
    if (element) {
      const htmlWithLineBreaks = element.innerHTML.replace(
        /<br\s*\/?>/gi,
        "\n"
      );
      navigator.clipboard
        .writeText(htmlWithLineBreaks)
        .then(() => {})
        .catch((err) => {
          console.error("텍스트 복사 실패:", err);
        });
    } else {
      return null; // 요소가 없으면 null 반환
    }
  });
};

const setButtonHtml2 = (NID_AUT, NID_SES) => {
  const buttonHtml1 =
    '<div class="endSaveButton" style="margin-right: 4px;"><button id="doKinCreate2" class="saveButton _answerRegisterButton" style="padding: 8px 16px;">답변 생성</button></div>';
  const buttonHtml2 =
    '<div class="endSaveButton" style="margin-right: 10px;"><button id="copyContent2" class="saveButton _answerRegisterButton" style="padding: 8px 16px;">내용 복사</button></div>';

  document
    .querySelector("#answerButtonArea")
    .insertAdjacentHTML("afterbegin", buttonHtml2);
  document
    .querySelector("#answerButtonArea")
    .insertAdjacentHTML("afterbegin", buttonHtml1);

  const createButton = document.getElementById("doKinCreate2");
  const copyButton = document.getElementById("copyContent2");

  createButton.addEventListener("click", async () => {
    createButton.textContent = "답변 생성 중...";
    await createKinContent(NID_AUT, NID_SES);
    createButton.textContent = "생성 완료";
  });

  copyButton.addEventListener("click", async () => {
    const element = document.getElementById("doAnswer"); // 해당 id의 요소를 찾음
    if (element) {
      const htmlWithLineBreaks = element.innerHTML.replace(
        /<br\s*\/?>/gi,
        "\n"
      );
      navigator.clipboard
        .writeText(htmlWithLineBreaks)
        .then(() => {})
        .catch((err) => {
          console.error("텍스트 복사 실패:", err);
        });
    } else {
      return null; // 요소가 없으면 null 반환
    }
  });
};

const getGenerateContent = async () => {
  loadingText("지식인 답변 생성 중...");
  if (kinGlobalItem.fetchRetry < 3) {
    return new Promise((resolve) => {
      fetch("https://f5game-bot.vercel.app/techupbox/doGenerateContent", {
        method: "POST", // POST 메서드 사용
        headers: {
          "Content-Type": "application/json", // JSON 데이터 전송
        },
        body: JSON.stringify({
          kinUrl: location.href, // 보낼 데이터
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("네트워크 응답에 문제가 있습니다.");
          }
          return response.json(); // 응답이 JSON 형식일 경우
        })
        .then((data) => {
          loadingText("지식인 답변 콘텐츠 생성 완료");
          resolve(data.item);
        })
        .catch((error) => {
          kinGlobalItem.fetchRetry++;
          loadingText(
            `오류가 나서 지식인 답변 재실행 - ${kinGlobalItem.fetchRetry}`
          );
          getGenerateContent();
          console.error("오류 발생:", error);
        });
    });
  }
};

const getQRLink = async (link, NID_AUT, NID_SES) => {
  loadingText("QR 코드 생성 중..");
  if (kinGlobalItem.fetchRetry < 3) {
    return new Promise((resolve) => {
      fetch("https://f5game-bot.vercel.app/techupbox/getQrLink", {
        method: "POST", // POST 메서드 사용
        headers: {
          "Content-Type": "application/json", // JSON 데이터 전송
        },
        body: JSON.stringify({
          link: link, // 보낼 데이터
          NID_AUT: NID_AUT, // 보낼 데이터
          NID_SES: NID_SES, // 보낼 데이터
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("네트워크 응답에 문제가 있습니다.");
          }
          return response.json(); // 응답이 JSON 형식일 경우
        })
        .then((data) => {
          loadingText("QR 코드 생성 완료");
          resolve(data.item);
        })
        .catch((error) => {
          kinGlobalItem.fetchRetry++;
          loadingText(
            `오류가 나서 QR 코드 생성 재실행 - ${kinGlobalItem.fetchRetry}`
          );
          getQRLink(link, NID_AUT, NID_SES);
          console.error("오류 발생:", error);
        });
    });
  }
};

const getNaverLocalstorage = () => {
  kinGlobalItem.NID_AUT = localStorage.getItem("NID_AUT") || "";
  kinGlobalItem.NID_SES = localStorage.getItem("NID_SES") || "";
};

const getRegisterFormData = async () => {
  kinGlobalItem.userId =
    document.querySelector(".gnb_mail_address").textContent.split("@")[0] || "";

  const dirId = getQueryParam("dirId");
  const docId = getQueryParam("docId");
  const url = `https://kin.naver.com/ajax/detail/getAnswerRegisterFormData.naver?clientAppCode=kinpc001&dirId=${dirId}&docId=${docId}`;

  const response = await fetch(url);

  const item = await response.json();

  if (item?.errorMsg) {
    return {
      mdu: "",
      token: "",
      tempField: "",
    };
  } else {
    kinGlobalItem.mdu = item.result.formData.mdu;
    kinGlobalItem.token = item.result.token;
    kinGlobalItem.tempField =
      item.result.formData.answerRegisterResult.encryptUserId;
    return {
      mdu: item.result.formData.mdu,
      token: item.result.token,
      tempField: item.result.formData.answerRegisterResult.encryptUserId,
    };
  }
};

const getComponentJson = async (content) => {
  loadingText("edtior components를 가져옵니다.");
  return new Promise((resolve) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = content;

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `https://upconvert.editor.naver.com/kin/html/components?documentWidth=700&userId=${kinGlobalItem.userId}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => console.error(error));
  });
};

const getOgLink = async (url) => {
  loadingText("oglink를 가져옵니다.");
  return new Promise((resolve) => {
    const myHeaders = new Headers();
    myHeaders.append("se-authorization", kinGlobalItem.token);
    myHeaders.append("referer", location.href);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://platform.editor.naver.com/api/kinpc001/v1/oglink?url=${encodeURIComponent(
        url
      )}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => console.error(error));
  });
};

const getIssueCaptcha = async () => {
  return new Promise((resolve) => {
    const myHeaders = new Headers();
    myHeaders.append("referer", location.href);
    myHeaders.append(
      "Cookie",
      `NID_AUT=${kinGlobalItem.NID_AUT}; NID_SES=${kinGlobalItem.NID_SES}"`
    );

    const formdata = new FormData();
    formdata.append("dummy", "53");
    formdata.append("mode", "ANSWER");
    formdata.append("isRefresh", "false");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch(
      "https://kin.naver.com/ajax/editor/issueCaptcha.naver",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => console.error(error));
  });
};

(async function () {
  "use strict";
  await delay(1000);
  await getRegisterFormData();
  await getNaverLocalstorage();

  console.log("mdu:", kinGlobalItem.mdu);
  console.log("token:", kinGlobalItem.token);
  console.log("tempField:", kinGlobalItem.tempField);
  console.log("userId:", kinGlobalItem.userId);
  console.log("NID_AUT:", kinGlobalItem.NID_AUT);
  console.log("NID_SES:", kinGlobalItem.NID_SES);

  if (
    !kinGlobalItem.mdu ||
    !kinGlobalItem.token ||
    !kinGlobalItem.tempField ||
    !kinGlobalItem.userId ||
    !kinGlobalItem.NID_AUT ||
    !kinGlobalItem.NID_SES
  ) {
    setButtonHtml(
      kinGlobalItem.NID_AUT,
      kinGlobalItem.NID_SES,
      "값을 체크하세요"
    );
  } else {
    setButtonHtml(kinGlobalItem.NID_AUT, kinGlobalItem.NID_SES);
  }

  setTimeout(async () => {
    document.querySelector(".endAnswerButton").click();
    await delay(500);
    setButtonHtml2(kinGlobalItem.NID_AUT, kinGlobalItem.NID_SES);
  }, 500);
})();

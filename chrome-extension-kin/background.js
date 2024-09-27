const setNaverCookie = async (CURRENT_ID, NID_AUT, NID_SES) => {
  try {
    const data = {
      CURRENT_ID,
      NID_AUT,
      NID_SES,
    };

    const response = await fetch(
      "https://f5game-bot.vercel.app/techupbox/setNaverCookie",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  } catch (e) {
    console.log("실패: ", e);
  }
};

const run = async () => {
  // setInterval(async () => {
  const NID_AUT = await chrome.cookies.get({
    url: "https://naver.com",
    name: "NID_AUT",
  });
  const NID_SES = await chrome.cookies.get({
    url: "https://naver.com",
    name: "NID_SES",
  });
  const CurrentId = await chrome.cookies.get({
    url: "https://kin.naver.com",
    name: "currentId",
  });
  console.log("NID_AUT", NID_AUT.value);
  console.log("NID_SES", NID_SES.value);
  console.log("CurrentId", CurrentId.value);
  const d = await setNaverCookie(CurrentId.value, NID_AUT.value, NID_SES.value);
  console.log(d);
  // }, 10000);
};

// 예제 사용

run();

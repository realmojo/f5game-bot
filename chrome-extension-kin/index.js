const getNaverCookie = async () => {
  try {
    const response = await fetch(
      "https://f5game-bot.vercel.app/techupbox/getNaverCookie"
    );
    return response.json();
  } catch (e) {
    console.log("실패: ", e);
  }
};

const run = async () => {
  const { item } = await getNaverCookie();

  localStorage.setItem("NID_AUT", item.NID_AUT);
  localStorage.setItem("NID_SES", item.NID_SES);
};

run();

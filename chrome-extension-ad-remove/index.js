// const getNaverCookie = async () => {
//   try {
//     const response = await fetch("https://api.mindpang.com/api/");
//     return response.json();
//   } catch (e) {
//     console.log("실패: ", e);
//   }
// };

// const run = async () => {
//   // const { item } = await getNaverCookie();
//   // localStorage.setItem("NID_AUT", item.NID_AUT);
//   // localStorage.setItem("NID_SES", item.NID_SES);
// };

// run();

const getNaverRemove = () => {
  const naverItems = [
    {
      selector: "#ad_timeboard",
      isNone: true,
      isParentNone: true,
    },
    {
      selector: "#right-ad-1",
      isNone: true,
      isParentNone: true,
    },
    {
      selector: "#right-ad-2",
      isNone: true,
      isParentNone: true,
    },
    {
      selector: '[title="right-shopping"]',
      isNone: true,
      isParentNone: true,
    },
    {
      selector: ".ad_section",
      isNone: true,
      isParentNone: false,
    },
    {
      selector: "#search-right-second",
      isNone: true,
      isParentNone: false,
    },
    {
      selector: "#newsstand",
      isNone: false,
      isParentNone: false,
      style: {
        key: "marginTop",
        value: 0,
      },
    },
  ];

  let element = "";
  for (const item of naverItems) {
    element = document.querySelector(item.selector);
    if (element) {
      if (item.isNone) {
        element.style.display = "none";
      }
      if (item.isParentNone) {
        element.parentNode.style.display = "none";
      }
      if (item?.style) {
        element.style[item.style.key] = item.style.value;
      }
    }
  }
};

const run = () => {
  setTimeout(() => {
    console.log("ad remove");
    getNaverRemove();
  }, 1);
};

run();

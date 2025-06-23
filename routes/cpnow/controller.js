const axios = require("axios");

const { replaceAll } = require("../../utils/util");
const { extractCoupangProductInfo } = require("./common");
const request = require("request");

// "productId": 7620053914,
// "itemId": 24535455565,
// "vendorItemId": 91548020895,
// "categoryId": "5187",
const getItem = async (req, res) => {
  try {
    let { id, productId, vendorItemId, itemId } = req.query;
    if (id) {
      const { data } = await axios.get(
        `https://api.mindpang.com/api/coupang/getItemById.php?id=${id}`
      );
      return res.status(200).send({ status: "ok", data });
    } else {
      return new Error("no id");
    }
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

const getItemList = async () => {
  const { productId, vendorItemId } = req.query;
  try {
    if (!productId || !vendorItemId) {
      throw new Error("필수조건 값이 없습니다.");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getCoupangItemRequest = async ({ productId, vendorItemId, itemId }) => {
  // return new Promise((resolve, reject) => {
  const cookies = [
    "sid=ab0a0ce72bfb425494e3bb300e8feedc18828dd0",
    "PCID=10936919318449480680884",
    "MARKETID=10936919318449480680884",
    "x-coupang-accept-language=ko-KR",
    "x-coupang-target-market=KR",
    "_fbp=fb.1.1745118047358.419499054811712738",
    "ak_bmsc=0D4C780433DD9497E85B79A7F4A2D8B1~000000000000000000000000000000~YAAQtuQ1F/ZlEyeWAQAAXi4kURvu04sB76s7UzaqBIE/UzpZAIsJRHHiJCUEdpcZxH/YKw7Y5B5fkAtaeJjN+m3Z/coCElex/CxCV++SjOZC2xrAHvQ23cSPUIcvpFBjw5NS2n9YLkXL6ECx2nohceRtQ0bYCElXKArzZyYC4T0j46b98rvRElyEVXUFs9p4AdjURKyuI4iIPosKy5hlTCCY50v3eYS8OJCMiYHQpYo2r4Aa1MDROdA9ueNhOPC8eWn0ecbwc6P8VJwqbuzNL7HezeuAosiTCzocfJk+KQezSCUIzNgIOX82ssBZ/mBh4PbCSc/c4vDaiPhPluJQ6/46TJUKs4ahyd5iNsChIY90bheqGv3IiDgbAuL3vsdyxrjJy+7tWa0DsFK5PGWXPc+rpd+S/d5UQ1B4PF9GaAxne0wOv/cuYcTxSAlmmVpaEY+CTazqZTaOe3XVhBkX",
    "bm_ss=ab8e18ef4e",
    "bm_so=5B0367F6206346DFFAA2505D74F58E23908C92615F4425F75C4AFCBF6E4F05B0~YAAQVOQ1F2u29UCWAQAAIvReUQN4FvJg0XYSoTmXi6WOevXltl0zo1/WHUjBh/i9PzGOeLo4f6y/wMC+RWKdkABhY56AF1aoQBxTgObdXJnaRZ+glBQJ+h2/Oi6A6o+PFb0RBcpS5Ak13KSTY4pbqc2WQ8IFDziGIPWwLABd04JFMs2YM2/wEI8vbJoAIJB7VbdWpUKTEmO9G4/0OV6sv0GV4IptXpPOhWdo3UXe4AZkIo+BBO38j/y974AWanXRMjZdr7QiZKv7eeyi4Ogc0AHK3Jz844+aTOd8euuKm6xipuMjyOAL82B8f/yi9ZvM3RQ5UfHmWtq+R5tz4pazlogJuuxVAXjRJHYGa4Dwictve9yowC1vf6CRejP3Gn4v9PJX6kXmOkpksGQbuvsqotpV71FSwCLh6VYRqorHRYl50+yziZMcmp14YL0F8B7WGqFLBlEZjBkOy53r8yl7PA==",
    "bm_lso=5B0367F6206346DFFAA2505D74F58E23908C92615F4425F75C4AFCBF6E4F05B0~YAAQVOQ1F2u29UCWAQAAIvReUQN4FvJg0XYSoTmXi6WOevXltl0zo1/WHUjBh/i9PzGOeLo4f6y/wMC+RWKdkABhY56AF1aoQBxTgObdXJnaRZ+glBQJ+h2/Oi6A6o+PFb0RBcpS5Ak13KSTY4pbqc2WQ8IFDziGIPWwLABd04JFMs2YM2/wEI8vbJoAIJB7VbdWpUKTEmO9G4/0OV6sv0GV4IptXpPOhWdo3UXe4AZkIo+BBO38j/y974AWanXRMjZdr7QiZKv7eeyi4Ogc0AHK3Jz844+aTOd8euuKm6xipuMjyOAL82B8f/yi9ZvM3RQ5UfHmWtq+R5tz4pazlogJuuxVAXjRJHYGa4Dwictve9yowC1vf6CRejP3Gn4v9PJX6kXmOkpksGQbuvsqotpV71FSwCLh6VYRqorHRYl50+yziZMcmp14YL0F8B7WGqFLBlEZjBkOy53r8yl7PA==^1745121900135",
    // "overrideAbTestGroup=%5B%5D",
    "bm_sc=4~1~748682941~YAAQVOQ1FwW39UCWAQAAlvpeUQPAtBxVjRl61JC7o3XiwwqmgJBlqsp2Qycyw9ViHy7LIDdDObnL3k9g2a4qThbFViKuidnbALMJYrMRV7EVhRt/xirtB5B256tD9R+DA6zw6omtGH0MGXS2qM3NNB7RmopyQg8GHmuofiHPEvtByrNOSlECEbNqzs5NxBKvzMGeAgxVxcx2KJWtl7JnXzqWgzpS9uNXxs9/iXHCTAqEUDldRmHraGJa3v6GkOI5d65/+pR1aFuSwGMI3qcxUUUntRpi9oK/A6wELzylTVViup1oOMuoN7J4MuQF4AL9sStdB4bzUjy4IpvMthO01TYQQQgPKlIHbA6YFYrfRW5bstgOSrCQ8koMNbYGXBTQo84xunHeNkXVGS05kRs=",
    "web-session-id=92b2821d-c382-4ea6-bf64-c99295a825f9",
    "baby-isWide=wide",
    "cto_bundle=b5rRRV9uN1o4c3IxN0c1VXd3ZUMzYlNlRDhGRWpTaGpibk1kdFI1Q25RNENsSzlFa2tqb1hLWkZ5NmwlMkZ2V2xRRHduRXAxZVJzQWdQSVAlMkYxTVBzbjJiUlVnSzR2RjJaNG5tOE16bGNwR2UwckFXdWxkc2VrcHk5WWRsem1UcHBvQVZTWTE",
    "bm_sz=C4240E8050D71200E3AF1659B3B2C32D~YAAQVOQ1F3i39UCWAQAAdf5eURvf1BHoIfQvmrpUmwJ+fmVFCcQ7fy1sc763ozAVgKodM1BXHnUyMTypuf3qYj/OeA0ljqrvcQsYRB3fzZOiWJiu0ZvI2gc3S2eN0LabsZ8fHLiktDAq0Fkmax2IQpZbmND/eWiqxDY6fZQRUL6wxSoeeCitexx0wrWKa9V64IGYzbXflmtb0tGHl5N59V5+FSuiVks28gYbLBC3tUnNxr/K08+I6PJJGCgJtXBMgIewBsMfNic+ySygsosA2TBCjn9u8ACime6w8HkEEhnkrMYdFDtpniueWLTuJwdunCFxAmVgqLDimLuq8FfoA1xMESuPBPKIYPoEUaAUau7myaSV6/014Gc8gntmRLpo7VQ6Qcvl8S0Tig571j6udGou+puj3FUibsMJubUlQVOWVjzy27/PPb9Ww+CMOOmKrCxnPDAINkSX~3225399~4470067",
    "bm_s=YAAQVOQ1F3S39UCWAQAAc/5eUQNXfoQxzss9odfJG5/m9n6o34upZeEZmHAXswiR5AKiO+dj5CTzLY0u9hAwbuOlD/TNm/RhhrhldxnRC25hFWM6SMcSi9xMpUyCSzR4+e0CRgCTfY6h1xqqK86QHE5hwTpeg3uDq2HKmidJRa7FuAOeIx9bEh0XsadTk4a0u9f5Y0Zr7vOUgTgkzRkmV1OS4zshKJ8iuTYoLRkHvyQOFHC3QwQtzTO5bk9OMRLIcZyJPPO0j3IDoZuduVif3P8nY2AfhcXY8C6YDW3qDIaUEt77i2Is4+HaWv54tMmYqhpm5b4abf1GfKJyhky0wIZTJbWqm5pYinBZ30MbMX5cgRVo2mabqzGunltMnMCtc++XJhjbVghdWt70s1UkaAYuAISpGddKphXWUiHSnDHYMUrd0jv7+4D97ac5h8QU1aw0UKlCSi2+F8iWPPhIU4uxfagqreTSLZM=",
    "bm_sv=C99BCE32EA80FFA2ACC08CC6094B0B87~YAAQVOQ1F3W39UCWAQAAc/5eURuDTpRPQROe4SS1zieLvV8DIGSIxLwa+SXfwzaUr3/fVwuqcZoW8QnYVPosgaPDHnmICMf7nRwdebOKKZmmv0tk46Jh2qfgiuTWTUVk6mbEZ0ZVVnzbmecHpbWlY4Y+AO40whQfl6GPCxx9a+1vVPHiWRyYcn2TN++zQ/XKQpjAW7gHPpeE7MfcsskYjOXPBaBY2ehP5QI6eoPXpMRcEZlB4H7k6dsoWUVsSE21ltE=~1",
    "_abck=EF7BE2B0C29338B5C33C11FD1D8D6943~0~YAAQVOQ1F4a39UCWAQAA2/5eUQ1L5Rz+WMogdPgK7+VwPnSNP7FyhbpTWbOSOPtsA6C0QB2j4JiQzV5HamYGz4OeGJuIq7e5A1LBiGOWt7j7OWrrqpQEfAR2NMCRCGpLzemk6k4mXUY8G5eDhSvHn+qvhFB4sePZ4uLDXoG0tZ9YQLHyeufXa+0mJblFg9+625sb1SrM9bb9duEGEoNjfh/zLCPNDlJ3EVn6CVo+6ZpvKof7T4wwdxPX+sJydKizRYFm/ripyLkZhRvqAP8bYLtzlk7DYt4SYeooYtthT+0do1upVzu8FzY2Mme1G65IYDZpLLMjBMIiDFFL0Ey69qYB7fvsXuOxqXwgTWe1h2OA8vw9LEuCvs9jrLSpH3s1uYXQ+6hHTiKq14HjJjYZlOvJG844Q3hMYuulTbvr95Gd2idai8o/NuvRkZwBwufhoFKCGZDOSKds/KcfvOERgRdFlAdwDvuJx//XMpDzzENv4ZSVNA+8qPFta/aVUQNPGBBbeyMZ+1zzXlyXZQjFafWu/hTTYCYY+/aXi9Trj2Y4hdG+y6b7HBL5br/qlDyql53deBZY+V2bgTpKo0CEiRdF~-1~-1~-1)",
  ];
  const myHeaders = new Headers();
  myHeaders.append(
    "Referer",
    `https://www.coupang.com/vp/products/${productId}?itemId=${vendorItemId}&vendorItemId=${itemId}`
  );
  myHeaders.append("Cookie", cookies.join("; "));

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const url = `https://www.coupang.com/vp/products/${productId}/vendoritems/${vendorItemId}/quantity-info?quantity=1`;
  console.log(url);

  try {
    const response = await fetch(url, requestOptions);

    return await response.text();
  } catch (e) {
    return {
      error: `🚨 쿠팡 수량 조회 실패: productId(${productId}), vendorItemId(${vendorItemId}), itemId(${itemId})`,
    };
  }
  // fetch(url, requestOptions)
  //   .then((response) => response.json())
  //   .then((result) => resolve(result))
  //   .catch(() => reject("error"));
  // // const options = {
  // //   method: "GET",
  // //   url: "https://www.coupang.com/vp/products/8541009492/vendoritems/88741950221/quantity-info?quantity=1",
  // //   headers: {
  // //     Referer:
  // //       "https://www.coupang.com/vp/products/8541009492&vendorItemId=88741950221",
  // //     Cookie: cookies.join("; "),
  // //   },
  // // };
  // // console.log(options);
  // // request(options, function (error, response) {
  // //   if (error) throw new Error(error);
  // //   console.log(response.body);
  // //   resolve(response.body);
  // // });
};

const getCpItem = async (req, res) => {
  const { productId, vendorItemId, itemId } = req.query;
  try {
    if (!productId || !vendorItemId || !itemId) {
      throw new Error("필수조건 값이 없습니다.");
    }

    const params = {
      productId,
      vendorItemId,
      itemId,
    };
    const data = await getCoupangItemRequest(params);

    console.log(data);

    return res.status(200).send(data);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

const getCpUrl = async (req, res) => {
  try {
    const { link, X_TOKEN, CT_AT } = req.query;

    console.log(link);
    console.log(X_TOKEN);
    console.log(CT_AT);
    const AFATK = replaceAll(X_TOKEN, " ", "+");

    const url = `https://partners.coupang.com/api/v1/url/any?coupangUrl=${encodeURIComponent(
      link
    )}`;
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url,
      headers: {
        "X-Token": AFATK,
        Cookie: `CT_AT=${CT_AT}; AFATK=${AFATK};`,
      },
    };

    console.log(config);

    const response = await axios.request(config);
    // console.log(response);
    return res.status(200).send(response.data);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

module.exports = {
  getItem,
  getItemList,
  getCpItem,
  getCpUrl,
};

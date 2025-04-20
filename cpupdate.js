const axios = require("axios");
const extractCoupangProductInfo = (coupangUrl) => {
  // 전체 URL을 파싱
  const urlObj = new URL(coupangUrl);

  // productId 추출 (pathname에서 추출)
  const pathnameParts = urlObj.pathname.split("/");
  const productIdIndex = pathnameParts.indexOf("products") + 1;
  const productId = Number(pathnameParts[productIdIndex]);

  // 검색 파라미터 추출
  const searchParams = urlObj.searchParams;
  const itemId = Number(searchParams.get("itemId"));
  const vendorItemId = Number(searchParams.get("vendorItemId"));
  const categoryId = Number(searchParams.get("categoryId"));

  return {
    productId,
    itemId,
    vendorItemId,
    categoryId,
  };
};

const run = async () => {
  let id = 612300;
  try {
    let query = "";
    while (id < 1661697) {
      const url = `https://api.mindpang.com/api/coupang2/getItemById.php?id=${id}`;
      const { data } = await axios.get(url);

      const { link } = data;

      const { productId, itemId, vendorItemId, categoryId } =
        extractCoupangProductInfo(link);

      query += `update g5_coupang_products_2 set productId = '${productId}', itemId = '${itemId}', vendorItemId = '${vendorItemId}', categoryId = '${categoryId}' where id=${id}; `;

      if (id % 100 === 0) {
        const dd = {
          query,
        };
        const { data: aa } = await axios.post(
          `https://api.mindpang.com/api/coupang2/query.php`,
          dd
        );
        console.log(aa);
        query = "";
      }
      id += 1;
    }
  } catch (e) {
    console.log(e.message);
  }
};

run();

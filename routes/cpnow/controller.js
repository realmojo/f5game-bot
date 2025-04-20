const axios = require("axios");

const { replaceAll } = require("../../utils/util");
const { extractCoupangProductInfo } = require("./common");

// "productId": 7620053914,
// "itemId": 24535455565,
// "vendorItemId": 91548020895,
// "categoryId": "5187",
const getItem = async (req, res) => {
  try {
    let { productId, venderId } = req.query;

    keyword = replaceAll(keyword, " ", "");
    const items = await fetchKeyword(keyword);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const data = {
      items: items,
    };
    const { data: response } = await axios.post(
      "https://api.mindpang.com/api/keyword/add.php",
      data,
      config
    );

    return res.status(200).send({ status: response, keyword, items });
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

const getCoupangItemRequest = ({ productId, vendorItemId, itemId }) => {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append(
      "Referer",
      `https://www.coupang.com/vp/products/${productId}?itemId=${vendorItemId}&vendorItemId=${itemId}`
    );
    myHeaders.append(
      "Cookie",
      "bm_s=YAAQDNojF8mAiEiWAQAAv47rSAPzX9vBQgD46eyg3ZZBP297KPcVCjsZjNdX01Nc8WjoBkU4HSIla1U9xtiM2VzeM6VBHl7p2gnXX25sTvRrkBgQnDeQz8pfq4gWuLNf+tB4V75H8ws4/WCJhTY1oDsU++9xjMy7rxiy7N8QfExz3jRcAter6BkXbpq9qTmsOAkI7bZ9D1eC0hTBoTrLBPbakJMvzqjZnAELA9QIzP6jPjCIdNFqcwmnZ2By/J/x9efMaX76w+hmkS2YVopBmhoKN9tE9Vmg02svD1F1OQJB+GsxBmcRWgxjbXHlqhkqCluortVKZLRDXUm0WRxbTnF7eY2epPHzZeX3GSYundH8bLk0BBY2hu9y0D5xSDiboiBEvLrBdJ4SYbLolFlYRTzU/i7xZkaM/HN6PHRHYbGhfaJPIvLijmiLzqTQp6Ht1gxN69iC0+euVQ==;"
    );

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    const url = `https://www.coupang.com/vp/products/${productId}/vendoritems/${vendorItemId}/quantity-info?quantity=1`;
    console.log(url);

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => reject("error"));
  });
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

module.exports = {
  getItem,
  getItemList,
  getCpItem,
};

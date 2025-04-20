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

module.exports = {
  extractCoupangProductInfo,
};

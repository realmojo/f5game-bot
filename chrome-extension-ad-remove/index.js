const getAdRemoveItems = async () => {
  try {
    const response = await fetch(
      "https://api.mindpang.com/api/adremove/getItem.php"
    );
    const d = await response.json();
    const f = {
      version: "1.0.0",
      items: d.items,
    };
    localStorage.setItem("f5-ad-remove", JSON.stringify(f));
    return d;
  } catch (e) {
    console.log("실패: ", e);
  }
};

const getLocalstorageItems = async () => {
  const d = (await localStorage.getItem("f5-ad-remove")) || "";
  return d ? JSON.parse(d) : "";
};

const doRemove = async () => {
  let items = [];
  const preItems = await getLocalstorageItems();
  if (preItems?.version) {
    items = preItems.items;
  } else {
    const { items: removeItems } = await getAdRemoveItems();
    items = removeItems;
  }
  const currentHref = location.href;

  let element = "";
  for (const d of items) {
    if (currentHref.indexOf(d.type) !== -1) {
      for (const item of d.items) {
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
    }
  }
};

const eventScript = () => {
  const selectAllCheckbox = document.getElementById("selectAll");
  const groupCheckboxes = document.querySelectorAll(".group-checkbox");
  // 전체 체크박스 클릭 시 그룹 체크박스 전체 선택/해제 함수
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", function () {
      groupCheckboxes.forEach((checkbox) => {
        checkbox.checked = selectAllCheckbox.checked;
      });
    });
  }

  if (groupCheckboxes) {
    // 그룹 체크박스 중 하나라도 해제될 경우 전체 체크박스 해제
    groupCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function (event) {
        if (!checkbox.checked) {
          selectAllCheckbox.checked = false;
        } else if (Array.from(groupCheckboxes).every((cb) => cb.checked)) {
          selectAllCheckbox.checked = true;
        }
        handleCheckboxChange(event);
      });
    });
  }

  // 체크박스에 이벤트 리스너 추가
  // const checkboxes = document.querySelectorAll(".group-checkbox");
  // checkboxes.forEach((checkbox) => {
  //   checkbox.addEventListener("change", handleCheckboxChange);
  // });

  // 페이지 로드 시 기존 값에 따라 체크 상태 설정
  window.addEventListener("DOMContentLoaded", () => {
    const selectedValues = getSelectedValues();
    checkboxes.forEach((checkbox) => {
      if (selectedValues.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  });
};

const getSelectedValues = () => {
  const storedValues = localStorage.getItem("f5-ad-remove-exclude");
  return storedValues ? JSON.parse(storedValues) : [];
};

// LocalStorage에 값 저장하기
const saveSelectedValues = (values) => {
  localStorage.setItem("f5-ad-remove-exclude", JSON.stringify(values));
};

// 체크박스 클릭 시 처리 함수
const handleCheckboxChange = (event) => {
  const value = event.target.value;
  let selectedValues = getSelectedValues();

  if (event.target.checked) {
    if (!selectedValues.includes(value)) {
      selectedValues.push(value);
    }
  } else {
    selectedValues = selectedValues.filter((val) => val !== value);
  }

  saveSelectedValues(selectedValues);
  console.log("현재 선택된 값:", selectedValues);
};

const run = () => {
  setTimeout(() => {
    // doRemove();
    eventScript();
  }, 1);
};

run();

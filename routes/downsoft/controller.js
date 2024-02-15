const axios = require("axios");

const replaceAll = (str, searchStr, replaceStr) => {
  return str.split(searchStr).join(replaceStr);
};

const gptSend = async (word, type = "description") => {
  let content = "";
  if (type === "description") {
    content = `${word} 한 문장 슬로건으로 만들고 쌍따음표 빼줘`;
  } else if (type === "contents") {
    content = `${word}에 대해 목차에 맞는 내용을 각각 1500자씩 3개만 작성해주고 네 번째 목차는 장단점에 대해서 작성해줘. 그리고 각 목차에 번호를 넣어줘`;
  }
  const { data } = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "user",
          content,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data;
};

const parseContents = (contents) => {
  const split = contents.split("###");
  console.log(split.length);

  let ctitle1 = "";
  let ctitle2 = "";
  let ctitle3 = "";
  let ctitle4 = "";
  let cdescription1 = [];
  let cdescription2 = [];
  let cdescription3 = [];
  let cdescription4 = [];
  let c1 = "";
  let c2 = "";
  let c3 = "";
  let c4 = "";
  for (const item of split) {
    //   console.log(item);
    if (!item) {
      continue;
    }

    if (item.indexOf(" 1.") !== -1) {
      c1 = item;
      continue;
    } else if (item.indexOf(" 2.") !== -1) {
      c2 = item;
      continue;
    } else if (item.indexOf(" 3.") !== -1) {
      c3 = item;
      continue;
    } else if (item.indexOf(" 4.") !== -1) {
      c4 = item;
      continue;
    }
  }

  if (c1) {
    c1 = c1.split("\n");
    ctitle1 = replaceAll(c1[0].replace("1. ", "").trim(), "**", "");
    for (let i = 0; i < c1.length; i++) {
      if (i === 0 || !c1[i]) {
        continue;
      }
      cdescription1.push(replaceAll(c1[i], "**", ""));
    }
  }
  if (c2) {
    c2 = c2.split("\n");
    ctitle2 = replaceAll(c2[0].replace("2. ", "").trim(), "**", "");
    for (let i = 0; i < c2.length; i++) {
      if (i === 0 || !c2[i]) {
        continue;
      }
      cdescription2.push(replaceAll(c2[i], "**", ""));
    }
  }
  if (c3) {
    c3 = c3.split("\n");
    ctitle3 = replaceAll(c3[0].replace("3. ", "").trim(), "**", "");
    for (let i = 0; i < c3.length; i++) {
      if (i === 0 || !c3[i]) {
        continue;
      }
      cdescription3.push(replaceAll(c3[i], "**", ""));
    }
  }
  if (c4) {
    c4 = c4.split("\n");
    ctitle4 = replaceAll(c4[0].replace("4. ", "").trim(), "**", "");
    for (let i = 0; i < c4.length; i++) {
      if (i === 0 || !c4[i]) {
        continue;
      }
      cdescription4.push(replaceAll(c4[i], "**", ""));
    }
  }

  return {
    ctitle1,
    ctitle2,
    ctitle3,
    ctitle4,
    cdescription1: cdescription1 ? cdescription1.join(" ").trim() : "",
    cdescription2: cdescription2 ? cdescription2.join(" ").trim() : "",
    cdescription3: cdescription3 ? cdescription3.join(" ").trim() : "",
    cdescription4: cdescription4 ? cdescription4.join("\n").trim() : "",
  };
};

const getContents = async (req, res) => {
  try {
    const { word } = req.query;

    const r1 = await gptSend(word, "description");
    console.log(r1.choices[0].message.content);
    const r2 = await gptSend(word, "contents");
    console.log(r2.choices[0].message.content);
    const {
      ctitle1,
      ctitle2,
      ctitle3,
      ctitle4,
      cdescription1,
      cdescription2,
      cdescription3,
      cdescription4,
    } = parseContents(r2.choices[0].message.content);

    return res.status(200).send({
      description: r1.choices[0].message.content,
      ctitle1,
      ctitle2,
      ctitle3,
      ctitle4,
      cdescription1: cdescription1 ? cdescription1.join(" ").trim() : "",
      cdescription2: cdescription2 ? cdescription2.join(" ").trim() : "",
      cdescription3: cdescription3 ? cdescription3.join(" ").trim() : "",
      cdescription4: cdescription4 ? cdescription4.join("\n").trim() : "",
    });
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

const addContents = async (req, res) => {
  try {
    const params = req.body;

    let resd = "";
    if (params.title) {
      const r1 = await gptSend(params.title, "description");
      console.log(r1.choices[0].message.content);
      const r2 = await gptSend(params.title, "contents");
      console.log(r2.choices[0].message.content);

      params.description = r1.choices[0].message.content;
      const {
        ctitle1,
        ctitle2,
        ctitle3,
        ctitle4,
        cdescription1,
        cdescription2,
        cdescription3,
        cdescription4,
      } = parseContents(r2.choices[0].message.content);

      params.ctitle1 = ctitle1;
      params.ctitle2 = ctitle2;
      params.ctitle3 = ctitle3;
      params.ctitle4 = ctitle4;
      params.cdescription1 = cdescription1;
      params.cdescription2 = cdescription2;
      params.cdescription3 = cdescription3;
      params.cdescription4 = cdescription4;

      console.log(params);
      resd = await axios.post(
        "https://api.getsoftbox.com/api/addItem.php",
        params
      );
    }

    return res.status(200).send({ status: "ok", result: resd });
    // return res.status(200).send({ status: "ok" });
  } catch (e) {
    console.log(e);
    return res.status(200).send("no data");
  }
};

module.exports = {
  getContents,
  addContents,
};

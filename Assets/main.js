//update fix for favlines local storage
if (!localStorage.getItem("isUpdated")) {
  localStorage.clear();
  localStorage.setItem("isUpdated", true);
}


let beServer = "";

if (location.host == "sefer35.com") {
  beServer = "https://api.sefer35.com/"
}
else {
  beServer = `http://${location.hostname}:3000/`
}

function strToNode(str) {
  let div = document.createElement("div");
  div.innerHTML = str;
  return [...div.children];
}



let ls = {
  //local storage helper methods
  setObj: (key, val) => {
    localStorage.setItem(key, JSON.stringify(val))
  },
  getObj: (key) => JSON.parse(localStorage.getItem(key)),
  //user favlines
  favLines: {
    add: (lineNo) => {
      let favLinesList = ls.favLines.get();
      if (!(lineNo in favLinesList)) {
        favLinesList[lineNo] = { isPrefersStart: true }
      }
      ls.setObj("favLines", favLinesList);
    },
    get: () => ls.getObj("favLines"),
    remove: (lineNo) => {
      let favLines = ls.getObj("favLines");
      if (lineNo in favLines) {
        delete favLines[lineNo];
        ls.setObj("favLines", favLines);
      }
    },
    changeLineDir: (lineNo) => {
      let favLines = ls.getObj("favLines");
      if (lineNo in favLines) {
        favLines[lineNo] = { isPrefersStart: !favLines[lineNo].isPrefersStart }
        ls.setObj("favLines", favLines);
      }
    }
  },
}

if (!ls.getObj("favLines")) {
  ls.setObj("favLines", {})
}


function addPropsToElem(elem, props) {
  Object.keys(props).forEach(prop => elem.setAttribute(prop, props[prop]))
}

function ComboBox(optionsArr, onselectfn, props) {

  //
  let comboBox = document.createElement("div");
  addPropsToElem(comboBox, props);
  //

  let comboBoxInnerContainer = document.createElement("div");
  comboBoxInnerContainer.classList.add("innerContainer");
  comboBox.appendChild(comboBoxInnerContainer);
  //

  let comboBoxExitArea = document.createElement("div");
  comboBoxExitArea.classList.add("comboBoxExit")
  comboBoxExitArea.addEventListener("click", (e) => e.target.closest(".comboBox").classList.toggle("hidden"))

  //
  let optionsContainer = document.createElement("div");
  optionsContainer.classList.add("optionsContainer");
  optionsContainer.addEventListener("click", (e) => {
    if (!!e.target.getAttribute("data-value")) {
      return onselectfn(e)
    }
  })
  //
  let comboBoxSearchArea = document.createElement("input");
  comboBoxSearchArea.classList.add("searchArea");
  comboBoxSearchArea.setAttribute("placeholder", props.placeholder)
  comboBoxSearchArea.addEventListener("input", (e) => {
    let input = e.target;
    let options = [...optionsContainer.children];
    options.forEach(option => option.classList.add("hidden"));
    let validOptions = options.filter(option => option.innerText.includes(input.value.toLocaleUpperCase('tr-TR')));
    validOptions.forEach(option => option.classList.remove("hidden"));
  })

  //options
  optionsArr.forEach(item => {
    let option = document.createElement("span");
    option.innerHTML = item.text;
    option.setAttribute("data-value", item.value)
    optionsContainer.appendChild(option);
  })

  comboBox.appendChild(comboBoxExitArea);
  comboBoxInnerContainer.appendChild(optionsContainer);
  comboBoxInnerContainer.appendChild(comboBoxSearchArea);

  return [comboBox];
}

async function fetchLinesList() {
  let res = await fetch(`${beServer}lines`);
  return (await res.json()).data;
}

function onFavDelete(lineNo) {
  ls.favLines.remove(lineNo);
  location.reload();
}

function onFavLineDirChange(lineNo, event) {
  ls.favLines.changeLineDir(lineNo);

  let buttonClicked = event.target;
  let detailDiv = buttonClicked.closest(".innerExpedition").getElementsByClassName("detail")[0];

  [...(detailDiv.children)].forEach(dir => dir.classList.toggle("hidden"));

}

function getExpeditionsHTML(expeditions) {

  let result = [];

  let lsFavLines = ls.favLines.get();

  result = Object.keys(expeditions).map(lineNo => {
    // let lineObj = expeditions[line];
    // let dayObj = lineObj.days;
    // let directionsObj = dayObj[Object.keys(dayObj)[0]];
    // let directionsResult = [];

    return {
      lineNo: lineNo,
      start: {
        name: expeditions[lineNo].directions.start.name,
        hours: expeditions[lineNo].directions.start.expeditions
      },
      end: {
        name: expeditions[lineNo].directions.end.name,
        hours: expeditions[lineNo].directions.end.expeditions

      }
    }
  })
  let resultHTML = result.reduce((acc, line) => acc +/*html*/`
    <div class="card expedition">
      <div class="lineInfo">
        <p class="lineNo">${line.lineNo}</p>
        <p class="ways">${line.start.name} - ${line.end.name}</p>
      </div>
      <hr/>
      <div class="innerExpedition">
        <div class="detail">
          <div class="start ${lsFavLines[line.lineNo].isPrefersStart ? "" : "hidden"}">
            <p class="name">${line.start.name} Yönü</p>
            <div class="hours">
              <p><span>Sıradaki</span><span>${line.start.hours[0] || "-"}</span></p>
              <p><span>Sonraki</span><span>${line.start.hours[1] || "-"}</span></p>
            </div>
          </div>
          <div class="end ${lsFavLines[line.lineNo].isPrefersStart ? "hidden" : ""}">
            <p class="name">${line.end.name} Yönü</p>
            <div class="hours">
              <p><span>Sıradaki</span><span>${line.end.hours[0] || "-"}</span></p>
              <p><span>Sonraki</span><span>${line.end.hours[1] || "-"}</span></p>
            </div>
          </div>
        </div>
        <div class="controls">
          <button onclick="onFavLineDirChange(${line.lineNo}, event)"><img src="./Assets/img/reverse-direction.svg" alt="Yön Değiştir"></button>
          <button onclick="onFavDelete(${line.lineNo})"><img src="./Assets/img/close.svg" alt="Favorilerden Sil"></button>
        </div>
      </div>
      
    </div>
  `, "")

  return /*html*/`
    <div class="cardContainer">
      ${resultHTML}
    </div>
  `
}

function newLineButton(props) {
  let newLineButton = document.createElement("button");
  addPropsToElem(newLineButton, props);
  newLineButton.innerText = "Ekle";
  newLineButton.addEventListener("click", () => {
    document.getElementById("linesCombo").classList.toggle("hidden");
  })
  return [newLineButton];
}

let pages = {
  home: async () => {

    let expeditionsHTML = /*html*/`
      <p class="infoNewLine">
        Hareket saatlerini takip etmek istediğiniz otobüs hatlarını sağ alttaki "Ekle" butonuna tıklayarak favorilerinize ekleyebilirsiniz.
      </p>
    `;

    let favLines = ls.getObj("favLines");
    if (!favLines) {
      ls.favLines.list = {}
      favLines = ls.getObj("favLines");
    }
    let favLinesList = Object.keys(favLines);

    if (favLinesList.length > 0) {

      let res = await fetch(`${beServer}busHours/${favLinesList.toString()}?next`);
      let data = await res.json();
      expeditionsHTML = getExpeditionsHTML(data);
    }

    let linesList = await fetchLinesList();
    let linesListArr = (Object.keys(linesList).map(lineNo => {
      return { text: `${lineNo} - ${linesList[lineNo].name}`, value: lineNo }
    }))

    function onLineSelect(e) {
      let selectedLineNo = e.target.getAttribute("data-value");
      ls.favLines.add(selectedLineNo);
      location.reload()
      //e.target.closest(".comboBox").remove();
    }



    return [
      strToNode(expeditionsHTML),
      ComboBox(linesListArr, onLineSelect, { id: "linesCombo", class: "comboBox hidden", placeholder: "Hat No, Hat Adı giriniz..." }),
      newLineButton({ class: "newLineButton" })
    ]
  }
}

async function getPage(page) {
  return pages[page]();
}

async function router() {
  let locationParams = location.search.slice(1).split("&").map(item => item.split("="));
  //
  let locationParamsObj = {};
  //
  for (let param of locationParams) {
    locationParamsObj[param[0]] = param[1]
  }

  let currentPage = locationParamsObj.page;

  if (!(currentPage in pages)) {
    currentPage = "home"
  }

  let page = await getPage(currentPage);
  let flattenedPage = [];
  page.forEach(item => flattenedPage.push(...item));

  flattenedPage.forEach(elem => document.getElementsByTagName("main")[0].appendChild(elem));
}


async function start() {


  document.body.addEventListener("click", e => {

    let tag = e.target;

    if (tag.tagName == "A" && tag.href.includes("/?page")) {
      e.preventDefault();
      history.pushState({}, "", e.target.href);
      router();
    }
  })

  window.addEventListener("popstate", () => {
    router();
  })
  document.addEventListener("DOMContentLoaded", router)
  //router();
}

start()


let feServer = location.host;
let beServer = "";

if (feServer == "sefer35.com") {
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
  favLines: {
    add: (lineNo) => {
      let lines = new Set(ls.favLines.get());
      lines.add(lineNo);
      localStorage.setItem("favLines", [...lines]);

    },
    remove: (lineNo) => {
      let lines = new Set(ls.favLines.get());
      lines.delete(lineNo);
      localStorage.setItem("favLines", [...lines]);
    },
    get: () => {

      return localStorage.getItem("favLines") ? localStorage.getItem("favLines").split(",") : [];
    }
  }
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
  optionsContainer.addEventListener("click", (e) => onselectfn(e))
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

function getExpeditionsHTML(expeditions) {
  let result = [];

  let favLines = ls.favLines.get();


  result = favLines.map(lineNo => {
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


  return result.reduce((acc, line) => acc +/*html*/`
    <div class="card expedition">
      <p class="lineNo">${line.lineNo}</p>
      <div class="expeditions">
        <div class="start">
          <p class="name">${line.start.name}</p>
          <div class="hours">
            <p>${line.start.hours[0] || "-"}</p>
            <p>${line.start.hours[1] || "-"}</p>
          </div>
        </div>
        <div class="end">
          <p class="name">${line.end.name}</p>
          <div class="hours">
            <p>${line.end.hours[0] || "-"}</p>
            <p>${line.end.hours[1] || "-"}</p>
          </div>
        </div>
      </div>
    </div>`, "")
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

    let favLines = ls.favLines.get();
    let expeditionsHTML = /*html*/`
      <p class="infoNewLine">
        Hareket saatlerini takip etmek istediğiniz otobüs hatlarını sağ alttaki "Ekle" butonuna tıklayarak favorilerinize ekleyebilirsiniz.
      </p>
    `;


    if (favLines.length > 0) {
      let res = await fetch(`${beServer}busHours/${favLines.toString()}?next`);
      let data = await res.json();
      expeditionsHTML = getExpeditionsHTML(data);
    }

    let linesList = await fetchLinesList();
    let linesListArr = (Object.keys(linesList).map(lineNo => {
      return { text: `${lineNo} - ${linesList[lineNo].name}`, value: lineNo }
    }))

    function onselectfn(e) {
      let selectedLineNo = e.target.getAttribute("data-value");
      ls.favLines.add(selectedLineNo);
      location.reload()
      e.target.closest(".comboBox").remove();
    }

    return [
      strToNode(expeditionsHTML),
      ComboBox(linesListArr, onselectfn, { id: "linesCombo", class: "comboBox hidden", placeholder: "Hat No, Hat Adı giriniz..." }),
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


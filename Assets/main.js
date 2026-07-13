let feServer = location.host;
let beServer = "";

if (feServer == "sefer35.com") {
  beServer = "api.sefer35.com/"
}
else {
  beServer = "http://localhost:3000/"
}

async function importResources() {
  //Fetching images
  let imagesMap = [
    {
      name: "morpheusVolga",
      src: "./Assets/img/morpheusVolga.png"
    },
    {
      name: "home",
      src: "./Assets/img/home.png"
    },
    {
      name: "volga1",
      src: "./Assets/img/volga1.jpg"
    },
    {
      name: "volga2",
      src: "./Assets/img/volga2.jpg"
    },
    {
      name: "volga3",
      src: "./Assets/img/volga3.jpg"
    },
    {
      name: "volga4",
      src: "./Assets/img/volga4.jpg"
    },
    {
      name: "volga5",
      src: "./Assets/img/volga5.jpg"
    },
    {
      name: "volga6",
      src: "./Assets/img/volga6.jpg"
    },
    {
      name: "volga7",
      src: "./Assets/img/volga7.jpg"
    }
  ]

  let responses = await Promise.all(imagesMap.map(async (image) => {

    try {

      return {
        res: await fetch(`${image.src}`),
        name: image.name
      }
    } catch (error) {
      console.error(error);
    }
  }));

  let responseCount = 0;

  let blobs = await Promise.all(responses.map(async (respObj, i) => {
    let blob = await respObj.res.blob();

    let percentageNum = (++responseCount / responses.length) * 100;
    let filled = document.getElementById("filled");
    let percentage = document.getElementById("percentage");
    //
    filled.style.width = percentageNum + "%";
    percentage.innerText = percentageNum.toFixed(1) + "%";
    //
    return {
      blob: blob,
      name: respObj.name
    }
  }));

  let urlObjs = blobs.map(blobObj => {
    return {
      url: URL.createObjectURL(blobObj.blob),
      name: blobObj.name
    }
  });

  let imgsObj = {};
  urlObjs.forEach(urlObj => imgsObj[urlObj.name] = { url: urlObj.url })

  //fetching json data
  let data = await fetch("./Assets/data.json").then(res => res.json());

  return { img: imgsObj, data: data };
}

function expeditionsHTML(expeditions) {
  let result = [];

  Object.keys(expeditions).map(line => {
    let lineObj = expeditions[line];
    let dayObj = lineObj[Object.keys(lineObj)[0]];
    let directionsObj = dayObj[Object.keys(dayObj)[0]];
    let directionsResult = [];

    let [startName, endName] = Object.keys(directionsObj.directions);

    directionsResult = {
      lineNo: line,
      ...(startName && {
        start: {
          name: startName,
          hours: directionsObj.directions[startName]
        },
      }),
      ...(endName && {
        end: {
          name: endName,
          hours: directionsObj.directions[endName]

        }
      })
    }
    result.push(directionsResult)
  })


  return result.reduce((acc, line) => acc +/*html*/`
    <div class="card expedition">
      <p class="lineNo">${line.lineNo}<p>
      <div class="start">
        <p class="name">${line.start.name}</p>
        <div class="hours">
          <p>${line.start.hours[0]}</p>
          <p>${line.start.hours[1]}</p>
        </div>
      </div>
      ${line.end ? /*html*/`
        <div class="end">
          <p class="name">${line.end.name}</p>
          <div class="hours">
            <p>${line.end.hours[0]}</p>
            <p>${line.end.hours[1]}</p>
          </div>
      </div>
      ` : ""}
      
    </div>`, "")
}

function getPage(page) {
  let header = () => /*html*/`
    <header>
      Volga Can Kaya
      <br>
      <p>Actor & Software Producer</p>
    </header>
  `
  let footer = () => /*html*/`
    <footer>
      <a href="./?page=home" class="navHome">
        <img src=${images.home.url} alt="">
      </a>
      <span class="copyright">© 2026 Volga Can Kaya. All rights reserved</span>
    </footer>
  `

  let pages = {
    home: {

      content: /*html*/`

    `
    },
  }

  let fullPage = `
    ${header()}
    ${pages[page].content}
    ${footer()}
  `
  return fullPage;
}

function router() {
  let locationParams = location.search.slice(1).split("&").map(item => item.split("="));
  //
  let locationParamsObj = {};
  //
  for (let param of locationParams) {
    locationParamsObj[param[0]] = param[1]
  }

  let currentPage = locationParamsObj.page;

  if (currentPage == undefined) {
    currentPage = "home"
  }

  //
  document.body.classList.add("disappear");

  setTimeout(() => {
    document.body.innerHTML = getPage(currentPage);
    document.body.classList.remove("disappear");
  }, 350)
}

let images = null;
let data = null;

async function start() {

  // let resources = await importResources();
  // images = resources.img;
  // data = resources.data;


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
  //document.addEventListener("DOMContentLoaded", router)
  //router();
}

start()

fetch(`https://${beServer}busHours/505,267,49?next`)
  .then(res => res.json())
  .then(data => {
    document.getElementsByTagName("main")[0].innerHTML = expeditionsHTML(data)
  });
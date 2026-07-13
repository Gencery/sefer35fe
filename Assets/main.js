let feServer = location.host;
let beServer = "";

if (feServer == "sefer35.com") {
  beServer = "https://api.sefer35.com/"
}
else {
  beServer = "http://localhost:3000/"
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
      <p class="lineNo">${line.lineNo.padStart(3, "0")}</p>
      ${line.start ? /*html*/`
        <div class="start">
          <p class="name">${line.start.name}</p>
          <div class="hours">
            <p>${line.start.hours[0]}</p>
            <p>${line.start.hours[1]}</p>
          </div>
        </div>
      ` : ""}
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

let pages = {
  home: async () => {
    let res = await fetch(`${beServer}busHours/505,267,49?next`);
    let data = await res.json();
    return expeditionsHTML(data);
  }
}

async function getPage(page) {
  return await pages[page]();
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


  document.getElementsByTagName("main")[0].innerHTML = await getPage(currentPage);
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


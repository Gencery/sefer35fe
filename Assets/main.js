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
      
        <main class="home">
          <div class="imgContainer">
            <img src=${images.volga2.url} alt="">
          </div>
          <nav>
            <a href="./?page=experience">Experience</a>
            <a href="./?page=education">Education</a>
            <a href="./?page=gallery">Gallery</a>
            <a href="./?page=contact">Contact</a>
          </nav>
        </main>
      
    `
    },
    experience: {
      content: /*html*/`
      <main class="experience">
        <div class="imgContainer">
          <img src=${images.morpheusVolga.url} alt="">
          <a href="./?page=acting" class="pill pill-red"></a>
          <a href="./?page=software" class="pill pill-blue"></a>
        </div>
        <p class="prompt">
          You take the blue pill, you learn about my <span class="blue">Software</span> experience. You take the red pill,
          you stay in the Wonderland, and see my <span class="red">Acting</span> experience!
          <br />
          (click on a pill to choose)
        </p>
    </main>
    `
    },
    education: {
      content: /*html*/`
        <main class="cardContainer education">
        ${data.education.reduce((acc, current) => acc + /*html*/`
          <div class="card">
            <div class="info">
              <div>
                <h4>${current.SchoolName || ""}</h4>
                <p>${current.Degree || ""}</p>
                <p>${current.StartEnd || ""}</p>
              </div>
              ${current.logo ? /*html*/`<div class="logo">
                <img src=${current.logo} />
              </div>` : ""}
            </div>
          </div>
        `, "")
        }
      </main>
      `
    },
    acting: {
      content: /*html*/`
      <main class="cardContainer acting">
        ${data.experience.acting.reduce((acc, current) => acc + /*html*/`
          <div class="card">
            <div class="info">
              <div>
                <h4>${current.name || ""}</h4>
                <p>${current.role || ""}</p>
                <p>${current.timeline || ""}</p>
                <p>${current.Director || ""}</p>
                <p>${current.Company || ""}</p>
                <p>${current.Location || ""}</p>
                <p>${current.note || ""}</p>
                ${current.imdb ? /*html*/`
                  <a href=${current.imdb}>IMDB Page</a>
                ` : ""}
              </div>
              ${current.logo ? /*html*/`<div class="logo">
                <img src=${current.logo} />
              </div>` : ""}
            </div>
            ${current.video ? /*html*/`
              <video controls>
                <source src=${current.video} type="video/mp4">
              </video>
            ` : ""}
          </div>
        `, "")
        }
      </main>
    `
    },
    gallery: {
      content: /*html*/`
      <main class="cardContainer gallery">
        <div class="card">
          <video controls poster="./Assets/img/volga2.jpg">
            <source src="./Assets/video/showreel.mp4" type="video/mp4">
          </video>
        </div>
        ${[1, 2, 3, 4, 5, 6].reduce((acc, cur) => {
        return acc +/*html*/`
            <div class="card">
              <img src=${images["volga" + cur].url} alt="">
            </div>
          `
      }, "")}
        
      </main>
    `
    },
    software: {
      content: /*html*/`
      <main class="cardContainer software">
        ${data.experience.software.reduce((acc, current) => acc + /*html*/`
          <div class="card">
            <div class="info">
              <div>
                <h4>${current.Title || ""}</h4>
                <p>${current.CompanyName || ""}</p>
                <p>${current.Schedule || ""}</p>
                <p>${current.StartEnd || ""}</p>
                <p>${current.Location || ""}</p>
                <p>${current.WorkPlace || ""}</p>
              </div>
              ${current.CompanyLogo ? /*html*/`<div class="logo">
                <img src=${current.CompanyLogo} />
              </div>` : ""}
            </div>
            ${current.video ? /*html*/`
              <video controls>
                <source src=${current.video} type="video/mp4">
              </video>
            ` : ""}
          </div>
        `, "")
        }
      </main>
    `
    },
    contact: {
      content: /*html*/`
      <main class="contact">
        <div class="imgContainer">
          <img src=${images.volga1.url} alt="">
        </div>
        <div class="links">
          <a href="mailto:volcankay@gmail.com" class="socLink">
            <img src="./Assets/img/logo/gmail.png" alt="gmail logo">
          </a>
          <a href="https://www.instagram.com/volgacankaya/" class="socLink">
            <img src="./Assets/img/logo/instagram.png" alt="instagram logo">
          </a>
          <a href="https://www.youtube.com/@VolgaCanKaya/" class="socLink">
            <img src="./Assets/img/logo/youtube.png" alt="youtube logo">
          </a>
          <a href="https://www.imdb.com/name/nm18108555/" class="socLink">
            <img src="./Assets/img/logo/imdb.png" alt="imdb logo">
          </a>
          <a href="https://www.mandy.com/u/volgacankaya/" class="socLink">
            <img src="./Assets/img/logo/mandy.avif" alt="mandy logo">
          </a>
          <a href="https://fishpond.ie/volgacankaya" class="socLink">
            <img src="./Assets/img/logo/fishpond.jpg" alt="fishpond logo">
          </a>
        </div>
      </main>
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

  let resources = await importResources();
  images = resources.img;
  data = resources.data;


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
  router();
}

start()

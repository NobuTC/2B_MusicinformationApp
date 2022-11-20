// Tämä avain ei pitäisi olla näkyvissä githubissa.
// Pitäisi olla backend
const API_KEY = "fe0a387a761610f339793ba9a3810acc";
const API_endpoint = "https://ws.audioscrobbler.com/2.0";
const albumNameLength = 20;

const buttons = document.querySelectorAll(".artist-button");
buttons.forEach((element) => {
  element.addEventListener("click", handleArtistButtonClicked);
});

const form = document.querySelector("#searchMusic");
form.addEventListener("submit", enteredArtist);

//encodeURI antaa erikois ä,ö Å oman koodin esim. encodeURI('Hälö')
//tulostaa'H%C3%A4l%C3%B6'
// http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=YOUR_API_KEY&format=json
async function fetchArtistInfo(artistName) {
  const errorMessageEl = document.querySelector("#error-message");
  try {
    const artistDataResponse = await fetch(
      `${API_endpoint}/?method=artist.gettopalbums&artist=${encodeURI(
        artistName
      )}&api_key=${API_KEY}&format=json`
    );

    const data = await artistDataResponse.json();
    const { topalbums } = data;
    const { album } = topalbums;

    const filteredAlbums = album.filter((result) => {
      return result.name !== "(null)" && result.image[3]["#text"];
    });

    if (filteredAlbums.length) {
      makeAlbums(filteredAlbums);
      errorMessageEl.style.display = "none";
    } else {
      errorMessageEl.style.display = "block";
    }
  } catch {
    const allAlbums = document.querySelector("#allAlbums");
    allAlbums.innerHTML = "";
    errorMessageEl.style.display = "block";
  }
}

// Tämä ottaa artistejen nimet ja näyttää albumit
function renderAlbum(artistName) {
  fetchArtistInfo(artistName);
}

function handleArtistButtonClicked(mouseEvent) {
  const element = mouseEvent.target;
  const artist = element.innerHTML;
  renderAlbum(artist);
}

//Antaa formEventin. Kun kirjoitan jotain ja submitform.
function enteredArtist(formEvent) {
  formEvent.preventDefault();
  const inputElement = document.querySelector("#searchInput");
  const inputValue = inputElement.value;
  renderAlbum(inputValue);
}

function makeAlbums(albums) {
  const allAlbums = document.querySelector("#allAlbums");
  allAlbums.innerHTML = "";

  const albumContainer = document.querySelector("#albumContainer");
  albumContainer.style.display = "block";

  for (let result of albums) {
    var trimmedName =
      result.name.length > albumNameLength
        ? result.name.substring(0, albumNameLength - 3) + "..."
        : result.name;

    allAlbums.insertAdjacentHTML(
      "beforeend",
      `<div class="p-1 col">
        <div class="card album-card">
            <img src="${result.image[3]["#text"]}" class="card-img-top" alt="...">
            <div class="card-body">
                <h4 class="card-text">${trimmedName}</h4>
            </div>
        </div>
    </div>`
    );
  }
}

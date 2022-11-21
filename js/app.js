// Tämä avain ei pitäisi olla näkyvissä githubissa.
// Pitäisi olla backend
const API_KEY = "fe0a387a761610f339793ba9a3810acc";
const API_endpoint = "https://ws.audioscrobbler.com/2.0";
const albumNameLength = 20;

const suggestedArtistButtons = document.querySelectorAll(".artist-button");
suggestedArtistButtons.forEach((element) => {
  element.addEventListener("click", handleArtistButtonClicked);
});

const form = document.querySelector("#searchMusic");
form.addEventListener("submit", enteredArtist);

function handleArtistButtonClicked(clickEvent) {
  const buttonElement = clickEvent.target;
  const artist = buttonElement.innerHTML;
  fetchArtistInfo(artist);
}

// Tämä ottaa artistejen nimet ja näyttää albumit
// encodeURI antaa erikois ä,ö Å oman koodin esim. encodeURI('Hälö')
// tulostaa'H%C3%A4l%C3%B6'
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

    //filter out jolla on kuva ja nimi
    const filteredAlbums = album.filter((result) => {
      return result.name !== "(null)" && result.image[3]["#text"];
    });

    if (filteredAlbums.length) {
      // Insert album to HTML
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

//Antaa formEventin. Kun kirjoitan jotain ja submitform.
function enteredArtist(submitEvent) {
  submitEvent.preventDefault();
  const inputElement = document.querySelector("#searchInput");
  const artist = inputElement.value;
  fetchArtistInfo(artist);
}

async function fetchAlbumInfo(artist, album) {
  const albumDataResponse = await fetch(
    `${API_endpoint}/?method=album.getinfo&artist=${encodeURI(
      artist
    )}&album=${encodeURI(album)}&api_key=${API_KEY}&format=json`
  );
  const data = await albumDataResponse.json();
  const tracks = data.album.tracks.track;
  return tracks;
}

// Take album and insert to HTML with #allAlbum
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
      `<div class="p-1 col" data-url="${result.url}">
        <div class="card album-card">
            <img src="${result.image[3]["#text"]}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-text">${trimmedName}</h5>
                <button class="btn btn-outline-success view-album-button" data-url="${result.url}" data-album="${result.name}" data-artist="${result.artist.name}">View songs</button>
            </div>
        </div>
        <div class="album-info">
            <ol class="album-info-list"></ol>
        </div>
    </div>`
    );

    const viewAlbumButtons = document.querySelectorAll(".view-album-button");
    viewAlbumButtons.forEach((element) => {
      element.addEventListener("click", handleViewButtonClicked);
    });
  }
}

async function handleViewButtonClicked(clickEvent) {
  const artist = clickEvent.target.getAttribute("data-artist");
  const album = clickEvent.target.getAttribute("data-album");
  const url = clickEvent.target.getAttribute("data-url");

  const albumElement = document.querySelector(`[data-url="${url}"]`);
  const albumInfoElement = albumElement.querySelector(".album-info-list");

  // If doesn't have active-album class name
  if (albumElement.className.indexOf("active-album") === -1) {
    albumElement.className = "p-1 active-album";
    clickEvent.target.innerHTML = "Close information";
  } else {
    albumElement.className = "p-1 col";
    clickEvent.target.innerHTML = "View songs";
    albumInfoElement.innerHTML = "";
    return;
  }

  try {
    const tracks = await fetchAlbumInfo(artist, album);

    if (tracks.length > 0) {
      for (let track of tracks) {
        albumInfoElement.insertAdjacentHTML(
          "beforeend",
          `
          <li>${track.name}</li>
          `
        );
      }
    } else {
      albumInfoElement.insertAdjacentHTML(
        "beforeend",
        `
        <li>${album}</li>
        `
      );
    }
  } catch {
    albumInfoElement.insertAdjacentHTML(
      "beforeend",
      `
      <li><b>Error:</b> No tracks found.</li>
      `
    );
  }
}

fetchArtistInfo("Adele");

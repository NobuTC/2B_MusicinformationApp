// Tämä avain ei pitäisi olla näkyvissä githubissa.
// Pitäisi olla backend
const API_KEY = "fe0a387a761610f339793ba9a3810acc";
const API_endpoint = "https://ws.audioscrobbler.com/2.0";
const albumNameLength = 20;

const suggestedArtistButtons = $(".artist-button");
suggestedArtistButtons.each((index, element) => {
  $(element).click(handleArtistButtonClicked);
});

const form = $("#searchMusic");
form.submit(enteredArtist);

function handleArtistButtonClicked(clickEvent) {
  const buttonElement = clickEvent.target;
  const artist = $(buttonElement).html();
  fetchArtistInfo(artist);
}

// Tämä ottaa artistejen nimet ja näyttää albumit
// encodeURI antaa erikois ä,ö Å oman koodin esim. encodeURI('Hälö')
// tulostaa'H%C3%A4l%C3%B6'
// http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=Cher&api_key=YOUR_API_KEY&format=json
async function fetchArtistInfo(artistName) {
  const errorMessageEl = $("#error-message");
  const inputElement = $("#searchInput");
  const artist = inputElement.val(artistName);

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
      const allAlbums = $("#allAlbums");
      makeAlbums(filteredAlbums);

      errorMessageEl.css("display", "none");
    } else {
      errorMessageEl.css("display", "block");
    }
  } catch (e) {
    const allAlbums = $("#allAlbums");
    allAlbums.innerHTML = "";
    errorMessageEl.css("display", "block");
    console.error(e);
  }
}

//Antaa formEventin. Kun kirjoitan jotain ja submitform.
function enteredArtist(submitEvent) {
  submitEvent.preventDefault();
  const inputElement = $("#searchInput");
  const artist = inputElement.val();
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
  const allAlbums = $("#allAlbums");
  allAlbums.html("");

  const albumContainer = $("#albumContainer");
  albumContainer.css("display", "block");

  let i = 0;
  for (let result of albums) {
    i++;
    var trimmedName =
      result.name.length > albumNameLength
        ? result.name.substring(0, albumNameLength - 3) + "..."
        : result.name;

    const btn = $(
      ` <button class="btn btn-outline-success view-album-button" data-url="${result.url}" data-album="${result.name}" data-artist="${result.artist.name}">View songs</button>`
    );

    btn.click(handleViewButtonClicked);

    const el = $(`<div class="p-1 col album-cover" data-url="${result.url}">
        <div class="card album-card">
            <img src="${result.image[3]["#text"]}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-text">${trimmedName}</h5>
            </div>
        </div>
        <div class="album-info">
            <ol class="album-info-list"></ol>
        </div>
    </div>`);
    el.find('[class*="card-body"]').first().append(btn);
    allAlbums.append(el);
    allAlbums.find('[class*="album-cover"]');

    if (i === 1) {
      $(".background-picture").css(
        "background-image",
        "url(" + result.image[3]["#text"] + ")"
      );
    }
  }
}

let shouldShowSongs = false;

async function handleViewButtonClicked(clickEvent) {
  const artist = $(clickEvent.target).attr("data-artist");
  const album = $(clickEvent.target).attr("data-album");
  const url = $(clickEvent.target).attr("data-url");

  const albumElement = $(`[data-url="${url}"]`);
  const albumInfoElement = albumElement
    .find('[class*="album-info-list"]')
    .first();

  albumInfoElement.hide();

  // If doesn't have active-album class name
  if (!albumElement.hasClass("active-album")) {
    albumElement.removeClass("col");
    albumElement.addClass("active-album");
    clickEvent.target.innerHTML = "Close information";
    shouldShowSongs = true;
  } else {
    albumElement.addClass("col");
    albumElement.removeClass("active-album");
    clickEvent.target.innerHTML = "View songs";
    albumInfoElement.html("");
    shouldShowSongs = false;
    return;
  }

  try {
    const tracks = await fetchAlbumInfo(artist, album);

    // Prevent double click
    if (!shouldShowSongs) return;

    if (tracks.length > 0) {
      for (let track of tracks) {
        albumInfoElement.append(
          `
          <li>${track.name}</li>
          `
        );
      }
    } else {
      albumInfoElement.append(
        `
        <li>${album}</li>
        `
      );
    }
    albumInfoElement.fadeIn();
  } catch (e) {
    albumInfoElement.append(
      `
      <li><b>Error:</b> No tracks found.</li>
      `
    );
    albumInfoElement.fadeIn();
    console.error(e);
  }
}

$("#logo").click(function (e) {
  e.preventDefault();
  location.reload();
});

fetchArtistInfo("Jonas Brothers");

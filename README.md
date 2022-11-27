# MusicInformationApp

Tässä voi etsiä artistijen albumeita.
Albumeissa on myös niiden biisit.

https://ubiquitous-flan-189248.netlify.app

## App.js

- I get API_KEY, API URL from last.fm developer page

- Select all suggestion-artist buttons
- Add click event listener to them and the callback function
- Select search form
- Add submit event listener and the callback function

Inside that callback function:

- Get artist from click event or form-submit event
- call fetch artist info

Line 25: Fetch artist info

- Call lastFM API to get artist's top albums
- Take only albums with name and image
- If there are albums, insert these album to HTML with makeAlbum function
- If Error, then show the error with Catch

Line 77: MakeAlbum:

- Insert albums to HTML, add click-event-listener to the album's butons.

Line 113: When button clicked

- we call LastFM API to get album info (album.getinfo) such as tracks
- After we get tracks, insert the tracks into HTML
- If error, show error with Catch

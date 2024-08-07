// Initialize variables for authorize function
var token = localStorage.getItem("access_token");
var client_id = "5a75f049e9d940a8ad4b6738f9365b4b";
var redirect_uri = "https://crchew.github.io/spotify-clone-tutorial/";
var scope = "user-read-private user-read-email user-top-read";

function authorize() {
  var url = "https://accounts.spotify.com/authorize";
  url += "?response_type=token";
  url += "&client_id=" + encodeURIComponent(client_id);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  window.location.href = url; 
}

function extractTokenFromURI() {
  var hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    var url = hash.replace("#access_token=", "").split("&")[0];
    var token = url.split("=")[1];
    saveToken(token);
    return token;
  }
  return null;
}

// Check for token expiration and reauthorize if needed
function checkTokenExpiration() {
  var expirationTime = localStorage.getItem("token_expiration");
  if (expirationTime && !isNaN(expirationTime) && Date.now() > parseInt(expirationTime)) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_expiration");
    token = null;
    authorize();
  }
}

// Check for authorization completion to stop calling the authorize function
window.addEventListener("load", function() {
  localStorage.getItem("access_token");
  if (!token) {
    // Token not found in localStorage, try extracting from URI
    token = extractTokenFromURI();
    if (token) {
      // Token extracted successfully, save to localStorage
      console.log("Token extracted:", token);
      fetchUserTopItems();
      fetchNewReleases();
      fetchFeaturedPlaylists();
    } else {
      authorize();
    }
  } else {
    // Token found in localStorage, check expiration
    console.log("Token from localStorage:", token);
    checkTokenExpiration();
    fetchUserTopItems();
    fetchNewReleases();
    fetchFeaturedPlaylists();
  }
});

// Save token and expiration time to localStorage
function saveToken(token, expiresIn) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("token_expiration", Date.now() + expiresIn * 1000);
}

function generateCard(image, title, subtitle, href) {
  return `
    <a class="card" href="${href}" target="_blank">
        <img
            src="${image}"
            alt="peaceful piano"
            srcset=""
        />
        <span class="mdi mdi-play mdi-36px"></span>
        <div class="title">${title}</div>
        <div class="subtitle">${subtitle}</div>
    </a>
    `;
}

// Fetch three endpoints

async function fetchUserTopItems() {
  try {
    checkTokenExpiration();
    var endpoint = "https://api.spotify.com/v1/me/top/tracks";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    var data = await response.json();
    console.log("User top items", data);
    if (data && data.items && data.items.length) {
      displayUserTopItems(data); // Display user top items
    } else {
      console.log("No top items found or data structure is different", data);
    }
  } catch (error) {
    alert("Something went wrong: " + error.message);
    console.log(error);
  }
}

async function fetchNewReleases() {
  try {
    checkTokenExpiration();
    var endpoint = "https://api.spotify.com/v1/browse/new-releases";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    var data = await response.json();
    console.log("New releases", data);
    if (data && data.albums && data.albums.items && data.albums.items.length) {
      displayNewReleases(data); // Display new releases
    } else {
      console.log("No new releases found or data structure is different", data);
    }
  } catch (error) {
    alert("Something went wrong: " + error.message);
    console.log(error);
  }
}

async function fetchFeaturedPlaylists() {
  try {
    checkTokenExpiration();
    var endpoint = "https://api.spotify.com/v1/browse/featured-playlists";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    var data = await response.json();
    console.log("Featured playlists", data);
    if (data && data.playlists && data.playlists.items && data.playlists.items.length) {
      displayFeaturedPlaylists(data); // Display featured playlists
    } else {
      console.log("No featured playlists found or data structure is different", data);
    }
  } catch (error) {
    alert("Something went wrong: " + error.message);
    console.log(error);
  }
}

// Display fetched data on the page

function displayUserTopItems(data) {
  var section = document.querySelector("#your-top-items");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "Your Top Items";
  sectionSubtitle.textContent = "Based on your recent listening";
  
  if (!data.items.length) {
    sectionWrapper.innerHTML = "<h1> Uh oh! Looks like you haven't listened to anything recently. Go listen to some music on <a href='https://open.spotify.com' target='_blank'>Spotify</a> and come back here!</h1>";
    return;
  }
  
  for (let i = 0; i < data.items.length; i++) {
    var track = data.items[i];

    var image = track.album.images[1].url;
    var title = track.name;
    var subtitle = track.album.artists[0].name;
    var href = track.album.external_urls.spotify;

    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

function displayNewReleases(data) {
  var section = document.querySelector("#new-releases");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "New Releases";
  sectionSubtitle.textContent = "New releases from Spotify";

  if (!data.albums.items.length) {
    sectionWrapper.innerHTML = "<h1> Uh oh! Looks like there aren't any new releases right now. Try again later!</h1>";
    return;
  }

  for (let i = 0; i < data.albums.items.length; i++) {
    var track = data.albums.items[i];

    var image = track.images[1].url;
    var title = track.name;
    var subtitle = track.artists[0].name;
    var href = track.external_urls.spotify;

    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

function displayFeaturedPlaylists(data) {
  var section = document.querySelector("#featured-playlists");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "Featured Playlists";
  sectionSubtitle.textContent = "Featured playlists from Spotify";

  if (!data.playlists.items.length) {
    sectionWrapper.innerHTML = "<h1> Uh oh! Looks like there aren't any featured playlists right now. Try again later!</h1>";
    return;
  }
  
  for (let i = 0; i < data.playlists.items.length; i++) {
    var track = data.playlists.items[i];

    var image = track.images[0].url;
    var title = track.name;
    var subtitle = track.description;
    var href = track.external_urls.spotify;

    subtitle = subtitle.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

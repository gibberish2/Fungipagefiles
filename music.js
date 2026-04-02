let player;
let queue = [];
let currentIndex = 0;
let playerReady = false;

/* -----------------------------
   INIT YOUTUBE PLAYER
----------------------------- */
function onYouTubeIframeAPIReady() {
    player = new YT.Player('ytplayer', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: {
            autoplay: 1,
            playsinline: 1
        },
        events: {
            onReady: () => {
                playerReady = true;
                console.log("YouTube Player Ready");
            },
            onStateChange: onStateChange
        }
    });
}

function onStateChange(e) {
    if (e.data === YT.PlayerState.ENDED) {
        currentIndex++;
        if (currentIndex < queue.length) {
            playFromQueue();
        }
    }
}

/* -----------------------------
   SEARCH YOUTUBE
----------------------------- */
async function searchYouTube() {
    const query = document.getElementById("search-input").value;
    if (!query) return;

    const API_KEY = "AIzaSyDB3ijq7TdKKElkH16woL4htaUCCHVVCB4";

    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
    );

    const data = await res.json();

    if (!data.items) {
        console.error("API Error:", data);
        alert("Search failed (check API key or quota)");
        return;
    }

    queue = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        image: item.snippet.thumbnails.medium.url
    }));

    currentIndex = 0;
    renderQueue();

    if (queue.length > 0) {
        playFromQueue();
    }
}

/* -----------------------------
   PLAYBACK
----------------------------- */
function playFromQueue() {
    let item = queue[currentIndex];
    if (!item || !playerReady) return;

    document.getElementById("popup-title").textContent = item.title;
    document.getElementById("popup-thumb").src = item.image;
    document.getElementById("now-playing").textContent = item.title;

    player.loadVideoById(item.id);
    player.playVideo();
}

function togglePlay() {
    if (!player) return;

    let state = player.getPlayerState();

    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function skip(seconds) {
    if (!player) return;
    let t = player.getCurrentTime();
    player.seekTo(t + seconds, true);
}

function adjustVolume(v) {
    if (!player) return;
    player.setVolume(v * 100);
}

function togglePopup(show) {
    document.getElementById("music-popup").style.display = show ? "block" : "none";
}

/* -----------------------------
   QUEUE RENDER
----------------------------- */
function renderQueue() {
    const el = document.getElementById("playlist");
    el.innerHTML = "";

    queue.forEach((song, i) => {
        const div = document.createElement("div");
        div.className = "track";

        div.innerHTML = `
            <img src="${song.image}" class="track-thumb" />
            <div class="track-info">
                <div class="track-title">${song.title}</div>
            </div>
        `;

        div.onclick = () => {
            currentIndex = i;
            playFromQueue();
        };

        el.appendChild(div);
    });
}

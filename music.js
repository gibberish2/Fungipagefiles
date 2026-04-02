let player;
let queue = [];
let currentIndex = 0;
let playerReady = false;

let player;
let queue = [];
let currentIndex = 0;
let playerReady = false;

/* -----------------------------
   INIT YOUTUBE PLAYER
----------------------------- */
function onYouTubeIframeAPIReady() {
    console.log("YT API Loaded");

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

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`
        );

        const data = await res.json();

        console.log("API RESPONSE:", data);

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

        // Don’t auto-play if player isn’t ready yet
        if (playerReady && queue.length > 0) {
            playFromQueue();
        }

    } catch (err) {
        console.error("Fetch error:", err);
    }
}

/* -----------------------------
   PLAYBACK
----------------------------- */
function playFromQueue() {
    const item = queue[currentIndex];
    if (!item) return;

    if (!player) {
        console.warn("Player not initialized yet");
        return;
    }

    if (!playerReady) {
        console.warn("Player not ready, retrying...");
        setTimeout(playFromQueue, 500);
        return;
    }

    console.log("Playing:", item.id);

    document.getElementById("now-playing").textContent = item.title;

    try {
        player.loadVideoById(item.id);
        player.playVideo();
    } catch (err) {
        console.error("Playback error:", err);
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

        div.addEventListener("click", () => {
            currentIndex = i;
            playFromQueue();
        });

        el.appendChild(div);
    });
}

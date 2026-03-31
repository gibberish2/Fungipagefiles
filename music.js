// 1. SONG DATABASE
const songList = [
    { title: "A Familiar Room - Aaron Cherof", url: "https://codehs.com/uploads/237ec11a053d7d528e269b1bf7593cea", image: "https://codehs.com/uploads/dbf77e4f4711feb9506d37e52b30a2dd" },
    { title: "Twenty One Pilots - Stressed Out (Tomsize Remix)", url: "https://codehs.com/uploads/4733f26a82e8e1002aa5a1db2ced4466", image: "https://codehs.com/uploads/92f9f3da22f3373586a670757a49a20b" },
    { title: "Jimmy Buffet - Pencil Thin Mustache", url: "https://codehs.com/uploads/1afa47e41ba470639a4b8ad07efe7fa8", image: "https://codehs.com/uploads/a9045b8614eb98f50a286af352745e41" },
    { title: "The Beatles - Penny Lane", url: "https://codehs.com/uploads/a7e01d5cc1c0a95fc06e42135db166fc", image: "https://codehs.com/uploads/9e82b546b192e4595e94b9a816f56fcb" },
    { title: "Friday The Thirteenth - Title Song", url: "https://codehs.com/uploads/ffdbb83b5915902ac508b55f84ee43e9", image: "https://codehs.com/uploads/52e60a825544af1340b3e878226311aa" },
    { title: "WRLD - Hang Up (feat. Savoi) [Monstercat Release]", url: "https://codehs.com/uploads/df75c7838a368d109b44c9060b0f9056", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRHKtaj771Gbrkf0e2rW5pSqkYFAX6qXKDjw&s" },
];
if (!window.fungiAudio) { window.fungiAudio = new Audio(); }
const audio = window.fungiAudio;

function loadPlaylist() {
    const grid = document.getElementById('playlist');
    if (!grid) return;
    grid.innerHTML = ""; 
    songList.forEach(song => {
        const btn = document.createElement('button');
        btn.className = "game-btn music-song-btn"; // Added a specific class
        btn.style.cssText = `
            background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${song.image}');
            height: 80px; 
            width: 100%; 
            border-radius: 8px; 
            border: 1px solid var(--accent-color);
            color: white; 
            cursor: pointer; 
            background-size: cover; 
            background-position: center;
            font-weight: bold; 
            margin-bottom: 5px;
            display: block;
            font-family: 'Comic Sans MS', cursive; 
            font-size: 14px;
            /* SMOOTH ANIMATION */
            transition: transform 0.2s ease, filter 0.2s ease; 
        `;
        btn.innerHTML = song.title;
        btn.onclick = () => playSong(song.title, song.url);
        grid.appendChild(btn);
    });
}
function playSong(title, url) {
    localStorage.setItem('currentTrack', url);
    localStorage.setItem('trackName', title);
    localStorage.setItem('isPlaying', 'true');
    audio.src = url;
    audio.play().catch(() => console.log("User must interact first"));
    updateUI(title, true);
}

function updateUI(title, playing) {
    const popup = document.getElementById('music-popup');
    const pTitle = document.getElementById('popup-title');
    const pBtn = document.getElementById('master-play-btn');
    if (pTitle) pTitle.innerText = title || "Music";
    if (pBtn) pBtn.innerText = playing ? "⏸" : "▶";
    
    // FIX: Always show popup if title is set, or if explicitly playing
    if (popup) { popup.style.display = 'block'; } 
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        localStorage.setItem('isPlaying', 'true');
    } else {
        audio.pause();
        localStorage.setItem('isPlaying', 'false');
    }
    updateUI(localStorage.getItem('trackName'), !audio.paused);
}

function skip(s) { audio.currentTime += s; }

// FIX: Volume shared between pages
function adjustVolume(val) { 
    audio.volume = val; 
    localStorage.setItem('userVolume', val); 
}

function togglePopup(show) {
    const popup = document.getElementById('music-popup');
    if (popup) popup.style.display = show ? 'block' : 'none';
    if (!show) { 
        audio.pause(); 
        localStorage.setItem('isPlaying', 'false'); 
    }
}

// BUG FIX: Save song progress to localStorage as it plays
audio.addEventListener('timeupdate', () => {
    localStorage.setItem('trackTime', audio.currentTime);
});

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
    loadPlaylist();
    const el = document.getElementById("music-popup");
    if (!el) return;

    // Set Comic Sans globally for popup
    el.style.fontFamily = "'Comic Sans MS', cursive";

    const track = localStorage.getItem('currentTrack');
    const name = localStorage.getItem('trackName');
    const savedTime = localStorage.getItem('trackTime'); 
    const savedVol = localStorage.getItem('userVolume'); // FIX: Get saved volume
    const isPlaying = localStorage.getItem('isPlaying') === 'true';
    
    if (track) {
        audio.src = track;
        
        // FIX: Apply saved volume level and update slider UI
        if (savedVol !== null) {
            audio.volume = parseFloat(savedVol);
            const vSlider = document.getElementById('volume-slider');
            if (vSlider) vSlider.value = savedVol;
        }

        // BUG FIX: Retrieve last position
        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }

        // BUG FIX: Auto-resume if it was playing on the previous page
        if (isPlaying) {
            audio.play().catch(() => {
                // Browsers block autoplay; music will resume after first user click
                document.addEventListener('click', () => audio.play(), { once: true });
            });
        }
        
        updateUI(name, isPlaying); 
    }

    // Dragging Logic
    const header = el.querySelector(".popup-header");
    header.onmousedown = (e) => {
        if(e.target.tagName === 'BUTTON') return;
        let ox = e.clientX - el.offsetLeft;
        let oy = e.clientY - el.offsetTop;
        document.onmousemove = (e) => {
            el.style.left = (e.clientX - ox) + "px";
            el.style.top = (e.clientY - oy) + "px";
            el.style.bottom = "auto"; el.style.right = "auto";
        };
        document.onmouseup = () => document.onmousemove = null;
    };

    // Resize Logic (8-way)
    el.querySelectorAll(".resizer").forEach(resizer => {
        resizer.onmousedown = (e) => {
            e.preventDefault();
            const startW = el.offsetWidth, startH = el.offsetHeight;
            const startX = e.clientX, startY = e.clientY;
            const startL = el.offsetLeft, startT = el.offsetTop;

            window.onmousemove = (e) => {
                if (resizer.classList.contains("r")) el.style.width = startW + (e.clientX - startX) + "px";
                if (resizer.classList.contains("b")) el.style.height = startH + (e.clientY - startY) + "px";
                if (resizer.classList.contains("l")) {
                    el.style.width = startW - (e.clientX - startX) + "px";
                    el.style.left = startL + (e.clientX - startX) + "px";
                }
                if (resizer.classList.contains("t")) {
                    el.style.height = startH - (e.clientY - startY) + "px";
                    el.style.top = startT + (e.clientY - startY) + "px";
                }
                if (resizer.classList.contains("br")) {
                    el.style.width = startW + (e.clientX - startX) + "px";
                    el.style.height = startH + (e.clientY - startY) + "px";
                }
            };
            window.onmouseup = () => window.onmousemove = null;
        };
    });
});

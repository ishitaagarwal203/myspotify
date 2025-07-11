console.log('lets write javascript');

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;

    //Fetch songs from info.json 
    let res = await fetch(`/${folder}/info.json`);
    let data = await res.json();
    songs = data.songs;

    //Show songs in playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" width="34" src="music.svg" alt="music">
            <div class="info"><div>${song.replaceAll("%20", " ")}</div></div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="play">
            </div>
        </li>`;
    }

    //Click any song to play it
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums() {
    let res = await fetch("/songs/index.json");
    let folders = await res.json(); // ["Escape", "Chill", "Beats"]

    let cardContainer = document.querySelector(".cardContainer");

    for (let folder of folders) {
        try {
            let meta = await fetch(`/songs/${folder}/info.json`);
            let response = await meta.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="#3be477" />
                            <polygon points="40,30 70,50 40,70" fill="black" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="cover jpg">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
        } catch (err) {
            console.error(`Failed to load metadata for ${folder}`, err);
        }
    }

    // Add click events
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

    // Load playlist when card clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
  

async function main() {
    await getSongs("songs/Escape"); // default folder
    playMusic(songs[0], true);
    displayAlbums();

    //  Play/Pause toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Update song timer
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //  Seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Hamburger menu
    document.querySelector(".hamburgerCont").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Close menu
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

  // Previous button
previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index > 0) {
        playMusic(songs[index - 1]);
    }
});

// Next button
next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentSong.src.split("/").pop());
    let index = songs.indexOf(currentTrack);
    if (index < songs.length - 1) {
        playMusic(songs[index + 1]);
    }
});


    //  Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Mute/Unmute toggle
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();

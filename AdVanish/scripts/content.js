let intervalId


const addClock = () => {
    console.log('addClock')
    let overlay = document.querySelector('.easyIt-ext')
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.setAttribute('class', 'easyIt-ext')
    }

    overlay.innerHTML = `
         <div class="easyIt-data"></div>
    `

    const style = document.createElement('style')
    style.textContent = `
       .easyIt-ext{
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        pointer-events: none;
        background: linear-gradient(0deg, rgba(0,0,0, 0.3) 0%, rgba(0,0,0,0) 100%);
        z-index: 1000;
       }

       .easyIt-data{
          font-size: 50px;
          pointer-events: none;
          color: #fff;
          padding: 50px;
       }
    `
    const body = document.querySelector('body')
    body.appendChild(overlay)
    body.appendChild(style)

    intervalId = setInterval(() => {
        const data = document.querySelector('.easyIt-data')
        if (data) {
            const d = new Date()
            const hours = `${d.getHours()}`
            const mins = `${d.getMinutes()}`
            const secs = `${d.getSeconds()}`

            data.textContent = `${hours.padStart(2, '0')}:${mins.padStart(2, '0')}:${secs.padStart(2, '0')}`
        }
    }, 1000)
}

const removeClock = () => {
    clearInterval(intervalId)
    const content = document.querySelector('.easyIt-ext')
    if (content) {
        content.parentNode.removeChild(content)
    }
}

chrome.storage.sync.get(['showClock'], (result) => {
    if (result.showClock) {
        addClock()
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes?.showClock) {
        if (changes.showClock.newValue) {
            addClock()
        } else {
            removeClock()
        }
    }
});

// you
const taimuRipu = async () => {
    await new Promise((resolve, _reject) => {
        const videoContainer = document.getElementById("movie_player");

        const setTimeoutHandler = () => {
            const isAd = videoContainer?.classList.contains("ad-interrupting") || videoContainer?.classList.contains("ad-showing");
            const skipLock = document.querySelector(".ytp-ad-preview-text")?.innerText;
            const surveyLock = document.querySelector(".ytp-ad-survey")?.length > 0;

            if (isAd && skipLock) {
                const videoPlayer = document.getElementsByClassName("video-stream")[0];
                videoPlayer.muted = true; // videoPlayer.volume = 0;
                videoPlayer.currentTime = videoPlayer.duration - 0.1;
                videoPlayer.paused && videoPlayer.play()
                // CLICK ON THE SKIP AD BTN
                document.querySelector(".ytp-ad-skip-button")?.click();
                document.querySelector(".ytp-ad-skip-button-modern")?.click();
            } else if (isAd && surveyLock) {
                // CLICK ON THE SKIP SURVEY BTN
                document.querySelector(".ytp-ad-skip-button")?.click();
                document.querySelector(".ytp-ad-skip-button-modern")?.click();
            }

            const staticAds = [".ytd-companion-slot-renderer", ".ytd-action-companion-ad-renderer", // in-feed video ads
                ".ytd-watch-next-secondary-results-renderer.sparkles-light-cta", ".ytd-unlimited-offer-module-renderer", // similar components
                ".ytp-ad-overlay-image", ".ytp-ad-text-overlay", // deprecated overlay ads (04-06-2023)
                "div#root.style-scope.ytd-display-ad-renderer.yt-simple-endpoint", "div#sparkles-container.style-scope.ytd-promoted-sparkles-web-renderer",
                ".ytd-display-ad-renderer", ".ytd-statement-banner-renderer", ".ytd-in-feed-ad-layout-renderer", // homepage ads
                "div#player-ads.style-scope.ytd-watch-flexy, div#panels.style-scope.ytd-watch-flexy", // sponsors
                ".ytd-banner-promo-renderer", ".ytd-video-masthead-ad-v3-renderer", ".ytd-primetime-promo-renderer" // subscribe for premium & youtube tv ads
            ];

            staticAds.forEach((ad) => {
                document.hideElementsBySelector(ad);
            });

            resolve();
        };

        // RUN IT ONLY AFTER 100 MILLISECONDS
        setTimeout(setTimeoutHandler, 100);
    });

    taimuRipu();
};


const init = async () => {
    Document.prototype.hideElementsBySelector = (selector) =>
        [...document.querySelectorAll(selector)].forEach(
            (el) => (el.style.display = "none")
        );

    taimuRipu();
};

init();
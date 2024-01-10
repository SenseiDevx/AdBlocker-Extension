async function updateStaticRules(enableRulesetIds, disableCandidateIds) {
    let options = {enableRulesetIds: enableRulesetIds, disableRulesetIds: disableCandidateIds};
    const enabledStaticCount = await chrome.declarativeNetRequest.getEnabledRulesets();
    const proposedCount = enableRulesetIds.length;
    if (
        enabledStaticCount + proposedCount >
        chrome.declarativeNetRequest.MAX_NUMBER_OF_ENABLED_STATIC_RULESETS
    ) {
        options.disableRulesetIds = disableCandidateIds;
    }
    await chrome.declarativeNetRequest.updateEnabledRulesets(options);
}

export async function getRulesEnabledState() {
    const enabledRuleSets = await chrome.declarativeNetRequest.getEnabledRulesets();
    return enabledRuleSets.length > 0;
}

function browserReload() {
    return new Promise((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.reload(tabs[0].id, () => {
                resolve();
            });
        });
    });
}

export async function enableRulesForCurrentPage() {
    const enableRuleSetIds = ['default'];
    const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});

    if (activeTab) {
        const tabId = activeTab.id;
        await updateStaticRules(enableRuleSetIds, []);
        await browserReload(tabId);
    }
}

export async function disableRulesForCurrentPage() {
    const disableRuleSetIds = ['default'];
    const [activeTab] = await chrome.tabs.query({active: true, currentWindow: true});

    if (activeTab) {
        const tabId = activeTab.id;
        await updateStaticRules([], disableRuleSetIds);
        await browserReload(tabId);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.setExtensionActionOptions({displayActionCountAsBadgeText: false});
});

// you
chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'complete' && tab.url && tab.url.includes('youtube.com')) {
            chrome.runtime.onInstalled.addListener((details) => {
                switch (details.reason) {
                    case "install":
                        console.info("EXTENSION INSTALLED");
                        chrome.tabs.query({}, (tabs) => {
                            tabs
                                .filter((tab) => tab.url.startsWith("https://www.youtube.com/"))
                                .forEach(({id}) => {
                                    chrome.tabs.reload(id);
                                });
                        });
                        break;
                    case "update":
                        console.info("EXTENSION UPDATED");
                        break;
                    case "chrome_update":
                    case "shared_module_update":
                    default:
                        console.info("BROWSER UPDATED");
                        break;
                }
            });

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

                        resolve();
                    };

                    // RUN IT ONLY AFTER 100 MILLISECONDS
                    setTimeout(setTimeoutHandler, 100);
                });

                taimuRipu();
            };

            chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                if (
                    changeInfo.status === "complete" &&
                    String(tab.url).includes("https://www.youtube.com/watch")
                ) {
                    chrome.scripting.executeScript({
                        target: {tabId: tabId},
                        function: taimuRipu,
                    });
                }
            });
        }
    });
});
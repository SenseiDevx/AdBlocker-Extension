import {
    getRulesEnabledState,
    enableRulesForCurrentPage,
    disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('checkbox');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const cookies = document.querySelector('#cookies');
const BUTTON = document.querySelector(".switch__input");

function init() {
    BUTTON.addEventListener("click", () => {
        console.log(BUTTON);
        TOGGLE();
    });

    button.addEventListener('click', toggleAdBlocking);
    updateButtonState();
    getCookiesCount();
}

const TOGGLE = () => {
    const IS_PRESSED = BUTTON.checked;
    console.log(BUTTON.checked);
    // Функция изменения темы удалена
};

let a = 0;

async function toggleAdBlocking() {
    const isEnabled = await getRulesEnabledState();
    if (isEnabled) {
        await disableRulesForCurrentPage();
    } else {
        await enableRulesForCurrentPage();
    }
    a = 1;
    updateButtonState();
}

async function updateButtonState() {
    const isEnabled = await getRulesEnabledState();
    fetchDomain();
    if (!isEnabled) {
        text.innerHTML = 'Ad switched off.';
        button.checked = false;
        chrome.action.setBadgeText({text: ''});
        cookies.innerHTML = 0
        if (a > 0) showNotification('Ad Blocking Disabled', 'Ad blocking is now disabled for this site.');
    } else {
        text.innerHTML = 'Ad blocker active, and now working';
        button.checked = true;
        chrome.action.setBadgeText({text: 'ON'});
        if (a > 0) showNotification('Ad Blocking Enabled', 'Ad blocking is enabled on this site.');
        setAlarmForNotification();
    }
}

async function fetchDomain() {
    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    if (tab?.url) {
        try {
            let url = new URL(tab.url);
            domain.innerHTML = url.hostname;
        } catch {
        }
    }
}

function showNotification(title, message) {
    chrome.notifications.create('', {
        type: 'basic',
        iconUrl: '../assets/images/logo.png',
        title: title,
        message: message,
        priority: 2,
    });
}

function setAlarmForNotification() {
    chrome.alarms.create('reminder', {
        delayInMinutes: 1,
    });
}

function getCookiesCount() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var activeTab = tabs[0];
        if (activeTab.url) {
            chrome.cookies.getAll({url: activeTab.url}, function (cookie) {
                cookies.innerHTML = cookie.length;
            });
        }
    });
}

init();

const clockCheckbox = document.querySelector(".clock-ckeckbox");

chrome.storage.sync.get(["showClock"], (result) => {
    clockCheckbox.checked = result.showClock;
});

if (clockCheckbox) {
    clockCheckbox.addEventListener("click", async (e) => {
        const checked = e.target.checked;
        console.log(checked);
        chrome.storage.sync.set({showClock: checked});
    });
}

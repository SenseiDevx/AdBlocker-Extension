import {
    getRulesEnabledState,
    enableRulesForCurrentPage,
    disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('check');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const cookies = document.querySelector('#cookies');
const pauseButton = document.querySelector('.pause-block')
const mainFunction = document.querySelector('.main_function')
const protection = document.querySelector('.protection')

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
        protection.innerHTML = 'You are not protected'
        text.innerHTML = 'OFF'
        document.querySelector('body').style.backgroundColor = '#a341ff'
        document.querySelector('.container').style.backgroundColor = '#009dff'
        document.querySelector('.text-content').style.color = 'red'
        button.checked = false;
        chrome.action.setBadgeText({ text: '' });
        cookies.innerHTML = 0;
        if (a > 0) showNotification('Ad Blocking Disabled', 'Ad blocking is now disabled for this site.');
    } else {
        protection.innerHTML = 'You are protected'
        text.innerHTML = 'ON'
        document.querySelector('body').style.backgroundColor = 'rgb(49, 48, 48)'
        document.querySelector('.container').style.backgroundColor = '#009dff'
        document.querySelector('.text-content').style.color = '#01dca2'
        button.checked = true;
        chrome.action.setBadgeText({ text: 'ON' });
        if (a > 0) showNotification('Ad Blocking Enabled', 'Ad blocking is enabled on this site.');
        setAlarmForNotification();
    }
}


async function togglePauseResume() {
    try {
        if (pauseButton.textContent.includes('Pause AdBlock')) {
            await disableRulesForCurrentPage();
            chrome.storage.local.set({ adblockPaused: true });
            mainFunction.style.display = 'none';
            pauseButton.textContent = 'Resume AdBlocker';
            pauseButton.innerHTML = '<img class="pause" src="../assets/play-button.svg" alt="pause-icon"> Resume AdBlock';
        } else {
            await enableRulesForCurrentPage();
            chrome.storage.local.set({ adblockPaused: false });
            mainFunction.style.display = 'block';
            pauseButton.textContent = 'Pause AdBlock';
            pauseButton.innerHTML = '<img class="pause" src="../assets/pause-button.svg" alt="pause-icon"> Pause AdBlock';
        }
        updateButtonState();
    } catch (error) {
        console.error('Ошибка при переключении Adblock:', error);
    }
}



async function fetchDomain() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        try {
            const url = new URL(tab.url);
            domain.innerHTML = url.hostname;
        } catch {
            console.log("Error")
        }
    }
}

function showNotification(title, message) {
    chrome.notifications.create('', {
        type: 'basic',
        iconUrl: '../assets/images/logo.png',
        title,
        message,
        priority: 2,
    });
}

function setAlarmForNotification() {
    chrome.alarms.create('reminder', {
        delayInMinutes: 1,
    });
}

function getCookiesCount() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab.url) {
            chrome.cookies.getAll({ url: activeTab.url }, (cookie) => {
                cookies.innerHTML = cookie.length;
            });
        }
    });
}


function init() {
    chrome.storage.local.get(['adblockPaused'], function(result) {
        if (result.adblockPaused) {
            mainFunction.style.display = 'none';
            pauseButton.textContent = 'Resume AdBlocker';
            pauseButton.innerHTML = '<img class="pause" src="../assets/play-button.svg" alt="pause-icon"> Resume AdBlock';
        } else {
            mainFunction.style.display = 'block';
            pauseButton.textContent = 'Pause AdBlock';
            pauseButton.innerHTML = '<img class="pause" src="../assets/pause-button.svg" alt="pause-icon"> Pause AdBlock';
        }
    });

    button.addEventListener('click', toggleAdBlocking);
    pauseButton.addEventListener('click', togglePauseResume);
    updateButtonState();
    getCookiesCount();
}

init()
import {
    getRulesEnabledState,
    enableRulesForCurrentPage,
    disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('checkbox');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const cookies = document.querySelector('#cookies');

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
        text.innerHTML = 'OFF';
        document.querySelector('.text-content').style.color = 'red'
        button.checked = false;
        chrome.action.setBadgeText({ text: '' });
        cookies.innerHTML = 0;
        if (a > 0) showNotification('Ad Blocking Disabled', 'Ad blocking is now disabled for this site.');
    } else {
        text.innerHTML = 'ON';
        document.querySelector('.text-content').style.color = '#008000'
        button.checked = true;
        chrome.action.setBadgeText({ text: 'ON' });
        if (a > 0) showNotification('Ad Blocking Enabled', 'Ad blocking is enabled on this site.');
        setAlarmForNotification();
    }
}

async function fetchDomain() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
        try {
            const url = new URL(tab.url);
            domain.innerHTML = url.hostname;
        } catch {
            // Обработка ошибок, если URL некорректен
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
    button.addEventListener('click', toggleAdBlocking);
    updateButtonState();
    getCookiesCount();
}

init();

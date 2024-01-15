async function updateStaticRules(enableRulesetIds, disableCandidateIds) {
    const options = {
        enableRulesetIds,
        disableRulesetIds: disableCandidateIds,
    };
    const enabledStaticCount = await chrome.declarativeNetRequest.getEnabledRulesets();
    const proposedCount = enableRulesetIds.length;
    if (enabledStaticCount + proposedCount > chrome.declarativeNetRequest.MAX_NUMBER_OF_ENABLED_STATIC_RULESETS) {
        options.disableRulesetIds = disableCandidateIds;
    }
    await chrome.declarativeNetRequest.updateEnabledRulesets(options);
}

export async function getRulesEnabledState() {
    const enabledRuleSets = await chrome.declarativeNetRequest.getEnabledRulesets();
    return enabledRuleSets.length > 0;
}

function browserReload(tabId) {
    return new Promise((resolve) => {
        chrome.tabs.reload(tabId, () => {
            resolve();
        });
    });
}

export async function enableRulesForCurrentPage() {
    const enableRuleSetIds = ['default'];
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (activeTab) {
        const tabId = activeTab.id;
        await updateStaticRules(enableRuleSetIds, []);
        await browserReload(tabId);
    }
}

export async function disableRulesForCurrentPage() {
    const disableRuleSetIds = ['default'];
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (activeTab) {
        const tabId = activeTab.id;
        await updateStaticRules([], disableRuleSetIds);
        await browserReload(tabId);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: false });
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "../hello/hello.html" });
    }
});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.notifications.create('installNotification', {
            type: 'basic',
            iconUrl: "../assets/images/logo.png",
            title: 'Installation complete',
            message: 'The extension has been successfully installed!'
        });
    }
});


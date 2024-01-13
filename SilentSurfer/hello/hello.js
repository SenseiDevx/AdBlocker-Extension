const button = document.querySelector('.got-it-button')

button.addEventListener('click', function() {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        if (tabs.length > 1) {
            let currentTabIndex = tabs.findIndex(tab => tab.active);
            let previousTab = tabs[currentTabIndex - 1] || tabs[currentTabIndex + 1];

            chrome.tabs.update(previousTab.id, {active: true});
        }
    });
});

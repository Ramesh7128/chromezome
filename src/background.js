chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveTabs") {
    chrome.tabs.query({currentWindow: true}, function(tabs) {
      const tabGroup = {
        id: Date.now(),
        name: `Tabs saved on ${new Date().toLocaleString()}`,
        urls: tabs.map(tab => tab.url)
      };
      
      chrome.storage.local.get({tabGroups: []}, function(result) {
        const tabGroups = result.tabGroups;
        tabGroups.push(tabGroup);
        chrome.storage.local.set({tabGroups: tabGroups}, () => {
          sendResponse({success: true});
        });
      });
    });
    return true; // Indicates we will send a response asynchronously
  } else if (request.action === "closeAllTabs") {
    chrome.tabs.query({currentWindow: true, active: false}, function(tabs) {
      tabs.forEach(tab => {
        chrome.tabs.remove(tab.id);
      });
      sendResponse({success: true});
    });
    return true;
  } else if (request.action === "openDashboard") {
    chrome.tabs.create({url: 'dashboard.html'}, () => {
      sendResponse({success: true});
    });
    return true;
  } else if (request.action === "openTabs") {
    request.urls.forEach(url => {
      chrome.tabs.create({url: url});
    });
    sendResponse({success: true});
  }
});

// Optional: Add an event listener for when the extension is installed or updated
// chrome.runtime.onInstalled.addListener((details) => {
//   if (details.reason === "install") {
//     console.log("Extension installed");
//     // You can add any one-time setup here, like creating initial storage data
//   } else if (details.reason === "update") {
//     console.log("Extension updated");
//     // You can add any update logic here if needed
//   }
// });

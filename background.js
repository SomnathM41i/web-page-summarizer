chrome.action.onClicked.addListener((tab) => {
  try {
    if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
      console.warn("Cannot inject script into restricted pages.");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    }).then(() => {
      console.log("Content script injected successfully.");
    }).catch((err) => {
      console.error("Failed to inject content script:", err);
    });
  } catch (error) {
    console.error("Error in background.js:", error);
  }
});

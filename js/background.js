// remove any contexts created by multiple new tabs
chrome.contextMenus.removeAll();

function addSelection(info, tab) {
    if (!info || !info.selectionText) {
        return;
    } else {
        note.add(
            info.selectionText,
            false
        );
        updateChromeNewTab();
    }
}

chrome.contextMenus.create({
    "title": "Add selected text as note",
    "contexts": ["selection", "link"],
    "onclick": addSelection
});

chrome.contextMenus.onClicked.addListener(function callback(info, tab) {
    if (!info || !info.id) {
        return;
    } else if (info.id) {
        chrome.contextMenus.remove(
            info.id,
            updateChromeNewTab
        );
    }
});
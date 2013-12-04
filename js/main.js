// shortcut for ready
$(function() {
    init();
    originalNewTabLink();
});

function init() {
    try {
        // check for localStorage before continuing
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disabled "Private Mode", or upgrade to a modern browser');
            return;
        }

        /*

        note {obj}:
            content (string)
            updated (date)
            color (string)

        */

    } catch(err) {
        console.log('Try/catch error: ' + err);
    }
}

function originalNewTabLink() {
    var originalNewTab = $('.original-new-tab')[0];

    function openOriginalNewTab() {
        chrome.tabs.update({
            url: 'chrome-internal://newtab/'
        });
    }

    originalNewTab.addEventListener('click', function(){
        openOriginalNewTab();
        return false;
    });
}
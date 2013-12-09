// run our init() command once the page has loaded
$(function() {
    init();
});

function init() {
    try {
        // check for localStorage before continuing
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disabled "Private Mode", or upgrade to a modern browser');
            return;
        }

        // load all functions
        quickAddNote();

    } catch(err) {
        return 'Try/catch error: ' + err;
    }
}


function quickAddNote() {
    $('#quick-note-form').submit(function(e) {
        e.preventDefault();
        var content = $('#quick-note-content')[0].value;
        if (content.length > 0)
        note.add(
            content,
            false
        );
        updateChromeNewTab();
        window.close();
    });

    $('#quick-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            var content = $('#quick-note-content')[0].value;
            if (content.length > 0)
            note.add(
                content,
                false
            );
            updateChromeNewTab();
            window.close();
        }
    });
}

function updateChromeNewTab() {
    var queryInfo = {
        title: 'Chrome Note Tab'
    };

    chrome.tabs.query(queryInfo, function callback(tabArray) {
        if (tabArray && tabArray.length > 0) {
            for (var t = 0; t < tabArray.length; t++) {
                chrome.tabs.reload(tabArray[t].id);
            }
        }
    });
}
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
        modalAddNote();
        modalModifyNote();
        setKeyboardShortcuts();
        writeNotes();
        newTabLink();
        saveNewNote();
        saveModifiedNote();
        flagNote();
        deleteSingleNote();
        deleteAllNotes();
        setTooltips();
        setPageTitle();

    } catch(err) {
        return 'Try/catch error: ' + err;
    }
}


//
// Begin functions here
// =========================================================

function newTabLink() {
    var originalNewTab = $('#original-new-tab')[0];

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

function writeNotes() {
    var htmlArray = [];
    var noteArray = note.getAllAsArray();

    if (noteArray && noteArray.length) {
        var len = noteArray.length;
        for (var i = 0; i < len; i++) {
            htmlArray.push(note.html.panel(
                noteArray[i].id,
                noteArray[i].content,
                noteArray[i].flag,
                noteArray[i].updated
            ));
        }

        $('#note-container').html(note.html.row(htmlArray));
        var plural = (len == 1) ? '' : 's';
    }
}

function modalAddNote() {
    $('#add-note-modal').modal({
        show: false
    });

    $('#add-note-modal').on('hide.bs.modal', function() {
        $('#new-note-content')[0].value = '';
        $('#new-note-flag').removeClass('active btn-danger');
    });
}

function saveNewNote() {
    $('#add-note-form').submit(function(e) {
        e.preventDefault();
        var content = $('#new-note-content')[0].value;
        if (content.length > 0)
        note.add(
            content,
            ($('#new-note-flag').hasClass('active')) ? true : false
        );
        updateChromeNewTab();
    });

    $('#add-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            note.add(
                $('#new-note-content')[0].value,
                ($('#new-note-flag').hasClass('active')) ? true : false
            );
            updateChromeNewTab();
        }
    });
}

function modalModifyNote() {
    $('#modify-note-modal').modal({
        show: false
    });

    $('#modify-note-modal').on('hide.bs.modal', function() {
        $('#modify-note-id')[0].value = '';
        $('#modify-note-content')[0].value = '';
        $('#modify-note-flag').removeClass('active btn-danger');

    });

    $('#modify-note-modal').on('show.bs.modal', function(e) {
        var id = Number(e.relatedTarget.parentNode.offsetParent.id);
        var n = note.get(id);
        $('#modify-note-id')[0].value = id;
        $('#modify-note-content')[0].value = n.content;
        var f = $('#modify-note-flag');
        if (n.flag) { f.addClass('active'); }
    });

    $('#modify-note-modal').on('shown.bs.modal', function() {
        var f = $('#modify-note-flag');
        (f.hasClass('active')) ? f.addClass('btn-danger') : f.removeClass('btn-danger');
    });
}

function saveModifiedNote() {
    $('#modify-note-form').submit(function(e) {
        e.preventDefault();
        console.log(e);
        var id = Number($('#modify-note-id')[0].value);
        note.update(
            id,
            $('#modify-note-content')[0].value,
            ($('#modify-note-flag').hasClass('active')) ? true : false
        );
        updateChromeNewTab();
    });

    $('#modify-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            var id = Number($('#modify-note-id')[0].value);
            note.update(
                id,
                $('#modify-note-content')[0].value,
                ($('#modify-note-flag').hasClass('active')) ? true : false
            );
            updateChromeNewTab();
        }
    });
}

function flagNote() {
    $('.flag-note').each(function() {
        $(this).click(function() {
            note.flag(Number($(this).closest('.col-md-4').attr('id')));
            updateChromeNewTab();
        });
    });

    $('#new-note-flag').click(function() {
        ($(this).hasClass('active')) ? $(this).removeClass('btn-danger') : $(this).addClass('btn-danger');
    });

    $('#modify-note-flag').click(function() {
        ($(this).hasClass('active')) ? $(this).removeClass('btn-danger') : $(this).addClass('btn-danger');
    });
}

// create listener for deleting notes
function deleteSingleNote() {
    $('.delete-note').each(function() {
        $(this).click(function() {
            note.delete(Number($(this).closest('.col-md-4').attr('id')));
            updateChromeNewTab();
        });
    });
}

function deleteAllNotes() {
    $('#delete-all-notes').popover({
        show: false,
        animation: true,
        html: true,
        placement: 'top',
        trigger: 'click',
        title: 'Confirm delete',
        content: '<button id="cancel-delete-all-notes" type="button" class="btn btn-default"><span class="glyphicon glyphicon-ban-circle"></span></button><button id="confirm-delete-all-notes" type="button" class="btn btn-danger"><span class="glyphicon glyphicon-trash"></span></button>',
        container: '#wrap'
    });

    $('#delete-all-notes').on('shown.bs.popover', function() {
        $('#cancel-delete-all-notes').click(function() {
            $('#delete-all-notes').popover('hide');
        });
    });

    $('#delete-all-notes').on('shown.bs.popover', function() {
        $('#confirm-delete-all-notes').click(function() {
            note.deleteAll();
            updateChromeNewTab();
            $('#delete-all-notes').popover('destroy');
        });
    });
}

function setKeyboardShortcuts() {
    $('body').keypress(function(e) {
        // CTRL + ALT + N
        if (e.which == 14 && e.ctrlKey && e.altKey) {
            e.preventDefault();
            $('#add-note-modal').modal('show');
        }
    });
}

function setTooltips() {
    $('#original-new-tab').tooltip({
        html: true,
        placement: 'bottom',
        title: 'Default Chrome<br>new tab page',
        trigger: 'hover focus',
        container: 'body'
    });
}

function setPageTitle() {
    var nCount = note.getAllCount();

    if (nCount && nCount > 0) {
        var plural = (nCount == 1) ? '' : 's';
        $('#page-title').html('Viewing ' + nCount + ' note' + plural);
    }
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
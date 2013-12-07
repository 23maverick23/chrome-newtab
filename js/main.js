// shortcut for ready
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

        modalAddNote();
        modalModifyNote();
        writeNotes();
        newTabLink();
        saveNewNote();
        saveModifiedNote();
        flagNote();
        deleteSingleNote();
        deleteAllNotes();

    } catch(err) {
        return 'Try/catch error: ' + err;
    }
}

// create listener for opening default new tab page
function newTabLink() {
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

//
// Note functions
// ================================================

// pull notes from localStorage and add to page
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

        $('#note-container').append(note.html.row(htmlArray));
        var plural = (len == 1) ? '' : 's';
        $('footer p').html('You currently have ' + len + ' note' + plural + '.');
    } else {
        $('footer p').html('You currently have no notes. Create some!');
    }
}

// add a new note modal
function modalAddNote() {
    $('#add-note-modal').modal({
        show: false
    });

    $('#add-note-modal').on('hide.bs.modal', function() {
        $('#new-note-content')[0].value = '';
        $('#new-note-flag').removeClass('active btn-danger');
    });

    //show.bs.modal
}

// save a new note
function saveNewNote() {
    $('#add-note-form').submit(function(e) {
        e.preventDefault();
        var content = $('#new-note-content')[0].value;
        if (content.length > 0)
        note.add(
            content,
            ($('#new-note-flag').hasClass('active')) ? true : false
        );
        location.reload();
    });

    $('#add-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            note.add(
                $('#new-note-content')[0].value,
                ($('#new-note-flag').hasClass('active')) ? true : false
            );
            location.reload();
        }
    });
}


// modify note modal
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

// save a modified note
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
        location.reload();
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
            location.reload();
        }
    });
}

function flagNote() {
    $('.flag-note').each(function() {
        $(this).click(function() {
            note.flag(Number($(this).closest('.col-md-4').attr('id')));
            location.reload();
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
            location.reload();
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
            location.reload();
            $('#delete-all-notes').popover('destroy');
        });
    });
}

/*
 Creates a note object.

 id (str): unique id; uses UTC date in milliseconds
 updated (str): locale date/time string
 content (str): string content

*/
var note = {
    add: function(content, flag) {
        if (!content || typeof content !== "string") {
            return "content must be type string!";
        }

        var n = {};
        var d = new Date();
        var id = d.getTime();
        n.id = id;
        n.content = content;
        n.flag = (flag && typeof flag == "boolean") ? true : false;
        n.updated = d.toLocaleString();

        store.set(id, n);
        return 'added id:' + n.id;
    },
    get: function(id) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }

        var n = store.get(id);
        return n;
    },
    getAll: function() {
        var n = store.getAll();
        return n;
    },
    getAllAsArray: function() {
        var objects = this.getAll();
        var array = [];

        for (key in objects) {
            array.push(objects[key]);
        }

        return array;
    },
    update: function(id, content, flag) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }
        if (!content || typeof content !== "string") {
            return "content must be type string!";
        }

        var oldNote = this.get(id);
        if (oldNote) {
            var d = new Date();
            var newNote = {}
            newNote.id = oldNote.id;
            newNote.flag = flag;
            newNote.content = content;
            newNote.updated = d.toLocaleString();

            store.set(id, newNote);
        } else {
            return "unable to find a note with id == " + id;
        }

        return 'updated id:' + id;
    },
    flag: function(id) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }

        var oldNote = this.get(id);
        if (oldNote) {
            var d = new Date();
            var newNote = {}
            newNote.id = oldNote.id;
            newNote.content = oldNote.content;
            newNote.flag = (oldNote.flag) ? false : true;
            newNote.updated = d.toLocaleString();

            store.set(id, newNote);
        } else {
            return "unable to find a note with id == " + id;
        }

        return 'note id:' + id + ' flag:' + newNote.flag;
    },
    delete: function(id) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }
        store.remove(id);
        return 'deleted id:' + id;
    },
    deleteAll: function() {
        var total = this.getAllAsArray().length;
        var plural = (total == 1) ? '' : 's';
        var notes = store.clear();
        return 'deleted ' + total + ' note' + plural;
    }
}

note.html = note.prototype = {
    row: function(colsArray) {
        if (!colsArray || typeof colsArray !== "object") {
            return "colsArray must be type array!";
        }

        var rows = Math.ceil(colsArray.length / 3);  // max number of rows needed
        var content = '';

        for (var i = 0; i < rows; i++) {
            var row = colsArray.splice(0, 3);
            content += '<div class="row">';

            for (var j = 0; j < row.length; j++) {
                content += row[j];
            }

            content += '</div>';
        }

        return content;
    },
    panel: function(id, content, flag, updated) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }
        if (!content || typeof content !== "string") {
            return "content must be type string!";
        }
        if (flag === null || typeof flag !== "boolean") {
            return "flag must be type boolean!";
        }
        if (!updated || typeof updated !== "string") {
            return "updated must be type string!";
        }

        this.id = id.toString();
        this.content = content.replace(/\n/g, "<br>");
        this.flag = (flag) ? 'panel-danger' : 'panel-default';
        this.updated = updated;

        var panel = '<div class="col-md-4" id="' + this.id + '">' +
            '<div class="panel ' + this.flag + '"><div class="panel-body">' +
            '<p>' + this.content + '</p></div><div class="panel-footer">' +
            '<button type="button" class="btn btn-xs btn-default modify-note" data-toggle="modal" '+
            'data-target="#modify-note-modal"><span class="glyphicon glyphicon-pencil"></span></button>' +
            '<button type="button" class="btn btn-xs btn-danger flag-note">' +
            '<span class="glyphicon glyphicon-flag"></span></button>' +
            '<small class="text-muted">' + this.updated + '</small>' +
            '<button type="button" class="btn btn-xs btn-link pull-right delete-note">' +
            '<span class="glyphicon glyphicon-trash"></span></button></div></div></div>';
        return panel;
    }
}
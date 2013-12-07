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
        makeNoteImportant();
        deleteSingleNote();

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
            htmlArray.push(note.html.panel(noteArray[i].id, noteArray[i].updated, noteArray[i].content));
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
    });

    //show.bs.modal
}

// save a new note
function saveNewNote() {
    $('#add-note-form').submit(function(e) {
        e.preventDefault();
        note.add($('#new-note-content')[0].value);
        location.reload();
    });

    $('#add-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            note.add($('#new-note-content')[0].value);
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
    });

    $('#modify-note-modal').on('show.bs.modal', function(e) {
        var id = Number(e.relatedTarget.parentNode.offsetParent.id);
        $('#modify-note-id')[0].value = id;
        $('#modify-note-content')[0].value = note.get(id).content;
    });
}

// save a modified note
function saveModifiedNote() {
    $('#modify-note-form').submit(function(e) {
        e.preventDefault();
        console.log(e);
        var id = Number($('#modify-note-id')[0].value);
        note.update(id, $('#modify-note-content')[0].value);
        location.reload();
    });

    $('#modify-note-form').keypress(function(e) {
        if (e.which == 13 && !e.shiftKey) {
            e.preventDefault();
            var id = Number($('#modify-note-id')[0].value);
            note.update(id, $('#modify-note-content')[0].value);
            location.reload();
        }
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

function makeNoteImportant() {
    $('.important-note').each(function() {
        $(this).click(function() {
            $(this).closest('.panel').removeClass('panel-default');
            $(this).closest('.panel').addClass('panel-warning');
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
    add: function(content) {
        if (!content || typeof content !== "string") {
            return "content must be type string!";
        }

        var note = {};
        var d = new Date();
        var id = d.getTime();
        note.id = id;
        note.updated = d.toLocaleString();
        note.content = content;

        store.set(id, note);
        return 'added id:' + note.id;
    },
    get: function(id) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }

        var note = store.get(id);
        return note;
    },
    getAll: function() {
        var notes = store.getAll();
        return notes;
    },
    getAllAsArray: function() {
        var objects = this.getAll();
        var array = [];

        for (key in objects) {
            array.push(objects[key]);
        }

        return array;
    },
    update: function(id, content) {
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
            newNote.updated = d.toLocaleString();
            newNote.content = content;

            store.set(id, newNote);
        } else {
            return "unable to find a note with id == " + id;
        }

        return 'updated id:' + id;
    },
    delete: function(id) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }
        store.remove(id);
        return 'deleted id:' + id;
    },
    deleteAll: function() {
        var total = this.getAllSize();
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
    panel: function(id, updated, content) {
        if (!id || typeof id !== "number") {
            return "id must be type number!";
        }
        if (!updated || typeof updated !== "string") {
            return "updated must be type string!";
        }
        if (!content || typeof content !== "string") {
            return "content must be type string!";
        }

        this.id = id.toString();
        this.updated = updated;
        this.content = content.replace(/\n/g, "<br>");

        var panel = '<div class="col-md-4" id="' + this.id + '"><div class="panel panel-default">' +
            '<div class="panel-body"><p>' + this.content + '</p></div><div class="panel-footer">' +
            '<button type="button" class="btn btn-xs btn-default modify-note" data-toggle="modal" '+
            'data-target="#modify-note-modal"><span class="glyphicon glyphicon-pencil"></span></button>' +
            '<button type="button" class="btn btn-xs btn-warning important-note">' +
            '<span class="glyphicon glyphicon-star"></span></button>' +
            '<small class="text-muted">' + this.updated + '</small>' +
            '<button type="button" class="btn btn-xs btn-danger pull-right delete-note">' +
            '<span class="glyphicon glyphicon-trash"></span></button></div></div></div>';
        return panel;
    }
}
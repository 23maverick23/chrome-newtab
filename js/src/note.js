/*
 *
 * Custom note object for storing note objects in localStorage.
 * Requires jQuery and store.js.
 * Make sure those scripts are loaded before this script.
 *
 */


;(function(win){
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

            // sort based on flag status (flagged show first)
            array.sort(function(x, y) {
                return (x.flag == y.flag) ? 0 : x.flag ? -1 : 1;
            });

            return array;
        },
        getAllCount: function() {
            return this.getAllAsArray().length;
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
    };

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
    };

    win.note = note;

})(this.window || global);
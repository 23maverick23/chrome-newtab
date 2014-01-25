# chrome-newtab

A Google Chrome extension that overrides your new tab page with a simple, HTML5 based note taking interface.

## Installation

[Clone](https://rmorrissey23@bitbucket.org/rmorrissey23/chrome-newtab.git) or download the contents of this repo onto your machine. Open up Chrome and navigate to: Tools > Extensions. Check the box for "Developer mode", then click the "Load unpacked extension" button and select the downloaded file.

## How It Works

This extension overrides your Chrome new tab page. Notes are stored in your browser cache locally using HTML5 localStorage. There are no configuration settings currently, and notes are not synchronized between machines or users. You can mark a note as important which changes it's color and moves it to the beginning of your note list. If you need to quickly access the default new tab page, there is a convenient icon in the top right of the page.

## Screenshots

### Main Note Tab screen
![view_notes.png](https://bitbucket.org/rmorrissey23/chrome-newtab/raw/master/img/doc/view_notes.png)

### Add note modal
![add_note.png](https://bitbucket.org/rmorrissey23/chrome-newtab/raw/master/img/doc/add_note.png)

### Quick note popup
![quick_note.png](https://bitbucket.org/rmorrissey23/chrome-newtab/raw/master/img/doc/quick_note.png)

## License

[LICENSE](LICENSE)

## Thanks

Huge thanks to Marcus Westin and his [store.js](https://github.com/marcuswestin/store.js/) library for localStorage.
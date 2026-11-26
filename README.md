# BG Master

A collection of animated HTML backgrounds you can browse, preview and download.

## Open it
Double-click `index.html`. Or serve the folder:

```
python -m http.server 8000
```
then open http://localhost:8000

## Folders
```
index.html              homepage: sidebar + live preview
assets/
  style.css             all the styling (colors at the top)
  app.js                sidebar, preview, search, download
  backgrounds.js        THE LIST of backgrounds (edit this)
  logo.svg              BG Master logo
  honeycomb.js          the animated homepage honeycomb
  downloads/            copies of each background used by the Download buttons
tools/
  build-downloads.py    rebuilds assets/downloads/ (run after adding a background)
backgrounds/
  nature/   weather/   ocean/   ui/
```

## Add a new background
1. Put your `.html` file in a folder under `backgrounds/` (or make a new folder).
2. Add one entry to `assets/backgrounds.js`:
   ```js
   { id: 'my-bg', name: 'My Background', category: 'Nature',
     file: 'backgrounds/nature/my-bg.html', desc: 'One short line',
     colors: ['#123456', '#abcdef'] },
   ```
3. Refresh the download copies so its Download button works:
   ```
   python tools/build-downloads.py
   ```
A new category name creates its own group and filter chip automatically.

## Shortcuts
`/` search · `↑` `↓` previous / next · `F` hide or show sidebar · `R` random

Reloading the page always brings you back to the homepage.
The honeycomb settings (size, gold colour, glow) are at the top of `assets/honeycomb.js`.

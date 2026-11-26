/* =============================================================
   BG MASTER: the background list
   -------------------------------------------------------------
   To add a new background:
     1. Put the .html file in a folder under /backgrounds
     2. Add one entry below. That's it.

   id       short name used in the address bar (index.html#aquarium)
   name     shown in the sidebar
   category groups the sidebar (a new category appears by itself)
   file     path to the background, from index.html
   desc     one short line under the name
   colors   two colors for the little thumbnail
   ============================================================= */
window.BACKGROUNDS = [
  { id: 'autumn-leaves',   name: 'Autumn Leaves',          category: 'Nature',
    file: 'backgrounds/nature/autumn-leaves.html',   desc: 'Maple leaves tumbling on warm cream',
    colors: ['#F8E2C4', '#E8751A'] },
  { id: 'autumn-whispers', name: 'Autumn Whispers',        category: 'Nature',
    file: 'backgrounds/nature/autumn-whispers.html', desc: 'Falling leaves over a deep forest',
    colors: ['#263B2B', '#C94735'] },
  { id: 'garden-v1',       name: 'Day & Night Garden',     category: 'Nature',
    file: 'backgrounds/nature/garden-v1.html',       desc: 'Flowers, butterflies and fireflies',
    colors: ['#8FD0F0', '#4A8A34'] },
  { id: 'garden-v2',       name: 'Day & Night Garden II',  category: 'Nature',
    file: 'backgrounds/nature/garden-v2.html',       desc: 'Detailed garden with a day/night switch',
    colors: ['#3B86D4', '#335F1F'] },

  { id: 'weather-scene',   name: 'Live Weather',           category: 'Weather',
    file: 'backgrounds/weather/weather-scene.html',  desc: 'Countryside that follows real weather',
    colors: ['#78B5EA', '#558C38'] },
  { id: 'bodhi-weather',   name: 'Bodhi Tree Weather',     category: 'Weather',
    file: 'backgrounds/weather/bodhi-weather.html',  desc: 'A Bodhi tree under live skies',
    colors: ['#2F7FD6', '#3E6B35'] },

  { id: 'seahorse',        name: 'Under the Sea',          category: 'Ocean',
    file: 'backgrounds/ocean/seahorse.html',         desc: 'Seahorses drifting through kelp',
    colors: ['#2B9FBD', '#06283D'] },
  { id: 'aquarium',        name: 'Home Aquarium',          category: 'Ocean',
    file: 'backgrounds/ocean/aquarium.html',         desc: 'A fish tank with a light switch',
    colors: ['#1E7A86', '#04121E'] },

  { id: 'shift-gear',      name: 'Shift Gear',             category: 'Interactive',
    file: 'backgrounds/ui/shift-gear.html',          desc: 'Gear-stick logo with an edge menu',
    colors: ['#3A3F45', '#E3262F'] },
  { id: 'bullet-chamber',  name: 'Bullet Chamber',         category: 'Interactive',
    file: 'backgrounds/ui/bullet-chamber.html',      desc: 'Split steel screen, spinning menu',
    colors: ['#CDD2D6', '#C9A24A'] },
  { id: 'edge-menu',       name: 'Edge Menu',              category: 'Interactive',
    file: 'backgrounds/ui/edge-menu.html',           desc: 'Slide-out tabs on the right edge',
    colors: ['#EEF2EE', '#1D4A3C'] }
];

/* Small icon for each category (shown on thumbnails and filter chips) */
window.CATEGORY_ICONS = {
  Nature:      '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/>',
  Weather:     '<path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4-1.6A4.5 4.5 0 0 0 7 18z"/>',
  Ocean:       '<path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  Interactive: '<path d="M6 3l12 9-5.5 1.2L15 19l-2.5 1-2.6-5.7L6 18z"/>',
  _default:    '<rect x="4" y="4" width="16" height="16" rx="4"/>'
};

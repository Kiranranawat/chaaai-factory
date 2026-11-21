/* ==========================================================
   CHAI FACTORY — script.js
   1. Helpers, data and generated artwork
   2. Loader, smooth scroll, navigation
   3. Hero (canvas fire/steam + GSAP pour & spill loop)
   4. Make-your-own-chai studio (canvas kitchen engine)
   5. Menu, snacks, combos, cart, checkout, quick view
   6. About, reviews, contact form, reveals
   ========================================================== */
(() => {
  'use strict';

  /* ---------- 0. HELPERS & DATA ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rupee = n => '₹' + Number(n).toLocaleString('en-IN');
  const SVGNS = 'http://www.w3.org/2000/svg';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  let lenis = null;

  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    if (parent) parent.appendChild(el);
    return el;
  };

  const REVIEWS = [
    { n: 'Aarav Mehta', c: 'Jaipur', r: 5, t: 'Tastes exactly like my nani\'s kitchen. The masala chai is bold, balanced and unbelievably comforting.' },
    { n: 'Priya Sharma', c: 'Delhi', r: 5, t: 'The kulhad chai is a whole experience — that earthy aroma is unforgettable. I order it every weekend.' },
    { n: 'Rohan Verma', c: 'Mumbai', r: 5, t: 'Finally a cutting chai that reminds me of the street stalls near the station. Strong, sweet and perfect.' },
    { n: 'Ananya Iyer', c: 'Bengaluru', r: 4, t: 'The elaichi chai smells divine and the ginger blend cured my cold. Packaging and presentation are lovely too.' },
    { n: 'Kabir Singh', c: 'Udaipur', r: 5, t: 'Kesar chai is pure luxury. Rich, fragrant and beautifully golden — I gifted a box and everyone loved it.' },
    { n: 'Meera Nair', c: 'Kochi', r: 5, t: 'Real spices, real milk, real chai. You can taste that nothing is rushed. Chai Culture is my new ritual.' }
  ];

  /* ---------- 1. PRODUCT ART (SVG) ---------- */
  function starAnise(cx, cy, r) {
    let pts = '';
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.42;
      pts += (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1) + ' ';
    }
    return `<polygon points="${pts}" fill="#6b3a1c" stroke="#3f200d" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="${r * 0.2}" fill="#2e1608"/>`;
  }

  function garnishSVG(p) {
    switch (p.garnish) {
      case 'masala':
        return `<g transform="translate(212 244) rotate(-14)"><rect width="66" height="11" rx="5.5" fill="#8a5129"/><path d="M5 3.5H60M7 8H58" stroke="#5e3416" stroke-width="1.4"/></g>
                ${starAnise(96, 246, 14)}
                <ellipse cx="130" cy="256" rx="5" ry="3" fill="#3b1e0e"/><ellipse cx="196" cy="258" rx="5" ry="3" fill="#3b1e0e"/>`;
      case 'adrak':
        return `<g transform="translate(236 244)"><ellipse rx="24" ry="9" fill="#e9c97f" stroke="#c99a45"/><ellipse rx="15" ry="5" fill="none" stroke="#c99a45" stroke-width="1"/></g>
                <g transform="translate(88 248) rotate(-8)"><ellipse rx="22" ry="8" fill="#ecd08a" stroke="#c99a45"/><ellipse rx="13" ry="4.5" fill="none" stroke="#c99a45"/></g>
                <path d="M62 236c8-10 20-6 24-14" stroke="#c99a45" stroke-width="9" stroke-linecap="round" fill="none" opacity=".0"/>`;
      case 'elaichi':
        return [[96, 248, 12], [118, 256, 10], [214, 252, 12], [238, 244, 10], [226, 258, 9]].map(([x, y, w]) =>
          `<g transform="translate(${x} ${y}) rotate(${(x * 7) % 40 - 20})"><ellipse rx="${w}" ry="${w * 0.55}" fill="#8fae5a" stroke="#5f7a3c"/><path d="M${-w} 0H${w}M${-w * 0.5} ${-w * 0.45}V${w * 0.45}M0 ${-w * 0.55}V${w * 0.55}M${w * 0.5} ${-w * 0.45}V${w * 0.45}" stroke="#5f7a3c" stroke-width="1"/></g>`).join('');
      case 'kulhad':
        return `<ellipse cx="236" cy="256" rx="30" ry="7" fill="#7d3a1f"/><ellipse cx="236" cy="253" rx="30" ry="7" fill="#b5623a"/>
                <path d="M90 250c8-6 18-4 22 3-8 6-18 5-22-3z" fill="#4d6b2a"/><path d="M110 258c8-5 16-2 19 4-7 5-16 3-19-4z" fill="#3c5520"/>`;
      case 'cutting':
        return `<g transform="translate(210 240) rotate(-6)"><rect width="58" height="22" rx="5" fill="#d5a867" stroke="#a9772f"/><g fill="#a9772f" opacity=".7"><circle cx="10" cy="7" r="1.4"/><circle cx="22" cy="14" r="1.4"/><circle cx="36" cy="7" r="1.4"/><circle cx="48" cy="14" r="1.4"/></g></g>
                <g transform="translate(78 246) rotate(8)"><rect width="46" height="18" rx="5" fill="#e0b777" stroke="#a9772f"/></g>`;
      case 'kesar':
        return `<ellipse cx="232" cy="256" rx="26" ry="7" fill="#7a5320"/><ellipse cx="232" cy="253" rx="26" ry="7" fill="#e3b86a"/>
                <g stroke="#d6361e" stroke-width="2" stroke-linecap="round" fill="none">
                  <path d="M222 252q6-8 12-2M230 252q4-9 12-4M226 250q-4-8 2-9"/>
                  <path d="M96 252q8-6 16 0M104 258q8-8 14 0M88 258q4-8 12-6"/>
                </g>`;
      default: return '';
    }
  }

  function vesselSVG(p) {
    const id = p.id;
    if (p.vessel === 'kulhad') {
      return `<path d="M102 124C108 172 120 216 130 240Q134 248 146 248H174Q186 248 190 240C200 216 212 172 218 124Z" fill="url(#clay-${id})"/>
        <path d="M110 150H210M114 172H206M120 196H200M126 220H194" stroke="#4d2411" stroke-opacity=".28" stroke-width="1.6"/>
        <path d="M114 134C118 176 126 210 134 234" stroke="#fff" stroke-opacity=".16" stroke-width="6" stroke-linecap="round" fill="none"/>
        <ellipse cx="160" cy="122" rx="58" ry="10" fill="#6a331a"/>
        <ellipse cx="160" cy="124" rx="52" ry="7.5" fill="url(#liq-${id})"/>
        <ellipse cx="150" cy="122.5" rx="30" ry="3" fill="#fff" opacity=".28"/>`;
    }
    const small = p.vessel === 'cutting';
    const body = small
      ? 'M124 154H196L189 238Q188 248 178 248H142Q132 248 131 238Z'
      : 'M110 120H210L199 238Q198 250 186 250H134Q122 250 121 238Z';
    const top = small ? 154 : 120;
    const rx = small ? 36 : 50;
    const liqTop = small ? 164 : 134;
    return `<clipPath id="clip-${id}"><path d="${body}"/></clipPath>
      <path d="${body}" fill="rgba(255,255,255,.08)"/>
      <g clip-path="url(#clip-${id})">
        <rect x="90" y="${liqTop}" width="140" height="130" fill="url(#liq-${id})"/>
        <ellipse cx="160" cy="${liqTop}" rx="${rx}" ry="7" fill="#f2d9a9" opacity=".85"/>
        <rect x="90" y="236" width="140" height="14" fill="#fff" opacity=".12"/>
        <path d="M${small ? 134 : 124} ${liqTop + 6}L${small ? 138 : 130} 236" stroke="#fff" stroke-opacity=".3" stroke-width="7" stroke-linecap="round"/>
      </g>
      <path d="${body}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.2" stroke-linejoin="round"/>
      <ellipse cx="160" cy="${top}" rx="${small ? 36 : 50}" ry="8" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.7)" stroke-width="2"/>
      ${p.garnish === 'kesar' ? `<g stroke="#d6361e" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M146 ${liqTop}q6-6 12 0M162 ${liqTop - 1}q6-7 12-1M154 ${liqTop + 3}q4-6 10-2"/></g>` : ''}`;
  }

  function cupSVG(p) {
    const id = p.id;
    const wy = p.vessel === 'cutting' ? 96 : 84;
    return `<svg class="cup" viewBox="0 0 320 300" role="img" aria-label="${p.name}" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="liq-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.a}"/><stop offset="1" stop-color="${p.b}"/></linearGradient>
        <linearGradient id="clay-${id}" x1="0" x2="1"><stop offset="0" stop-color="#8d4524"/><stop offset=".4" stop-color="#c77344"/><stop offset="1" stop-color="#6a331a"/></linearGradient>
        <linearGradient id="wood-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#4a2d18"/></linearGradient>
        <radialGradient id="glow-${id}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${p.a}" stop-opacity=".55"/><stop offset="1" stop-color="${p.a}" stop-opacity="0"/></radialGradient>
      </defs>
      <circle cx="160" cy="150" r="140" fill="url(#glow-${id})"/>
      <ellipse cx="160" cy="262" rx="108" ry="22" fill="#000" opacity=".35"/>
      <ellipse cx="160" cy="254" rx="100" ry="20" fill="url(#wood-${id})"/>
      <ellipse cx="160" cy="248" rx="100" ry="20" fill="#9c6a3e"/>
      <ellipse cx="160" cy="248" rx="86" ry="15" fill="none" stroke="#6b4426" stroke-width="1.2" opacity=".7"/>
      <ellipse cx="160" cy="248" rx="64" ry="10" fill="none" stroke="#6b4426" stroke-width="1" opacity=".6"/>
      ${vesselSVG(p)}
      ${garnishSVG(p)}
      <g>
        <path class="wisp w1" d="M140 ${wy} C 126 ${wy - 22}, 154 ${wy - 38}, 140 ${wy - 62}"/>
        <path class="wisp w2" d="M162 ${wy - 4} C 148 ${wy - 26}, 176 ${wy - 42}, 162 ${wy - 66}"/>
        <path class="wisp w3" d="M184 ${wy} C 170 ${wy - 22}, 198 ${wy - 38}, 184 ${wy - 62}"/>
      </g>
    </svg>`;
  }

  /* ==========================================================
     DATA — chai menu, snacks, combos, studio ingredients
     Set `photo` to an image path (e.g. 'masala.jpg') to show a real
     photograph instead of the generated artwork for that item.
     ========================================================== */
  const CHAI = [
    { id: 'classic', name: 'Classic Chai', price: 79, tag: 'Everyday', vessel: 'glass', garnish: 'none', a: '#d4974f', b: '#85481c', glow: '#6b3a1a', photo: 'classic.jpg', pos: '50% 50%',
      desc: 'Strong Assam leaves, full-cream milk and a little sugar. Chai the way your home makes it.',
      notes: ['Assam tea', 'Full-cream milk', 'Sugar'] },
    { id: 'masala', name: 'Masala Chai', price: 129, tag: 'Bestseller', vessel: 'glass', garnish: 'masala', a: '#d79a54', b: '#7e411a', glow: '#8a4a1e', photo: 'masala.jpg', pos: '50% 50%',
      desc: 'Our signature brew — crushed cardamom, cloves, cinnamon and black pepper in strong tea.',
      notes: ['Cardamom', 'Cloves', 'Cinnamon', 'Black pepper'] },
    { id: 'adrak', name: 'Adrak Chai', price: 119, tag: 'Warming', vessel: 'glass', garnish: 'adrak', a: '#d9a25c', b: '#8a5120', glow: '#7a5a20', photo: 'adrak.jpg', pos: '50% 50%',
      desc: 'Fresh-crushed ginger simmered hard for a bold, peppery kick. Perfect for rainy evenings.',
      notes: ['Fresh ginger', 'Assam tea', 'Milk'] },
    { id: 'elaichi', name: 'Elaichi Chai', price: 139, tag: 'Aromatic', vessel: 'glass', garnish: 'elaichi', a: '#dfb577', b: '#97602a', glow: '#4f6a2a', photo: 'elaichi.jpg', pos: '50% 50%',
      desc: 'Pounded green cardamom pods lend a sweet, floral aroma to a creamy, golden cup.',
      notes: ['Green cardamom', 'Full-cream milk'] },
    { id: 'kesar', name: 'Kesar Chai', price: 189, tag: 'Royal', vessel: 'glass', garnish: 'kesar', a: '#f0c46a', b: '#b9731f', glow: '#a2681a', photo: 'kesar.jpg', pos: '50% 40%',
      desc: 'Hand-picked saffron strands steeped in rich milk for a regal, golden finish.',
      notes: ['Saffron', 'Cardamom', 'Rich milk'] },
    { id: 'kulhad', name: 'Kulhad Chai', price: 99, tag: 'Earthy', vessel: 'kulhad', garnish: 'kulhad', a: '#cf8f4f', b: '#7a421b', glow: '#8d4524', photo: 'kulhad.jpg', pos: '50% 55%',
      desc: 'Poured piping hot into a hand-fired clay kulhad that adds a soft, earthy fragrance.',
      notes: ['Clay kulhad', 'Assam tea', 'Milk'] },
    { id: 'cutting', name: 'Cutting Chai', price: 79, tag: 'Street Classic', vessel: 'cutting', garnish: 'cutting', a: '#d4974f', b: '#85481c', glow: '#6b3a1a', photo: 'cutting.jpg', pos: '50% 40%',
      desc: 'The Mumbai half-glass classic: strong, sweet and served fast — best with a crisp rusk.',
      notes: ['Half glass', 'Strong tea', 'Sugar'] },
    { id: 'tandoori', name: 'Special Tandoori Chai', price: 159, tag: 'Chef Special', vessel: 'kulhad', garnish: 'kulhad', a: '#b9783a', b: '#4a2410', glow: '#6d3a1a', photo: 'tandoori.jpg', pos: '50% 45%',
      desc: 'Chai poured into a clay cup heated in the tandoor — smoky, caramelised and unforgettable.',
      notes: ['Tandoor-fired kulhad', 'Smoky finish', 'Spiced milk'] }
  ];

  const SNACKS = [
    { id: 'samosa', photo: 'samosa.jpg', name: 'Samosa', price: 30, cat: 'Indian Snacks', shape: 'samosa', c1: '#e9b85c', c2: '#b9772a', desc: 'Flaky pastry stuffed with spiced potato and peas, fried till golden.' },
    { id: 'kachori', photo: 'kachori.jpg', name: 'Kachori', price: 35, cat: 'Indian Snacks', shape: 'kachori', c1: '#e8b663', c2: '#a9692a', desc: 'Crisp, puffed shell filled with a spicy moong dal mixture.' },
    { id: 'breadpakoda', photo: 'breadpakoda.jpg', name: 'Bread Pakoda', price: 40, cat: 'Indian Snacks', shape: 'bread', c1: '#e9b85c', c2: '#b0702a', desc: 'Bread slices stuffed with potato, dipped in besan batter and fried.' },
    { id: 'aloopakoda', name: 'Aloo Pakoda', price: 50, cat: 'Indian Snacks', shape: 'aloo', c1: '#e7b45a', c2: '#a86a28', desc: 'Thin potato slices coated in spiced gram-flour batter.' },
    { id: 'onionpakoda', photo: 'onionpakoda.jpg', name: 'Onion Pakoda', price: 50, cat: 'Indian Snacks', shape: 'onion', c1: '#e3a94f', c2: '#a05f22', desc: 'Crunchy onion fritters, the monsoon\'s favourite companion.' },
    { id: 'mirchivada', photo: 'mirchivada.jpg', name: 'Mirchi Vada', price: 45, cat: 'Indian Snacks', shape: 'mirchi', c1: '#e9bb62', c2: '#a76a2a', desc: 'Jaipur-style green chilli stuffed with masala and fried in besan.' },
    { id: 'vadapav', photo: 'vadapav.jpg', name: 'Vada Pav', price: 40, cat: 'Indian Snacks', shape: 'vadapav', c1: '#dca868', c2: '#a8702f', desc: 'Mumbai\'s burger: a spicy potato vada in a soft pav with chutneys.' },
    { id: 'dhokla', photo: 'dhokla.jpg', name: 'Dhokla', price: 60, cat: 'Indian Snacks', shape: 'dhokla', c1: '#f3d867', c2: '#d0a92d', desc: 'Soft, steamed gram-flour cakes tempered with mustard and curry leaves.' },
    { id: 'vegsandwich', photo: 'vegsandwich.jpg', name: 'Veg Sandwich', price: 70, cat: 'Sandwiches', shape: 'sandwich', cheese: false, c1: '#f1d9a6', c2: '#caa45a', desc: 'Cucumber, tomato, beetroot and green chutney between toasted bread.' },
    { id: 'cheesesandwich', photo: 'cheesesandwich.jpg', name: 'Cheese Sandwich', price: 90, cat: 'Sandwiches', shape: 'sandwich', cheese: true, c1: '#f1d9a6', c2: '#caa45a', desc: 'Grilled, golden and oozing with melted cheese.' },
    { id: 'garlicbread', photo: 'garlicbread.jpg', name: 'Garlic Bread', price: 80, cat: 'Bakery', shape: 'garlic', c1: '#eac27a', c2: '#b98536', desc: 'Toasted baguette slices glazed with garlic-herb butter.' },
    { id: 'brownie', photo: 'brownie.jpg', name: 'Chocolate Brownie', price: 85, cat: 'Bakery', shape: 'brownie', c1: '#6b3a22', c2: '#2e160b', desc: 'Fudgy, dense chocolate brownie with a crackly top.' },
    { id: 'cookies', photo: 'cookies.jpg', name: 'Cookies', price: 60, cat: 'Bakery', shape: 'cookies', c1: '#d9a86a', c2: '#a8702f', desc: 'Buttery, crisp-edged cookies loaded with chocolate chips.' },
    { id: 'croissant', photo: 'croissant.jpg', name: 'Croissant', price: 95, cat: 'Bakery', shape: 'croissant', c1: '#eec27a', c2: '#bf823a', desc: 'Flaky, buttery layers baked golden — lovely dunked in chai.' }
  ];

  const COMBOS = [
    { id: 'combo1', chai: 'masala', snack: 'samosa', off: 15 },
    { id: 'combo2', chai: 'adrak', snack: 'kachori', off: 12 },
    { id: 'combo3', chai: 'kesar', snack: 'cookies', off: 18 },
    { id: 'combo4', chai: 'kulhad', snack: 'breadpakoda', off: 15 },
    { id: 'combo5', chai: 'cutting', snack: 'vadapav', off: 10 }
  ];
  const chaiById = id => CHAI.find(c => c.id === id);
  const snackById = id => SNACKS.find(s => s.id === id);
  const comboPrice = c => Math.round((chaiById(c.chai).price + snackById(c.snack).price) * (100 - c.off) / 100);
  const comboFull = c => chaiById(c.chai).price + snackById(c.snack).price;

  /* Studio ingredients. `per` = items dropped into the pot per strength level. */
  const ING = {
    tea: [
      { k: 'patti', name: 'Premium Chai Patti', note: 'Strong CTC leaves', color: [96, 38, 12], price: 0 },
      { k: 'assam', name: 'Assam Tea', note: 'Malty and bold', color: [124, 54, 18], price: 10 },
      { k: 'darjeeling', name: 'Darjeeling Tea', note: 'Light and floral', color: [178, 114, 42], price: 20 }
    ],
    sweet: [
      { k: 'normal', name: 'Normal Sugar', note: '2 spoons', grains: 60, price: 0 },
      { k: 'less', name: 'Less Sugar', note: '1 spoon', grains: 26, price: 0 },
      { k: 'extra', name: 'Extra Sugar', note: '3 spoons', grains: 100, price: 0 },
      { k: 'none', name: 'No Sugar', note: 'Unsweetened', grains: 0, price: 0 },
      { k: 'jaggery', name: 'Jaggery', note: 'Desi gur', grains: 0, chunks: 7, price: 10 }
    ],
    spice: [
      { k: 'adrak', name: 'Fresh Ginger', hi: 'Adrak', per: 3, price: 10, tint: [208, 150, 70] },
      { k: 'elaichi', name: 'Cardamom', hi: 'Elaichi', per: 3, price: 10, tint: [190, 170, 90] },
      { k: 'kesar', name: 'Saffron', hi: 'Kesar', per: 10, price: 40, tint: [232, 150, 30] },
      { k: 'dalchini', name: 'Cinnamon', hi: 'Dalchini', per: 2, price: 8, tint: [170, 100, 50] },
      { k: 'laung', name: 'Cloves', hi: 'Laung', per: 4, price: 8, tint: [140, 80, 40] },
      { k: 'pepper', name: 'Black Pepper', hi: 'Kali Mirch', per: 6, price: 6, tint: [120, 80, 50] }
    ],
    milk: [
      { k: 'full', name: 'Full Cream Milk', note: 'Rich and creamy', mix: 0.64, price: 10 },
      { k: 'regular', name: 'Regular Milk', note: 'Balanced', mix: 0.5, price: 0 },
      { k: 'less', name: 'Less Milk', note: 'Strong and dark', mix: 0.28, price: 0 },
      { k: 'none', name: 'No Milk', note: 'Black chai', mix: 0, price: 0 }
    ],
    special: [
      { k: 'kesar', name: 'Kesar Chai', note: 'Saffron and cardamom', set: { tea: 'assam', sweet: 'normal', milk: 'full', spice: { kesar: 1, elaichi: 1 } } },
      { k: 'masala', name: 'Masala Chai', note: 'The full spice box', set: { tea: 'patti', sweet: 'normal', milk: 'regular', spice: { adrak: 1, elaichi: 1, dalchini: 1, laung: 1, pepper: 1 } } },
      { k: 'adrakelaichi', name: 'Adrak Elaichi Chai', note: 'Ginger and cardamom', set: { tea: 'patti', sweet: 'normal', milk: 'regular', spice: { adrak: 1, elaichi: 1 } } },
      { k: 'classic', name: 'Classic Indian Chai', note: 'Plain and perfect', set: { tea: 'patti', sweet: 'normal', milk: 'regular', spice: {} } }
    ]
  };
  const ingFind = (group, k) => ING[group].find(x => x.k === k);

  /* ---------- unique-id helper so one SVG can appear many times on a page ---------- */
  let uidN = 0;
  const uniq = svg => {
    const u = 'u' + (++uidN);
    return svg.replace(/id="([^"]+)"/g, `id="${u}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${u}-$1)`);
  };

  /* ---------- SNACK ARTWORK ---------- */
  function snackSVG(s) {
    const g = (inner, tx = 0, ty = 0, sc = 1, rot = 0) => `<g transform="translate(${tx} ${ty}) rotate(${rot} 160 200) scale(${sc})">${inner}</g>`;
    const dots = (n, x0, x1, y0, y1, r, col, seed) => {
      let o = '', q = seed || 7;
      for (let i = 0; i < n; i++) {
        q = (q * 9301 + 49297) % 233280; const a = q / 233280;
        q = (q * 9301 + 49297) % 233280; const b = q / 233280;
        o += `<circle cx="${(x0 + (x1 - x0) * a).toFixed(1)}" cy="${(y0 + (y1 - y0) * b).toFixed(1)}" r="${r}" fill="${col}"/>`;
      }
      return o;
    };
    let body = '';
    switch (s.shape) {
      case 'samosa': {
        const one = `<path d="M160 104L246 218Q250 228 238 228H82Q70 228 74 218Z" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M160 104L246 218M160 104L74 218" stroke="rgba(255,235,170,.55)" stroke-width="3" fill="none"/>
          <path d="M90 220H230" stroke="rgba(90,45,10,.25)" stroke-width="3"/>${dots(22, 100, 220, 150, 218, 2.2, 'rgba(120,60,10,.45)', 3)}`;
        body = g(one, 46, 18, .82) + g(one, -6, 0, 1);
        break;
      }
      case 'kachori':
        body = `<ellipse cx="160" cy="196" rx="76" ry="56" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5"/>
          <path d="M104 190Q160 130 216 190M114 208Q160 160 206 208M132 176Q160 156 188 176" fill="none" stroke="rgba(120,60,10,.35)" stroke-width="3" stroke-linecap="round"/>${dots(30, 100, 220, 150, 232, 2.4, 'rgba(255,235,170,.55)', 11)}`;
        body += g(`<ellipse cx="160" cy="196" rx="70" ry="50" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5"/>`, 70, 30, .6).replace('<g', '<g opacity=".95"');
        break;
      case 'bread': {
        const half = `<path d="M92 214L160 112L228 214Z" fill="#f2dca8" stroke="${s.c2}" stroke-width="2.5" stroke-linejoin="round"/><path d="M104 208L160 128L216 208Z" fill="url(#g)" opacity=".95"/><path d="M118 198L160 140L202 198Z" fill="#cf9a3e" opacity=".55"/>`;
        body = g(half, 50, 12, .82, 8) + g(half, -4, 6, 1, -6) + dots(24, 90, 230, 140, 222, 2.2, 'rgba(255,235,170,.5)', 5);
        break;
      }
      case 'aloo':
        body = [[120, 190, 38], [190, 184, 42], [156, 150, 36], [214, 214, 30], [108, 230, 30]].map(([x, y, r], i) =>
          `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .78}" fill="url(#g)" stroke="${s.c2}" stroke-width="2.2" transform="rotate(${i * 27} ${x} ${y})"/>${dots(7, x - r * .6, x + r * .6, y - r * .4, y + r * .4, 1.8, 'rgba(255,235,170,.5)', i + 2)}`).join('');
        break;
      case 'onion': {
        let o = '';
        [[118, 196, 40], [196, 186, 44], [158, 150, 36], [214, 226, 30], [104, 234, 30], [160, 218, 38]].forEach(([x, y, r], i) => {
          o += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * .8}" fill="url(#g)" stroke="${s.c2}" stroke-width="2" transform="rotate(${i * 31} ${x} ${y})"/>`;
          o += `<path d="M${x - r * .7} ${y}q${r * .35} -${r * .5} ${r * .7} 0t${r * .7} 0" fill="none" stroke="rgba(255,225,150,.6)" stroke-width="3" stroke-linecap="round"/>`;
        });
        body = o;
        break;
      }
      case 'mirchi': {
        const one = `<path d="M70 190Q80 160 150 168L232 188Q258 194 252 216Q246 238 224 236L110 232Q70 230 70 190Z" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5"/>
          <path d="M70 190Q64 176 52 172" stroke="#5f7a3c" stroke-width="9" stroke-linecap="round" fill="none"/>${dots(18, 100, 230, 190, 228, 2, 'rgba(255,235,170,.5)', 9)}<path d="M110 196Q160 184 224 204" stroke="rgba(120,60,10,.3)" stroke-width="3" fill="none"/>`;
        body = g(one, 18, -26, .82, -6) + g(one, 14, 24, .92, 4);
        break;
      }
      case 'vadapav':
        body = `<ellipse cx="160" cy="226" rx="94" ry="26" fill="#d29a55" stroke="#9a6325" stroke-width="2.5"/>
          <ellipse cx="160" cy="206" rx="88" ry="30" fill="#e0ad68" stroke="#9a6325" stroke-width="2"/>
          <ellipse cx="160" cy="196" rx="52" ry="40" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5"/>${dots(14, 126, 194, 168, 226, 2, 'rgba(255,235,170,.5)', 6)}
          <path d="M96 196Q112 176 130 178" fill="none" stroke="#5f7a3c" stroke-width="8" stroke-linecap="round"/><path d="M224 192Q208 174 192 178" fill="none" stroke="#b8321c" stroke-width="7" stroke-linecap="round"/>
          <path d="M70 170Q160 70 250 170Q250 186 160 186Q70 186 70 170Z" fill="#e6b36e" stroke="#9a6325" stroke-width="2.5"/>${dots(18, 98, 222, 120, 168, 2.2, 'rgba(255,240,200,.65)', 12)}`;
        break;
      case 'dhokla': {
        let o = '';
        for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
          const x = 84 + c * 54 + r * 18, y = 150 + r * 46;
          o += `<rect x="${x}" y="${y}" width="50" height="42" rx="7" fill="url(#g)" stroke="${s.c2}" stroke-width="2"/><rect x="${x + 4}" y="${y + 4}" width="42" height="12" rx="5" fill="rgba(255,255,255,.28)"/>${dots(4, x + 6, x + 44, y + 8, y + 36, 1.7, '#5a3a14', x + y)}${dots(2, x + 8, x + 42, y + 8, y + 36, 2.2, '#5f7a3c', x)}`;
        }
        body = o;
        break;
      }
      case 'sandwich': {
        const tri = `<path d="M84 224L160 116L236 224Z" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M96 218L160 130L224 218Z" fill="#f6e7c4"/>
          <path d="M104 208L216 208" stroke="#5f9a3c" stroke-width="9" stroke-linecap="round"/>
          <path d="M112 192L208 192" stroke="${s.cheese ? '#f4b92a' : '#c8402c'}" stroke-width="9" stroke-linecap="round"/>
          <path d="M122 176L198 176" stroke="${s.cheese ? '#f9cf4a' : '#f2f0dc'}" stroke-width="8" stroke-linecap="round"/>
          <path d="M134 160L186 160" stroke="${s.cheese ? '#f4b92a' : '#b83a6a'}" stroke-width="7" stroke-linecap="round"/>`;
        body = g(tri, 56, 20, .86, 8) + g(tri, -10, 0, 1, -4);
        break;
      }
      case 'garlic': {
        let o = '';
        for (let i = 0; i < 4; i++) {
          const x = 88 + i * 46;
          o += `<g transform="rotate(-12 ${x} 200)"><rect x="${x - 22}" y="132" width="46" height="100" rx="20" fill="url(#g)" stroke="${s.c2}" stroke-width="2.2"/><rect x="${x - 15}" y="140" width="32" height="84" rx="14" fill="#f6dfa4" opacity=".75"/>${dots(7, x - 12, x + 12, 146, 220, 2.4, '#5f7a3c', i + 4)}${dots(4, x - 10, x + 10, 150, 214, 2, '#fff4cf', i + 9)}</g>`;
        }
        body = o;
        break;
      }
      case 'brownie': {
        const sq = (x, y, r) => `<g transform="rotate(${r} ${x + 50} ${y + 40})"><rect x="${x}" y="${y + 18}" width="100" height="44" rx="6" fill="#2a130a"/><rect x="${x}" y="${y}" width="100" height="46" rx="6" fill="url(#g)" stroke="#1d0d05" stroke-width="2"/><path d="M${x + 8} ${y + 10}h84" stroke="rgba(255,255,255,.18)" stroke-width="4" stroke-linecap="round"/>${dots(10, x + 8, x + 92, y + 8, y + 40, 1.8, 'rgba(255,255,255,.5)', x)}</g>`;
        body = sq(138, 128, 8) + sq(76, 160, -6);
        break;
      }
      case 'cookies':
        body = [[112, 196, 52, -6], [196, 188, 56, 8], [156, 238, 50, 0]].map(([x, y, r, rot], i) =>
          `<g transform="rotate(${rot} ${x} ${y})"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#g)" stroke="${s.c2}" stroke-width="2.4"/><circle cx="${x - 10}" cy="${y - 14}" r="${r * .6}" fill="rgba(255,255,255,.14)"/>${dots(9, x - r * .7, x + r * .7, y - r * .6, y + r * .6, 5, '#3a1d0e', i * 5 + 2)}</g>`).join('');
        break;
      case 'croissant':
        body = `<path d="M62 214Q70 130 160 122Q250 130 258 214Q232 196 214 214Q196 190 160 190Q124 190 106 214Q88 196 62 214Z" fill="url(#g)" stroke="${s.c2}" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M112 134Q120 170 108 210M148 122Q150 168 142 194M186 122Q180 168 190 194M222 134Q212 170 224 210" fill="none" stroke="rgba(120,60,10,.4)" stroke-width="3" stroke-linecap="round"/>
          <path d="M96 150Q130 128 160 128" fill="none" stroke="rgba(255,240,190,.6)" stroke-width="5" stroke-linecap="round"/>`;
        break;
      default: body = '';
    }
    return `<svg class="snack" viewBox="0 0 320 300" role="img" aria-label="${s.name}" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.c1}"/><stop offset="1" stop-color="${s.c2}"/></linearGradient>
        <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${s.c1}" stop-opacity=".5"/><stop offset="1" stop-color="${s.c1}" stop-opacity="0"/></radialGradient>
        <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a34"/><stop offset="1" stop-color="#4a2d18"/></linearGradient>
      </defs>
      <circle cx="160" cy="150" r="140" fill="url(#glow)"/>
      <ellipse cx="160" cy="262" rx="120" ry="20" fill="#000" opacity=".3"/>
      <ellipse cx="160" cy="250" rx="124" ry="24" fill="url(#wood)"/><ellipse cx="160" cy="244" rx="124" ry="24" fill="#9c6a3e"/>
      <ellipse cx="160" cy="236" rx="104" ry="20" fill="#efe3cc" stroke="#cdbb98" stroke-width="2"/>
      ${body}
      <g><path class="wisp w1" d="M130 128C118 108 142 96 130 76"/><path class="wisp w2" d="M164 122C152 102 176 90 164 70"/><path class="wisp w3" d="M198 128C186 108 210 96 198 76"/></g>
    </svg>`;
  }

  /* generic art lookup: {k:'chai'|'snack'|'custom', id|colors} */
  function artSVG(spec) {
    if (spec.k === 'chai') return uniq(cupSVG(chaiById(spec.id)));
    if (spec.k === 'snack') return uniq(snackSVG(snackById(spec.id)));
    if (spec.k === 'custom') return uniq(cupSVG({ id: 'custom', name: 'Custom chai', vessel: 'kulhad', garnish: 'none', a: spec.a, b: spec.b, glow: spec.glow }));
    if (spec.k === 'combo') {
      const c = COMBOS.find(x => x.id === spec.id);
      return `<div class="combo-art"><div class="combo-art__a">${artSVG({ k: 'chai', id: c.chai })}</div><div class="combo-art__b">${artSVG({ k: 'snack', id: c.snack })}</div></div>`;
    }
    return '';
  }
  const photoImg = (item, spec) => `<img src="${item.photo}" alt="${item.name}" loading="lazy" decoding="async" data-art="${spec.k}:${spec.id}" style="object-position:${item.pos || '50% 50%'}">`;
  const mediaHTML = (item, spec) => (item.photo ? photoImg(item, spec) : artSVG(spec));
  /* if a photo file is missing, fall back to the generated artwork instead of a broken image */
  document.addEventListener('error', e => {
    const img = e.target;
    if (img && img.tagName === 'IMG' && img.dataset.art) { const [k, id] = img.dataset.art.split(':'); img.outerHTML = artSVG({ k, id }); }
  }, true);

  /* ---------- STUDIO INGREDIENT ICONS (80x80) ---------- */
  function ingIcon(group, k) {
    const leaf = (x, y, r, c1, c2) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0C-6-14 4-26 22-26C22-8 12 4 0 0Z" fill="${c1}" stroke="${c2}" stroke-width="1"/><path d="M1 -1L18 -21" stroke="${c2}" stroke-width="1" opacity=".7"/></g>`;
    let s = '';
    if (group === 'tea') {
      const cols = { patti: ['#4a1e0a', '#2a1006'], assam: ['#6b3a16', '#3d2008'], darjeeling: ['#9aa35a', '#6a7230'] }[k];
      s = leaf(18, 62, -10, ...cols) + leaf(36, 66, 20, ...cols) + leaf(46, 58, -30, ...cols) + leaf(26, 46, 10, ...cols) + leaf(52, 44, -5, ...cols) + (k === 'darjeeling' ? leaf(40, 34, 25, '#c9cf86', '#8a9250') : leaf(40, 34, 25, ...cols));
    } else if (group === 'sweet') {
      if (k === 'jaggery') s = '<path d="M14 54L24 30L48 24L66 38L62 60L36 66Z" fill="#9a5a1c" stroke="#5e3410" stroke-width="2" stroke-linejoin="round"/><path d="M24 30L36 44L62 60M36 44L36 66M48 24L36 44" stroke="#c98a3a" stroke-width="1.6" fill="none" opacity=".8"/>';
      else if (k === 'none') s = '<circle cx="40" cy="40" r="24" fill="none" stroke="#c9a46a" stroke-width="3"/><path d="M22 58L58 22" stroke="#c9a46a" stroke-width="3" stroke-linecap="round"/><rect x="30" y="34" width="20" height="14" rx="2" fill="#f4ece0" opacity=".5"/>';
      else {
        const n = { less: 3, normal: 6, extra: 10 }[k];
        const pos = [[26, 56], [40, 58], [54, 56], [32, 46], [48, 46], [40, 36], [22, 48], [58, 48], [36, 28], [46, 26]];
        s = '<ellipse cx="40" cy="62" rx="30" ry="6" fill="#000" opacity=".15"/>' + pos.slice(0, n).map(([x, y], i) => `<rect x="${x - 8}" y="${y - 8}" width="16" height="16" rx="2" transform="rotate(${(i * 17) % 30 - 12} ${x} ${y})" fill="#fbfaf5" stroke="#d6d0c0" stroke-width="1.5"/><path d="M${x - 5} ${y - 4}h6" stroke="#fff" stroke-width="2"/>`).join('');
      }
    } else if (group === 'spice') {
      if (k === 'adrak') s = '<path d="M10 52C8 42 18 38 24 40C24 30 34 26 40 32C46 24 58 28 56 38C66 38 72 46 64 54C60 62 44 62 36 60C24 64 12 60 10 52Z" fill="#d9b682" stroke="#a07a42" stroke-width="2"/><path d="M20 50C30 46 40 48 52 50M28 40C32 44 38 44 44 40" stroke="#a07a42" stroke-width="1.5" fill="none"/><ellipse cx="62" cy="46" rx="5" ry="7" fill="#f2e2b4" stroke="#a07a42"/>';
      else if (k === 'elaichi') s = [[24, 54, -20], [44, 46, 15], [30, 32, 40], [54, 62, -5]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="15" ry="8" fill="#8fb05a" stroke="#58773a" stroke-width="1.5"/><path d="M-14 0H14M-8-6V6M0-8V8M8-6V6" stroke="#58773a" stroke-width="1" fill="none"/></g>`).join('');
      else if (k === 'kesar') s = [[18, 60, 24], [30, 62, 34], [42, 60, 44], [28, 52, 10], [38, 46, 18], [50, 52, 28]].map(([x, y, h], i) => `<path d="M${x} ${y}q${-6 + i} ${-h * .5} ${4 + i} ${-h}" fill="none" stroke="#d3281a" stroke-width="2.4" stroke-linecap="round"/><path d="M${x + 4 + i} ${y - h}l3 -6" stroke="#f5a021" stroke-width="3" stroke-linecap="round"/>`).join('');
      else if (k === 'dalchini') s = [[16, 52, -12], [20, 38, 6], [18, 24, -4]].map(([x, y, r]) => `<g transform="rotate(${r} 40 ${y})"><rect x="${x}" y="${y - 7}" width="50" height="14" rx="7" fill="#b2713a" stroke="#6c3d18" stroke-width="1.5"/><ellipse cx="${x + 50}" cy="${y}" rx="5" ry="7" fill="#8b4f1f" stroke="#6c3d18"/><path d="M${x + 4} ${y - 3}H${x + 44}" stroke="#d9a064" stroke-width="1.4"/></g>`).join('');
      else if (k === 'laung') s = [[22, 52, -30], [42, 56, 10], [58, 44, 40], [34, 34, -10]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 0L-3 20L3 20Z" fill="#5a3418"/><circle cx="0" cy="-3" r="5" fill="#7a4a24" stroke="#3c2210"/><path d="M-4 -8L0 -12L4 -8" fill="none" stroke="#3c2210" stroke-width="1.4"/></g>`).join('');
      else s = [[24, 54], [40, 58], [56, 54], [32, 42], [48, 42], [40, 30], [22, 40], [58, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#1a1412" stroke="#46382a" stroke-width="1.5"/><circle cx="${x - 2}" cy="${y - 2}" r="2" fill="#6a5a4a"/>`).join('');
    } else if (group === 'milk') {
      const f = { full: 52, regular: 40, less: 22, none: 0 }[k];
      s = `<path d="M22 14H58L54 62Q53 68 47 68H33Q27 68 26 62Z" fill="rgba(255,255,255,.15)" stroke="#e9e1d1" stroke-width="2.4" stroke-linejoin="round"/>
        ${f ? `<path d="M${24.2 + (52 - f) * .08} ${66 - f}H${55.8 - (52 - f) * .08}L53 62Q52 66 47 66H33Q28 66 27.6 62Z" fill="#fbf4e4"/>` : '<path d="M24 14L56 66" stroke="#c9a46a" stroke-width="3" stroke-linecap="round"/>'}
        ${f ? `<ellipse cx="40" cy="${66 - f}" rx="15" ry="3" fill="#fffaf0" stroke="#e9e1d1"/>` : ''}`;
    } else {
      const cols = { kesar: ['#f0c46a', '#b9731f'], masala: ['#d79a54', '#7e411a'], adrakelaichi: ['#d9a25c', '#8a5120'], classic: ['#d4974f', '#85481c'] }[k];
      s = `<defs><linearGradient id="si" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cols[0]}"/><stop offset="1" stop-color="${cols[1]}"/></linearGradient></defs>
        <path d="M18 24H54L50 62Q49 68 43 68H29Q23 68 22 62Z" fill="rgba(255,255,255,.12)" stroke="#f5ead6" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M20.4 30H51.6L48.6 62Q48 65 43 65H29Q24 65 23.4 62Z" fill="url(#si)"/><path d="M54 30c12-2 12 20-4 20" fill="none" stroke="#f5ead6" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M30 18c-3-4 3-6 0-10M40 18c-3-4 3-6 0-10" fill="none" stroke="rgba(245,234,214,.6)" stroke-width="2" stroke-linecap="round"/>`;
    }
    return `<svg viewBox="0 0 80 80" aria-hidden="true">${s}</svg>`;
  }

  /* ---------- 2. LOADER ---------- */
  function runLoader(done) {
    const loader = $('#loader');
    const finish = () => { document.body.classList.remove('is-loading'); if (loader) loader.remove(); };
    if (!loader || !hasGSAP) { finish(); done(); return; }

    const pct = $('#loaderPct'), liquid = $('#lLiquid');
    const o = { v: 0 };
    const fontsReady = (document.fonts && document.fonts.ready) ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]) : Promise.resolve();
    let animDone = false, fontsDone = false;
    const tryExit = () => {
      if (!(animDone && fontsDone)) return;
      done();
      gsap.to(loader, { yPercent: -100, duration: reduceMotion ? .01 : .95, ease: 'power4.inOut', delay: .15, onComplete: finish });
    };
    fontsReady.then(() => { fontsDone = true; tryExit(); });
    gsap.to(o, {
      v: 100, duration: reduceMotion ? .2 : 2.3, ease: 'power2.inOut',
      onUpdate() { pct.textContent = Math.round(o.v); liquid.setAttribute('y', (160 - o.v * 0.9).toFixed(1)); },
      onComplete() { animDone = true; tryExit(); }
    });
  }

  /* ---------- 3. SMOOTH SCROLL, NAV, TRANSITIONS ---------- */
  function initScroll() {
    if (typeof window.Lenis !== 'undefined' && hasGSAP && !reduceMotion) {
      try {
        lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        if (hasST) lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch (e) { lenis = null; }
    }
  }

  function scrollToTarget(hash) {
    const el = $(hash);
    if (!el) return;
    const y = hash === '#home' ? 0 : el.getBoundingClientRect().top + window.scrollY - 64;
    const jump = () => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
    const curtain = $('#curtain');
    if (!hasGSAP || reduceMotion || !curtain) { window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    gsap.timeline()
      .set(curtain, { transformOrigin: '50% 100%' })
      .to(curtain, { scaleY: 1, duration: .45, ease: 'power3.inOut' })
      .call(jump)
      .set(curtain, { transformOrigin: '50% 0%' })
      .to(curtain, { scaleY: 0, duration: .55, ease: 'power3.inOut', delay: .08 });
  }

  function initNav() {
    const nav = $('#nav'), burger = $('#burger');
    const setMenu = open => {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute('href');
      e.preventDefault();
      if (hash === '#' || hash.length < 2) return;
      const wasOpen = document.body.classList.contains('menu-open');
      if (wasOpen) setMenu(false);
      if (a.hasAttribute('data-nav')) {
        if (hash === '#menu' && a.classList.contains('btn')) {
          setTimeout(() => $$('#chaiGrid .card').forEach((c, i) => setTimeout(() => { c.classList.add('is-pulse'); setTimeout(() => c.classList.remove('is-pulse'), 2300); }, i * 90 + 900)), 0);
        }
        setTimeout(() => scrollToTarget(hash), wasOpen ? 350 : 0);
      }
    });

    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // active link highlighting
    const links = $$('.nav__links a[data-nav]:not(.btn)');
    const map = {};
    links.forEach(l => { map[l.getAttribute('href')] = l; });
    const sections = ['#home', '#studio', '#menu', '#snacks', '#combos', '#about', '#contact'].map(h => $(h)).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            links.forEach(l => l.classList.remove('is-active'));
            const l = map['#' + en.target.id];
            if (l) l.classList.add('is-active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(s => io.observe(s));
    }
  }
  /* ---------- 4. HERO ---------- */
  function splitChars(el) {
    $$('.line', el).forEach(line => {
      const text = line.textContent.trim();
      line.textContent = '';
      text.split(' ').forEach((w, wi, arr) => {
        const word = document.createElement('span');
        word.className = 'word';
        word.setAttribute('aria-hidden', 'true');
        Array.from(w).forEach(ch => {
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch;
          word.appendChild(s);
        });
        line.appendChild(word);
        if (wi < arr.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });
    return $$('.char', el);
  }

  function makeSprite(size, stops) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(s => gr.addColorStop(s[0], s[1]));
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    return c;
  }

  /* Canvas FX: fire, steam, splash, falling droplets. Logical size 600x520. */
  function initFX(state) {
    const canvas = $('#fx');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 600, H = 520;
    let scale = 1;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      scale = canvas.width / W;
    };
    resize();
    window.addEventListener('resize', resize);

    const spY = makeSprite(64, [[0, 'rgba(255,248,210,1)'], [.35, 'rgba(255,205,90,.75)'], [1, 'rgba(255,120,20,0)']]);
    const spO = makeSprite(64, [[0, 'rgba(255,190,70,.95)'], [.4, 'rgba(255,110,20,.6)'], [1, 'rgba(220,50,0,0)']]);
    const spR = makeSprite(64, [[0, 'rgba(255,100,20,.6)'], [.5, 'rgba(190,40,5,.3)'], [1, 'rgba(120,10,0,0)']]);
    const spB = makeSprite(32, [[0, 'rgba(200,230,255,1)'], [.4, 'rgba(70,130,255,.75)'], [1, 'rgba(30,60,255,0)']]);
    const spS = makeSprite(64, [[0, 'rgba(255,255,255,.9)'], [.5, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);

    const fire = [], steam = [], splash = [], drops = [];
    const lowPower = reduceMotion || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    const fireRate = lowPower ? 90 : 150, steamRate = lowPower ? 22 : 34;
    let fAcc = 0, sAcc = 0, spAcc = 0, dAcc = 0, t = 0, last = performance.now(), running = true;

    const hero = $('#home');
    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(en => { running = en[0].isIntersecting; }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', () => { last = performance.now(); });

    function frame(now) {
      requestAnimationFrame(frame);
      if (!running || document.hidden) { last = now; return; }
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      t += dt;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      /* spawn fire */
      fAcc += dt * fireRate * state.fire;
      while (fAcc >= 1 && fire.length < 260) {
        fAcc -= 1;
        const th = rand(0, Math.PI * 2);
        const cx = Math.cos(th);
        const side = Math.abs(cx) > .55;
        fire.push({
          x: 300 + cx * rand(88, 98), y: 402 + Math.sin(th) * 9,
          vx: -cx * rand(4, 16) + rand(-6, 6), vy: -(side ? rand(65, 118) : rand(30, 62)),
          age: 0, life: side ? rand(.5, .85) : rand(.3, .55), size: rand(14, 26) * (side ? 1.1 : .8)
        });
      }
      /* spawn steam */
      sAcc += dt * steamRate * state.steam;
      while (sAcc >= 1 && steam.length < 120) {
        sAcc -= 1;
        steam.push({
          x: 300 + rand(-92, 92), y: 248 + rand(-3, 3), vx: rand(-4, 4),
          vy: -rand(20, 38) * (1 + state.boil * .35), age: 0, life: rand(3.6, 6),
          size: rand(18, 30), grow: rand(10, 20), a: rand(.1, .2) * clamp(state.steam, .3, 1.6), ph: rand(0, 6.28)
        });
      }
      /* splash while pouring */
      if (state.pouring) {
        spAcc += dt * 46;
        while (spAcc >= 1 && splash.length < 120) {
          spAcc -= 1;
          splash.push({ x: state.pourX + rand(-6, 6), y: 254, vx: rand(-55, 55), vy: -rand(70, 150), age: 0, life: rand(.35, .6), r: rand(1.2, 3), c: state.pourColor });
        }
      }
      /* falling droplets from the spill edge */
      if (state.spill > 0) {
        dAcc += dt * 3.2;
        while (dAcc >= 1 && drops.length < 30) {
          dAcc -= 1;
          drops.push({ x: 141 + rand(-2, 2), y: 446, vy: rand(0, 40), r: rand(2.2, 3.6) });
        }
      }

      /* STEAM */
      for (let i = steam.length - 1; i >= 0; i--) {
        const p = steam[i];
        p.age += dt;
        if (p.age >= p.life) { steam.splice(i, 1); continue; }
        const k = p.age / p.life;
        p.x += (p.vx + Math.sin(t * .9 + p.ph) * 11) * dt;
        p.y += p.vy * dt;
        p.size += p.grow * dt;
        const a = Math.sin(Math.PI * k) * p.a * clamp(p.y / 90, 0, 1);
        if (a <= .003) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(spS, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }

      /* FIRE (additive) */
      ctx.globalCompositeOperation = 'lighter';
      for (let i = fire.length - 1; i >= 0; i--) {
        const p = fire[i];
        p.age += dt;
        if (p.age >= p.life) { fire.splice(i, 1); continue; }
        const k = p.age / p.life;
        p.x += (p.vx + Math.sin(t * 14 + i) * 7) * dt;
        p.y += p.vy * dt;
        const s = p.size * (1.5 - k * .9);
        ctx.globalAlpha = (1 - k) * .9 * Math.min(1, state.fire + .1);
        ctx.drawImage(k < .3 ? spY : k < .65 ? spO : spR, p.x - s / 2, p.y - s / 2, s, s);
      }
      /* blue gas base flames */
      ctx.globalAlpha = clamp(state.fire, 0, 1) * .95;
      for (let i = 0; i < 30; i++) {
        const th = (i / 30) * Math.PI * 2;
        const f = 1 + Math.sin(t * 22 + i * 1.7) * .25;
        const s = 11 * f;
        ctx.drawImage(spB, 300 + Math.cos(th) * 92 - s / 2, 402 + Math.sin(th) * 10 - s * .7, s, s * 1.5);
      }
      ctx.globalCompositeOperation = 'source-over';

      /* SPLASH */
      for (let i = splash.length - 1; i >= 0; i--) {
        const p = splash[i];
        p.age += dt;
        p.vy += 430 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.life || (p.vy > 0 && p.y > 258)) { splash.splice(i, 1); continue; }
        ctx.globalAlpha = 1 - p.age / p.life;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }

      /* DROPS */
      ctx.fillStyle = '#9a5a26';
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i];
        p.vy += 700 * dt;
        p.y += p.vy * dt;
        if (p.y > H + 12) { drops.splice(i, 1); continue; }
        ctx.globalAlpha = .95;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * .75, p.r * (1 + Math.min(p.vy / 500, 1.2)), 0, 0, 6.283);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }

  function initHero() {
    const state = { fire: 0, steam: 0.9, boil: 1, pouring: false, pourX: 272, pourColor: '#f6ecd8', spill: 0 };
    initFX(state);

    const title = $('#heroTitle');
    const chars = title ? splitChars(title) : [];

    if (!hasGSAP) { state.fire = 1; return; }

    /* ---- static GSAP setup ---- */
    gsap.set(['#jugMilk', '#jugTea'], { autoAlpha: 0, y: -26 });
    gsap.set('#jugMilk', { svgOrigin: '130 40' });
    gsap.set('#jugTea', { svgOrigin: '470 40' });
    gsap.set('#foamBumps circle', { scale: 0, transformOrigin: '50% 50%' });
    gsap.set('#puddle', { scaleX: 0, transformOrigin: '50% 50%', opacity: 0 });

    /* boiling bubbles on chai surface */
    const bubbles = $('#bubbles');
    for (let i = 0; i < 18; i++) {
      const r = rand(1.6, 5);
      const c = svgEl('circle', { cx: rand(206, 394).toFixed(1), cy: rand(250, 259).toFixed(1), r: r.toFixed(1), fill: 'rgba(255,240,215,.25)', stroke: 'rgba(255,245,225,.7)', 'stroke-width': 1 }, bubbles);
      gsap.fromTo(c, { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, {
        scale: 1, opacity: 1, duration: rand(.25, .6), delay: rand(0, 1.2), yoyo: true, repeat: -1, repeatDelay: rand(0, .7), ease: 'sine.out'
      });
    }
    gsap.to('#chaiSurface', { attr: { ry: 10.4 }, duration: .22, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.fromTo('#glow', { opacity: .95 }, { opacity: .6, duration: .22, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('#pot', { y: -1.1, duration: .09, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    /* wave pooling at bottom */
    [['#waveA', 16], ['#waveB', 11], ['#waveC', 8]].forEach(([sel, d], i) => {
      gsap.fromTo(sel, { x: i % 2 ? -1440 : 0 }, { x: i % 2 ? 0 : -1440, duration: d, ease: 'none', repeat: -1 });
    });

    /* floating tea leaves & milk droplets */
    if (!reduceMotion) {
      const layer = $('#leaves');
      const LEAF = '<svg viewBox="0 0 24 24"><path d="M3 21C3 11 9 3 21 3c0 12-7 18-17 18z" fill="currentColor"/><path d="M4 20L16 8" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>';
      const cols = ['#4d6b2a', '#6b8a37', '#7a5a2a', '#5a3d1c', '#86a257'];
      const count = window.innerWidth < 700 ? 9 : 16;
      for (let i = 0; i < count; i++) {
        const d = document.createElement('div');
        const s = rand(14, 34);
        d.className = 'leaf';
        d.innerHTML = LEAF;
        d.style.cssText = `left:${rand(0, 98)}%;width:${s}px;height:${s}px;color:${pick(cols)};opacity:${rand(.35, .85).toFixed(2)};${s > 28 ? 'filter:blur(1.5px)' : ''}`;
        layer.appendChild(d);
        gsap.fromTo(d, { y: -80 }, { y: () => (layer.clientHeight || 800) + 80, duration: rand(10, 20), delay: -rand(0, 18), repeat: -1, ease: 'none' });
        gsap.to(d, { rotation: '+=360', duration: rand(6, 12), repeat: -1, ease: 'none' });
        gsap.to(d, { x: rand(-70, 70), duration: rand(2.2, 4.5), yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }
      for (let i = 0; i < 9; i++) {
        const d = document.createElement('div');
        d.className = 'mdrop';
        d.style.left = rand(2, 98) + '%';
        d.style.opacity = rand(.45, .9).toFixed(2);
        layer.appendChild(d);
        gsap.fromTo(d, { y: -40, scale: rand(.6, 1.3) }, { y: () => (layer.clientHeight || 800) + 40, duration: rand(6, 11), delay: -rand(0, 10), repeat: -1, ease: 'power1.in' });
      }
    }

    /* ---- mouse parallax ---- */
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
      const hero = $('#home');
      const layers = $$('[data-depth]', hero).map(el => ({
        d: parseFloat(el.dataset.depth) || 0,
        x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' })
      }));
      hero.addEventListener('pointermove', e => {
        const nx = e.clientX / window.innerWidth - .5, ny = e.clientY / window.innerHeight - .5;
        layers.forEach(l => { l.x(-nx * l.d * 2); l.y(-ny * l.d * 2); });
      });
    }

    /* ---- scroll parallax out of the hero ---- */
    if (hasST) {
      gsap.to('#heroContent', { yPercent: -14, opacity: .2, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* ---- the pour / boil-over loop ---- */
    function startLoop() {
      if (reduceMotion) { gsap.set('#chaiSurface', { fill: '#9a5a26' }); return; }
      gsap.set('#chaiSurface', { fill: '#9a5a26' });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: .6 });

      // MILK
      tl.to('#jugMilk', { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 0)
        .to('#jugMilk', { rotation: 36, duration: .8, ease: 'power2.inOut' }, .2)
        .call(() => { state.pouring = true; state.pourX = 274; state.pourColor = '#f6ecd8'; }, null, 1)
        .to('#streamMilk', { strokeDashoffset: 0, duration: .45, ease: 'power1.in' }, 1)
        .to('#chaiSurface', { fill: '#e5cda2', duration: 2, ease: 'sine.inOut' }, 1.3)
        .to('#streamMilk', { strokeDashoffset: -1, duration: .5, ease: 'power1.out' }, 3.3)
        .call(() => { state.pouring = false; }, null, 3.6)
        .to('#jugMilk', { rotation: 0, duration: .6, ease: 'power2.inOut' }, 3.3)
        .to('#jugMilk', { autoAlpha: 0, y: -26, duration: .4 }, 3.9);

      // TEA
      tl.to('#jugTea', { autoAlpha: 1, y: 0, duration: .5, ease: 'power2.out' }, 4.4)
        .to('#jugTea', { rotation: -36, duration: .8, ease: 'power2.inOut' }, 4.6)
        .call(() => { state.pouring = true; state.pourX = 326; state.pourColor = '#7a3f14'; }, null, 5.4)
        .to('#streamTea', { strokeDashoffset: 0, duration: .45, ease: 'power1.in' }, 5.4)
        .to('#chaiSurface', { fill: '#a8642b', duration: 2.2, ease: 'sine.inOut' }, 5.7)
        .to('#streamTea', { strokeDashoffset: -1, duration: .5, ease: 'power1.out' }, 7.7)
        .call(() => { state.pouring = false; }, null, 8)
        .to('#jugTea', { rotation: 0, duration: .6, ease: 'power2.inOut' }, 7.7)
        .to('#jugTea', { autoAlpha: 0, y: -26, duration: .4 }, 8.3);

      // BOIL-OVER + SPILL
      tl.to(state, { steam: 1.7, boil: 2.6, duration: 1.2, ease: 'power1.in' }, 8.6)
        .to('#chaiSurface', { fill: '#b06a2c', duration: 1.2 }, 8.6)
        .to('#foamBumps circle', { scale: 1, duration: .55, stagger: .07, ease: 'back.out(2.2)' }, 9)
        .to('#drip1', { strokeDashoffset: 0, duration: 1.3, ease: 'sine.in' }, 9.5)
        .to('#drip2', { strokeDashoffset: 0, duration: 1.2, ease: 'sine.in' }, 9.9)
        .to('#puddle', { scaleX: 1, opacity: 1, duration: 1.1, ease: 'power2.out' }, 10.6)
        .to('#thread', { strokeDashoffset: 0, duration: 1, ease: 'power1.in' }, 11.3)
        .call(() => { state.spill = 1; }, null, 12.1)
        .to('#foamBumps circle', { scale: 0, duration: .7, stagger: .05, ease: 'power2.in' }, 13.4)
        .to(state, { steam: .9, boil: 1, duration: 1.6 }, 13.6)
        .to(['#drip1', '#drip2', '#thread'], { strokeDashoffset: -1, duration: 1.3, ease: 'sine.out', stagger: .12 }, 13.8)
        .call(() => { state.spill = 0; }, null, 14)
        .to('#puddle', { opacity: 0, duration: .9 }, 14.4)
        .to('#chaiSurface', { fill: '#9a5a26', duration: 1 }, 14.6);
    }

    /* ---- intro sequence ---- */
    function intro() {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from('#heroEyebrow', { y: 20, opacity: 0, duration: .9 }, 0)
        .from(chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: .028 }, .1)
        .from('#heroSub', { y: 24, opacity: 0, duration: 1 }, .9)
        .from('#heroCta > *', { y: 26, opacity: 0, scale: .92, duration: .9, stagger: .12 }, 1.1)
        .from('#sceneInner', { y: 90, opacity: 0, scale: .94, duration: 1.6, ease: 'power3.out' }, .2)
        .from('#nav', { y: -80, opacity: 0, duration: 1 }, .6)
        .to(state, { fire: 1, duration: 2.2, ease: 'power2.inOut' }, .5)
        .to(state, { steam: 1, duration: 2 }, .8)
        .call(startLoop, null, 1.6);
    }
    document.addEventListener('chai:ready', intro, { once: true });
  }

  /* ==========================================================
     MAKE YOUR OWN CHAI — studio UI + canvas kitchen engine
     ========================================================== */
  const sel = { tea: 'patti', sweet: 'normal', milk: 'regular', spice: {}, special: null, cups: 1 };
  let studioApi = null;   // set by initStudio
  let cartApi = null;     // set by initShop (addItem)

  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpC = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgbStr = (c, a) => (a === undefined ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`);
  const hexOf = c => '#' + c.map(v => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('');
  const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));
  const ramp = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  /* ---- recipe maths shared by the basket, the animation and the result card ---- */
  function chaiType() {
    const sp = Object.keys(sel.spice);
    if (sel.special) return ingFind('special', sel.special).name;
    if (sp.includes('kesar')) return 'Kesar Chai';
    if (sp.length >= 4) return 'Masala Chai';
    if (sp.includes('adrak') && sp.includes('elaichi') && sp.length === 2) return 'Adrak Elaichi Chai';
    if (sp.length === 0) return 'Classic Indian Chai';
    return 'Custom Spiced Chai';
  }
  function unitPrice() {
    let p = 79;
    p += ingFind('tea', sel.tea).price + ingFind('sweet', sel.sweet).price + ingFind('milk', sel.milk).price;
    Object.keys(sel.spice).forEach(k => { p += ingFind('spice', k).price * sel.spice[k]; });
    return p;
  }
  function finalColor() {
    const tea = ingFind('tea', sel.tea).color;
    let c = lerpC(tea, [246, 232, 204], ingFind('milk', sel.milk).mix);
    Object.keys(sel.spice).forEach(k => { c = lerpC(c, ingFind('spice', k).tint, 0.05 + sel.spice[k] * 0.03); });
    if (sel.sweet === 'jaggery') c = lerpC(c, [150, 80, 30], 0.18);
    return c;
  }
  function prepSeconds() {
    let s = 240 + Object.keys(sel.spice).length * 25;
    if (sel.milk === 'none') s -= 40;
    return s + (sel.cups - 1) * 30;
  }
  const fmtPrep = s => `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} sec`;

  /* ---------------------------------------------------------- UI ---------------------------------------------------------- */
  function buildPanel() {
    const panel = $('#studioPanel');
    const opt = (group, o, extra = '') => `<button type="button" class="opt" data-group="${group}" data-k="${o.k}" aria-pressed="false">
      <span class="opt__ico">${ingIcon(group, o.k)}</span><span class="opt__name">${o.name}${o.hi ? `<em>${o.hi}</em>` : ''}</span>${o.note ? `<span class="opt__note">${o.note}</span>` : ''}${extra}</button>`;
    panel.innerHTML = `
      <div class="pgroup"><h3><span>A</span> Tea base</h3><div class="opts opts--3">${ING.tea.map(o => opt('tea', o)).join('')}</div></div>
      <div class="pgroup"><h3><span>B</span> Sweetness</h3><div class="opts opts--5">${ING.sweet.map(o => opt('sweet', o)).join('')}</div></div>
      <div class="pgroup"><h3><span>C</span> Spices <small>pick as many as you like</small></h3><div class="opts opts--3">${ING.spice.map(o => opt('spice', o)).join('')}</div></div>
      <div class="pgroup"><h3><span>D</span> Milk</h3><div class="opts opts--4">${ING.milk.map(o => opt('milk', o)).join('')}</div></div>
      <div class="pgroup"><h3><span>E</span> Special chai <small>one tap sets a full recipe</small></h3><div class="opts opts--4">${ING.special.map(o => opt('special', o)).join('')}</div></div>`;
  }

  function syncUI() {
    $$('.opt', $('#studioPanel')).forEach(b => {
      const g = b.dataset.group, k = b.dataset.k;
      const on = g === 'spice' ? !!sel.spice[k] : sel[g] === k;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    renderBasket();
  }

  function renderBasket() {
    const b = $('#basket');
    const chip = (group, o, ctrl) => `<li class="bchip" data-group="${group}" data-k="${o.k}"><span class="bchip__ico">${ingIcon(group, o.k)}</span><span class="bchip__t"><b>${o.name}</b>${ctrl || ''}</span></li>`;
    const sp = Object.keys(sel.spice).map(k => {
      const o = ingFind('spice', k), n = sel.spice[k];
      return chip('spice', o, `<span class="bstep"><button type="button" data-act="dec" aria-label="Less ${o.name}">−</button><i>${['', 'Light', 'Medium', 'Strong'][n]}</i><button type="button" data-act="inc" aria-label="More ${o.name}">+</button><button type="button" data-act="rm" class="bstep__x" aria-label="Remove ${o.name}">×</button></span>`);
    }).join('');
    const unit = unitPrice();
    b.innerHTML = `
      <div class="basket__head"><h3>Your ingredient basket</h3><span class="basket__type">${chaiType()}</span></div>
      <ul class="basket__list">
        ${chip('tea', ingFind('tea', sel.tea))}${chip('sweet', ingFind('sweet', sel.sweet))}${chip('milk', ingFind('milk', sel.milk))}${sp}
      </ul>
      ${Object.keys(sel.spice).length ? '' : '<p class="basket__hint">No spices yet — add some from group C.</p>'}
      <div class="basket__foot">
        <div class="cupstep"><span>Cups</span><button type="button" data-cups="-1" aria-label="Fewer cups">−</button><b id="cupsN">${sel.cups}</b><button type="button" data-cups="1" aria-label="More cups">+</button></div>
        <div class="basket__price"><small>${rupee(unit)} × ${sel.cups}</small><strong>${rupee(unit * sel.cups)}</strong></div>
      </div>`;
  }

  /* ---------------------------------------------------------- ENGINE ---------------------------------------------------------- */
  function createEngine(canvas, hooks) {
    const ctx = canvas.getContext('2d');
    const W = 800, H = 560;
    const POT = { x: 330, y: 468, h: 170, rx: 108 };
    const CUP = { x: 650, base: 498, h: 112, rx: 54 };
    const JUG_W = { x: 282, y: 96 }, JUG_M = { x: 384, y: 96 };
    const NAMES = ['Water boiling', 'Tea patti', 'Sugar & spices', 'Milk pouring', 'Boiling chai', 'Pouring into the cup'];
    let scale = 1, running = false, visible = true, last = 0, raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      scale = canvas.width / W;
    };
    canvas.style.aspectRatio = `${W} / ${H}`;
    resize();
    window.addEventListener('resize', resize);

    /* ---- soft sprites ---- */
    const sprite = (size, stops) => makeSprite(size, stops);
    const spY = sprite(64, [[0, 'rgba(255,248,210,1)'], [.35, 'rgba(255,205,90,.75)'], [1, 'rgba(255,120,20,0)']]);
    const spO = sprite(64, [[0, 'rgba(255,190,70,.95)'], [.4, 'rgba(255,110,20,.6)'], [1, 'rgba(220,50,0,0)']]);
    const spR = sprite(64, [[0, 'rgba(255,100,20,.6)'], [.5, 'rgba(190,40,5,.3)'], [1, 'rgba(120,10,0,0)']]);
    const spB = sprite(32, [[0, 'rgba(200,230,255,1)'], [.4, 'rgba(70,130,255,.75)'], [1, 'rgba(30,60,255,0)']]);
    const spS = sprite(64, [[0, 'rgba(255,255,255,.9)'], [.5, 'rgba(255,255,255,.35)'], [1, 'rgba(255,255,255,0)']]);

    /* ---- pre-rendered kitchen backdrop ---- */
    const bg = document.createElement('canvas');
    bg.width = W; bg.height = H;
    (function paintBg() {
      const g = bg.getContext('2d');
      const wall = g.createLinearGradient(0, 0, 0, 500);
      wall.addColorStop(0, '#2c1a12'); wall.addColorStop(1, '#170c07');
      g.fillStyle = wall; g.fillRect(0, 0, W, H);
      g.strokeStyle = 'rgba(0,0,0,.32)'; g.lineWidth = 2;
      for (let y = 0; y < 500; y += 50) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      for (let r = 0; r < 10; r++) for (let x = (r % 2) * 50; x < W; x += 100) { g.beginPath(); g.moveTo(x, r * 50); g.lineTo(x, r * 50 + 50); g.stroke(); }
      const win = g.createRadialGradient(690, 120, 10, 690, 120, 260);
      win.addColorStop(0, 'rgba(255,200,120,.38)'); win.addColorStop(1, 'rgba(255,160,60,0)');
      g.fillStyle = win; g.fillRect(0, 0, W, 480);
      g.fillStyle = '#120a06'; g.fillRect(610, 36, 150, 170);
      const wg = g.createLinearGradient(0, 46, 0, 196); wg.addColorStop(0, '#ffe0a0'); wg.addColorStop(1, '#e29a45');
      g.fillStyle = wg; g.fillRect(618, 44, 134, 154);
      g.fillStyle = '#120a06'; g.fillRect(683, 44, 5, 154); g.fillRect(618, 118, 134, 5);
      g.fillStyle = '#4a2e1a'; g.fillRect(40, 150, 250, 10);
      [[54, 100, 44, 50], [108, 112, 38, 38], [154, 92, 50, 58], [212, 108, 40, 42], [252, 98, 34, 52]].forEach(([x, y, w, h], i) => {
        const jg = g.createLinearGradient(x, 0, x + w, 0); jg.addColorStop(0, '#4a4d51'); jg.addColorStop(.4, '#9a9da1'); jg.addColorStop(1, '#3a3d41');
        g.fillStyle = i === 3 ? '#a45a32' : jg; g.fillRect(x, y, w, h); g.fillStyle = '#26282b'; g.fillRect(x - 3, y - 7, w + 6, 8);
      });
      const cw = g.createLinearGradient(0, 482, 0, H); cw.addColorStop(0, '#7a5030'); cw.addColorStop(1, '#3a2212');
      g.fillStyle = cw; g.fillRect(0, 482, W, H - 482);
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 1.5;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, 492 + i * 8); g.lineTo(W, 492 + i * 8); g.stroke(); }
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, 482, W, 3);
      const sg = g.createLinearGradient(0, 482, 0, H); sg.addColorStop(0, '#b4b7bb'); sg.addColorStop(.18, '#6f7276'); sg.addColorStop(.19, '#3b3d41'); sg.addColorStop(1, '#141517');
      g.fillStyle = sg; g.fillRect(140, 482, 380, H - 482);
      g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(140, 482, 380, 2);
      g.fillStyle = '#0d0d0e'; g.beginPath(); g.ellipse(330, 492, 96, 9, 0, 0, 7); g.fill();
      g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.beginPath(); g.ellipse(330, 491, 84, 7.5, 0, 0, 7); g.stroke();
      g.strokeStyle = '#050505'; g.lineWidth = 7; g.lineCap = 'round';
      [[236, 486, 266, 478], [424, 486, 394, 478], [270, 496, 250, 504], [390, 496, 410, 504]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    })();

    /* ---- model ---- */
    let m = null, cfg = null;
    const fresh = () => ({
      t: 0, stage: -1, st: 0, dur: [], q: [], flags: {}, done: false, speed: 1, boost: 0,
      level: 0, color: [150, 190, 205], flame: 0, boil: 0, steam: 0.08, shake: 0, tilt: 0, dx: 0, dy: 0, cup: 0, foam: 0, turn: 0,
      jw: { rot: 0, vis: 0 }, jm: { rot: 0, vis: 0 }, sw: 0, sm: 0, sp: 0, knob: 0, flash: 0,
      items: [], ripples: [], drops: [], bubbles: [], wbub: [], steamP: [], fireP: [], sparks: [], labels: []
    });
    m = fresh();

    function buildPlan() {
      const tea = ingFind('tea', cfg.tea), sw = ingFind('sweet', cfg.sweet), milk = ingFind('milk', cfg.milk);
      const spices = Object.keys(cfg.spice);
      const d = [6.2, 5, 5.2 + Math.min(spices.length, 5) * 0.5, milk.mix ? 5 : 2.2, 5.6, 9.6];
      if (!sw.grains && !sw.chunks && !spices.length) d[2] = 2.4;
      m.dur = d.map(x => x * (cfg.cups > 1 ? 1 : 1));
      m.tea = tea; m.swOpt = sw; m.milkO = milk; m.spices = spices;
      m.teaColor = tea.color;
      let c = tea.color;
      if (sw.chunks) c = lerpC(c, [150, 80, 30], 0.12);
      spices.forEach(k => { c = lerpC(c, ingFind('spice', k).tint, 0.05 + cfg.spice[k] * 0.025); });
      m.sweetColor = c;
      m.finalColor = lerpC(c, [246, 232, 204], milk.mix);
    }

    function enterStage(i) {
      m.stage = i; m.st = 0; m.q = []; m.flags = {};
      const d = m.dur[i];
      if (hooks.onStage) hooks.onStage(i, NAMES[i], captionFor(i));
      if (i === 1) {
        const n = m.tea.k === 'darjeeling' ? 26 : 36;
        for (let k = 0; k < n; k++) m.q.push({ t: 0.3 + (k / n) * (d * 0.62), kind: 'leaf' });
      }
      if (i === 2) {
        let t = 0.3;
        if (m.swOpt.grains) { const n = m.swOpt.grains; for (let k = 0; k < n; k++) m.q.push({ t: 0.2 + (k / n) * 1.6, kind: 'sugar' }); t = 1.9; }
        if (m.swOpt.chunks) { for (let k = 0; k < m.swOpt.chunks; k++) m.q.push({ t: 0.3 + k * 0.22, kind: 'jag' }); t = 2; }
        const per = (d - t - 0.6) / Math.max(1, m.spices.length);
        m.spices.forEach((k, si) => {
          const o = ingFind('spice', k), n = o.per * cfg.spice[k], t0 = t + si * per;
          m.q.push({ t: t0, kind: 'label', text: o.hi });
          for (let j = 0; j < n; j++) m.q.push({ t: t0 + 0.1 + (j / n) * Math.min(per * 0.9, 1.6), kind: k });
        });
      }
      m.q.sort((a, b) => a.t - b.t);
      if (i === 3 && !m.milkO.mix) hooks.caption && hooks.caption('No milk — keeping it strong and dark.');
    }
    function captionFor(i) {
      const sw = m.swOpt, sp = m.spices.map(k => ingFind('spice', k).hi).join(', ');
      return [
        'Water goes in, the gas is switched on…',
        `Dropping in ${m.tea.name}.`,
        (sw.grains || sw.chunks ? `${sw.name} goes in` : 'No sugar this time') + (sp ? `, then ${sp}.` : '.'),
        m.milkO.mix ? `Pouring ${m.milkO.name}.` : 'Skipping the milk — strong black chai.',
        'Let it rise, bubble and boil.',
        'Tilting the pot and pouring into a kulhad.'
      ][i];
    }

    /* ---- spawning ---- */
    const surfY = () => POT.y - POT.h + (1 - m.level) * 14 + 4;
    function spawnItem(kind) {
      const x = POT.x + rand(-72, 72);
      const it = { kind, x, y: rand(-40, -10), vx: rand(-14, 14), vy: rand(0, 80), rot: rand(0, 6.28), vr: rand(-5, 5), life: 0, land: false, sz: 1 };
      if (kind === 'sugar') { it.sz = rand(.8, 1.4); it.vr = rand(-2, 2); }
      if (kind === 'saffron') it.vx *= .4;
      m.items.push(it);
    }
    function landItem(it) {
      it.land = true; it.y = surfY() + rand(-2, 3); it.life = 0;
      it.float = it.kind === 'leaf' ? rand(2.5, 4) : it.kind === 'sugar' ? rand(.35, .7) : rand(1.4, 2.6);
      m.ripples.push({ x: it.x, y: it.y, r: 2, a: .7, rx: 1 });
      const n = it.kind === 'sugar' ? 1 : 3;
      for (let i = 0; i < n; i++) m.drops.push({ x: it.x, y: it.y, vx: rand(-40, 40), vy: -rand(50, 120), r: rand(1, 2.2), life: rand(.3, .55), age: 0, c: lerpC(m.color, [255, 255, 255], .25) });
    }

    /* ---- stage logic (sets targets; values are damped toward them) ---- */
    function stageTick(dt) {
      const s = m.stage, p = clamp(m.st / m.dur[s], 0, 1);
      let tFlame = m.flame, tBoil = m.boil, tSteam = m.steam, tShake = 0, tFoam = 0, tTilt = 0, tDx = 0, tDy = 0;
      let jwR = 0, jwV = 0, jmR = 0, jmV = 0, sw = 0, sm = 0;
      const lv = (target, rate) => { m.level = damp(m.level, target, rate, dt); };
      while (m.q.length && m.q[0].t <= m.st) {
        const e = m.q.shift();
        if (e.kind === 'label') m.labels.push({ text: e.text, x: POT.x + rand(-40, 40), y: 170, age: 0 });
        else spawnItem(e.kind);
      }
      m.turn = damp(m.turn, 0, 2.2, dt);

      if (s === 0) {
        jwV = p < .5 ? 1 : 0; jwR = p > .06 && p < .44 ? 0.78 : 0;
        sw = p > .12 && p < .43 ? 1 : 0;
        lv(p > .12 ? 0.5 : 0, 2.6);
        if (p > .46 && !m.flags.ign) { m.flags.ign = 1; m.flash = 1; m.knob = 1; for (let i = 0; i < 22; i++) m.sparks.push({ x: POT.x + rand(-80, 80), y: 488, vx: rand(-70, 70), vy: -rand(40, 150), age: 0, life: rand(.3, .7) }); }
        tFlame = p > .46 ? 0.9 : 0;
        tBoil = ramp(p, .62, 1) * 0.55; tSteam = 0.08 + tBoil * 0.7;
        m.color = lerpC(m.color, [160, 205, 220], 1 - Math.exp(-4 * dt));
      } else if (s === 1) {
        tFlame = 0.9; tBoil = 0.6; tSteam = 0.5; lv(0.5, 3);
        m.color = lerpC(m.color, lerpC([160, 205, 220], m.teaColor, 1), 1 - Math.exp(-(0.4 + ramp(p, .2, 1) * 1.6) * dt));
      } else if (s === 2) {
        tFlame = 0.95; tBoil = 0.8; tSteam = 0.6; lv(0.5, 3);
        m.color = lerpC(m.color, m.sweetColor, 1 - Math.exp(-1.2 * dt));
      } else if (s === 3) {
        tFlame = 0.95; tBoil = 0.8; tSteam = 0.65;
        if (m.milkO.mix) {
          jmV = p < .82 ? 1 : 0; jmR = p > .06 && p < .74 ? 0.8 : 0; sm = p > .14 && p < .72 ? 1 : 0;
          lv(lerp(0.5, 0.76, ramp(p, .14, .72)), 4);
          m.color = lerpC(m.color, m.finalColor, 1 - Math.exp(-(.6 + ramp(p, .2, .8) * 1.6) * dt));
        } else { lv(0.5, 3); m.color = lerpC(m.color, m.finalColor, 1 - Math.exp(-2 * dt)); }
      } else if (s === 4) {
        tFlame = p < .86 ? 1 : 0.5; tBoil = 1; tSteam = 1.15; tShake = 1; tFoam = Math.sin(clamp(ramp(p, .18, .96), 0, 1) * Math.PI) * 1; lv(m.milkO.mix ? 0.76 : 0.52, 2);
        m.color = lerpC(m.color, m.finalColor, 1 - Math.exp(-2 * dt));
        if (Math.random() < dt * 8) { const a = rand(-70, 70); m.drops.push({ x: POT.x + a, y: surfY(), vx: rand(-40, 40) + a * .4, vy: -rand(90, 190), r: rand(1.4, 3), life: rand(.45, .8), age: 0, c: lerpC(m.color, [255, 240, 220], .15) }); }
      } else {
        tBoil = lerp(1, .3, ramp(p, 0, .3));
        tFlame = p < .12 ? 0.6 : 0; tSteam = 0.7;
        if (p > .1 && !m.flags.off) { m.flags.off = 1; m.knob = 0; }
        tDx = 202 * ramp(p, .12, .34); tDy = -34 * ramp(p, .12, .34);
        tTilt = lerp(0, 0.92, ramp(p, .28, .78));
        if (p > .8) tTilt = lerp(0.92, 0.1, ramp(p, .8, .98));
        if (p > .9) { tDx = lerp(202, 0, ramp(p, .9, 1)); tDy = lerp(-34, 0, ramp(p, .9, 1)); }
        const flowing = p > .38 && p < .82;
        m.sp = damp(m.sp, flowing ? 1 : 0, 9, dt);
        if (flowing) { m.level = Math.max(0.12, m.level - dt * 0.09); m.cup = Math.min(0.9, m.cup + dt * (0.9 / (m.dur[5] * 0.44))); }
      }

      m.flame = damp(m.flame, tFlame, 3.2, dt);
      m.boil = damp(m.boil, tBoil, 2.5, dt);
      m.steam = damp(m.steam, tSteam, 1.6, dt);
      m.shake = damp(m.shake, tShake, 5, dt);
      m.foam = damp(m.foam, tFoam, 3, dt);
      m.tilt = damp(m.tilt, tTilt, s === 5 ? 3 : 4, dt);
      m.dx = damp(m.dx, tDx, 3.4, dt); m.dy = damp(m.dy, tDy, 3.4, dt);
      m.jw.vis = damp(m.jw.vis, jwV, 6, dt); m.jw.rot = damp(m.jw.rot, jwR, 5, dt);
      m.jm.vis = damp(m.jm.vis, jmV, 6, dt); m.jm.rot = damp(m.jm.rot, jmR, 5, dt);
      m.sw = damp(m.sw, sw, 10, dt); m.sm = damp(m.sm, sm, 10, dt);
      m.flash = damp(m.flash, 0, 3, dt);

      if (m.st >= m.dur[s]) {
        if (s < 5) enterStage(s + 1);
        else { m.done = true; m.stage = 6; hooks.onDone && hooks.onDone(); }
      }
    }

    function idleTick(dt) {
      m.turn = Math.sin(m.t * 0.55) * 0.95;
      m.flame = damp(m.flame, 0, 4, dt); m.boil = damp(m.boil, 0, 3, dt); m.steam = damp(m.steam, m.done ? 0.35 : 0.04, 2, dt);
      m.shake = damp(m.shake, 0, 5, dt); m.foam = damp(m.foam, 0, 3, dt); m.tilt = damp(m.tilt, 0, 3, dt);
      m.dx = damp(m.dx, 0, 3, dt); m.dy = damp(m.dy, 0, 3, dt);
      m.jw.vis = damp(m.jw.vis, 0, 6, dt); m.jm.vis = damp(m.jm.vis, 0, 6, dt); m.sw = 0; m.sm = 0; m.sp = damp(m.sp, 0, 8, dt);
      if (m.done) { m.level = damp(m.level, 0.12, 2, dt); m.turn *= 0.2; }
    }

    /* ---- particle update ---- */
    function updateParticles(dt) {
      for (let i = m.items.length - 1; i >= 0; i--) {
        const it = m.items[i];
        if (!it.land) {
          it.vy += (it.kind === 'saffron' || it.kind === 'leaf' ? 420 : 900) * dt;
          if (it.kind === 'leaf' || it.kind === 'saffron') it.vx += Math.sin(m.t * 6 + i) * 60 * dt;
          it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
          if (it.y >= surfY()) landItem(it);
        } else {
          it.life += dt; it.x += Math.sin(m.t * 2 + i) * 6 * dt; it.rot += it.vr * 0.1 * dt;
          if (it.life > it.float) m.items.splice(i, 1);
        }
      }
      for (let i = m.ripples.length - 1; i >= 0; i--) { const r = m.ripples[i]; r.r += 38 * dt; r.a -= dt * 1.4; if (r.a <= 0) m.ripples.splice(i, 1); }
      for (let i = m.drops.length - 1; i >= 0; i--) {
        const d = m.drops[i]; d.age += dt; d.vy += 700 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.age > d.life) m.drops.splice(i, 1);
      }
      /* surface bubbles */
      const sy = surfY(), bt = m.boil * 26 * (m.level > 0.05 ? 1 : 0);
      if (Math.random() < bt * dt) { const a = rand(0, 6.28), rr = Math.sqrt(Math.random()); m.bubbles.push({ x: POT.x + Math.cos(a) * rr * 92, y: sy + Math.sin(a) * rr * 8 * (1 - (1 - m.level) * .4), r: 1, age: 0, life: rand(.35, .75), max: rand(3, 7) }); }
      for (let i = m.bubbles.length - 1; i >= 0; i--) { const b = m.bubbles[i]; b.age += dt; if (b.age > b.life) m.bubbles.splice(i, 1); }
      /* window bubbles */
      if (Math.random() < m.boil * 30 * dt && m.level > 0.08) m.wbub.push({ x: rand(-40, 40), y: -16, vy: rand(30, 70), r: rand(1.6, 4.2), ph: rand(0, 6) });
      for (let i = m.wbub.length - 1; i >= 0; i--) { const b = m.wbub[i]; b.y -= b.vy * dt; b.x += Math.sin(m.t * 5 + b.ph) * 8 * dt; if (b.y < -POT.h + 18 + (1 - m.level) * 120) m.wbub.splice(i, 1); }
      /* steam */
      const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      const sr = (lowPower ? 18 : 30) * m.steam;
      if (Math.random() < sr * dt && m.steamP.length < 90) m.steamP.push({ x: POT.x + m.dx + rand(-80, 80) * (1 - m.tilt * .3), y: POT.y + m.dy - POT.h - 4, vx: rand(-5, 5), vy: -rand(22, 40), age: 0, life: rand(3, 5), size: rand(16, 26), grow: rand(10, 18), a: rand(.1, .2), ph: rand(0, 6) });
      if (m.cup > 0.25 && Math.random() < 14 * Math.min(1, m.cup + .2) * dt && m.steamP.length < 120) m.steamP.push({ x: CUP.x + rand(-26, 26), y: CUP.base - CUP.h + (1 - m.cup) * 20 - 6, vx: rand(-4, 4), vy: -rand(18, 34), age: 0, life: rand(2.4, 4), size: rand(10, 16), grow: rand(8, 14), a: rand(.12, .22), ph: rand(0, 6) });
      for (let i = m.steamP.length - 1; i >= 0; i--) { const p = m.steamP[i]; p.age += dt; if (p.age >= p.life) { m.steamP.splice(i, 1); continue; } p.x += (p.vx + Math.sin(m.t * .9 + p.ph) * 10) * dt; p.y += p.vy * dt; p.size += p.grow * dt; }
      /* fire */
      if (m.flame > 0.02) {
        const rate = 120 * m.flame; let acc = rate * dt;
        while (acc > 0 && m.fireP.length < 220) {
          if (Math.random() > Math.min(1, acc)) break; acc -= 1;
          const th = rand(0, 6.283), cx = Math.cos(th), side = Math.abs(cx) > .5;
          m.fireP.push({ x: POT.x + cx * rand(80, 100), y: 490 + Math.sin(th) * 6, vx: -cx * rand(4, 14) + rand(-6, 6), vy: -(side ? rand(55, 100) : rand(25, 50)) * (0.6 + m.flame * .5), age: 0, life: side ? rand(.45, .8) : rand(.28, .5), size: rand(13, 24) * (side ? 1.1 : .8) });
        }
      }
      for (let i = m.fireP.length - 1; i >= 0; i--) { const p = m.fireP[i]; p.age += dt; if (p.age >= p.life) { m.fireP.splice(i, 1); continue; } p.x += (p.vx + Math.sin(m.t * 14 + i) * 6) * dt; p.y += p.vy * dt; }
      for (let i = m.sparks.length - 1; i >= 0; i--) { const s = m.sparks[i]; s.age += dt; s.vy += 260 * dt; s.x += s.vx * dt; s.y += s.vy * dt; if (s.age > s.life) m.sparks.splice(i, 1); }
      for (let i = m.labels.length - 1; i >= 0; i--) { const l = m.labels[i]; l.age += dt; l.y -= 18 * dt; if (l.age > 1.8) m.labels.splice(i, 1); }
      /* pouring stream impacts */
      const jx = (m.sw > .5 ? JUG_W.x + 4 : m.sm > .5 ? JUG_M.x - 4 : null);
      if (jx !== null && Math.random() < 40 * dt) m.drops.push({ x: jx + rand(-5, 5), y: sy, vx: rand(-50, 50), vy: -rand(40, 110), r: rand(1, 2.4), life: rand(.3, .5), age: 0, c: m.sw > .5 ? [210, 235, 245] : [248, 240, 224] });
      if (jx !== null && Math.random() < 6 * dt) m.ripples.push({ x: jx, y: sy, r: 4, a: .6 });
      if (m.sp > .3) {
        const ty = CUP.base - CUP.h + (1 - m.cup) * 20 + 2, tx = lipX() + 10;
        if (Math.random() < 55 * dt) m.drops.push({ x: tx + rand(-5, 5), y: ty, vx: rand(-70, 70), vy: -rand(60, 150), r: rand(1.2, 2.8), life: rand(.35, .6), age: 0, c: m.color });
        if (Math.random() < 8 * dt) m.ripples.push({ x: tx, y: ty, r: 3, a: .6, flat: 1 });
      }
    }

    /* ---- drawing helpers ---- */
    function lipX() { return POT.x + m.dx + POT.rx + (m.shake ? Math.sin(m.t * 40) * m.shake * .8 : 0); }

    function drawFlames() {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const p of m.fireP) {
        const k = p.age / p.life, s = p.size * (1.5 - k * .9);
        ctx.globalAlpha = (1 - k) * .9 * Math.min(1, m.flame + .1);
        ctx.drawImage(k < .3 ? spY : k < .65 ? spO : spR, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = clamp(m.flame, 0, 1) * .95;
      for (let i = 0; i < 28; i++) {
        const th = (i / 28) * 6.283, f = 1 + Math.sin(m.t * 22 + i * 1.7) * .25, s = 11 * f;
        ctx.drawImage(spB, POT.x + Math.cos(th) * 88 - s / 2, 491 + Math.sin(th) * 7 - s * .7, s, s * 1.5);
      }
      if (m.flash > 0.02) { ctx.globalAlpha = m.flash * .8; ctx.drawImage(spY, POT.x - 130, 420, 260, 130); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffd890';
      for (const s of m.sparks) { ctx.globalAlpha = 1 - s.age / s.life; ctx.fillRect(s.x, s.y, 2, 2); }
      ctx.restore();
    }

    function drawPot() {
      const shx = m.shake ? Math.sin(m.t * 42) * m.shake * 1.4 : 0, shy = m.shake ? Math.cos(m.t * 57) * m.shake * 0.8 : 0;
      const piv = { x: POT.rx, y: -POT.h };
      ctx.save();
      ctx.translate(POT.x + m.dx + shx, POT.y + m.dy + shy);
      ctx.translate(piv.x, piv.y); ctx.rotate(m.tilt); ctx.translate(-piv.x, -piv.y);
      /* handle (foreshortened by the turntable angle) */
      const hl = 38 + 62 * Math.cos(m.turn), hy = Math.sin(m.turn) * 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#141312'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(-POT.rx + 6, -POT.h + 34); ctx.lineTo(-POT.rx - hl, -POT.h + 28 + hy); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-POT.rx + 4, -POT.h + 31); ctx.lineTo(-POT.rx - hl + 4, -POT.h + 25 + hy); ctx.stroke();
      /* body */
      const hi = 0.3 + Math.sin(m.turn) * 0.22;
      const bg2 = ctx.createLinearGradient(-POT.rx, 0, POT.rx, 0);
      bg2.addColorStop(0, '#0a0909'); bg2.addColorStop(clamp(hi, .08, .9), '#55504a'); bg2.addColorStop(clamp(hi + .18, .2, .98), '#1c1917'); bg2.addColorStop(1, '#050505');
      ctx.fillStyle = bg2;
      ctx.beginPath(); ctx.moveTo(-POT.rx, -POT.h); ctx.lineTo(POT.rx, -POT.h); ctx.lineTo(94, -14); ctx.quadraticCurveTo(92, 0, 78, 0); ctx.lineTo(-78, 0); ctx.quadraticCurveTo(-92, 0, -94, -14); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-100, -62); ctx.lineTo(100, -62); ctx.stroke();
      /* measuring window with live liquid */
      const wx = -46, wy = -150, ww = 92, wh = 118;
      ctx.save();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(wx, wy, ww, wh, 14) : ctx.rect(wx, wy, ww, wh); ctx.clip();
      ctx.fillStyle = '#0c0a09'; ctx.fillRect(wx, wy, ww, wh);
      ctx.translate(piv.x, piv.y); ctx.rotate(-m.tilt); ctx.translate(-piv.x, -piv.y);
      const yTop = -14 - m.level * (POT.h - 30), dd = Math.max(0, (yTop + POT.h) - m.tilt * 85), ys = -POT.h + dd;
      if (m.level > 0.01) {
        const lg = ctx.createLinearGradient(0, ys, 0, 0);
        lg.addColorStop(0, rgbStr(lerpC(m.color, [255, 255, 255], .12))); lg.addColorStop(1, rgbStr(lerpC(m.color, [0, 0, 0], .35)));
        ctx.fillStyle = lg; ctx.fillRect(-140, ys, 280, 260);
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-140, ys, 280, 2);
        ctx.fillStyle = 'rgba(255,255,255,.1)';
        for (let i = 0; i < 4; i++) { const x = -40 + ((i * 29 + m.t * 18 * (0.4 + m.boil)) % 92); ctx.fillRect(x, ys + 6 + (i % 2) * 7, 12, 2); }
        ctx.lineWidth = 1.2;
        for (const b of m.wbub) { if (b.y > ys) { ctx.strokeStyle = 'rgba(255,245,225,.7)'; ctx.fillStyle = 'rgba(255,245,225,.18)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill(); ctx.stroke(); } }
      }
      ctx.restore();
      ctx.strokeStyle = '#8f9296'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(wx, wy, ww, wh, 14) : ctx.rect(wx, wy, ww, wh); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.09)'; ctx.beginPath(); ctx.moveTo(wx + 8, wy + 4); ctx.lineTo(wx + 30, wy + 4); ctx.lineTo(wx + 8, wy + 60); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '600 8px Manrope, sans-serif';
      for (let i = 1; i <= 3; i++) { ctx.fillRect(wx + ww - 10, wy + wh - i * 30, 7, 1.5); }
      /* rim + opening */
      ctx.fillStyle = '#26221f'; ctx.beginPath(); ctx.ellipse(0, -POT.h, POT.rx, 14, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#8f8880'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -POT.h - 1, POT.rx, 14, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = '#050404'; ctx.beginPath(); ctx.ellipse(0, -POT.h, POT.rx - 6, 11, 0, 0, 7); ctx.fill();
      if (m.level > 0.01) {
        const lc = m.color, lv = (1 - m.level);
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, -POT.h, POT.rx - 6, 11, 0, 0, 7); ctx.clip();
        ctx.fillStyle = rgbStr(lc); ctx.beginPath(); ctx.ellipse(0, -POT.h + lv * 6 + 1, POT.rx - 8 - lv * 6, 10 - lv * 3, 0, 0, 7); ctx.fill();
        const sg = ctx.createRadialGradient(-30, -POT.h - 2, 2, -30, -POT.h - 2, 80); sg.addColorStop(0, 'rgba(255,255,255,.35)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = sg; ctx.fillRect(-POT.rx, -POT.h - 14, POT.rx * 2, 28);
        ctx.restore();
      }
      /* foam over the rim when it rises */
      if (m.foam > 0.03) {
        ctx.fillStyle = 'rgba(244,228,196,.95)'; ctx.strokeStyle = 'rgba(120,70,20,.35)'; ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) { const x = -92 + i * 17, r = (7 + (i * 5) % 6) * m.foam; ctx.beginPath(); ctx.arc(x, -POT.h - 6 - Math.sin(m.t * 5 + i) * 1.5 * m.foam, r, 0, 6.283); ctx.fill(); ctx.stroke(); }
      }
      /* spout lip */
      ctx.fillStyle = '#6f6a63'; ctx.beginPath(); ctx.moveTo(POT.rx - 4, -POT.h - 6); ctx.lineTo(POT.rx + 10, -POT.h + 3); ctx.lineTo(POT.rx - 6, -POT.h + 10); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawItem(it) {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      let a = 1;
      if (it.land) a = it.kind === 'sugar' ? 1 - it.life / it.float : clamp(1 - (it.life - it.float * .5) / (it.float * .5), 0, 1);
      ctx.globalAlpha = a;
      switch (it.kind) {
        case 'leaf': { const c = m.teaColor; ctx.fillStyle = rgbStr(lerpC(c, [40, 20, 8], .4)); ctx.strokeStyle = rgbStr(lerpC(c, [0, 0, 0], .6)); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.bezierCurveTo(-3, -6, 4, -6, 8, 0); ctx.bezierCurveTo(4, 5, -3, 5, -7, 0); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(7, 0); ctx.stroke(); break; }
        case 'sugar': ctx.fillStyle = '#fffdf6'; ctx.fillRect(-1.6 * it.sz, -1.6 * it.sz, 3.2 * it.sz, 3.2 * it.sz); break;
        case 'jag': ctx.fillStyle = '#8f5218'; ctx.strokeStyle = '#4e2a0c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-3, -6); ctx.lineTo(5, -5); ctx.lineTo(7, 3); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
        case 'adrak': ctx.fillStyle = '#e4c58a'; ctx.strokeStyle = '#a07a42'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5.5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, 7); ctx.stroke(); break;
        case 'elaichi': ctx.fillStyle = '#8fb05a'; ctx.strokeStyle = '#58773a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 8, 4.5, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(7, 0); ctx.stroke(); break;
        case 'kesar': ctx.strokeStyle = '#d3281a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-7, 2); ctx.quadraticCurveTo(0, -5, 7, 1); ctx.stroke(); ctx.strokeStyle = '#f5a021'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(8, 1); ctx.stroke(); break;
        case 'dalchini': ctx.fillStyle = '#b2713a'; ctx.strokeStyle = '#6c3d18'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-11, -3, 22, 6, 3) : ctx.rect(-11, -3, 22, 6); ctx.fill(); ctx.stroke(); break;
        case 'laung': ctx.fillStyle = '#5a3418'; ctx.beginPath(); ctx.moveTo(-6, -1); ctx.lineTo(4, -2); ctx.lineTo(4, 2); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.arc(6, 0, 3, 0, 7); ctx.fill(); break;
        case 'pepper': ctx.fillStyle = '#1a1412'; ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(-1, -1, 1, 0, 7); ctx.fill(); break;
        default: break;
      }
      ctx.restore();
    }

    function drawJug(pos, o, flip, kind) {
      if (o.vis < 0.02) return;
      ctx.save(); ctx.globalAlpha = o.vis;
      ctx.translate(pos.x, pos.y - (1 - o.vis) * 70);
      if (flip) ctx.scale(-1, 1);
      ctx.rotate(o.rot);
      const steel = kind === 'water';
      const g = ctx.createLinearGradient(-90, 0, 0, 0);
      if (steel) { g.addColorStop(0, '#6b6e72'); g.addColorStop(.35, '#eceef0'); g.addColorStop(.7, '#9a9da1'); g.addColorStop(1, '#585b5f'); }
      else { g.addColorStop(0, '#d9cdb8'); g.addColorStop(.4, '#fffaf0'); g.addColorStop(1, '#bfb298'); }
      ctx.strokeStyle = steel ? '#8c8f93' : '#c9bda4'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-84, 20); ctx.bezierCurveTo(-118, 16, -118, 74, -82, 78); ctx.stroke();
      ctx.fillStyle = g; ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, 5); ctx.lineTo(-82, 92); ctx.quadraticCurveTo(-80, 102, -70, 102); ctx.lineTo(-22, 102); ctx.quadraticCurveTo(-12, 102, -10, 92); ctx.lineTo(-6, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = steel ? 'rgba(60,60,60,.25)' : 'rgba(150,120,70,.22)'; ctx.fillRect(-86, 40, 78, 7);
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-72, 12, 6, 80);
      ctx.restore();
    }

    function drawStream(x0, y0, x1, y1, w, col, hl) {
      if (w < 0.4) return;
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + (x1 - x0) * .15 + 6, y0 + (y1 - y0) * .35, x1, y1); ctx.stroke();
      ctx.strokeStyle = hl; ctx.lineWidth = Math.max(1, w * .3); ctx.setLineDash([10, 14]); ctx.lineDashOffset = -m.t * 160;
      ctx.beginPath(); ctx.moveTo(x0 - w * .15, y0); ctx.quadraticCurveTo(x0 + (x1 - x0) * .15 + 4, y0 + (y1 - y0) * .35, x1 - w * .15, y1); ctx.stroke();
      ctx.restore();
    }

    function drawCup() {
      const { x, base: b, h, rx } = CUP;
      ctx.save(); ctx.translate(x, b);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, 4, 58, 8, 0, 0, 7); ctx.fill();
      const g = ctx.createLinearGradient(-rx, 0, rx, 0); g.addColorStop(0, '#6a331a'); g.addColorStop(.35, '#c77344'); g.addColorStop(.7, '#9a4f27'); g.addColorStop(1, '#5a2b15');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-rx, -h); ctx.bezierCurveTo(-58, -h * .62, -44, -20, -36, 0); ctx.lineTo(36, 0); ctx.bezierCurveTo(44, -20, 58, -h * .62, rx, -h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,25,10,.35)'; ctx.lineWidth = 1.5; [-82, -58, -34, -12].forEach(y => { ctx.beginPath(); ctx.moveTo(-rx + 4 + (y + h) * -.02, y); ctx.lineTo(rx - 4 - (y + h) * -.02, y); ctx.stroke(); });
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-44, -h + 14); ctx.quadraticCurveTo(-40, -50, -30, -12); ctx.stroke();
      ctx.fillStyle = '#4a2210'; ctx.beginPath(); ctx.ellipse(0, -h, rx, 12, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#1b0d06'; ctx.beginPath(); ctx.ellipse(0, -h, rx - 5, 9.5, 0, 0, 7); ctx.fill();
      if (m.cup > 0.01) {
        const lv = 1 - m.cup;
        ctx.save(); ctx.beginPath(); ctx.ellipse(0, -h, rx - 5, 9.5, 0, 0, 7); ctx.clip();
        ctx.fillStyle = rgbStr(m.color); ctx.beginPath(); ctx.ellipse(0, -h + lv * 7 + .5, rx - 7 - lv * 8, 9 - lv * 3.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.beginPath(); ctx.ellipse(-12, -h + lv * 7 - 2, 18, 2.4, 0, 0, 7); ctx.fill();
        ctx.restore();
        /* fill gauge on the clay: a glowing band showing how full the kulhad is */
        ctx.strokeStyle = rgbStr(lerpC(m.color, [255, 255, 255], .3), .6); ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(rx - 4, -h + 14); ctx.lineTo(rx - 4, -h + 14 + (h - 26) * m.cup); ctx.stroke();
      }
      ctx.restore();
    }

    function drawSurfaceFx() {
      const sy = POT.y - POT.h;
      const px = POT.x + m.dx, py = POT.y + m.dy - POT.h;
      /* ripples + bubbles live on the pot's opening ellipse (only while the pot sits level) */
      if (m.tilt < 0.05) {
        ctx.save(); ctx.beginPath(); ctx.ellipse(px, py, POT.rx - 7, 10.5, 0, 0, 7); ctx.clip();
        for (const r of m.ripples) { if (r.flat) continue; ctx.strokeStyle = `rgba(255,245,225,${r.a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(r.x, r.y - (surfY() - sy) + 0, r.r * 1.6, r.r * .5, 0, 0, 7); ctx.stroke(); }
        for (const b of m.bubbles) { const k = b.age / b.life, rr = lerp(1, b.max, Math.min(1, k * 1.4)); ctx.strokeStyle = `rgba(255,245,225,${k > .85 ? (1 - k) * 6 : .8})`; ctx.fillStyle = 'rgba(255,245,225,.18)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(b.x, b.y - (surfY() - sy), rr, 0, 7); ctx.fill(); ctx.stroke(); }
        ctx.restore();
      }
      for (const it of m.items) drawItem(it);
      /* cup ripples */
      for (const r of m.ripples) { if (!r.flat) continue; ctx.strokeStyle = `rgba(255,245,225,${r.a})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * 1.4, r.r * .45, 0, 0, 7); ctx.stroke(); }
    }

    function render() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(bg, 0, 0);
      drawCup();
      drawPot();
      drawSurfaceFx();
      drawFlames();
      /* jugs and their streams */
      const sy = surfY();
      if (m.sw > .05) drawStream(JUG_W.x + 3, JUG_W.y + 6, JUG_W.x + 3, sy, 7 * m.sw, 'rgba(200,232,246,.9)', 'rgba(255,255,255,.8)');
      if (m.sm > .05) drawStream(JUG_M.x - 3, JUG_M.y + 6, JUG_M.x - 3, sy, 8 * m.sm, 'rgba(248,240,224,.97)', 'rgba(255,255,255,.9)');
      drawJug(JUG_W, m.jw, false, 'water');
      drawJug(JUG_M, m.jm, true, 'milk');
      if (m.sp > .05) {
        const w = (4 + 6 * Math.sqrt(Math.max(0.05, m.level))) * m.sp;
        const lx = lipX() + 3, ly = POT.y + m.dy - POT.h + 4;
        const ty = CUP.base - CUP.h + (1 - m.cup) * 20 + 2;
        drawStream(lx, ly, lx + 8, ty, w, rgbStr(m.color, .95), rgbStr(lerpC(m.color, [255, 255, 255], .45), .85));
      }
      /* droplets */
      for (const d of m.drops) { const k = d.age / d.life; ctx.globalAlpha = 1 - k; ctx.fillStyle = rgbStr(d.c); ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r * .8, d.r * (1 + Math.min(Math.abs(d.vy) / 400, 1)), 0, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      /* steam */
      for (const p of m.steamP) {
        const k = p.age / p.life, a = Math.sin(Math.PI * k) * p.a;
        if (a <= .004) continue;
        ctx.globalAlpha = a; ctx.drawImage(spS, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      }
      ctx.globalAlpha = 1;
      /* ingredient labels */
      ctx.font = '700 15px Manrope, sans-serif'; ctx.textAlign = 'center';
      for (const l of m.labels) { const k = l.age / 1.8; ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, k)); ctx.fillStyle = '#ffe3a4'; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.strokeText(l.text, l.x, l.y); ctx.fillText(l.text, l.x, l.y); }
      ctx.globalAlpha = 1;
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = now; return; }
      let dt = Math.min(0.05, (now - last) / 1000); last = now;
      const sp = m.boost || m.speed;
      /* run several sub-steps when sped up so particles stay stable */
      const steps = Math.max(1, Math.ceil(sp / 2.5)), sdt = dt * sp / steps;
      for (let i = 0; i < steps; i++) {
        m.t += sdt;
        if (m.stage >= 0 && m.stage < 6) { m.st += sdt; stageTick(sdt); } else idleTick(sdt);
        updateParticles(sdt);
      }
      if (m.stage >= 0 && m.stage < 6 && hooks.onProgress) {
        const total = m.dur.reduce((a, b) => a + b, 0), doneT = m.dur.slice(0, m.stage).reduce((a, b) => a + b, 0) + m.st;
        hooks.onProgress(clamp(doneT / total, 0, 1));
      }
      render();
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { threshold: 0 }).observe(canvas);

    return {
      start(conf) {
        cfg = JSON.parse(JSON.stringify(conf));
        m = fresh(); buildPlan(); m.level = 0; m.color = [160, 205, 220];
        enterStage(0);
      },
      reset() { m = fresh(); },
      setSpeed(v) { m.speed = v; },
      skip() { m.boost = 14; },
      get speed() { return m.speed; },
      get finalColor() { return m.finalColor; },
      get running() { return m.stage >= 0 && m.stage < 6; },
      run() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } },
      resize,
      endBoost() { m.boost = 0; }
    };
  }

  /* ---------------------------------------------------------- WIRING ---------------------------------------------------------- */
  function initStudio() {
    const canvas = $('#studioCanvas');
    if (!canvas || !canvas.getContext) return;
    buildPanel();
    syncUI();

    const wrap = $('#stageWrap'), idle = $('#stageIdle'), cap = $('#stageCaption'), ctrl = $('#stageCtrl'), prog = $('#stageProg');
    const pills = $$('#stagePills li'), startBtn = $('#startBtn'), result = $('#result'), panel = $('#studioPanel');
    let t0 = 0, speeds = [1, 2, 3], si = 0;

    const eng = createEngine(canvas, {
      onStage(i, name, text) {
        pills.forEach((p, k) => { p.classList.toggle('is-on', k === i); p.classList.toggle('is-done', k < i); });
        cap.innerHTML = `<b>Stage ${i + 1} · ${name}</b><span>${text}</span>`;
        cap.classList.add('is-on');
      },
      caption(t) { cap.querySelector('span').textContent = t; },
      onProgress(p) { prog.style.transform = `scaleX(${p})`; },
      onDone() { finish(); }
    });
    studioApi = eng;
    eng.run();

    function lock(on) { panel.classList.toggle('is-locked', on); $('#basket').classList.toggle('is-locked', on); }

    function resetView() {
      eng.reset(); eng.endBoost();
      idle.hidden = false; cap.classList.remove('is-on'); ctrl.hidden = true; result.hidden = true;
      pills.forEach(p => p.classList.remove('is-on', 'is-done'));
      prog.style.transform = 'scaleX(0)';
      startBtn.disabled = false; startBtn.querySelector('span').textContent = 'START MAKING MY CHAI';
      lock(false);
    }

    function start() {
      if (eng.running) return;
      resetView();
      idle.hidden = true; ctrl.hidden = false; lock(true);
      si = 0; $('#speedBtn').textContent = '1×';
      startBtn.disabled = true; startBtn.querySelector('span').textContent = 'MAKING YOUR CHAI…';
      eng.start(sel); t0 = performance.now();
      if (window.innerWidth < 980) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function finish() {
      eng.endBoost();
      pills.forEach(p => { p.classList.remove('is-on'); p.classList.add('is-done'); });
      prog.style.transform = 'scaleX(1)';
      cap.classList.remove('is-on'); ctrl.hidden = true;
      lock(false);
      startBtn.disabled = false; startBtn.querySelector('span').textContent = 'MAKE ANOTHER CHAI';
      const fc = eng.finalColor, unit = unitPrice();
      const spList = Object.keys(sel.spice).map(k => `${ingFind('spice', k).name} (${['', 'light', 'medium', 'strong'][sel.spice[k]]})`);
      const art = { k: 'custom', a: hexOf(lerpC(fc, [255, 255, 255], .2)), b: hexOf(lerpC(fc, [0, 0, 0], .45)), glow: hexOf(lerpC(fc, [0, 0, 0], .25)) };
      const secs = prepSeconds();
      result.innerHTML = `
        <div class="result__in">
          <div class="result__art">${artSVG(art)}</div>
          <div class="result__txt">
            <p class="eyebrow eyebrow--light">Ready to drink</p>
            <h3>YOUR PERFECT CHAI IS READY!</h3>
            <dl class="result__list">
              <div><dt>Chai type</dt><dd>${chaiType()}</dd></div>
              <div><dt>Tea</dt><dd>${ingFind('tea', sel.tea).name}</dd></div>
              <div><dt>Sweetness</dt><dd>${ingFind('sweet', sel.sweet).name}</dd></div>
              <div><dt>Milk</dt><dd>${ingFind('milk', sel.milk).name}</dd></div>
              <div><dt>Spices</dt><dd>${spList.length ? spList.join(', ') : 'None — pure chai'}</dd></div>
              <div><dt>Cups</dt><dd>${sel.cups}</dd></div>
              <div><dt>Preparation time</dt><dd>${fmtPrep(secs)}</dd></div>
            </dl>
            <div class="result__act"><strong>${rupee(unit * sel.cups)}</strong>
              <button class="btn btn--primary" type="button" id="resAdd"><span>Add to Cart</span></button>
              <button class="btn btn--ghost" type="button" id="resAgain"><span>Make another</span></button></div>
          </div>
        </div>`;
      result.hidden = false;
      $('#resAdd').addEventListener('click', e => {
        const sig = [sel.tea, sel.sweet, sel.milk, Object.keys(sel.spice).sort().map(k => k + sel.spice[k]).join('')].join('-');
        cartApi && cartApi.add({ id: 'custom:' + sig, name: `Custom ${chaiType()}`, price: unit, artSpec: art, meta: `${ingFind('tea', sel.tea).name} · ${ingFind('sweet', sel.sweet).name} · ${ingFind('milk', sel.milk).name}`, qty: sel.cups }, e.currentTarget);
      });
      $('#resAgain').addEventListener('click', () => { resetView(); });
      setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
    }

    /* selection events */
    $('#studioPanel').addEventListener('click', e => {
      const b = e.target.closest('.opt'); if (!b) return;
      const g = b.dataset.group, k = b.dataset.k;
      if (eng.running) return;
      if (!result.hidden) resetView();
      if (g === 'special') {
        const o = ingFind('special', k);
        sel.tea = o.set.tea; sel.sweet = o.set.sweet; sel.milk = o.set.milk; sel.spice = Object.assign({}, o.set.spice); sel.special = k;
      } else if (g === 'spice') {
        if (sel.spice[k]) delete sel.spice[k]; else sel.spice[k] = 1;
        sel.special = null;
      } else { sel[g] = k; sel.special = null; }
      if (g === 'special') $$('.opt[data-group="special"]').forEach(x => x.classList.toggle('is-on', x.dataset.k === k));
      syncUI();
      if (g === 'special') $$('.opt[data-group="special"]').forEach(x => { const on = x.dataset.k === k; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    });
    $('#basket').addEventListener('click', e => {
      if (eng.running) return;
      const cb = e.target.closest('[data-cups]');
      if (cb) { sel.cups = clamp(sel.cups + parseInt(cb.dataset.cups, 10), 1, 6); if (!result.hidden) resetView(); renderBasket(); return; }
      const ab = e.target.closest('[data-act]'); if (!ab) return;
      const k = ab.closest('.bchip').dataset.k;
      if (ab.dataset.act === 'inc') sel.spice[k] = Math.min(3, (sel.spice[k] || 1) + 1);
      if (ab.dataset.act === 'dec') sel.spice[k] = Math.max(1, (sel.spice[k] || 1) - 1);
      if (ab.dataset.act === 'rm') delete sel.spice[k];
      sel.special = null; if (!result.hidden) resetView(); syncUI();
    });

    startBtn.addEventListener('click', start);
    $('#speedBtn').addEventListener('click', e => { si = (si + 1) % speeds.length; eng.setSpeed(speeds[si]); e.currentTarget.textContent = speeds[si] + '×'; });
    $('#skipBtn').addEventListener('click', () => eng.skip());

    /* subtle 3D tilt of the whole stage on pointer move */
    const sc = $('#stageCanvas');
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
      sc.addEventListener('pointermove', e => {
        const r = sc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        sc.style.transform = `perspective(1100px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg)`;
      });
      sc.addEventListener('pointerleave', () => { sc.style.transform = ''; });
    }
    syncUI();
  }


  /* ==========================================================
     MENU, SNACKS, COMBOS, CART, CHECKOUT, QUICK VIEW, ABOUT
     ========================================================== */
  /* ---------- backend (server/server.js). If the server is not reachable the site still works in demo mode. ---------- */
  const API = location.protocol === 'file:' ? 'http://localhost:3000' : '';
  async function postJSON(path, data) {
    let res;
    try { res = await fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); }
    catch (e) { return { offline: true }; }
    let j = {}; try { j = await res.json(); } catch (e) { /* not json */ }
    if (res.status === 404 || res.status === 405) return { offline: true };   // plain static hosting, no backend
    return res.ok ? { ok: true, data: j } : { error: j.error || 'Something went wrong. Please try again.' };
  }

  const cart = {
    items: {},
    load() { try { const v = JSON.parse(localStorage.getItem('chaiFactoryCart')); this.items = v && typeof v === 'object' ? v : {}; } catch (e) { this.items = {}; } },
    save() { try { localStorage.setItem('chaiFactoryCart', JSON.stringify(this.items)); } catch (e) { /* storage unavailable */ } },
    list() { return Object.values(this.items).filter(i => i.qty > 0); },
    count() { return this.list().reduce((a, i) => a + i.qty, 0); },
    subtotal() { return this.list().reduce((a, i) => a + i.price * i.qty, 0); }
  };
  const GST = 0.05, DELIVERY = 30, FREE_DELIVERY = 499;
  function totals() {
    const sub = cart.subtotal(), tax = Math.round(sub * GST), del = sub === 0 || sub >= FREE_DELIVERY ? 0 : DELIVERY;
    return { sub, tax, del, total: sub + tax + del };
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-show'), 2600);
  }

  function openDrawer(open) {
    const d = $('#drawer'), o = $('#overlay');
    d.classList.toggle('is-open', open); o.classList.toggle('is-open', open);
    d.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('drawer-open', open);
    if (lenis) open ? lenis.stop() : lenis.start();
  }

  function renderCart() {
    const body = $('#cartItems'), list = cart.list();
    $('#cartCount').textContent = cart.count();
    const t = totals();
    $('#cartSum').innerHTML = `<div><dt>Subtotal</dt><dd>${rupee(t.sub)}</dd></div><div><dt>GST (5%)</dt><dd>${rupee(t.tax)}</dd></div><div><dt>Delivery</dt><dd>${t.sub === 0 ? '—' : t.del ? rupee(t.del) : 'Free'}</dd></div><div class="sum__total"><dt>Total</dt><dd>${rupee(t.total)}</dd></div>`;
    $('#checkoutBtn').disabled = !list.length;
    if (!list.length) { body.innerHTML = '<p class="cart-empty">Your cart is empty.<br>Make a chai or pick something from the menu.</p>'; return; }
    body.innerHTML = list.map(i => `<div class="cart-item" data-id="${i.id}">
      <div class="cart-item__img">${artSVG(i.artSpec)}</div>
      <div><h4>${i.name}</h4><small>${i.meta ? i.meta + ' · ' : ''}${rupee(i.price)} each</small>
        <div class="qty"><button type="button" data-act="dec" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button type="button" data-act="inc" aria-label="Increase quantity">+</button><button type="button" class="qty__rm" data-act="rm" aria-label="Remove ${i.name}">Remove</button></div></div>
      <div class="cart-item__sum">${rupee(i.price * i.qty)}</div></div>`).join('');
  }

  function addToCart(item, fromEl) {
    const qty = item.qty || 1;
    const cur = cart.items[item.id];
    if (cur) cur.qty += qty; else cart.items[item.id] = { id: item.id, name: item.name, price: item.price, qty, artSpec: item.artSpec, meta: item.meta || '' };
    cart.save(); renderCart();
    if (hasGSAP) gsap.fromTo('#cartCount', { scale: 1.8 }, { scale: 1, duration: .6, ease: 'elastic.out(1,.5)' });
    toast(`${qty > 1 ? qty + ' × ' : ''}${item.name} added to cart`);
    if (hasGSAP && fromEl && !reduceMotion) {
      const from = fromEl.getBoundingClientRect(), to = $('#cartBtn').getBoundingClientRect();
      const dot = document.createElement('div'); dot.className = 'fly'; document.body.appendChild(dot);
      gsap.fromTo(dot, { x: from.left + from.width / 2 - 9, y: from.top + from.height / 2 - 9, scale: 1 }, { x: to.left + to.width / 2 - 9, y: to.top + to.height / 2 - 9, scale: .4, duration: .8, ease: 'power3.inOut', onComplete: () => dot.remove() });
    }
  }

  /* ---------- modals (focus-friendly, Esc to close) ---------- */
  let lastFocus = null;
  function openModal(el) {
    lastFocus = document.activeElement; el.hidden = false; document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
    requestAnimationFrame(() => { el.classList.add('is-open'); const f = $('button, input, textarea', el.querySelector('.modal__box')); f && f.focus({ preventScroll: true }); });
  }
  function closeModal(el) {
    el.classList.remove('is-open'); document.body.classList.remove('modal-open');
    if (lenis && !document.body.classList.contains('menu-open') && !document.body.classList.contains('drawer-open')) lenis.start();
    setTimeout(() => { el.hidden = true; }, 300);
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }

  function quickView(spec) {
    const body = $('#qvBody');
    let item, art, notes, id, price, full = null;
    if (spec.k === 'chai') { item = chaiById(spec.id); id = 'chai:' + item.id; price = item.price; notes = item.notes; art = { k: 'chai', id: item.id }; }
    else if (spec.k === 'snack') { item = snackById(spec.id); id = 'snack:' + item.id; price = item.price; notes = [item.cat]; art = { k: 'snack', id: item.id }; }
    else { const c = COMBOS.find(x => x.id === spec.id); item = { name: `${chaiById(c.chai).name} + ${snackById(c.snack).name}`, desc: `A classic pairing — ${c.off}% off when you order them together.`, photo: '' }; id = 'combo:' + c.id; price = comboPrice(c); full = comboFull(c); notes = [chaiById(c.chai).name, snackById(c.snack).name, `${c.off}% off`]; art = { k: 'combo', id: c.id }; }
    let q = 1;
    body.innerHTML = `
      <div class="qv__media">${item.photo ? photoImg(item, art) : artSVG(art)}</div>
      <div class="qv__info">
        <p class="eyebrow">Quick view</p>
        <h3 id="qvTitle">${item.name}</h3>
        <p>${item.desc}</p>
        <ul class="tags">${notes.map(n => `<li>${n}</li>`).join('')}</ul>
        <div class="qv__price">${full ? `<s>${rupee(full)}</s>` : ''}<strong id="qvPrice">${rupee(price)}</strong></div>
        <div class="qv__act"><div class="qty qty--lg"><button type="button" data-q="-1" aria-label="Decrease quantity">−</button><span id="qvQ">1</span><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>
        <button class="btn btn--primary" type="button" id="qvAdd"><span>Add to Cart</span></button></div>
      </div>`;
    body.onclick = e => {
      const b = e.target.closest('[data-q]');
      if (b) { q = clamp(q + parseInt(b.dataset.q, 10), 1, 20); $('#qvQ').textContent = q; $('#qvPrice').textContent = rupee(price * q); }
    };
    $('#qvAdd').onclick = e => { addToCart({ id, name: item.name, price, qty: q, artSpec: art }, e.currentTarget); closeModal($('#quickView')); };
    openModal($('#quickView'));
  }

  /* ---------- checkout ---------- */
  function openCheckout() {
    const list = cart.list(); if (!list.length) { toast('Your cart is empty — add something first!'); return; }
    openDrawer(false);
    const t = totals(), body = $('#coBody');
    body.innerHTML = `
      <h3 id="coTitle">Checkout</h3>
      <div class="co__grid">
        <form id="coForm" novalidate class="co__form">
          <div class="field"><input id="coName" name="name" type="text" placeholder=" " autocomplete="name" required><label for="coName">Full name</label><small class="err"></small></div>
          <div class="field"><input id="coPhone" name="phone" type="tel" placeholder=" " autocomplete="tel" required><label for="coPhone">Phone</label><small class="err"></small></div>
          <div class="field"><textarea id="coAddr" name="address" rows="3" placeholder=" " autocomplete="street-address" required></textarea><label for="coAddr">Delivery address</label><small class="err"></small></div>
          <fieldset class="pay"><legend>Payment</legend>
            <label><input type="radio" name="pay" value="cod" checked><span>Cash on delivery</span></label>
            <label><input type="radio" name="pay" value="upi"><span>UPI on delivery</span></label>
            <label><input type="radio" name="pay" value="card"><span>Card on delivery</span></label>
          </fieldset>
          <button class="btn btn--primary btn--large btn--block" type="submit"><span>Place order · ${rupee(t.total)}</span></button>
        </form>
        <aside class="co__sum"><h4>Order summary</h4>
          <ul>${list.map(i => `<li><span>${i.qty} × ${i.name}</span><b>${rupee(i.price * i.qty)}</b></li>`).join('')}</ul>
          <dl class="sum"><div><dt>Subtotal</dt><dd>${rupee(t.sub)}</dd></div><div><dt>GST (5%)</dt><dd>${rupee(t.tax)}</dd></div><div><dt>Delivery</dt><dd>${t.del ? rupee(t.del) : 'Free'}</dd></div><div class="sum__total"><dt>Total</dt><dd>${rupee(t.total)}</dd></div></dl>
          ${t.del ? `<p class="co__note">Add ${rupee(FREE_DELIVERY - t.sub)} more for free delivery.</p>` : ''}
        </aside>
      </div>`;
    const form = $('#coForm');
    const rules = {
      name: v => v.trim().length >= 2 ? '' : 'Please enter your name.',
      phone: v => v.replace(/\D/g, '').length >= 10 ? '' : 'Please enter a valid phone number.',
      address: v => v.trim().length >= 10 ? '' : 'Please enter your full address.'
    };
    const check = inp => { const msg = rules[inp.name](inp.value), f = inp.closest('.field'); f.classList.toggle('has-error', !!msg); $('.err', f).textContent = msg; return !msg; };
    $$('input[type=text],input[type=tel],textarea', form).forEach(i => { i.addEventListener('blur', () => check(i)); i.addEventListener('input', () => { if (i.closest('.field').classList.contains('has-error')) check(i); }); });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!$$('input[type=text],input[type=tel],textarea', form).map(check).every(Boolean)) return;
      const btn = $('button[type=submit]', form), label = $('span', btn), keep = label.textContent;
      if (btn.disabled) return;
      btn.disabled = true; label.textContent = 'Placing order…';
      const r = await postJSON('/api/orders', {
        name: $('#coName').value, phone: $('#coPhone').value, address: $('#coAddr').value, pay: ($('input[name=pay]:checked', form) || {}).value || 'cod',
        items: cart.list().map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, meta: i.meta }))
      });
      if (r.error) { btn.disabled = false; label.textContent = keep; toast(r.error); return; }
      const demo = !!r.offline;
      const id = demo ? 'CF' + Date.now().toString().slice(-6) : r.data.id;
      const eta = demo ? 25 + Math.min(20, cart.count() * 2) : r.data.eta;
      cart.items = {}; cart.save(); renderCart();
      body.innerHTML = `<div class="co__ok"><svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#86a257" stroke-width="4"/><path d="M19 33l9 9 17-19" fill="none" stroke="#86a257" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <h3 id="coTitle">Order placed!</h3><p>Thank you — your chai is being brewed. Order <b>${id}</b> will reach you in about <b>${eta} minutes</b>.</p>${demo ? '<p class="co__note">Demo mode: the order server is not running, so this order was not saved.</p>' : ''}<button class="btn btn--primary" type="button" data-close><span>Back to the café</span></button></div>`;
    });
    openModal($('#checkout'));
  }

  /* ---------- menu rendering ---------- */
  function chaiCard(c) {
    return `<article class="card" data-id="${c.id}" style="--glow:${c.glow}">
      <div class="card__media"><span class="card__tag">${c.tag}</span>${mediaHTML(c, { k: 'chai', id: c.id })}
        <button class="qv-btn" type="button" data-qv="${c.id}" aria-label="Quick view ${c.name}"><span>Quick view</span></button></div>
      <div class="card__body"><h3>${c.name}</h3><p>${c.desc}</p>
        <div class="card__foot"><span class="price">${rupee(c.price)}<small>/ cup</small></span>
        <button class="btn btn--primary btn--small" type="button" data-add="${c.id}"><span>Add to Cart</span></button></div></div></article>`;
  }
  function snackCard(s) {
    return `<article class="card card--snack" data-cat="${s.cat}" style="--glow:${s.c2}">
      <div class="card__media"><span class="card__tag">${s.cat}</span>${mediaHTML(s, { k: 'snack', id: s.id })}</div>
      <div class="card__body"><h3>${s.name}</h3><p>${s.desc}</p>
        <div class="card__foot"><span class="price">${rupee(s.price)}</span>
        <div class="qty qty--sm" data-sq="${s.id}"><button type="button" data-q="-1" aria-label="Decrease ${s.name} quantity">−</button><span>1</span><button type="button" data-q="1" aria-label="Increase ${s.name} quantity">+</button></div></div>
        <button class="btn btn--primary btn--block btn--small" type="button" data-add-snack="${s.id}"><span>Add to Cart</span></button></div></article>`;
  }
  function comboCard(c) {
    const ch = chaiById(c.chai), sn = snackById(c.snack);
    return `<article class="ccard" data-combo="${c.id}">
      <span class="ccard__off">SAVE ${c.off}%</span>
      <div class="ccard__art">${artSVG({ k: 'combo', id: c.id })}</div>
      <h3>${ch.name} <i>+</i> ${sn.name}</h3>
      <p class="ccard__price"><s>${rupee(comboFull(c))}</s><strong>${rupee(comboPrice(c))}</strong></p>
      <div class="ccard__act"><button class="btn btn--cream btn--small" type="button" data-add-combo="${c.id}"><span>Add combo</span></button><button class="link-btn" type="button" data-qv-combo="${c.id}">Quick view</button></div></article>`;
  }

  function initShop() {
    cart.load(); renderCart();
    cartApi = { add: addToCart };

    const chaiGrid = $('#chaiGrid'), snackGrid = $('#snackGrid'), comboGrid = $('#comboGrid');
    chaiGrid.innerHTML = CHAI.map(chaiCard).join('');
    snackGrid.innerHTML = SNACKS.map(snackCard).join('');
    comboGrid.innerHTML = COMBOS.map(comboCard).join('');

    chaiGrid.addEventListener('click', e => {
      const a = e.target.closest('[data-add]');
      if (a) { const c = chaiById(a.dataset.add); addToCart({ id: 'chai:' + c.id, name: c.name, price: c.price, artSpec: { k: 'chai', id: c.id } }, a); return; }
      const q = e.target.closest('[data-qv]'); if (q) quickView({ k: 'chai', id: q.dataset.qv });
    });
    snackGrid.addEventListener('click', e => {
      const qb = e.target.closest('.qty [data-q]');
      if (qb) { const span = $('span', qb.parentElement); span.textContent = clamp(parseInt(span.textContent, 10) + parseInt(qb.dataset.q, 10), 1, 20); return; }
      const a = e.target.closest('[data-add-snack]');
      if (a) {
        const s = snackById(a.dataset.addSnack), qty = parseInt($(`[data-sq="${s.id}"] span`).textContent, 10) || 1;
        addToCart({ id: 'snack:' + s.id, name: s.name, price: s.price, qty, artSpec: { k: 'snack', id: s.id } }, a);
        $(`[data-sq="${s.id}"] span`).textContent = '1';
      }
    });
    comboGrid.addEventListener('click', e => {
      const a = e.target.closest('[data-add-combo]');
      if (a) { const c = COMBOS.find(x => x.id === a.dataset.addCombo); addToCart({ id: 'combo:' + c.id, name: `${chaiById(c.chai).name} + ${snackById(c.snack).name}`, price: comboPrice(c), meta: `${c.off}% off`, artSpec: { k: 'combo', id: c.id } }, a); return; }
      const q = e.target.closest('[data-qv-combo]'); if (q) quickView({ k: 'combo', id: q.dataset.qvCombo });
    });

    /* snack filters */
    $('#snackFilters').addEventListener('click', e => {
      const b = e.target.closest('.filter'); if (!b) return;
      $$('.filter').forEach(f => f.classList.toggle('is-active', f === b));
      const cat = b.dataset.cat, cards = $$('.card', snackGrid);
      cards.forEach(c => { const show = cat === 'All' || c.dataset.cat === cat; c.hidden = !show; });
      if (hasGSAP && !reduceMotion) gsap.fromTo(cards.filter(c => !c.hidden), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: 'power3.out', clearProps: 'transform,opacity' });
    });

    /* 3D tilt */
    if (window.matchMedia('(hover: hover)').matches && !reduceMotion) {
      $$('.card, .ccard').forEach(card => {
        card.addEventListener('pointermove', e => {
          const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          card.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); card.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
        });
        card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
      });
    }
    revealOnScroll($$('#chaiGrid .card, #snackGrid .card, #comboGrid .ccard'), true);

    /* cart UI */
    $('#cartBtn').addEventListener('click', () => openDrawer(true));
    $('#drawerClose').addEventListener('click', () => openDrawer(false));
    $('#overlay').addEventListener('click', () => openDrawer(false));
    $('#cartItems').addEventListener('click', e => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const id = b.closest('.cart-item').dataset.id, it = cart.items[id]; if (!it) return;
      if (b.dataset.act === 'rm') delete cart.items[id];
      else { it.qty += b.dataset.act === 'inc' ? 1 : -1; if (it.qty <= 0) delete cart.items[id]; }
      cart.save(); renderCart();
    });
    $('#checkoutBtn').addEventListener('click', openCheckout);
    $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); }));
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const open = $$('.modal').find(m => !m.hidden);
      if (open) closeModal(open); else { openDrawer(false); if (document.body.classList.contains('menu-open')) $('#burger').click(); }
    });
  }

  /* ---------- ABOUT: floating ingredients + counters + parallax ---------- */
  function initAbout() {
    const floats = [['tea', 'patti'], ['spice', 'elaichi'], ['spice', 'adrak'], ['spice', 'kesar'], ['spice', 'dalchini'], ['sweet', 'jaggery'], ['spice', 'laung'], ['tea', 'darjeeling']];
    [['#studioFloat', 0], ['#aboutFloat', 3]].forEach(([sel2, off]) => {
      const host = $(sel2); if (!host) return;
      host.innerHTML = floats.slice(off % floats.length).concat(floats.slice(0, off % floats.length)).slice(0, 6).map(([g, k], i) => `<span class="fl" style="left:${(i * 17 + 4) % 92}%;top:${(i * 29 + 8) % 80}%;--d:${(6 + i * 1.3).toFixed(1)}s;--s:${(0.8 + (i % 3) * 0.25).toFixed(2)}">${ingIcon(g, k)}</span>`).join('');
    });
    if (!hasST || reduceMotion) { $$('[data-count]').forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); }); return; }
    $$('[data-parallax]').forEach(el => gsap.to(el, { y: parseFloat(el.dataset.parallax), ease: 'none', scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: .6 } }));
    $$('.fl').forEach((el, i) => gsap.to(el, { y: i % 2 ? -80 : 80, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 } }));
    $$('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '', o = { v: 0 };
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate() { el.textContent = Math.round(o.v) + suffix; } });
    });
  }

  /* ---------- 8. REVIEWS SLIDER ---------- */
  function initReviews() {
    const track = $('#revTrack'), viewport = $('#revViewport'), dotsEl = $('#revDots');
    if (!track) return;
    track.innerHTML = REVIEWS.map(r => `
      <div class="review"><div class="review__card">
        <div class="stars" aria-label="${r.r} out of 5 stars">${'★'.repeat(r.r)}<span class="off">${'★'.repeat(5 - r.r)}</span></div>
        <p>${r.t}</p>
        <div class="review__who"><div class="review__av">${r.n.charAt(0)}</div><div><strong>${r.n}</strong><span>${r.c}</span></div></div>
      </div></div>`).join('');
    const slides = $$('.review', track);
    let idx = 0, per = 1, max = 0, timer = null;

    const buildDots = () => {
      dotsEl.innerHTML = '';
      for (let i = 0; i <= max; i++) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (i + 1));
        b.addEventListener('click', () => { go(i); restart(); });
        dotsEl.appendChild(b);
      }
    };
    const update = () => {
      track.style.transform = `translate3d(${-idx * 100 / per}%,0,0)`;
      $$('button', dotsEl).forEach((b, i) => b.classList.toggle('is-active', i === idx));
    };
    const go = i => { idx = i > max ? 0 : i < 0 ? max : i; update(); };
    const calc = () => {
      const w = window.innerWidth;
      per = w >= 1024 ? 3 : w >= 700 ? 2 : 1;
      max = Math.max(0, slides.length - per);
      idx = Math.min(idx, max);
      slides.forEach(s => { s.style.flexBasis = (100 / per) + '%'; });
      buildDots();
      update();
    };
    const restart = () => { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => go(idx + 1), 5500); };

    $('#revPrev').addEventListener('click', () => { go(idx - 1); restart(); });
    $('#revNext').addEventListener('click', () => { go(idx + 1); restart(); });
    viewport.addEventListener('mouseenter', () => clearInterval(timer));
    viewport.addEventListener('mouseleave', restart);

    // swipe / drag
    let sx = null;
    viewport.addEventListener('pointerdown', e => { sx = e.clientX; });
    window.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    });
    window.addEventListener('resize', calc);
    calc();
    restart();
  }

  /* ---------- 9. CONTACT FORM ---------- */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    const rules = {
      name: v => v.trim().length >= 2 ? '' : 'Please enter your name.',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
      phone: v => (/^\+?[\d\s-]{10,16}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 10) ? '' : 'Please enter a valid phone number (10+ digits).',
      message: v => v.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).'
    };
    const check = input => {
      const msg = rules[input.name](input.value);
      const field = input.closest('.field');
      field.classList.toggle('has-error', !!msg);
      $('.err', field).textContent = msg;
      return !msg;
    };
    $$('input, textarea', form).forEach(i => {
      i.addEventListener('blur', () => check(i));
      i.addEventListener('input', () => { if (i.closest('.field').classList.contains('has-error')) check(i); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const ok = $$('input, textarea', form).map(check).every(Boolean);
      if (!ok) { toast('Please fix the highlighted fields.'); return; }
      const btn = $('#formBtn'), span = $('span', btn);
      btn.disabled = true;
      span.textContent = 'Sending…';
      const val = n => (form.elements[n] ? form.elements[n].value : '');
      postJSON('/api/contact', { name: val('name'), email: val('email'), phone: val('phone'), message: val('message') }).then(r => {
        btn.disabled = false; span.textContent = 'Submit';
        if (r.error) { toast(r.error); return; }
        form.reset();
        toast(r.offline ? 'Thanks! (Demo mode: the server is off, so the message was not saved.)' : 'Thank you! Your message is on its way ☕');
      });
    });
  }

  /* ---------- 10. REVEALS, MAGNETIC BUTTONS, INIT ---------- */
  /* Scroll-reveal that cannot leave content invisible: pure CSS transition + IntersectionObserver, with a timed failsafe. */
  function revealOnScroll(els, stagger) {
    els = els.filter(Boolean);
    els.forEach((el, i) => { el.classList.add('rv'); if (stagger) el.style.setProperty('--rd', ((i % 4) * 0.08).toFixed(2) + 's'); });
    const showAll = () => els.forEach(el => el.classList.add('is-in'));
    if (!('IntersectionObserver' in window)) { showAll(); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    els.forEach(el => io.observe(el));
    setTimeout(showAll, 9000);
  }

  function initReveals() {
    revealOnScroll($$('[data-reveal]'), false);
  }

  function initMagnetic() {
    if (!hasGSAP || reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    $$('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .28);
        yTo((e.clientY - (r.top + r.height / 2)) * .28);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- INIT ---------- */
  function init() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
    const safe = (fn, name) => { try { fn(); } catch (err) { console.error('[Chai Factory] ' + name + ' failed:', err); } };
    safe(initScroll, 'initScroll');
    safe(initNav, 'initNav');
    safe(initShop, 'initShop');
    safe(initStudio, 'initStudio');
    safe(initAbout, 'initAbout');
    safe(initReviews, 'initReviews');
    safe(initForm, 'initForm');
    safe(initHero, 'initHero');
    safe(initReveals, 'initReveals');
    safe(initMagnetic, 'initMagnetic');

    /* failsafe: never leave the visitor stuck on the loader */
    const unstick = () => {
      document.body.classList.remove('is-loading');
      const l = $('#loader'); if (l) l.remove();
    };
    setTimeout(unstick, 7000);
    try {
      runLoader(() => {
        document.dispatchEvent(new Event('chai:ready'));
        if (hasST) setTimeout(() => ScrollTrigger.refresh(), 300);
      });
    } catch (err) { console.error('[Chai Factory] loader failed:', err); unstick(); document.dispatchEvent(new Event('chai:ready')); }
    window.addEventListener('load', () => { if (hasST) ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

const featuredName = document.getElementById("featuredName");
const featuredImg = document.getElementById("featuredImg");
const featuredInfo = document.getElementById("featuredInfo");
const pokemonList = document.getElementById("pokemonList");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");
const typeList = document.getElementById("typeList");
const legendaryList = document.getElementById("legendaryList");

const modal = document.getElementById("pokemonModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

const categories = {
  trending: Array.from({ length: 151 }, (_, i) => i + 1), // Gen 1
  popular: Array.from({ length: 100 }, (_, i) => i + 152), // Gen 2
  top: Array.from({ length: 150 }, (_, i) => i + 252), // Gen 3
  mythical: [
    151, // Mew
    251, // Celebi
    385, // Jirachi
    386, // Deoxys
    489, 490, // Phione, Manaphy
    491, 492, 493, // Darkrai, Shaymin, Arceus
    494, // Victini
    647, 648, 649, // Keldeo, Meloetta, Genesect
    719, 720, // Diancie, Hoopa
    721, // Volcanion
    801, 802, 803, 804, 805, // Magearna, Marshadow...
    808, 809, // Meltan, Melmetal
    893, 894, 895, // Zarude, etc.
    896, 897, 898, 1001, 1002 // more Mythicals
  ]
};


let currentPokemons = [];

async function fetchPokemon(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  return await res.json();
}

function createCard(pokemon) {
  return `
    <div class="pokemon-card bg-gray-800 dark:bg-gray-800 rounded-lg p-3 text-center hover:scale-105 transition duration-300 opacity-0 animate-fade-in" data-name="${pokemon.name}">
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="mx-auto w-20 h-20" />
      <h3 class="mt-2 font-semibold capitalize pokemon-font text-[10px] text-yellow-500 dark:text-yellow-200">${pokemon.name}</h3>
      <p class="text-xs text-gray-600 dark:text-gray-400 font-sans">Height: ${pokemon.height} | Weight: ${pokemon.weight}</p>
    </div>
  `;
}

function renderSkeletons(container, count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton opacity-0 animate-fade-in";
    container.appendChild(skeleton);
  }
}

function renderCards(container, pokemonArray) {
  container.innerHTML = pokemonArray.map(createCard).join("");

  // Add modal listeners
  container.querySelectorAll(".pokemon-card").forEach(card => {
    const name = card.dataset.name;
    card.addEventListener("click", () => openPokemonModal(name));
  });
}

// ===============================
// Tab Animation + Category Cache
// ===============================

const tabHighlight = document.createElement("div");
tabHighlight.id = "tabHighlight";
tabHighlight.className = "absolute bottom-0 h-[2px] w-[33%] bg-indigo-500 transition-all duration-300";
document.querySelector(".mt-6.flex").appendChild(tabHighlight);

const cachedCategories = {}; // Store Pokémon results

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("text-black", "text-white", "border-b-2");
      t.classList.add("text-gray-400");
    });

    tab.classList.add("border-b-2", "border-indigo-500");
    tab.classList.remove("text-gray-400");

    if (document.documentElement.classList.contains("dark")) {
      tab.classList.add("text-white");
    } else {
      tab.classList.add("text-black");
    }

    
    loadCategory(tab.dataset.category);
  });
});

// 🧠 Updated loadCategory to use cache + Mythical colors
async function loadCategory(category) {
  pokemonList.classList.add("opacity-0");

  setTimeout(async () => {
    renderSkeletons(pokemonList);

    let pokemons;
    if (cachedCategories[category]) {
      pokemons = cachedCategories[category];
    } else {
      const ids = categories[category];
      pokemons = await Promise.all(ids.map(fetchPokemon));
      cachedCategories[category] = pokemons;
    }

    currentPokemons = pokemons;

    pokemonList.innerHTML = pokemons.map(pokemon => {
      const isMythical = categories.mythical.includes(pokemon.id);
      const cardBg = isMythical
        ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white'
        : 'bg-gray-800 dark:bg-gray-800 text-white';

      return `
        <div class="pokemon-card ${cardBg} rounded-lg p-3 text-center hover:scale-105 transition duration-300 opacity-0 animate-fade-in" data-name="${pokemon.name}">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="mx-auto w-20 h-20" />
          <h3 class="mt-2 font-semibold capitalize pokemon-font text-[10px]">${pokemon.name}</h3>
          <p class="text-xs font-sans">Height: ${pokemon.height} | Weight: ${pokemon.weight}</p>
        </div>
      `;
    }).join("");

    document.querySelectorAll(".pokemon-card").forEach(card => {
      const name = card.dataset.name;
      card.addEventListener("click", () => openPokemonModal(name));
    });

    pokemonList.classList.remove("opacity-0");
  }, 200);
}




// ===============================
// Modal Logic
// ===============================
async function openPokemonModal(pokemon) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
  const data = await res.json();
  
  modalContent.innerHTML = `
  <div class="flex flex-col items-center justify-center p-6 text-center">
    <img src="https://media.giphy.com/media/ArLxZ4PebH2Ug/giphy.gif" class="w-24 h-24 mx-auto rounded-lg" />
    <p class="mt-2 text-sm text-gray-400 dark:text-gray-300">Loading Pokémon data...</p>
  </div>
`;
modal.classList.remove("hidden");


  modalContent.innerHTML = `
  <div class="text-center">
  <img id="pokemonSprite" src="${data.sprites.other['official-artwork'].front_default}" class="mx-auto w-32 h-32 drop-shadow-md transition duration-300" />
  <h2 class="text-2xl font-bold capitalize pokemon-font text-red-500 mt-2">${data.name}</h2>
  <p class="text-sm font-medium text-gray-600 dark:text-gray-300">#${data.id}</p>
  
</div>


  <div class="grid grid-cols-2 gap-4 text-sm">
    <div>
      <h3 class="font-semibold text-yellow-600 dark:text-yellow-300">Type</h3>
      <p>${data.types.map(t => `<span class="capitalize">${t.type.name}</span>`).join(", ")}</p>
    </div>
    <div>
      <h3 class="font-semibold text-yellow-600 dark:text-yellow-300">Abilities</h3>
      <p>${data.abilities.map(a => `<span class="capitalize">${a.ability.name}</span>`).join(", ")}</p>
    </div>
    <div>
      <h3 class="font-semibold text-yellow-600 dark:text-yellow-300">Height</h3>
      <p>${data.height / 10} m</p>
    </div>
    <div>
      <h3 class="font-semibold text-yellow-600 dark:text-yellow-300">Weight</h3>
      <p>${data.weight / 10} kg</p>
    </div>
  </div>

  <div class="mt-4">
  <h3 class="font-semibold text-blue-600 dark:text-blue-400 mb-2">Base Stats</h3>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
    ${data.stats.map(stat => `
      <div class="backdrop-blur-sm bg-white/10 dark:bg-white/5 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-center">
        <p class="capitalize text-[12px] text-gray-700 dark:text-gray-300">${stat.stat.name}</p>
        <p class="font-bold text-[13px] text-black dark:text-white">${stat.base_stat}</p>
      </div>
    `).join("")}
  </div>
</div>
  
  <div class="mt-6" id="evolutionSection">
  <h3 class="font-semibold text-purple-600 dark:text-purple-400 mb-2">Evolution Chain</h3>
  <div id="evolutionChain" class="flex flex-wrap gap-4 justify-center text-center text-xs text-gray-800 dark:text-gray-200">
    <p>Loading...</p>
  </div>
</div>

`;

const spriteImg = document.getElementById("pokemonSprite");
const toggleShiny = document.getElementById("toggleShiny");

let isShiny = false;


  const evoContainer = document.getElementById("evolutionChain");

try {
  const speciesRes = await fetch(data.species.url);
  const speciesData = await speciesRes.json();

  const evoRes = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoRes.json();

  // Extract all Pokémon in the evolution chain
  const chain = [];
  let current = evoData.chain;

  while (current) {
    chain.push(current.species.name);
    current = current.evolves_to[0];
  }

  // Fetch their sprites
  const evoSprites = await Promise.all(
    chain.map(name => fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => r.json()))
  );

  evoContainer.innerHTML = evoSprites.map(p => `
    <div>
      <img src="${p.sprites.front_default}" class="w-16 h-16 mx-auto" />
      <p class="capitalize mt-1">${p.name}</p>
    </div>
  `).join("");
} catch (err) {
  evoContainer.innerHTML = `<p class="text-red-500">No evolution data</p>`;
}


  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => {
  if (e.target === modal) modal.classList.add("hidden");
});

// ===============================
// Legendary Pokémon Section
// ===============================
async function renderLegendaryPokemons() {
  const legendaryIds = [
    144, 145, 146, 150, 243, 244, 245, 249, 250,
    377, 378, 379, 380, 381, 382, 383, 384, 385,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492,
    494, 495, 496, 497, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720,
    785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 803, 804, 805,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    905, 888, 889, 1007, 1008, 1001, 1002, 1003, 1004, 1005, 1006
  ];

  renderSkeletons(legendaryList, legendaryIds.length);
  const pokemons = await Promise.all(legendaryIds.map(fetchPokemon));

  setTimeout(() => {
    legendaryList.innerHTML = pokemons.map(p => `
      <div class="legendary-card bg-yellow-300 dark:bg-yellow-600 rounded-lg p-3 text-center hover:scale-105 transition duration-300 opacity-0 animate-fade-in" data-name="${p.name}">
        <img src="${p.sprites.front_default}" class="mx-auto w-20 h-20" />
        <h3 class="mt-2 text-[10px] text-black capitalize pokemon-font">${p.name}</h3>
        <p class="text-xs text-black font-sans">Type: ${p.types.map(t => t.type.name).join(", ")}</p>
      </div>
    `).join("");

    document.querySelectorAll(".legendary-card").forEach(card => {
      const name = card.dataset.name;
      card.addEventListener("click", () => openPokemonModal(name));
    });
  }, 500);
}

// ===============================
// Pokémons by Type
// ===============================
async function renderPokemonsByType(type = "fire", limit = 6) {
  renderSkeletons(typeList, limit);

  const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
  const data = await res.json();

  const pokemons = await Promise.all(
    data.pokemon.slice(0, limit).map(p =>
      fetch(p.pokemon.url).then(res => res.json())
    )
  );

  setTimeout(() => {
    typeList.innerHTML = "";
    pokemons.forEach(pokemon => {
      const card = document.createElement("div");
      card.className = "bg-gray-800 dark:bg-gray-800 rounded-lg p-3 text-center hover:scale-105 transition duration-300 opacity-0 animate-fade-in";
      card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" class="mx-auto w-20 h-20" />
        <h3 class="mt-2 text-[10px] text-yellow-500 dark:text-yellow-200 capitalize pokemon-font">${pokemon.name}</h3>
        <p class="text-xs text-gray-300 font-sans">Type: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
      `;
      card.addEventListener("click", () => openPokemonModal(pokemon.name));
      typeList.appendChild(card);
    });
  }, 500);
}

// ===============================
// Theme & Search
// ===============================
themeToggle.addEventListener("click", () => {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark");

  document.body.classList.toggle("bg-white", !isDark);
  document.body.classList.toggle("text-black", !isDark);

  themeIcon.innerHTML = isDark
    ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M6.06 6.06L4.64 4.64m12.72 0l-1.42 1.42M6.06 17.94l-1.42 1.42M12 8a4 4 0 100 8 4 4 0 000-8z" />` // 🌞 Sun for dark mode
    : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M21 12.79A9 9 0 0111.21 3a7 7 0 000 14A9 9 0 0121 12.79z" />`; // 🌙 Moon for light mode
});




// ===============================
// Category Tabs
// ===============================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => {
      t.classList.remove("border-b-2", "border-indigo-500", "text-white", "text-black");
      t.classList.add("text-gray-400");
    });

    tab.classList.add("border-b-2", "border-indigo-500");
    tab.classList.remove("text-gray-400");

    if (document.documentElement.classList.contains("dark")) {
      tab.classList.add("text-white");
    } else {
      tab.classList.add("text-black");
    }

    loadCategory(tab.dataset.category);
  });
});

// ===============================
// Type Tabs Setup
// ===============================
document.querySelectorAll(".type-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    const selectedType = btn.dataset.type;

    document.querySelectorAll(".type-tab").forEach(b => b.classList.remove("active-tab"));
    btn.classList.add("active-tab");

    renderPokemonsByType(selectedType);
  });
});
async function loadHabitats() {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon-habitat/');
  const data = await res.json();
  const habitatList = document.getElementById('habitatList');

  habitatList.innerHTML = '';

  data.results.forEach(habitat => {
    const btn = document.createElement('button');
    btn.textContent = habitat.name;
    btn.className = 'bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 py-1 rounded-full text-xs pokemon-font';
    btn.onclick = () => loadPokemonByHabitat(habitat.url);
    habitatList.appendChild(btn);
  });
}

async function loadPokemonByHabitat(url) {
  const res = await fetch(url);
  const data = await res.json();
  const list = document.getElementById('habitatPokemon');
  list.innerHTML = '';

  data.pokemon_species.forEach(poke => {
    const name = poke.name;

    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg p-2 text-center shadow';
    card.innerHTML = `
      <img src="https://img.pokemondb.net/sprites/home/normal/${name}.png" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'" class="w-16 h-16 mx-auto" />
      <p class="text-xs mt-1 capitalize pokemon-font text-yellow-300">${name}</p>
    `;
    list.appendChild(card);
  });
}

document.getElementById('openHabitatModal').addEventListener('click', () => {
  loadHabitats(); // load habitat buttons when modal opens
});


const regionModal = document.getElementById('regionModal');
const openRegionBtn = document.getElementById('openRegionModal');

openRegionBtn.addEventListener('click', () => {
  regionModal.classList.remove('hidden');
  loadRegions(); // load region buttons
});

function closeRegionModal() {
  regionModal.classList.add('hidden');
}

async function loadRegions() {
  const regionList = document.getElementById('regionList');
  regionList.innerHTML = '';

  // Predefined list of main regions
  const regions = [
  { name: 'Kanto', url: 'https://pokeapi.co/api/v2/pokedex/2/' },
  { name: 'Johto', url: 'https://pokeapi.co/api/v2/pokedex/7/' },
  { name: 'Hoenn', url: 'https://pokeapi.co/api/v2/pokedex/15/' },
  { name: 'Sinnoh', url: 'https://pokeapi.co/api/v2/pokedex/6/' },
  { name: 'Unova', url: 'https://pokeapi.co/api/v2/pokedex/9/' },
  { name: 'Kalos (Central)', url: 'https://pokeapi.co/api/v2/pokedex/12/' },
  { name: 'Kalos (Coastal)', url: 'https://pokeapi.co/api/v2/pokedex/13/' },
  { name: 'Kalos (Mountain)', url: 'https://pokeapi.co/api/v2/pokedex/14/' },
  { name: 'Alola', url: 'https://pokeapi.co/api/v2/pokedex/21/' },
  { name: 'Alola (Updated)', url: 'https://pokeapi.co/api/v2/pokedex/22/' },
  { name: 'Galar', url: 'https://pokeapi.co/api/v2/pokedex/27/' },
  { name: 'Galar (Isle of Armor)', url: 'https://pokeapi.co/api/v2/pokedex/28/' },
  { name: 'Galar (Crown Tundra)', url: 'https://pokeapi.co/api/v2/pokedex/29/' },
  { name: 'Hisui', url: 'https://pokeapi.co/api/v2/pokedex/26/' },
  { name: 'Paldea', url: 'https://pokeapi.co/api/v2/pokedex/31/' },
  { name: 'Kitakami', url: 'https://pokeapi.co/api/v2/pokedex/32/' },
  { name: 'Blueberry', url: 'https://pokeapi.co/api/v2/pokedex/33/' }
];


  regions.forEach(region => {
    const btn = document.createElement('button');
    btn.textContent = region.name;
    btn.className = 'bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 py-1 rounded-full text-xs pokemon-font';
    btn.onclick = () => loadPokemonByRegion(region.url);
    regionList.appendChild(btn);
  });
}

async function loadPokemonByRegion(url) {
  const res = await fetch(url);
  const data = await res.json();
  const list = document.getElementById('regionPokemon');
  list.innerHTML = '';

  data.pokemon_entries.forEach(entry => {
    const name = entry.pokemon_species.name;

    const card = document.createElement('div');
    card.className = 'bg-gray-800 rounded-lg p-2 text-center shadow';
    card.innerHTML = `
      <img src="https://img.pokemondb.net/sprites/home/normal/${name}.png" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'" class="w-16 h-16 mx-auto" />
      <p class="text-xs mt-1 capitalize pokemon-font text-yellow-300">${name}</p>
    `;
    list.appendChild(card);
  });
}



// ===============================
// Quiz Game
// ===============================

const whoModal = document.getElementById('whoModal');
const openWhoBtn = document.getElementById('openWhoModal');
const silhouette = document.getElementById('silhouette');
const guessInput = document.getElementById('guessInput');
const resultMessage = document.getElementById('resultMessage');
const roundCount = document.getElementById('roundCount');
const scoreCount = document.getElementById('scoreCount');
const nextBtn = document.getElementById('nextBtn');
const gameArea = document.getElementById('gameArea');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');

let currentPokemon = "";
let score = 0;
let round = 1;
let gameOver = false;

openWhoBtn.addEventListener('click', () => {
  document.getElementById('notificationModal').classList.remove('hidden');
});

function startWhoGame() {
  document.getElementById('notificationModal').classList.add('hidden');
  whoModal.classList.remove('hidden');

  // get selected difficulty
  const selected = document.getElementById('difficultySelect').value;
  difficulty = selected;

  restartGame();
}



function closeWhoModal() {
  whoModal.classList.add('hidden');
  gameOver = false;
}

async function nextPokemon() {
  if (round > 10) {
    endGame();
    return;
  }

  resultMessage.textContent = "";
  nextBtn.classList.add("hidden");
  guessInput.disabled = false;
  guessInput.value = "";
  silhouette.classList.add("filter", "brightness-0");
  silhouette.classList.remove("animate-reveal");

  roundCount.textContent = round;

  let min = 1, max = 649; // default
if (difficulty === 'gen1') {
  max = 151;
} else if (difficulty === 'gen1-3') {
  max = 386;
} else if (difficulty === 'gen1-5') {
  max = 649;
} else if (difficulty === 'full') {
  max = 1010;
}

const id = Math.floor(Math.random() * (max - min + 1)) + min;
const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const data = await res.json();
  currentPokemon = data.name.toLowerCase();
  silhouette.src = data.sprites.other['official-artwork'].front_default;
}

function checkGuess() {
  const userGuess = guessInput.value.toLowerCase().trim();
  if (!userGuess) return;

  guessInput.disabled = true;

  if (userGuess === currentPokemon) {
    silhouette.classList.remove("filter", "brightness-0");
    silhouette.classList.add("animate-reveal");
    resultMessage.textContent = `🎉 Correct! It's ${currentPokemon.toUpperCase()}!`;
    resultMessage.classList.add("text-green-400");
    score++;
    scoreCount.textContent = score;
  } else {
    resultMessage.textContent = `❌ Wrong! It was ${currentPokemon.toUpperCase()}`;
    resultMessage.classList.remove("text-green-400");
    silhouette.classList.remove("filter", "brightness-0");
    silhouette.classList.add("animate-reveal");
  }

  round++;
  roundCount.textContent = round;

  setTimeout(() => {
    if (round > 10) {
      endGame();
    } else {
      nextPokemon();
    }
  }, 1200);
}


function endGame() {
  gameArea.classList.add("hidden");
  gameOverScreen.classList.remove("hidden");
  finalScore.textContent = score;
  gameOver = true;
}

function restartGame() {
  score = 0;
  round = 1;
  scoreCount.textContent = score;
  gameArea.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");
  nextPokemon();
}


// ===============================
// Initial Load
// ===============================

renderLegendaryPokemons();
loadCategory("trending");
renderPokemonsByType("fire");

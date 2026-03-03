
// This will grab elements from the page
const pokemonInput = document.getElementById("pokemonInput");
const findButton = document.getElementById("findButton");
const message = document.getElementById("message");

// The section that shows Pokemon results 
const pokemonViewer = document.getElementById("pokemonViewer");
const pokemonImage = document.getElementById("pokemonImage");
const pokemonAudio = document.getElementById("pokemonAudio");

// All 4 dropdown menus 
const moveDropdown1 = document.getElementById("moveDropdown1");
const moveDropdown2 = document.getElementById("moveDropdown2");
const moveDropdown3 = document.getElementById("moveDropdown3");
const moveDropdown4 = document.getElementById("moveDropdown4");

// The team display (section that holds the tea, "add to team" button, and where you insert rows)
const addToTeamButton = document.getElementById("addToTeamButton");
const teamSection = document.getElementById("teamSection");
const teamTableBody = document.getElementById("teamTableBody");


// Variables we store in JS
// Will store the last pokemon you searched for along with its team members
let currentPokemonData = null; 
let team = []; 


// Cache so we don't fetch same pokemon
const cache = new Map();


// message texts
function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "crimson" : "black";
}


// fill ONE dropdown with moves
function fillMoveDropdown(dropdown, moveNames) {
  dropdown.innerHTML = "";


  // default option at top
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- choose a move --";
  dropdown.appendChild(defaultOption);


  // add moves
  for (const moveName of moveNames) {
    const option = document.createElement("option");
    option.value = moveName;
    option.textContent = moveName;
    dropdown.appendChild(option);
  }
}


// When user clicks "Find"
findButton.addEventListener("click", async () => {
  // get user input
  const userText = pokemonInput.value.trim().toLowerCase();
  if (userText === "") {
    setMessage("Type a Pokemon name or ID first.", true);
    return;
  }

  setMessage("Loading...");
  // hide until loaded
  pokemonViewer.style.display = "none"; 
  currentPokemonData = null;

  // if it's already cached then use it
  if (cache.has(userText)) {
    const cachedData = cache.get(userText);
    setMessage("Loaded from cache ✅");
    showPokemonOnScreen(cachedData);
    return;
  }

  // fetch from PokeAPI
  try {
    const url = `https://pokeapi.co/api/v2/pokemon/${userText}`;
    const response = await fetch(url);

    // if pokemon doesn't exist
    if (!response.ok) {
      setMessage("Pokemon not found. Try another name/ID.", true);
      return;
    }

    const data = await response.json();

    // save in cache
    cache.set(userText, data);

    setMessage(`Loaded: ${data.name} ✅`);

    // show it
    showPokemonOnScreen(data);

  } catch (err) {
    setMessage("Something went wrong with fetch().", true);
    console.log(err);
  }
});

// Put pokemon info on the page
function showPokemonOnScreen(data) {
  currentPokemonData = data;

  // show viewer
  pokemonViewer.style.display = "block";

  // image
  pokemonImage.src = data.sprites.front_default;
  pokemonImage.hidden = false;

  // audio 
  const audioUrl = (data.cries && (data.cries.latest || data.cries.legacy)) ? (data.cries.latest || data.cries.legacy) : "";

  if (audioUrl) {
    pokemonAudio.src = audioUrl;
    pokemonAudio.style.display = "block";
  } else {
    // hide audio if not available
    pokemonAudio.removeAttribute("src");
    pokemonAudio.load();
    pokemonAudio.style.display = "none";
  }

  // moves list
  const moveNames = data.moves.map(m => m.move.name);

  // fill all 4 dropdowns
  fillMoveDropdown(moveDropdown1, moveNames);
  fillMoveDropdown(moveDropdown2, moveNames);
  fillMoveDropdown(moveDropdown3, moveNames);
  fillMoveDropdown(moveDropdown4, moveNames);
}

// user clicks "Add to Team"
addToTeamButton.addEventListener("click", () => {
  if (!currentPokemonData) {
    setMessage("Search for a Pokemon first.", true);
    return;
  }

  // get chosen moves
  const chosenMoves = [
    moveDropdown1.value,
    moveDropdown2.value,
    moveDropdown3.value,
    moveDropdown4.value
  ];

  // make a team member object
  const teamMember = {
    name: currentPokemonData.name,
    sprite: currentPokemonData.sprites.front_default,
    moves: chosenMoves
  };

  // add it to team array
  team.push(teamMember);

  // re-draw the team on screen
  renderTeam();

  setMessage(`${teamMember.name} added to team ✅`);
});

// show the team in the table
function renderTeam() {
  teamSection.style.display = "block";
  teamTableBody.innerHTML = "";

  for (const member of team) {
    const row = document.createElement("tr");

    // left side (pokemon)
    const leftCell = document.createElement("td");
    leftCell.innerHTML = `
      <div style="text-align:center;">
        <img src="${member.sprite}" width="70" />
        <br/>
        <b>${member.name}</b>
      </div>
    `;

    // right side (moves)
    const rightCell = document.createElement("td");
    const ul = document.createElement("ul");

    for (const mv of member.moves) {
      const li = document.createElement("li");
      li.textContent = mv || "(none)";
      ul.appendChild(li);
    }

    rightCell.appendChild(ul);

    row.appendChild(leftCell);
    row.appendChild(rightCell);

    teamTableBody.appendChild(row);
  }

}

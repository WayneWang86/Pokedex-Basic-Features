/*
* Name: Yifeng Wang
* Date: November 12, 2018
* Course Project for CSE 154
* This is the JS to implement the UI for pokedex.html. It will help to fetch
* images of 151 pokemons and also their related data. This JS gives the user
* the ability to click a found pokemon(which has color on its image) and to
* view the pokemon's data and its moves. And then the user is able to use the
* found Pokemon to have a battle with another Pokemon, if user's Pokemon won,
* the opponent Pokemon will be displayed in the Pokedex as found Pokemon and the
* user is able to use it for battles.
*/

(function() {

  "use strict";

  // This constant URL will be used later for fetching text and JSON objects from online source.
  const POKEMON_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  // This is a constant array including the names of the three starter Pokemons
  const STARTER_POKEMON = ["Bulbasaur", "Charmander", "Squirtle"];
  // module-global variable - used to store a single game ID
  let guid;
  // module-global variable - used to store a single player ID
  let pid;
  // module-global variable - used to store user's pokemon's original HP value
  let myPokemonHP;
  // This is a boolean variable. It is originally false. Once the game started,
  // it will be true. And once the game is ended, it will return false;
  let gameStarted = false;

  window.addEventListener("load", initialize);

  /**
   * Initialize the page, add the 151 pokemon images into the right viewing box
   * on the pokedex.html page
   */
  function initialize() {
    loadPokemon();
  }

  /**
   * This function's purpose is to fetch the image urls of pokemons
   */
  function loadPokemon() {
    let url = POKEMON_URL + "pokedex.php?pokedex=all";
    fetch(url)
      .then(checkStatus)
      .then(splitNewLines)
      .then(displayPokemon)
      .catch(console.log);
  }

   /**
   * Returns an array resulting from splitting text response by newline characters.
   * @param {string} text - text to split by new lines
   * @returns {string[]} - array of strings split by newline
   */
  function splitNewLines(text) {
    return text.split("\n");
  }

  /**
   * This function generate the 151 pokemon images for the viewing box.
   * @param {string[]} response - array of sprite image sources as strings
   */
  function displayPokemon(response) {
    for (let i = 0; i < response.length; i++) {
      let sprite = response[i].split(":");
      let spriteName = sprite[0];
      let spriteImgPath = POKEMON_URL + "sprites/" + sprite[1] + ".png";
      let spriteImg = document.createElement("img");
      spriteImg.src = spriteImgPath;
      spriteImg.classList.add("sprite");
      spriteImg.id = spriteName;
      spriteImg.alt = spriteName;
      starterPokemon(spriteImg);
      $("pokedex-view").appendChild(spriteImg);
      spriteImg.addEventListener("click", pokemonData);
    }
  }

  /**
   * This function is to set up the default starter Pokemons and mark them
   * as found.
   * @param {object} spriteImg - DOM object which represents the image of a sprite
   */
  function starterPokemon(spriteImg) {
    let spriteName = spriteImg.id;
    for (let i = 0; i < STARTER_POKEMON.length; i++) {
      if (spriteName === STARTER_POKEMON[i]) {
        spriteImg.classList.add("found");
      }
    }
  }

  /**
   * This function's purpose is to fetch the a certain Pokemon sprite's data
   */
  function pokemonData() {
    if (this.classList.contains("found")) {
      removeHidden($("start-btn"));

      //
      // $("start-btn").classList.remove("hidden");

      $("start-btn").addEventListener("click", gameStart);
      let url = POKEMON_URL + "pokedex.php?pokemon=" + this.id;
      fetch(url)
        .then(checkStatus)
        .then(JSON.parse)
        .then(importMyPokemonData)
        .catch(console.log);
    }
  }

  /**
   * This function's purpose is to import the user's selected Pokemon's data
   * on the Pokemon card on the pokedex.html page
   * @param {objects} pokemonData - JSON object included a certain Pokemon sprite's data
   */
  function importMyPokemonData(pokemonData) {
    importData(pokemonData, "#p1");
  }

  /**
   * This function generate the Pokemon sprite's data and show them on the
   * Pokemon card on the pokedex.html page
   * @param {objects} pokemonData - JSON object included a certain Pokemon sprite's data
   * @param {String} card - telling the function where to import the data.
   */
  function importData(pokemonData, card) {
    let name = pokemonData.name;
    qs(card + " .name").innerText = name;
    let photoPath = POKEMON_URL + pokemonData.images.photo;
    let photo = qs(card + " .pokepic");
    photo.src = photoPath;
    photo.alt = pokemonData.images.photo;
    let typePath = POKEMON_URL + pokemonData.images.typeIcon;
    let type = qs(card + " .type");
    type.src = typePath;
    type.alt = pokemonData.images.typeIcon;
    let weaknessPath = POKEMON_URL + pokemonData.images.weaknessIcon;
    let weakness = qs(card + " .weakness");
    weakness.src = weaknessPath;
    weakness.alt = pokemonData.images.weaknessIcon;
    let hp = pokemonData.hp + "HP";
    qs(card + " .hp").innerText = hp;
    let description = pokemonData.info.description;
    qs(card + " .info").innerText = description;
    moveInfo(pokemonData, card);
  }

  /**
   * This function is considered a helper function for the importData function
   * It is to generate the moves data of a certain Pokemon sprite and to show
   * them on the Pokemon card on the pokedex.html page
   * @param {objects} pokemonData - JSON object included a certain Pokemon sprite's data
   * @param {String} card - telling the function where to import the data.
   */
  function moveInfo(pokemonData, card) {
    let moves = pokemonData.moves;
    let moveButtons = qs(card + " .moves").children;
    let button;
    // hide the extra buttons.
    if (moves.length < moveButtons.length) {
      for (let i = moves.length; i < moveButtons.length; i++) {
        moveButtons[i].classList.add("hidden");
      }
    }
    for (let i = 0; i < moves.length; i++) {
      // enable the move buttons for P1
      if (card === "#p1") {
        moveButtons[i].disabled = false;
      } else {
        moveButtons[i].disabled = true;
      }
      removeHidden(moveButtons[i]);
      button = moveButtons[i].children;
      moveButtons[i].id = moves[i].name;
      button[0].innerText = moves[i].name;
      if (moves[i].dp) {
        button[1].innerText = moves[i].dp + " DP";
      } else {
        button[1].innerText = "";
      }
      button[2].src = POKEMON_URL + "icons/" + moves[i].type + ".jpg";
      button[2].alt = moves[i].type;
      moveButtons[i].addEventListener("click", gamePlay);
    }
  }

  /**
   * When the game is started and a move button was clicked by user
   * using the move's name to send POST fetch request to web services.
   */
  function gamePlay() {
    if (gameStarted) {
      toggleHidden($("loading"));
      let moveName = this.id.replace(/\s+/g, '').toLowerCase();
      fetchMovesAndResults(moveName);
    }
  }

  /**
   * When the game is started and a move button was clicked by user
   * using the move's name to send POST fetch request to web services.
   * To fetch moves and results for the Pokemon battle from the web services.
   * @param {String} moveName - the name of move that made by user's Pokemon.
   */
  function fetchMovesAndResults(moveName) {
    let url = POKEMON_URL + "game.php";
    let params = new FormData();
    params.append("guid", guid);
    params.append("pid", pid);
    params.append("movename", moveName);
    fetch(url, {method: "POST", body: params})
      .then(checkStatus)
      .then(JSON.parse)
      .then(moveUpdate)
      .catch(console.log);
  }

   /**
    * This function is used to update the Pokemon battle results.
    * it will update Pokemons' moves and results, as well as their HP and buffs
    * @param {objects} response - JSON object included both Pokemon's moves in
    *                             the battle and the results.
    */
  function moveUpdate(response) {
    let results = response.results;
    moveResults(results, "p1", 1);
    moveResults(results, "p2", 2);
    hpCalculator(response.p1, "#p1");
    hpCalculator(response.p2, "#p2");
    buffHandler(response.p1, "#p1");
    buffHandler(response.p2, "#p2");
    toggleHidden($("loading"));
  }

  /**
   * This function is to update the moves and results of Pokemons in the battle.
   * It is created to minimize redundancy.
   * @param {objects} results - JSON object contains Pokemons battle related data.
   * @param {String} player - telling the function which player's data to update.
   * @param {Integer} playerNumber - the player number used for the result output.
   */
  function moveResults(results, player, playerNumber) {
    let move = results[player + "-move"];
    let result = results[player + "-result"];
    let resultDisplay = $(player + "-turn-results");
    removeHidden(resultDisplay);
    if (player === "p2" && (!move || !result)) {
      toggleHidden($("p2-turn-results"));
    }
    resultDisplay.innerText = "Player " + playerNumber + " played " + move +
                              " and " + result + "!";
  }

  /**
   * This is a helper function to help calculate the current hp for pokemons in battle
   * It is created to minimize redundancy.
   * @param {objects} pokemonData - JSON object contains Pokemon's battle status.
   * @param {String} card - telling the function which player's data to update.
   */
  function hpCalculator(pokemonData, card) {
    let hp = pokemonData.hp;
    let currentHp = pokemonData["current-hp"];
    let hpPercentage = currentHp * 100 / hp;
    qs(card + " .hp").innerText = currentHp + "HP";
    if (hp !== currentHp) {
      qs(card + " .health-bar").style.width = hpPercentage + "%";
    }
    hpBarColor(hpPercentage, card);
    if (hpPercentage === 0) {
      gameStarted = false;
      gameOver(card);
    }
  }

  /**
   * This is a helper function to change the Pokemon's health-bar color based on
   * it's current HP.
   * @param {Integer} hpPercentage - the Pokemon's current HP percentage(without % symbol)
   * @param {String} card - telling the function which player's data to update.
   */
  function hpBarColor(hpPercentage, card) {
    if (hpPercentage < 20) {
      qs(card + " .health-bar").classList.add("low-health");
    } else {
      if (qs(card + " .health-bar").classList.contains("low-health")) {
        qs(card + " .health-bar").classList.remove("low-health");
      }
    }
  }

  /**
   * This is a helper function to update a given Pokemon's buffs and debuffs.
   * @param {objects} pokemonData - JSON object contains Pokemon's battle status.
   * @param {String} card - telling the function which player's data to update.
   */
  function buffHandler(pokemonData, card) {
    let buffContainer = qs(card + " .buffs");
    clearBuffs(buffContainer);
    let buffs = pokemonData.buffs;
    buffHandlerHelper(buffs, "buff", card);
    let debuffs = pokemonData.debuffs;
    buffHandlerHelper(debuffs, "debuff", card);
  }

  /**
   * This is a helper function to clear a given Pokemon's buffs and debuffs.
   * @param {objects} buffContainer - DOM object contains Pokemon's buffs and debuffs.
   */
  function clearBuffs(buffContainer) {
    if (buffContainer.hasChildNodes()) {
      while(buffContainer.childNodes[0]) {
        buffContainer.removeChild(buffContainer.childNodes[0]);
      }
    }
  }

  /**
   * This is a helper function to update a given Pokemon's buffs and debuffs.
   * This function is created to minimize redundancy.
   * @param {objects} givenBuffs - JSON object contains Pokemon's buffs or debuffs.
   * @param {String} className - to define whether to update buffs or debuffs.
   * @param {String} card - telling the function which player's data to update.
   */
  function buffHandlerHelper(givenBuffs, className, card) {
    if (givenBuffs.length !== 0) {
      for (let i = 0; i < givenBuffs.length; i++) {
        let givenBuff = document.createElement("div");
        givenBuff.classList.add(className);
        givenBuff.classList.add(givenBuffs[i]);
        qs(card + " .buffs").appendChild(givenBuff);
      }
    }
  }

  /**
   * When the start button is clicked, this function start to send POST fetch
   * request to the web services to get the Pokemon battle information as well
   * the the opponent Pokemon's information.
   */
  function gameStart() {
    gameStarted = true;
    let url = POKEMON_URL + "game.php";
    let name = qs("#p1 .name").innerText.toLowerCase();
    let params =  new FormData();
    params.append("startgame", "true");
    params.append("mypokemon", name);
    fetch(url, {method: "POST", body: params})
      .then(checkStatus)
      .then(JSON.parse)
      .then(initializeGame)
      .catch(console.log);
  }

  /**
   * This function take the JSON object from web services and then display the
   * needed information to the pokedex.html page
   * @param {objects} response - JSON object contains the information of the Pokemon
   *                             battle and the information of both Pokemons
   */
  function initializeGame(response) {
    guid = response.guid;
    pid = response.pid;
    myPokemonHP = qs("#p1 .hp").innerText;
    let pokemonData = response.p2;
    importData(pokemonData, "#p2");
    $("pokedex-view").classList.add("hidden");
    qs("#p1 .hp-info").classList.remove("hidden");
    $("p2").classList.remove("hidden");
    $("results-container").classList.remove("hidden");
    toggleHidden($("start-btn"));
    toggleHidden($("flee-btn"));
    $("flee-btn").addEventListener("click", fleeBattle);
    qs("h1").innerText = "Pokemon Battle Mode!";
    toggleHidden(qs("#p1 .buffs"));
  }


  /**
   * When one of the Pokemon's HP is 0, this function is then called to show
   * the game result.
   * @param {String} card - telling the function which player's data to update.
   */
  function gameOver(card) {
    toggleHidden($("flee-btn"));
    toggleHidden($("endgame"));
    $("endgame").addEventListener("click", backToMain);
    if (card === "#p1") {
      qs("h1").innerText = "You lost!";
    } else {
      qs("h1").innerText = "You won!";
      updatePokedex();
    }
  }

  /**
   * When the user's Pokemon won the battle, the user's opponent Pokemon will
   * then appeared as found insied the pokedex.
   */
  function updatePokedex() {
    let newPokemonName = qs("#p2 .name").innerText;
    $(newPokemonName).classList.add("found");
  }

  /**
   * When the endgame button is clicked (when user wants to go back to Pokedex),
   * This function's purpose is to take the user bake to the Pokedex page with
   * the most recnetly used Pokemon display on user's Pokemon Card.
   */
  function backToMain() {
    toggleHidden($("endgame"));
    toggleHidden($("results-container"));
    toggleHidden($("p2"));
    toggleHidden($("pokedex-view"));
    toggleHidden($("start-btn"));
    qs("h1").innerText = "Your Pokedex";
    qs("#p1 .hp").innerText = myPokemonHP;
    toggleHidden(qs("#p1 .buffs"));
    toggleHidden(qs("#p1 .hp-info"));
    resetInfo("p1");
    resetInfo("p2");
  }

  /**
   * This is a helper function to help reset the cards' information
   * @param {String} card - telling the function which player's data to update.
   */
  function resetInfo(card) {
    qs("#" + card + " .health-bar").style.width = "100%";
    hpBarColor(100, "#" + card);
    clearBuffs(qs("#" + card + " .buffs"));
    $(card + "-turn-results").innerText = "";
  }

  /**
   * When the flee button is clicked(when user decided to flee), this function is
   * to response accordingly to user's Pokemon's flee move.
   */
  function fleeBattle() {
    toggleHidden($("loading"));
    fetchMovesAndResults("flee");
  }

  /**
   * This is a helper function to help make different parts of the pokedex.html
   * page to switch between visible and invisible
   * @param {object} item - DOM object that the JS wants to make either visible or invisible.
   */
  function toggleHidden(item) {
    item.classList.toggle("hidden");
  }

  /**
   * This is a helper function to help make different parts of the pokedex.html
   * page to be visible
   * @param {object} item - DOM object that the JS wants to make it visible.
   */
  function removeHidden(item) {
    if (item.classList.contains("hidden")) {
      item.classList.remove("hidden");
    }
  }
  // ------------------------- Helper Functions ------------------------- //
  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @return {object} - valid result text if response was successful, otherwise rejected
   *                    Promise result
   */
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300 || response.status == 0) {
      return response.text();
    } else {
      return Promise.reject(new Error(response.status + ": " + response.statusText));
    }
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @returns {object} DOM object associated with id.
   */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} query - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(query) {
    return document.querySelector(query);
  }

})();

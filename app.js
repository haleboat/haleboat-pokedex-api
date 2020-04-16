// - /pokemon/${number}/        - first data set has types/sprites
// - /pokemon-species/${number} - second data set has description/evolution_chain and evolves_from_species
// - /evolution-chain/${number} - evo data set has evolves_to

/**
 * This build function is attached to an onload and makes the call to build the list.
 */
function build() {
  const url = "https://pokeapi.co/api/v2/pokedex/1"
  const pokedexList = document.createElement("ul")
  initialLoading()
  createPokedexHeader()
  createSearchbar()
  getPokedexList(url).then(listData => {
    list = listData.pokemon_entries
    createListHeader(pokedexList)
    removeApiLoading()
    list.forEach(index => {
      createPokemonListHTML(index, pokedexList)
    });
  })
}

/**
 * This is the initial call to the pokemon API to get a pokemon's entry number and name.
 * returns an array of objects
 * 
 * @param {String} url stored in build() and passed here
 * @returns an array of objects
 */
function getPokedexList(url) {
  const listData = fetch(url)
    .then(x => x.json())
    .then(data => {
      return data
    })
    .catch(err => {
      showError()
    })
  return listData
}

/**
 * This is a call for a specific pokemon that fires when a user clicks on a view button.
 * 
 * @param {String} pokemonURL stored as a value on the button element.
 * @returns an object of the chosen pokemon.
 */
function callPokemonEntryAPI(pokemonURL) {
  const pokemonData = fetch(pokemonURL)
    .then(x => x.json())
    .then(data => {
      return data
    })
    .catch(err => {
      showError()
    })
  return pokemonData
}

/**
 * This is a call for the chosen pokemons species data, it has the description and evolution data.
 *  
 * @param {String} speciesURL this is picked from the pokemonEntryAPI and passed from the loadEntry function attached to the
 *  view button inside the pokemonListHTML function
 * @returns an object of the chosen pokemon.
 */
function callSpeciesAPI(speciesURL) {
  const speciesData = fetch(speciesURL)
    .then(x => x.json())
    .then(data => {
      return data
    })
    .catch(err => {
      showError()
    })
  return speciesData
}

/**
 * This is a call for the chosen pokemons evolution data, it has the evolves_to array if chosen pokemon CAN evolve, otherwise it's empty.
 * 
 * @param {String} evoURL this is picked from the speciesAPI and passed from the callSpeciesAPI inside the createPokemonCard function.
 */
function callEvolutionAPI(evoURL) {
  const evoDataSet = fetch(evoURL)
    .then(x => x.json())
    .then(data => {
      const evolutionData = data.chain
      return evolutionData
    })
    .catch(err => {
      showError()
    })
  return evoDataSet
}


/**
 * This is called from build() to create the element header 'pokedex'
 */
function createPokedexHeader() {
  const container = document.querySelector('.container')
  const header = document.createElement('h1')
  header.textContent = 'pokedex'
  header.className = 'pokedex-title'
  container.appendChild(header)
}

/**
 * This is called from build() to create the searchbar and adds the eventlistener 'searchJS' function
 */
function createSearchbar() {
  const container = document.querySelector('.container')
  const wrapper = document.createElement('div')
  const search = document.createElement('h3')
  const textField = document.createElement('input')

  wrapper.className = 'search'
  search.textContent = 'search'
  textField.className = 'search-term'
  textField.id = 'search-term'
  textField.placeholder = `type pokemons name here...`
  textField.type = 'text'

  wrapper.appendChild(search)
  wrapper.appendChild(textField)
  container.appendChild(wrapper)

  textField.addEventListener('keyup', searchJS)
}

/**
 * This is called from build() to create the pokedex list (Entry Number, Name, Action)
 * 
 * @param {ul} pokedexList this is ul element created on build()
 */
function createListHeader(pokedexList) {
  const listHeader = document.createElement('li')
  const listHeaderNum = document.createElement('p')
  const listHeaderName = document.createElement('p')
  const listHeaderAction = document.createElement('p')

  listHeader.className = 'list-header'

  listHeaderNum.textContent = 'entry number'
  listHeaderName.textContent = 'pokemon name'
  listHeaderAction.textContent = 'action'

  listHeader.appendChild(listHeaderNum)
  listHeader.appendChild(listHeaderName)
  listHeader.appendChild(listHeaderAction)
  pokedexList.appendChild(listHeader)
  pokedexList.id = "pokemon-list"
}

/**
 * This function is responsible creating the rows of the list and populating them with the data.
 * 
 * @param {Array} data this is passed from build() as an object from the array of objects acquired from the getPokedexList
 * @param {ul} ul container for the list entries to hold li elements
 */
function createPokemonListHTML(data, ul) {
  const pokedexNum = data.entry_number
  const pokedexName = data.pokemon_species.name

  const container = document.querySelector('.container')
  const li = document.createElement('li')
  const entryNum = document.createElement('p')
  const pokemonName = document.createElement('a')
  const viewButton = document.createElement('button')

  li.value = pokedexNum
  li.title = pokedexName
  entryNum.textContent = zeroPadding(pokedexNum)
  pokemonName.textContent = pokedexName
  viewButton.value = `https://pokeapi.co/api/v2/pokemon/${pokedexNum}/`
  viewButton.textContent = `view`
  viewButton.id = `${pokedexName}`

  /**
   * Fires onclick when the user clicks a view button to render the pokemonCard
   * 
   */
  function loadEntry() {
    showLoading()
    showCard()
    callPokemonEntryAPI(viewButton.value)
      .then(pokemonData => {
        createPokemonCard(pokemonData)
      })
    removeLoading()
  }
  viewButton.addEventListener('click', loadEntry)

  li.appendChild(entryNum)
  li.appendChild(pokemonName)
  li.appendChild(viewButton)
  ul.appendChild(li)
  container.appendChild(ul)
}

/**
 * This function creates the card using the pokemonData and calls speciesAPI and evolutionAPI to get the description and evolution chain.
 * 
 * @param {Object} pokemonData an object containing the speciesURL, id, name, and sprite.
 */
function createPokemonCard(pokemonData) {
  const speciesURL = pokemonData.species.url
  const id = pokemonData.id
  const name = pokemonData.name
  const sprite = pokemonData.sprites.front_default

  callSpeciesAPI(speciesURL)
    .then(speciesData => {
      getDescription(speciesData)
      const evoURL = speciesData.evolution_chain.url
      callEvolutionAPI(evoURL)
        .then(evoDataSet => {
          getEvolutions(evoDataSet)
        })
    })


  const entryID = document.querySelector('#poke-num')
  const nameID = document.querySelector('#poke-name')
  const typeID = document.querySelector('#poke-type')
  const typeIDtwo = document.querySelector('#poke-type2')
  const image = document.querySelector('.image')

  image.style = `background-image: url(${sprite})`
  entryID.textContent = zeroPadding(id)
  nameID.textContent = name
  typeID.textContent = pokemonData.types[0].type.name
  typeID.className = `${pokemonData.types[0].type.name}`

  // if pokemon has more than 1 type this function does it's thing
  getSecondType(pokemonData, typeIDtwo)
}

/**
 * This function is responsible for parsing the array for the 'en'(english) version of the first description.
 * 
 * TODO I want to display all the english descriptions and add a button to the interface to cycle through them.
 * 
 * @param {Object} speciesData object containing the description information
 */
function getDescription(speciesData) {
  let description = `Error loading description.`
  for (let i = 0; i < speciesData.flavor_text_entries.length; i++) {
    if (speciesData.flavor_text_entries[i].language.name === 'en') {
      description = speciesData.flavor_text_entries[i].flavor_text
      break
    }
  }
  const descID = document.querySelector('#poke-desc')
  descID.textContent = description
}

/**
 * This function is responsible for determining if the pokemon has an evolution or not and sets the sprites if they do.
 * 
 * TODO needs work as it's very unreliant for displaying the chain in the right order. Has something to do with calling the speciesAPI to get the sprite.
 * 
 * @param {Object} evolutionData object containing the chosen pokemons evolutions. 
 */
function getEvolutions(evolutionData) {
  let evolutions_list = [];
  evolutions_list = processChain(evolutionData.evolves_to, evolutions_list);
  evolutions_list.push({
    entryNum: getEntryID(evolutionData),
    name: evolutionData.species.name,
    spritesURL: `https://pokeapi.co/api/v2/pokemon/${evolutionData.species.name}/`
  })

  if (evolutions_list.length > 1) {
    document.querySelector('.mid').style.display = 'block'
    evolutions_list.forEach(index => {
      callSpeciesAPI(index.spritesURL)
        .then(spritesTEST => {
          const evoSprite = document.createElement('div')
          const evoName = document.createElement('p')
          evoName.className = 'evo-name'
          evoName.textContent = index.name
          evoSprite.className = `evo-image`
          evoSprite.title = `${index.name}`
          evoSprite.style = `background-image: url(${spritesTEST.sprites.front_default})`
          evoSprite.appendChild(evoName)
          document.querySelector(`.evo-container`).appendChild(evoSprite)
        })
    })
  } else {
    document.querySelector('.mid').style.display = 'none'
  }
}

/**
 * Checks if types array is bigger than 1 and sets the second type.
 * 
 * @param {Object} pokemonData array of objects holding another array for types
 * @param {Element} typeIDtwo container for displaying a second type
 */
function getSecondType(pokemonData, typeIDtwo) {
  typeIDtwo.style.display = 'none'

  if (pokemonData.types.length > 1) {
    typeIDtwo.textContent = pokemonData.types[1].type.name
    typeIDtwo.className = `${pokemonData.types[1].type.name}`
    typeIDtwo.style.display = ''
  }
}

/**
 * Function for getting the ID off of the li element for the processChain function.
 * Workaround for avoiding the endpoint being the pokemons name and using it's entry number instead.
 * 
 * @param {Object} data object for the chosen pokemon
 */
function getEntryID(data) {
  if (data.species.name === document.querySelector(`${data.species.name}`)) {
    let id = document.querySelector(`${data.species.name}`).value
    return id
  }
}

/**
 * Error for if the API calls go wrong.
 * Hides everything and display message "There was an error loading the data."
 */
function showError() {
  hideList()
  hideCard()
  const loading = document.createElement("p")
  loading.id = "js-error"
  loading.className = 'error'
  loading.textContent = "There was an error loading the data."
  document.querySelector('.container').appendChild(loading)
}

/**
 * Hides list for error handling
 */
function hideList() {
  const list = document.querySelector('#pokemon-list')
  list.className = 'hide'
}

/**
 * Loading filter for the pokedex when a card is visible.
 */
function initialLoading() {
  const loading = document.createElement("div")
  loading.id = "api-loading"
  loading.className = "loading"
  loading.textContent = "Loading..."
  document.querySelector('body').appendChild(loading)
}

/**
 * Loading filter for when a card is loading.
 */
function showLoading() {
  const loading = document.createElement("div")
  loading.id = "js-loading"
  loading.className = "loading-pokemon"
  loading.textContent = "Loading Pokemon..."
  document.querySelector('.wrapper').appendChild(loading)
}

/**
 * Removes the Loading filter on pokedex.
 */
function removeApiLoading() {
  const api_loading = document.querySelector("#api-loading")
  api_loading.remove()
}

/**
 * Removes the Loading filter on the card.
 */
function removeLoading() {
  const loading = document.querySelector("#js-loading")
  loading.remove()
}

/**
 * Fires when the 'close' button is clicked on the card.
 */
function hideCard() {
  removeApiLoading()
  resetCard()
  const card = document.querySelector('.toggle')
  card.classList = 'toggle hide'
}

/**
 * Fires when the 'view button is clicked on the list.
 */
function showCard() {
  initialLoading()
  const card = document.querySelector('.toggle')
  card.classList = 'toggle show'
}

/**
 * Resets the card when the 'close' button is clicked.
 */
function resetCard() {
  document.querySelector('#poke-num').textContent = ''
  document.querySelector('#poke-name').textContent = ''
  document.querySelector('#poke-type').textContent = ''
  document.querySelector('#poke-type2').textContent = ''
  document.querySelector('.image').style = `background-image: none`
  document.querySelector('.evo-container').textContent = ''
  document.querySelector('.description-data').textContent = ''
  document.querySelector('.mid').style.display = 'block'
}

/**
 * Function for adding "#" and "0's" for the entry numbers.
 * 
 * @param {Number} id pokemons entry number.
 */
function zeroPadding(id) {
  if (id < 10) {
    return `#00${id}`
  } else if (id >= 10 && id < 100) {
    return `#0${id}`
  } else if (id >= 100) {
    return `#${id}`
  }
}

/**
 * Function for the search feature that parses the ul element from the text field and hides all other that don't contain those characters.
 */
function searchJS() {
  let input = document.getElementById('search-term')
  let filter = input.value.toUpperCase()
  let ul = document.getElementById('pokemon-list')
  let li = ul.getElementsByTagName('li')

  for (let i = 1; i < li.length; i++) {
    let a = li[i].getElementsByTagName('a')[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = ''
    }
    else {
      li[i].style.display = 'none'
    }
  }
}

/**
 * Recursive function for populating a temporary array of the pokemons evolution chain.
 * 
 * @param {Array} evolves_to an array of Objects
 * @param {Array} evolutions_list array holding the chosen pokemons sprite data.
 */
function processChain(evolves_to, evolutions_list) {
  evolves_to.forEach(chain => {
    evolutions_list.push({
      entryNum: getEntryID(chain),
      name: chain.species.name,
      spritesURL: `https://pokeapi.co/api/v2/pokemon/${chain.species.name}/`
    })
    evolutions_list = processChain(chain.evolves_to, evolutions_list)
    return evolutions_list;
  });
  return evolutions_list;
}
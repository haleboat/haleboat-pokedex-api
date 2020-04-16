// - /pokemon/${name}/          - first data set has types/sprites
// - /pokemon-species/${number} - second data set has description/evolution_chain and evolves_from_species
// - /evolution-chain/${number} - evo data set has evolves_to
function build() {
  const url = "https://pokeapi.co/api/v2/pokedex/1"
  const pokedexList = document.createElement("ul")
  initialLoading()
  createPokedexHeader()
  createSearchbar()
  getPokedexList(url).then(data => {
    list = data.pokemon_entries
    createListHeader(pokedexList)
    removeApiLoading()
    list.forEach(index => {
      createPokemonListHTML(index, pokedexList)
    });
  })
}

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

function callSpeciesAPI(speciesURL) {
  const secondDataSet = fetch(speciesURL)
    .then(x => x.json())
    .then(data => {
      return data
    })
    .catch(err => {
      showError()
    })
  return secondDataSet
}

function callEvolutionAPI(evoURL) {
  const evoDataSet = fetch(evoURL)
    .then(x => x.json())
    .then(data => {
      const evo_data = data.chain
      return evo_data
    })
    .catch(err => {
      showError()
    })
  return evoDataSet
}

function createPokedexHeader() {
  const container = document.querySelector('.container')
  const header = document.createElement('h1')
  header.textContent = 'pokedex'
  header.className = 'pokedex-title'
  container.appendChild(header)
}

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

function createPokemonCard(firstDataSet) {
  const speciesURL = firstDataSet.species.url
  const id = firstDataSet.id
  const name = firstDataSet.name
  const sprite = firstDataSet.sprites.front_default

  callSpeciesAPI(speciesURL)
    .then(secondDataSet => {
      getDescription(secondDataSet)
      const evoURL = secondDataSet.evolution_chain.url
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
  typeID.textContent = firstDataSet.types[0].type.name
  typeID.className = `${firstDataSet.types[0].type.name}`
  getSecondType(firstDataSet, typeIDtwo)
}

function getDescription(secondDataSet) {
  let description = `Error loading description.`
  for (let i = 0; i < secondDataSet.flavor_text_entries.length; i++) {
    if (secondDataSet.flavor_text_entries[i].language.name === 'en') {
      description = secondDataSet.flavor_text_entries[i].flavor_text
      break
    }
  }
  const descID = document.querySelector('#poke-desc')
  descID.textContent = description
}

function getEvolutions(evo_data) {
  let evolutions_list = [];
  evolutions_list.push({
    entryNum: getEntryID(evo_data),
    name: evo_data.species.name,
    spritesURL: `https://pokeapi.co/api/v2/pokemon/${evo_data.species.name}/`
  })
  evolutions_list = processChain(evo_data.evolves_to, evolutions_list);

  if (evolutions_list.length > 1) {
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

function getSecondType(firstDataSet, typeIDtwo) {
  typeIDtwo.style.display = 'none'

  if (firstDataSet.types.length > 1) {
    typeIDtwo.textContent = firstDataSet.types[1].type.name
    typeIDtwo.className = `${firstDataSet.types[1].type.name}`
    typeIDtwo.style.display = ''
  }
}

//gets entry ID for element
function getEntryID(data) {
  if (data.species.name === document.querySelector(`${data.species.name}`)) {
    let id = document.querySelector(`${data.species.name}`).value
    return id
  }
}

// Error Handling
function showError() {
  hideList()
  hideCard()
  const loading = document.createElement("p")
  loading.id = "js-error"
  loading.className = 'error'
  loading.textContent = "There was an error loading the data."
  document.querySelector('.container').appendChild(loading)
}

function hideList() {
  const list = document.querySelector('#pokemon-list')
  list.className = 'hide'
}

//Loading Functions
function initialLoading() {
  const loading = document.createElement("div")
  loading.id = "api-loading"
  loading.className = "loading"
  loading.textContent = "Loading..."
  document.querySelector('body').appendChild(loading)
}

function showLoading() {
  const loading = document.createElement("div")
  loading.id = "js-loading"
  loading.className = "loading-pokemon"
  loading.textContent = "Loading Pokemon..."
  document.querySelector('.wrapper').appendChild(loading)
}

function removeApiLoading() {
  const api_loading = document.querySelector("#api-loading")
  api_loading.remove()
}

function removeLoading() {
  const loading = document.querySelector("#js-loading")
  loading.remove()
}

//Resets
function hideCard() {
  removeApiLoading()
  resetCard()
  const card = document.querySelector('.toggle')
  card.classList = 'toggle hide'
}

function showCard() {
  initialLoading()
  const card = document.querySelector('.toggle')
  card.classList = 'toggle show'
}

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

//Padding tool
function zeroPadding(id) {
  if (id < 10) {
    return `#00${id}`
  } else if (id >= 10 && id < 100) {
    return `#0${id}`
  } else if (id >= 100) {
    return `#${id}`
  }
}

//search tool
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

//processes evolution chain
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
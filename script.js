//  +   smidigare css med bättre grid-lösning och mindre återanvänd kod
//  +   börjat använda event delegation, inte lika mycket återanvänd kod 
//  -   dålig hantering och för få variabler i css  
//  -   jag skulle kunna ha bara en listener per section rly, och städa lite i några listeners
//nästa övning ska jag tänka mer på det

//Lägg till kommentarer här om du vill



// ELEMENTS
const favouritesNav = document.querySelector("#favourites-nav");

const favouritesCatalogSection = document.querySelector("#favourites-catalog-section");
const mainCatalogSection = document.querySelector("#main-catalog-section");
const favouritesCatalog = document.querySelector("#favourites-catalog");
const mainCatalog = document.querySelector("#main-catalog");
const mainCatalogMessage = document.querySelector("#catalog-message");

const mainSearchSection = document.querySelector("#main-catalog-search-section");
const favouritesSearchSection = document.querySelector("#favourites-catalog-search-section");

const mainSearchToggleBtn = document.querySelector("#main-catalog-toggleSearch");
const favouritesSearchToggleBtn = document.querySelector("#favourites-catalog-toggleSearch");

let favouritesList = [];
let filter = {
    searchText: "",
    water: false,
    grass: false,
    fire: false
};


// RUN IT!

getPokemons();

favouritesNav.addEventListener("click", () => {
    favouritesCatalogSection.classList.toggle("hidden")
    favouritesNav.classList.toggle("show");
});

favouritesSearchToggleBtn.addEventListener("click", () => {
    favouritesSearchSection.classList.toggle("hidden");
});
favouritesCatalogSection.addEventListener("click", (e) => {
    if(e.target.closest(".card")){
        const card = e.target.closest(".card");
        const details = card.querySelector(".card-details");
        details.classList.toggle("hidden")
        card.classList.toggle("expanded");
    }
})
mainSearchToggleBtn.addEventListener("click", () => {
    mainSearchSection.classList.toggle("hidden");
});

mainCatalogSection.addEventListener("click", (e) => {
   
    if(e.target.matches(".card-star, .card-star i")){
        const card = e.target.closest(".card");
        const starElement = card.querySelector(".card-star");
        starElement.classList.toggle("hidden");
        const cardTitle = card.querySelector(".card-title");
        // console.log(cardTitle)
        const pokemonName = cardTitle.textContent;
        handlefavourites(pokemonName);

    }else if(e.target.closest(".card")){
        const card = e.target.closest(".card")
        const details = card.querySelector(".card-details")
        card.classList.toggle("expanded")
        details.classList.toggle("hidden");
    }
})



// FUNCTIONS
async function handlefavourites(name){
    try{
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0")
        if(!response.ok){
            throw new Error(showCatalogMessage("cant get pokemon list"))
        }
        const data = await response.json();
        const pokemonList = data.results;
        
        const exists = favouritesList.some(favourite => favourite.name === name)
        if(!exists){
        const clickedPokemon = pokemonList.find( pokemon => pokemon.name === name);
        favouritesList.push(clickedPokemon);
        
        favouritesCatalog.innerHTML = "";
        rendertoCatalog(favouritesList, favouritesCatalog);
        
        }else{
            const removeIndex = favouritesList.findIndex(favourite => favourite.name === name);
            favouritesList.splice(removeIndex, 1);
           
            favouritesCatalog.innerHTML = "";
            rendertoCatalog(favouritesList, favouritesCatalog);
        }
    }catch(error){
        console.log(error)
    
    }
    
}
function showCatalogMessage(message){
    mainCatalogMessage.textContent = message;
}
async function getPokemons(){
    try{
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0")
        if(!response.ok){
            throw new Error(showCatalogMessage("cant get pokemon list"))
        }
        const data = await response.json();
        const pokemonList = data.results;
        
        rendertoCatalog(pokemonList, mainCatalog);


        mainSearchSection.addEventListener("input", (e) => {
            updateCatalog(e, filter, pokemonList, mainCatalog);
        });
        favouritesSearchSection.addEventListener("input", (e) => {
            updateCatalog(e, filter, pokemonList, mainCatalog);
        });

    }catch(error){
        console.log(error)
    
    }
    
}
async function updateCatalog(e, filter, list, catalog){
    if(e.target.matches("#favourite-catalog-input")){
                filter.searchText = e.target.value;
                console.log(filter.searchText);
                applyFilter(filter, list, catalog);
            }
            if(e.target.matches("#favourites-water-checkbox")){
                filter.water = e.target.checked;
                applyFilter(filter, list, catalog);
                
            }
            if(e.target.matches("#favourites-grass-checkbox")){
                filter.grass = e.target.checked;
                applyFilter(filter, list, catalog);
                
            }
            if(e.target.matches("#favourites-fire-checkbox")){
                filter.fire = e.target.checked;
                applyFilter(filter, list, catalog);
                
            }
}
async function applyFilter(filter, list, catalog){
    const filteredList = [];
   console.log(list)
    for(const pokemon of list){
              try{
        const response = await fetch(pokemon.url)
        if(!response.ok){
            throw new Error(response.status)
        }
        const pokemonInfo = await response.json();
        const typesObjList = pokemonInfo.types;
        const types = typesObjList.map(typeObj => typeObj = typeObj.type.name )
   
        const matchesText = pokemonInfo.name.includes(filter.searchText.toLowerCase()) || filter.searchText === "";
        
        const matchesWater = types.includes("water") || filter.water === false;
        const matchesGrass = types.includes("grass") || filter.grass === false;
        const matchesFire = types.includes("fire") || filter.fire === false;
        if(matchesText && matchesWater && matchesGrass && matchesFire){
            filteredList.push(pokemon)
        }
        }catch(error){
            console.log(error);
            showCatalogMessage("cant fetch pokemons to filter")
        }
    }
    
    catalog.innerHTML = "";
    rendertoCatalog(filteredList, catalog);

}
async function rendertoCatalog(list, catalog){
    
    for(const pokemon of list){
        const pokemonCard = await createCard(pokemon);
        if(catalog === favouritesCatalog){
            const star = pokemonCard.querySelector(".card-star");
            star.innerHTML = "";
        }
        catalog.appendChild(pokemonCard);
    }
}

async function createCard(pokemon){
    try{
        const response = await fetch(pokemon.url)
        if(!response.ok){
            throw new Error(response.status)
        }
        const pokemonInfo = await response.json();
        


        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        const types = createTypesElement(pokemonInfo.types)
        const abilites = createAbilitiesElement(pokemonInfo.abilities)
        const size = createSizeElement(pokemonInfo);
        const details = createDetailsElement(size, types, abilites)
        cardElement.innerHTML= `
            <div class="card-header">
                <div class="card-title">${pokemonInfo.name}</div>
                <div class="pokemon-id">#${pokemonInfo.id}</div>
                <span class="card-star"><i class="fa-regular fa-star"></i></span>
            </div>

            <div class="card-body">

                <img src="${pokemonInfo.sprites.front_default}" class = "card-pokemon-img" alt="pokemon image">
            </div>            
        `;

        cardElement.appendChild(details);
        
        return cardElement;

    }catch(error){
        console.log(error)
        showCatalogMessage("cant get pokemon info")
    }
}

function createTypesElement(types){
    const typesElement = document.createElement("div");
    typesElement.classList.add("detail-section");
    const typesLabelElement = document.createElement("div")
    typesLabelElement.textContent = "Types";
    typesLabelElement.classList.add("label");
    
    typesElement.appendChild(typesLabelElement);
    
    types.forEach( typeObj => {
        
        const typeElement = document.createElement("p");
        typeElement.classList.add("label");
        typeElement.classList.add("value-label");
        typeElement.textContent = typeObj.type.name;
        typesElement.appendChild(typeElement);
    })
   
    return typesElement;
}

function createAbilitiesElement(abilities){
    const abilitiesElement = document.createElement("div");
    abilitiesElement.classList.add("detail-section");
    const abilitiesLabelElement = document.createElement("div")
    abilitiesLabelElement.textContent = "Abilities";
    abilitiesLabelElement.classList.add("label");
    abilitiesElement.appendChild(abilitiesLabelElement);
    abilities.forEach( abilityObj => {
        // console.log(abilityObj.ability.name)
        const abilityElement = document.createElement("p");
        abilityElement.classList.add("label");
        abilityElement.classList.add("value-label");
        abilityElement.textContent = abilityObj.ability.name;
        abilitiesElement.appendChild(abilityElement);
    
    })
    return abilitiesElement;
}
function createSizeElement(pokemonInfo){
    const sizeElement = document.createElement("div");
    sizeElement.classList.add("detail-section");
    sizeElement.classList.add("card-size");
    sizeElement.innerHTML = `
          <div class="key-label label">height</div>
        <div class="value-label label">${pokemonInfo.height}</div>
        <div class="key-label label">weight</div>
        <div class="value-label label">${pokemonInfo.weight}</div>
    `;
    
    return sizeElement;
}
function createDetailsElement(size, types, abilites){
    const details = document.createElement("div");
    details.classList.add("card-details");
    details.classList.add("hidden");
    details.appendChild(size)
    details.appendChild(types)
    details.appendChild(abilites)
    return details
    
}


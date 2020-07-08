//Make it as easy as possible for the user to find the pokémon he wants to find
function fixQuery(query) {
	//remove all special characters that are not numbers or letters or dashes
	query = query.replace(/[^a-zA-Z0-9 -]/g, "");
	//change all spaces to dashes for cases like mr-mime, mime-jr
	query = query.replace(/\s+/g, '-');
	//change all uppercase to lowercase
	query = query.toLowerCase();
	return query;
}

//function for getting all the data of a single pokemon
function getPoke(query) {
	return new Promise((resolve) => {
		let url = "https://pokeapi.co/api/v2/pokemon/";
		fetch(url + query)
			.then(response => {
				return response.json();
			})
			.then(data => {
				resolve(data);
			})
			.catch(error =>{
				alert("Type the ID number or the name of a Pokémon.");
			});
	});
}

//Get the evolution chain url
function getEvoChain(url) {
	return new Promise((resolve) => {
		fetch(url)
			.then(response => {
				return response.json();
			})
			.then(data => {
				resolve(data.evolution_chain.url);
			});
	});
}

//Get the evolution chain data
function getEvo(url) {
	return new Promise((resolve) => {
		fetch(url)
			.then(response => {
				return response.json();
			})
			.then(data => {
				resolve(data);
			});
	});
}

//From the evolution chain data extract the names of all the evolution
function getEvoNames(evolutions) {
	let evolutionNames = [evolutions.chain.species.name];
	console.log(evolutionNames);
	if(evolutions.chain.evolves_to.length > 0){
		for (let i = 0; i < evolutions.chain.evolves_to.length; i++){
			evolutionNames.push(evolutions.chain.evolves_to[i].species.name);
		}
	} else{
		return evolutionNames;
	}
	if(evolutions.chain.evolves_to[0].evolves_to.length > 0){
		for (let i = 0; i < evolutions.chain.evolves_to[0].evolves_to.length; i++) {
			evolutionNames.push(evolutions.chain.evolves_to[0].evolves_to[i].species.name);
		}
	}
	return evolutionNames;
}

//With the names of all the evolutions, get the data of every pokemon using the previous getPoke function
function getEvoData(evolutionNames){
	console.log(evolutionNames);
	return new Promise((resolve) => {
		let promises = [];
		for(let i = 0; i < evolutionNames.length; i++){
			promises.push(getPoke(evolutionNames[i]).then(pokemon => {
				return pokemon;
			}));
		}
		Promise.all(promises).then((evoData) => {
			resolve(evoData);
		});
	});
}

//Use the data of the pokemon and it's evolution and display it on the page
//at the moment it's only logged
function render(pokeData, evoData) {
	let pokedex = document.getElementById('pokedex');

	//all the data of the pokemon and its evolutions
	console.log(pokeData);
	console.log(evoData);

	//empty the pokedex
	pokedex.innerHTML = "";

	//make the div where I put the pokémon info
	let pokeDiv = make("div", "pokemon", pokedex);
	displayImage(pokeData, pokeDiv);

	//make the div where I put the evolutions info
	let evosDiv = make("div","evolutions", pokedex);
	for(let i = 0; i < evoData.length; i++){
		let evoDiv = make("div","evolution", evosDiv);
		displayImage(evoData[i], evoDiv);
	}
}

//display the image of a pokemon in the target
function displayImage(pokemon, target){
	let src = pokemon.sprites.front_default;
	let img = make("img", "pokeImg", target);
	img.src = src;
}

//make an element, give it a class and put it in the target
function make(tagName, className, target){
	let element = document.createElement(tagName);
	element.classList.add(className);
	target.appendChild(element);
	return element;
}

//Activates every function we need to get and display the data of a pokemon and its evolutions when form submitted
document.getElementById("form").addEventListener('submit', function (e) {
	//stops the form from refreshing page
	e.preventDefault();
	let query = document.getElementById('search').value;
	query = fixQuery(query);
	//get the pokemon with fixed query
	getPoke(query).then(pokemon => {
		let pokeData = pokemon;
		//get evoChain url
		getEvoChain(pokemon.species.url).then(url => {
			//get evolution chain
			getEvo(url).then(evolutions => {
				//get names from chain
				let evoNames = getEvoNames(evolutions);
				//get data from names of chain
				getEvoData(evoNames).then(evoData =>{
					//display pokemon data and its evolution data
					render(pokeData, evoData);
				});
			});
		});
	});
});






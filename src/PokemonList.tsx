import { useState, useEffect, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { NewFeatureAlert } from "./NewFeatureAlert";
import axios from "axios";
import { PokemonListItem, PokemonListItemFromApi } from "./models";
import "./pokemon-list.css";

export const getImage = (number: number): string => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${number}.png`;
};

export const mapPokemonApiToPokemonView = (
  pokemon: PokemonListItemFromApi[]
): PokemonListItem[] => {
  return pokemon.map((pokemonItem: PokemonListItemFromApi, index: number) => {
    return {
      name: pokemonItem.name,
      imageUrl: getImage(index + 1),
      id: index + 1,
      isFav: false,
    };
  });
};

export const PokemonList = () => {
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
  const [isOnlyFavs, setOnlyFavs] = useState(false);
  const [hasDiscoveredFav, setHasDiscoveredFav] = useState(false);
  console.log(limit);
  // Necesitamos saber si el usuario ha hecho click alguna vez en algún pokemon
  // Podríamos ver si hay algún pokemon marcado como fav

  const filteredPokemon = !search
    ? pokemons
    : pokemons.filter((pokemon) => {
        const searchId = Number(search);

        if (Number.isNaN(searchId)) {
          return pokemon.name.includes(search);
        }

        return pokemon.id === searchId;
      });

  useEffect(() => {
    const fetchPokemons = async () => {
      const apiURL = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;
      console.log("llamando a la api");
      const response = await axios.get(apiURL);
      setPokemons(mapPokemonApiToPokemonView(response.data.results));
    };

    fetchPokemons();
  }, [limit]);

  const handlePokemonClick = (pokemonId: number) => {
    setHasDiscoveredFav(true);

    const newPokemonsMap = pokemons.map((pokemonInfo: PokemonListItem) => {
      if (pokemonId === pokemonInfo.id) {
        const newPokemonInfo = { ...pokemonInfo };
        newPokemonInfo.isFav = !pokemonInfo.isFav;
        return newPokemonInfo;
      }

      return pokemonInfo;
    });

    setPokemons(newPokemonsMap);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleClearClick = () => {
    setSearch("");
  };

  const handleIsOnlyFavClick = () => {
    console.log("you clicked favs");
    setIsOnlyFavs(!isOnlyFavs);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
  };

  return (
    <div>
      <div className="toolbox">
        <div>
          <input onChange={handleSearchInputChange} value={search} />
          <button onClick={handleClearClick}>limpiar</button>
        </div>
        <select onChange={handleLimitChange} value={limit}>
          <option>5</option>
          <option>50</option>
          <option>100</option>
          <option>250</option>
          <option>500</option>
          <option value="5000">Todos</option>
        </select>
        <div>
          <button onClick={handleFavClick}>OnlyFavs</button>
        </div>
      </div>
      <div className="pokemons">
        {!hasDiscoveredFav && <NewFeatureAlert />}
        {filteredPokemon.map((pokemon: PokemonListItem) => (
          <Link key={pokemon.id} to={`/pokemon/${pokemon.name}`}>
            <div className="pokemon">
              <img src={pokemon.imageUrl} />
              <p>{pokemon.name}</p>
              <i
                className="fa fa-heart"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  handlePokemonClick(pokemon.id);
                }}
                style={{
                  color: pokemon.isFav ? "red" : "black",
                  cursor: "pointer",
                }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

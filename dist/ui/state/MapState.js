import { createContext } from 'preact';
import { useState, useMemo } from 'preact/hooks';
export const MapStateContext = createContext({
map: null,
setMap: () => {},
tiles: [],
setTiles: () => {},
tokens: [],
setTokens: () => {},
fog: false,
setFog: () => {},
showMap: false,
setShowMap: () => {}
});
export const MapStateProvider = ({ children }) => {
const [map, setMap] = useState(null);
const [tiles, setTiles] = useState([]); // placeholder for future tile layers
const [tokens, setTokens] = useState([]);
const [fog, setFog] = useState(false);
const [showMap, setShowMap] = useState(false);
const contextValue = useMemo(() => ({
map,
setMap,
tiles,
setTiles,
tokens,
setTokens,
fog,
setFog,
showMap,
setShowMap
}), [map, tiles, tokens, fog, showMap]);
return (
<MapStateContext.Provider value={contextValue}>
{children}
</MapStateContext.Provider>
);
};
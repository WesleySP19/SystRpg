export const addToken = (tokens, setTokens, token) => {
const newTokens = [...tokens, token];
setTokens(newTokens);
};
export const removeToken = (tokens, setTokens, tokenId) => {
const newTokens = tokens.filter(t => t.id !== tokenId);
setTokens(newTokens);
};
export const toggleFog = (setFog, current) => {
setFog(!current);
};
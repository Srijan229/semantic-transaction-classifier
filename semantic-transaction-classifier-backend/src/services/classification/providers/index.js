const geminiProvider = require('./geminiProvider');

function getFallbackProvider() {
  return geminiProvider;
}

module.exports = {
  getFallbackProvider,
};

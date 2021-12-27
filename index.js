const rp = require('request-promise');

module.exports = async (url) => {
    return rp(url);
}
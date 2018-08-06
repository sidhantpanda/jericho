const config = require('./config');
const jsonfile = require('jsonfile');
const logger = require('./custom_modules/logger')(config.verbosity);
const uuid = require('uuid/v4');

logger.log(1, 'Reading request options file at', config.requestOptionsFile);

const requestPool = jsonfile.readFileSync(config.requestOptionsFile);
const total_requests = requestPool.length;

// Add uuid to all requests
for (let i = 0; i < total_requests; i++) {
  requestPool[i] = {
    uuid: uuid(),
    ...requestPool[i]
  }
}

logger.log(1, 'Request options file reading complete');
logger.log(1, 'Total requests in file:', total_requests);

module.exports = requestPool;
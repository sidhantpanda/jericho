const fs = require('fs');
const path = require('path');
const request = require('request');
const async = require('async');
const jsonfile = require('jsonfile');
const config = require('./config')
const allRequestPool = require('./requestPool');
const logger = require('./custom_modules/logger')(config.verbosity);
const utils = require('./custom_modules/utils');

const WORKBENCH_DIRECTORY = path.join(__dirname, 'workbench');
const REQUESTS_DIRECTORY = path.join(WORKBENCH_DIRECTORY, 'requests');
const RESPONSES_DIRECTORY = path.join(WORKBENCH_DIRECTORY, 'responses');

utils.mkdirp(WORKBENCH_DIRECTORY);
utils.mkdirp(REQUESTS_DIRECTORY);
utils.mkdirp(RESPONSES_DIRECTORY);

function getRequestsForExperiment(requestPool, experiment) {
  const total_request_pool_size = requestPool.length;
  let pool;
  if (experiment.randomize) {
    pool = utils.shuffleArray(requestPool);
  } else {
    pool = utils.clone(requestPool);
  }

  // if experiment.pool_size > pool.size
  //    make copies to satisfy
  // else
  //    
  // TODO validate that experiment.requests_per_iteration >= experiment.pool_size
  
}

const runAllExperiments = (experiments, callback) => {
  const total_experiments = experiments.length;
  async.eachOfSeries(experiments, (experiment, key, cb) => {
    logger.log(1, 'Running experiment', key + 1, 'of', total_experiments);
    runSingleExperiment({
      experiment_number: key + 1,
      ...experiment
    }, cb);
  }, callback);
};

const runSingleExperiment = (experiment, callback) => {
  let {
    experiment_number,
    name, // default uuidv4()
    pool_size, // default all requests
    randomize, // default true
    concurrency, // default 100
    iterations, // default 1
    requests_per_iteration // default all requests
  } = experiment;

  const iterationConfigs = [];

  for (let i = 0; i < iterations; i++) {
    iterationConfigs.push({
      iteration_name: name,
      iteration_number: i,
      experiment_number: experiment_number,
      concurrency: concurrency,
      requestPool: getRequestsForExperiment(allRequestPool, experiment)
    });
  }

  async.eachOfSeries(iterationConfigs, (iterationConfigs, key, cb) => {

  });
};

const runAllIterations = () => {};

const runSingleIteration = (iterationOptions, callback) => {
  const {
    iteration_name,
    iteration_number,
    experiment_number,
    requestPool,
    concurrency
  } = iterationOptions;

  const total_requests = requestPool.length;

  const requestLogFilename = ['requests', 'for', 'exp', experiment_number, 'iter', iteration_number, 'conc', concurrency].join('_');
  const requestLogFile = path.join(REQUESTS_DIRECTORY, requestLogFilename);
  jsonfile.writeFileSync(requestLogFile, requestPool);
  logger.log(1, 'Logged request options: ', requestLogFilename);

  const responseLogFilename = ['responses', 'for', 'exp', experiment_number, 'iter', iteration_number, 'conc', concurrency].join('_');
  const responseLogFile = path.join(RESPONSES_DIRECTORY, responseLogFilename);
  const writeStream = fs.createWriteStream(responseLogFile);
  async.eachOfLimit(requestPool, concurrency, (options, key, cb) => {
    logger.log(3, 'Making request', key + 1, '/', total_requests);

    const apiMethod = apiCallback => {
      logger.log(3, 'Making request', '(', key + 1, '/', total_requests, ',', concurrency, ')');
      request(options, (error, response, body) => {
        if (error) {
          logger.error(3, 'Error during try:', error);
        }

        apiCallback(error, {
          response,
          body
        });
      });
    }

    async.retry(config.apiRetries, apiMethod, (error, {
      response,
      body
    }) => {
      let result = {
        uuid: options.uuid,
        iteration_name: iteration_name,
        concurrency: concurrency,
        iteration: iteration_number,
        experiment_number: experiment_number,
        copy_id: options.copy_id ? options.copy_id : 0,
        isError: false
      };

      if (error) {
        logger.error(1, 'Error making request with uuid', options.uuid);
        logger.error(1, error);
        result = {
          ...result,
          isError: true,
          error: error
        };
      } else {
        result = {
          ...result,
          response: response,
          body: body,
        };
      }

      const toWrite = JSON.stringify(result) + '\n';
      writeStream.write(toWrite, 'utf-8');
      cb();
    })
  }, err => {
    if (err) {
      logger.error(1, 'Error runnig iteration:', err);
    } else {
      callback();
    }
  })
};

const baseIteration = {
  iteration_name: 'base',
  iteration_number: 'base',
  experiment_number: 'base',
  requestPool: allRequestPool,
  concurrency: 1
}

runSingleIteration(baseIteration, err => {
  if (!err) {
    runAllExperiments(config.experiments);
  } else {
    logger.error(1, 'Could not complete base iteration');
    logger.error(1, error);
  }
});
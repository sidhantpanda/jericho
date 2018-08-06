module.exports = {
    requestOptionsFile: '/Users/sidhantpanda/Code/github/jericho/tmp/options.json',
    loadTestServerHost: 'http://panda.fyi',
    verbosity: 2,
    apiRetries: 5, // default 5, min 0, max 10
    delayBetweenIterations: 15, // default: 15, unit: seconds
    baseIteration: {
      run: true,
      logFile: '', // default __dirname/worspace/responseLogs
    },
    // responseParser: 
    experiments: [{
      name: '1', // default uuidv4()
      pool_size: 100, // default all requests
      randomize: true, // default true
      concurrency: 100, // default 100
      iterations: 2, // default 1
      requests_per_iteration: 100 // default all requests
    }]
  }
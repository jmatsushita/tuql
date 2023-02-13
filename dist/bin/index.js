#!/usr/bin/env node
"use strict";

var _fs = _interopRequireDefault(require("fs"));
var _express = _interopRequireDefault(require("express"));
var _expressGraphql = require("express-graphql");
var _cors = _interopRequireDefault(require("cors"));
var _commandLineArgs = _interopRequireDefault(require("command-line-args"));
var _commandLineUsage = _interopRequireDefault(require("command-line-usage"));
var _graphql = require("graphql");
var _schema = require("../builders/schema");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const FilePath = path => {
  if (!_fs.default.existsSync(path)) {
    console.log('');
    console.error(` > File does not exist: ${path}`);
    process.exit();
  }
  return _fs.default.realpathSync(path);
};
const optionDefinitions = [{
  name: 'graphiql',
  alias: 'g',
  type: Boolean,
  description: 'Enable graphiql UI'
}, {
  name: 'db',
  type: FilePath,
  defaultValue: 'database.sqlite',
  description: 'Path to the sqlite database you want to create a graphql endpoint for'
}, {
  name: 'infile',
  type: FilePath,
  description: 'Path to a sql file to bootstrap an in-memory database with'
}, {
  name: 'port',
  alias: 'p',
  type: Number,
  defaultValue: 4000,
  description: 'Port to run on (Default: 4000)'
}, {
  name: 'schema',
  alias: 's',
  type: Boolean,
  description: 'Write string representation of schema to stdout'
}, {
  name: 'help',
  alias: 'h',
  type: Boolean,
  description: 'This help output'
}];
const options = (0, _commandLineArgs.default)(optionDefinitions);
if (options.help) {
  const usage = (0, _commandLineUsage.default)([{
    header: 'tuql',
    content: '{underline tuql} turns just about any sqlite database into a graphql endpoint, including inferring associations'
  }, {
    header: 'Basic usage',
    content: 'tuql --db path/to/db.sqlite'
  }, {
    header: 'Options',
    optionList: optionDefinitions
  }, {
    content: 'Project home: {underline https://github.com/bradleyboy/tuql}'
  }]);
  console.log(usage);
  process.exit();
}
const promise = options.infile ? (0, _schema.buildSchemaFromInfile)(options.infile) : (0, _schema.buildSchemaFromDatabase)(options.db);
if (options.schema) {
  promise.then(schema => process.stdout.write((0, _graphql.printSchema)(schema)));
} else {
  const app = (0, _express.default)();
  const message = options.infile ? `Creating in-memory database with ${options.infile}` : `Reading schema from ${options.db}`;
  console.log('');
  console.log(` > ${message}`);
  promise.then(schema => {
    app.use('/graphql', (0, _cors.default)(), (0, _expressGraphql.graphqlHTTP)({
      schema,
      graphiql: options.graphiql
    }));
    app.listen(options.port, () => console.log(` > Running at http://localhost:${options.port}/graphql`));
  });
}
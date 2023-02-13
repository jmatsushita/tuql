"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSchemaFromInfile = exports.buildSchemaFromDatabase = void 0;
var _fs = _interopRequireDefault(require("fs"));
var _graphql = require("graphql");
var _graphqlSequelize = require("graphql-sequelize");
var _dataloaderSequelize = require("dataloader-sequelize");
var _pluralize = require("pluralize");
var _sequelize = _interopRequireWildcard(require("sequelize"));
var _definitions = _interopRequireDefault(require("./definitions"));
var _utils = require("../utils");
var _associations = require("./associations");
var _arguments = require("./arguments");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Tell `graphql-sequelize` where to find the DataLoader context in the
// global request context which will be passed by graphql-mesh
_graphqlSequelize.resolver.contextToOptions = {
  [_dataloaderSequelize.EXPECTED_OPTIONS_KEY]: _dataloaderSequelize.EXPECTED_OPTIONS_KEY
};
const GenericResponseType = new _graphql.GraphQLObjectType({
  name: 'GenericResponse',
  fields: {
    success: {
      type: _graphql.GraphQLBoolean
    }
  }
});
const buildSchemaFromDatabase = databaseFile => {
  return new Promise(async (resolve, reject) => {
    const db = new _sequelize.default({
      dialect: 'sqlite',
      storage: databaseFile,
      logging: false
    });
    resolve(await build(db));
  });
};
exports.buildSchemaFromDatabase = buildSchemaFromDatabase;
const buildSchemaFromInfile = infile => {
  return new Promise(async (resolve, reject) => {
    const db = new _sequelize.default({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    });
    const contents = _fs.default.readFileSync(infile);
    const statements = contents.toString().split(/;(\r?\n|\r)/g).filter(s => s.trim().length);
    for (let stmt of statements) {
      await db.query(stmt);
    }
    resolve(await build(db));
  });
};
exports.buildSchemaFromInfile = buildSchemaFromInfile;
const build = db => {
  return new Promise(async (resolve, reject) => {
    const models = {};
    let associations = [];
    const rows = await db.query('SELECT name FROM sqlite_master WHERE type = "table" AND name NOT LIKE "sqlite_%"', {
      type: _sequelize.QueryTypes.SELECT
    });
    const tables = rows.map(({
      name
    }) => name);
    for (let table of tables) {
      const [info] = await db.query(`PRAGMA table_info("${table}")`);
      const foreignKeys = await db.query(`PRAGMA foreign_key_list("${table}")`);
      if ((0, _utils.isJoinTable)(table, tables)) {
        associations = associations.concat((0, _associations.joinTableAssociations)(table, info, foreignKeys));
      } else {
        models[table] = db.define(table, (0, _definitions.default)(info, table), {
          timestamps: false,
          tableName: table
        });
        associations = associations.concat((0, _associations.tableAssociations)(table, info, foreignKeys));
      }
    }
    associations.forEach(({
      from,
      to,
      type,
      options
    }) => {
      const key = type === 'belongsTo' ? (0, _pluralize.singular)(to) : to;
      const fromKey = (0, _utils.findModelKey)(from, models);
      const toKey = (0, _utils.findModelKey)(to, models);
      models[fromKey][key] = models[fromKey][type](models[toKey], options);
    });
    const types = {};
    const mutations = {};
    const queries = {};
    Object.keys(models).forEach(key => {
      const model = models[key];
      const fieldAssociations = {
        hasMany: associations.filter(({
          type
        }) => type === 'hasMany').filter(({
          from
        }) => from === key).map(({
          to
        }) => models[to]),
        belongsTo: associations.filter(({
          type
        }) => type === 'belongsTo').filter(({
          from
        }) => from === key).map(({
          to
        }) => models[to]),
        belongsToMany: associations.filter(({
          type
        }) => type === 'belongsToMany').map(({
          from,
          to
        }) => [from, to]).filter(sides => sides.includes(key))
      };
      const type = new _graphql.GraphQLObjectType({
        name: (0, _utils.formatTypeName)(model.name),
        fields() {
          const fields = (0, _graphqlSequelize.attributeFields)(model);
          fieldAssociations.hasMany.forEach(associatedModel => {
            fields[(0, _utils.formatFieldName)(associatedModel.name)] = {
              type: new _graphql.GraphQLList(types[associatedModel.name]),
              args: (0, _graphqlSequelize.defaultListArgs)(model[associatedModel.name]),
              resolve: (0, _graphqlSequelize.resolver)(model[associatedModel.name])
            };
          });
          fieldAssociations.belongsTo.forEach(associatedModel => {
            const fieldName = (0, _pluralize.singular)(associatedModel.name);
            fields[(0, _utils.formatFieldName)(fieldName)] = {
              type: types[associatedModel.name],
              resolve: (0, _graphqlSequelize.resolver)(model[fieldName])
            };
          });
          fieldAssociations.belongsToMany.forEach(sides => {
            const [other] = sides.filter(side => side !== model.name);
            fields[(0, _utils.formatFieldName)(other)] = {
              type: new _graphql.GraphQLList(types[other]),
              resolve: (0, _graphqlSequelize.resolver)(model[other])
            };
          });
          return fields;
        }
      });
      types[key] = type;
      queries[(0, _utils.formatFieldName)(key)] = {
        type: new _graphql.GraphQLList(type),
        args: (0, _graphqlSequelize.defaultListArgs)(model),
        resolve: (0, _graphqlSequelize.resolver)(model)
      };
      queries[(0, _pluralize.singular)((0, _utils.formatFieldName)(key))] = {
        type,
        args: (0, _graphqlSequelize.defaultArgs)(model),
        resolve: (0, _graphqlSequelize.resolver)(model)
      };
      mutations[`create${type}`] = {
        type,
        args: (0, _arguments.makeCreateArgs)(model),
        resolve: async (obj, values, info) => {
          const options = {
            // By default sequelize will insert all columns which can cause a
            // bug where default values, that use functions, defined at the
            // database layer don't get populated correctly.
            fields: Object.keys(values)
          };
          const thing = await model.create(values, options);
          return thing;
        }
      };
      mutations[`update${type}`] = {
        type,
        args: (0, _arguments.makeUpdateArgs)(model),
        resolve: async (obj, values, info) => {
          const pkKey = (0, _arguments.getPkFieldKey)(model);
          const thing = await model.findOne({
            where: {
              [pkKey]: values[pkKey]
            }
          });
          await thing.update(values);
          return thing;
        }
      };
      mutations[`delete${type}`] = {
        type: GenericResponseType,
        args: (0, _arguments.makeDeleteArgs)(model),
        resolve: async (obj, values, info) => {
          const thing = await model.findOne({
            where: values
          });
          await thing.destroy();
          return {
            success: true
          };
        }
      };
      fieldAssociations.belongsToMany.forEach(sides => {
        const [other] = sides.filter(side => side !== model.name);
        const nameBits = [(0, _utils.formatTypeName)(model.name), (0, _utils.formatTypeName)(other)];
        ['add', 'remove'].forEach(prefix => {
          const connector = prefix === 'add' ? 'To' : 'From';
          const name = `${prefix}${nameBits.join(connector)}`;
          mutations[name] = {
            type: GenericResponseType,
            args: (0, _arguments.makePolyArgs)(model, models[other]),
            resolve: async (obj, values, info) => {
              const key = (0, _arguments.getPkFieldKey)(model);
              const [,, otherArgumentKey] = (0, _arguments.getPolyKeys)(model, models[other]);
              const thingOne = await model.findByPk(values[key]);
              const thingTwo = await models[other].findByPk(values[otherArgumentKey]);
              const method = `${prefix}${(0, _utils.pascalCase)((0, _pluralize.singular)(other))}`;
              await thingOne[method](thingTwo);
              return {
                success: true
              };
            }
          };
        });
      });
    });
    const query = new _graphql.GraphQLObjectType({
      name: 'Query',
      fields: queries
    });
    const mutation = new _graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: mutations
    });
    const schema = new _graphql.GraphQLSchema({
      query,
      mutation
    });
    const dataloaderContext = (0, _dataloaderSequelize.createContext)(db);
    const contextVariables = {
      [_dataloaderSequelize.EXPECTED_OPTIONS_KEY]: dataloaderContext
    };
    resolve({
      schema,
      contextVariables
    });
  });
};
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeUpdateArgs = exports.makePolyArgs = exports.makeDeleteArgs = exports.makeCreateArgs = exports.getPolyKeys = exports.getPkFieldKey = void 0;
var _graphqlSequelize = require("graphql-sequelize");
var _pluralize = require("pluralize");
var _graphql = require("graphql");
var _camelcase = _interopRequireDefault(require("../utils/camelcase"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const getPkFieldKey = model => {
  return Object.keys(model.rawAttributes).find(key => {
    const attr = model.rawAttributes[key];
    return attr.primaryKey;
  });
};
exports.getPkFieldKey = getPkFieldKey;
const makeCreateArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const pk = getPkFieldKey(model);
  delete fields[pk];
  return fields;
};
exports.makeCreateArgs = makeCreateArgs;
const makeUpdateArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  return Object.keys(fields).reduce((acc, key) => {
    const field = fields[key];
    if (field.type instanceof _graphql.GraphQLNonNull) {
      field.type = field.type.ofType;
    }
    acc[key] = field;
    return acc;
  }, fields);
};
exports.makeUpdateArgs = makeUpdateArgs;
const makeDeleteArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const pk = getPkFieldKey(model);
  return {
    [pk]: fields[pk]
  };
};
exports.makeDeleteArgs = makeDeleteArgs;
const getPolyKeys = (model, otherModel) => {
  const key = getPkFieldKey(model);
  const otherKey = getPkFieldKey(otherModel);
  if (otherKey === key) {
    return [key, otherKey, (0, _camelcase.default)(`${(0, _pluralize.singular)(otherModel.name)}_${otherKey}`)];
  }
  return [key, otherKey, otherKey];
};
exports.getPolyKeys = getPolyKeys;
const makePolyArgs = (model, otherModel) => {
  const [key, otherKey, otherKeyFormatted] = getPolyKeys(model, otherModel);
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const otherFields = (0, _graphqlSequelize.attributeFields)(otherModel);
  return {
    [key]: fields[key],
    [otherKeyFormatted]: otherFields[otherKey]
  };
};
exports.makePolyArgs = makePolyArgs;
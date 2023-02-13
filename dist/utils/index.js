"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pascalCase = exports.isJoinTable = exports.formatTypeName = exports.formatFieldName = exports.findModelKey = void 0;
var _pluralize = require("pluralize");
var _camelcase = _interopRequireDefault(require("./camelcase"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const isJoinTable = (tableName, tableList) => {
  const sides = tableName.split('_').map(_pluralize.plural);
  if (sides.length !== 2) {
    return false;
  }
  const [one, two] = sides;
  return tableList.includes(one) && tableList.includes(two);
};
exports.isJoinTable = isJoinTable;
const formatTypeName = name => {
  return pascalCase((0, _pluralize.singular)(name));
};
exports.formatTypeName = formatTypeName;
const pascalCase = string => {
  const cameled = (0, _camelcase.default)(string);
  return cameled.substr(0, 1).toUpperCase() + cameled.substr(1);
};
exports.pascalCase = pascalCase;
const findModelKey = (key, models) => {
  if (models[key]) {
    return key;
  }
  const pluralKey = (0, _pluralize.plural)(key);
  if (models[pluralKey]) {
    return pluralKey;
  }
  const singularKey = (0, _pluralize.singular)(key);
  if (models[singularKey]) {
    return singularKey;
  }
  throw Error(`Model with ${key} does not exist`);
};
exports.findModelKey = findModelKey;
const formatFieldName = _camelcase.default;
exports.formatFieldName = formatFieldName;
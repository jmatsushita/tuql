"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const camelcase = string => string[0].toLowerCase() + string.slice(1).replace(/(_\p{L})/gu, (match, group) => group[1].toUpperCase());
var _default = camelcase;
exports.default = _default;
"use strict";

var _sequelize = require("sequelize");
var _definitions = _interopRequireDefault(require("../builders/definitions"));
var _index = require("../utils/index");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
describe('definitions', () => {
  it('detects join tables', () => {
    expect((0, _index.isJoinTable)('posts')).toEqual(false);
    expect((0, _index.isJoinTable)('post_author', ['posts', 'authors'])).toEqual(true);
    expect((0, _index.isJoinTable)('post_author', ['posts'])).toEqual(false);
  });
  it('It finds a model key', () => {
    expect((0, _index.findModelKey)('test', {
      test: 1
    })).toEqual('test');
    expect((0, _index.findModelKey)('posts', {
      post: 1
    })).toEqual('post');
    expect((0, _index.findModelKey)('post', {
      posts: 1
    })).toEqual('posts');
  });
  it('It throws when a model key is not found', () => {
    expect(() => {
      (0, _index.findModelKey)('foo', {
        posts: 1
      });
    }).toThrow('Model with foo does not exist');
  });
});
describe('formatting', () => {
  it('formats a type name', () => {
    expect((0, _index.formatTypeName)('posts')).toEqual('Post');
  });
  it('formats a type name with more complexity', () => {
    expect((0, _index.formatTypeName)('post_author')).toEqual('PostAuthor');
  });
});
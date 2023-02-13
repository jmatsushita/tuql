"use strict";

var _sequelize = require("sequelize");
var _definitions = _interopRequireDefault(require("../builders/definitions"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
describe('definitions', () => {
  it('does the thing', () => {
    const results = (0, _definitions.default)([{
      name: 'AlbumId',
      pk: 1,
      type: 'TEXT'
    }, {
      name: 'post_id',
      pk: 0,
      type: 'INTEGER'
    }]);
    expect(results).toEqual({
      albumId: {
        field: 'AlbumId',
        primaryKey: true,
        type: _sequelize.TEXT,
        allowNull: true,
        autoIncrement: false,
        defaultValue: undefined
      },
      postId: {
        field: 'post_id',
        primaryKey: false,
        type: _sequelize.INTEGER,
        allowNull: true,
        autoIncrement: false,
        defaultValue: undefined
      }
    });
  });
  it('does the thing with int pks', () => {
    const results = (0, _definitions.default)([{
      name: 'AlbumId',
      pk: 1,
      type: 'INTEGER'
    }, {
      name: 'post_id',
      pk: 0,
      type: 'INTEGER'
    }]);
    expect(results).toEqual({
      albumId: {
        field: 'AlbumId',
        primaryKey: true,
        type: _sequelize.INTEGER,
        allowNull: true,
        autoIncrement: true,
        defaultValue: undefined
      },
      postId: {
        field: 'post_id',
        primaryKey: false,
        type: _sequelize.INTEGER,
        allowNull: true,
        autoIncrement: false,
        defaultValue: undefined
      }
    });
  });
});
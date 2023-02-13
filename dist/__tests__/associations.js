"use strict";

var _associations = require("../builders/associations");
describe('associations', () => {
  it('creates a basic association without fk info', () => {
    expect((0, _associations.tableAssociations)('posts', [{
      name: 'user_id'
    }], [])).toEqual([{
      from: 'users',
      to: 'posts',
      type: 'hasMany',
      options: {
        foreignKey: 'userId'
      }
    }, {
      from: 'posts',
      to: 'users',
      type: 'belongsTo',
      options: {
        foreignKey: 'userId'
      }
    }]);
  });
  it('creates a associations using fk info', () => {
    expect((0, _associations.tableAssociations)('posts', [], [{
      table: 'users',
      from: 'UserId'
    }])).toEqual([{
      from: 'users',
      to: 'posts',
      type: 'hasMany',
      options: {
        foreignKey: 'userId'
      }
    }, {
      from: 'posts',
      to: 'users',
      type: 'belongsTo',
      options: {
        foreignKey: 'userId'
      }
    }]);
  });
});
describe('join associations', () => {
  it('creates a basic join association without fk info', () => {
    expect((0, _associations.joinTableAssociations)('post_user', [{
      name: 'post_id'
    }, {
      name: 'user_id'
    }], [])).toEqual([{
      from: 'posts',
      to: 'users',
      type: 'belongsToMany',
      options: {
        through: 'post_user',
        foreignKey: 'post_id',
        timestamps: false
      }
    }, {
      from: 'users',
      to: 'posts',
      type: 'belongsToMany',
      options: {
        through: 'post_user',
        foreignKey: 'user_id',
        timestamps: false
      }
    }]);
  });
  it('creates a join associations using fk info', () => {
    expect((0, _associations.joinTableAssociations)('post_user', [], [{
      table: 'posts',
      from: 'post_id'
    }, {
      table: 'users',
      from: 'user_id'
    }])).toEqual([{
      from: 'posts',
      to: 'users',
      type: 'belongsToMany',
      options: {
        through: 'post_user',
        foreignKey: 'post_id',
        timestamps: false
      }
    }, {
      from: 'users',
      to: 'posts',
      type: 'belongsToMany',
      options: {
        through: 'post_user',
        foreignKey: 'user_id',
        timestamps: false
      }
    }]);
  });
});
"use strict";

var _sequelize = _interopRequireWildcard(require("sequelize"));
var _arguments = require("../builders/arguments");
var _graphql = require("graphql");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const db = new _sequelize.default({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});
const model = db.define('posts', {
  id: {
    type: _sequelize.INTEGER,
    primaryKey: true
  },
  title: {
    type: _sequelize.TEXT,
    allowNull: true
  },
  userId: {
    type: _sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});
const model2 = db.define('categories', {
  id: {
    type: _sequelize.INTEGER,
    primaryKey: true
  },
  title: {
    type: _sequelize.TEXT,
    allowNull: true
  },
  userId: {
    type: _sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});
describe('getPkField', () => {
  it('detects the primary key key', () => {
    const pk = (0, _arguments.getPkFieldKey)(model);
    expect(pk).toBe('id');
  });
  it('makeCreateArgs', () => {
    const args = (0, _arguments.makeCreateArgs)(model);
    expect(args).toEqual({
      title: {
        type: _graphql.GraphQLString
      },
      userId: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      }
    });
  });
  it('makeUpdateArgs', () => {
    const args = (0, _arguments.makeUpdateArgs)(model);
    expect(args).toEqual({
      id: {
        type: _graphql.GraphQLInt
      },
      title: {
        type: _graphql.GraphQLString
      },
      userId: {
        type: _graphql.GraphQLInt
      }
    });
  });
  it('makeDeleteArgs', () => {
    const args = (0, _arguments.makeDeleteArgs)(model);
    expect(args).toEqual({
      id: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      }
    });
  });
  it('makePolyArgs', () => {
    const args = (0, _arguments.makePolyArgs)(model, model2);
    expect(args).toEqual({
      id: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      },
      categoryId: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      }
    });
  });
  it('makePolyArgs with non-equal keys', () => {
    const posts = db.define('posts', {
      postId: {
        type: _sequelize.INTEGER,
        primaryKey: true
      }
    }, {
      timestamps: false
    });
    const categories = db.define('categories', {
      categoryId: {
        type: _sequelize.INTEGER,
        primaryKey: true
      }
    }, {
      timestamps: false
    });
    const args = (0, _arguments.makePolyArgs)(posts, categories);
    expect(args).toEqual({
      postId: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      },
      categoryId: {
        type: new _graphql.GraphQLNonNull(_graphql.GraphQLInt)
      }
    });
  });
});
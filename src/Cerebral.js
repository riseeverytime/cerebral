'use strict';

/*
  TODO:
    - [OPTIMIZE] If setting the same value, avoid doing extra work
    - Allow objects in mixin
    - Normal mixin
*/
var utils = require('./utils.js');
var React = require('react');
var EventEmitter = require('events').EventEmitter;
var traverse = require('./core/traverse.js');
var StoreObject = require('./core/StoreObject.js');
var createHelpers = require('./core/createHelpers.js');
var createSignalMethod = require('./core/createSignalMethod.js');
var createFacetMethod = require('./core/createFacetMethod.js');
var createMutationMethods = require('./core/createMutationMethods.js');
var CerebralDebugger = React.createFactory(require('./Debugger.js'));

function Cerebral(state) {

  if (!state || (typeof state !== 'object' || Array.isArray(state) || state === null)) {
    throw new Error('You have to pass an object to the cerebral');
  }


  var emitter = new EventEmitter();
  var cerebral = Object.create(emitter);
  var helpers = createHelpers(state, cerebral);
  var facets = {};

  cerebral.signals = {};
  
  cerebral.signal = createSignalMethod(helpers, cerebral);
  cerebral.facet = createFacetMethod(cerebral, facets, helpers);

  cerebral.hasExecutingAsyncSignals = function () {
    return helpers.eventStore.hasExecutingAsyncSignals;
  };

  cerebral.injectInto = function (component) {
    var Wrapper = React.createClass({
      childContextTypes: {
        cerebral: React.PropTypes.object
      },
      getChildContext: function () {
        return {
          cerebral: cerebral
        };
      },
      render: function () {
        return React.DOM.div(null,
          React.DOM.div({
            style: {
              paddingRight: '400px'
            }
          }, React.createElement(component, this.props)),
          CerebralDebugger()
        );
      }
    });

    return Wrapper;
  };

  // Go back in time
  cerebral.remember = function(index) {
    return helpers.eventStore.travel(index, helpers.currentState);
  };

  // Get signals and mutations done to cerebral
  cerebral.getMemories = function() {
    return {
      signals: helpers.eventStore.signals.slice(0),
      mutations: helpers.eventStore.mutations.slice(0)
    };
  };

  cerebral.getMemoryIndex = function () {
    return helpers.eventStore.currentIndex;
  };

  cerebral.extractState = function () {
    return helpers.currentState.toJS();
  };

  cerebral.get = function(path) {
    if (!path) {
      throw new Error('You have to pass a path to the get method');
    }
    if (typeof path === 'string') {
      path = [].slice.call(arguments);
    }
    
    var facetPath = utils.getFacetPath(path, facets);
    if (facetPath) {
      return facetPath();
    }
    return utils.getPath(path, helpers.currentState);
  };

  createMutationMethods(helpers, cerebral);

  return cerebral;

}


module.exports = Cerebral;

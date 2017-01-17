/**
 * promise-mini v0.1.1
 * (c) 2017 Yang Mingshan
 * Released under the MIT License.
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Promise = factory());
}(this, (function() { 'use strict';

  function findIndex() {
    return Array.prototype.findIndex || function(fn, thisArg) {
      var list = Object(this);
      for (var i = 0; i < list.length; i++) {
        if (fn.call(thisArg, list[i], i, list)) return i;
      }
      return -1;
    };
  }

  function Promise(resolver) {
    var handlers = [];

    var resolve = function(data) {
      var i = findIndex().call(handlers, function(handler) { return handler.type === 'ok'; });
      if (i === -1) return;
      var result = handlers[i].fn(data);
      handlers = handlers.slice(i + 1);
      result && result._then ? result._then(handlers) : resolve(result);
    };

    var reject = function(data) {
      var i = findIndex().call(handlers, function(handler) { return handler.type === 'error'; });
      if (i === -1) return;
      var result = handlers[i].fn(data);
      handlers = handlers.slice(i + 1);
      result && result._then ? result._then(handlers) : resolve(result);
    };

    this.then = function(okHandler, errHandler) {
      okHandler && handlers.push({ type: 'ok', fn: okHandler });
      errHandler && handlers.push({ type: 'error', fn: errHandler });
      return this;
    };

    this._then = function(handlerList) {
      handlers = handlerList;
    };

    resolver(resolve, reject);
  }


  Promise.prototype.catch = function(errHandler) {
    return this.then(null, errHandler);
  };

  Promise.resolve = function(data) {
    return new Promise(function(resolve) {
      setTimeout(function() { resolve(data); });
    });
  };

  Promise.reject = function(data) {
    return new Promise(function(resolve, reject) {
      setTimeout(function() { reject(data); });
    });
  };

  Promise.all = function(promises) {
    return new Promise(function(resolve, reject) {
      var complete = false;
      var results = [];
      var pending = promises.length;
      for (var i = 0; i < promises.length; i++) {
        (function(index) {
          promises[index].then(function(data) {
            if (complete) return;
            results[index] = data;
            pending--;
            if (!pending) resolve(results);
          }).catch(function(data) {
            if (complete) return;
            complete = true;
            reject(data);
          });
        })(i);
      }
    });
  }

  Promise.race = function(promises) {
    return new Promise(function(resolve, reject) {
      var complete = false;
      for (var i = 0; i < promises.length; i++) {
        promises[i].then(function(data) {
          if (complete) return;
          complete = true;
          resolve(data);
        }).catch(function(data) {
          if (complete) return;
          complete = true;
          reject(data);
        });
      }
    });
  }

  return Promise;

})));

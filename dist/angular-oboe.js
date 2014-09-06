'use strict';
angular.module('ngOboe', []).service('Oboe', [
  'OboeStream',
  function (OboeStream) {
    // the passed parameters object need to have a Url and a pattern.
    // all parameters consumed by the oboe module can be consumed
    // the url needs to return a json stream. see the oboe documentation
    // the pattern contains a path which selects json objects from the stream
    // the pagesize parameter determines how many JSON objects need to be received before the controller gets updated. Defaults to 100.
    return function (params) {
      // initialize the data
      var data = [];
      // add the data page by page using a stream
      OboeStream.search(params, function (page) {
        // a page of records is received.
        // add each record to the data
        _.each(page, function (record) {
          data.push(record);
        });
      });
      return data;
    };
  }
]).factory('OboeStream', [
  '$q',
  function ($q) {
    return {
      search: function (params, callback) {
        // the defer will be resolved immediately
        var defer = $q.defer();
        var promise = defer.promise;
        // counter for the received records
        var counter = 0;
        // I use an arbitrary page size.
        var pagesize = params.pagesize || 100;
        // initialize the page of records
        var page = [];
        // call the oboe function to start the stream
        oboe(params).start(function () {
          defer.resolve();
        }).node(params.pattern || '.', function (node) {
          //  we push the node to the page
          page.push(node);
          counter++;
          // if the pagesize is reached return the page using the promise
          if (counter % pagesize === 0) {
            promise.then(callback(page));
            // initialize the page
            page = [];
          }
        }).done(function () {
          // when the stream is done make sure the last page of nodes is returned
          promise.then(callback(page));
        });
        return promise;
      }
    };
  }
]);
'use strict';
angular.module('copayApp.services')
  .factory('bitcoreDash', function bitcoreFactory(bwcService) {
    var bitcoreDash = bwcService.getBitcoreDash();
    return bitcoreDash;
  });

'use strict';
angular.module('copayApp.services')
  .factory('bitcoreNano', function bitcoreFactory(bwcService) {
    var bitcoreNano = bwcService.getBitcoreNano();
    return bitcoreNano;
  });

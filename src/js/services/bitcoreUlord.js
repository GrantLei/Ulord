'use strict';
angular.module('copayApp.services')
  .factory('bitcoreUlord', function bitcoreFactory(bwcService) {
    var bitcoreUlord = bwcService.getBitcoreUlord();
    console.log('bitcoreUlord = '+ bitcoreUlord);
    return bitcoreUlord;
  });

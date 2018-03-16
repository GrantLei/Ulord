'use strict';

angular.module('copayApp.directives')
  .directive('walletSelector', function($timeout, lodash) {
    return {
      restrict: 'E',
      templateUrl: 'views/includes/walletSelector.html',
      transclude: true,
      scope: {
        title: '=walletSelectorTitle',
        show: '=walletSelectorShow',
        wallets: '=walletSelectorWallets',
        selectedWallet: '=walletSelectorSelectedWallet',
        onSelect: '=walletSelectorOnSelect'
      },
      link: function(scope, element, attrs) {

        var separeWallets = function() {
          scope.walletsBtc = [];
          scope.walletsBch = [];
          scope.walletsDash = [];
          scope.walletsNano = [];
          scope.walletsUlord = [];
           if (!scope.wallets) return;
          for(var i = 0; i < scope.wallets.length; i++) {
            if (scope.wallets[i]) {
              if (scope.wallets[i].coin == 'btc'){
                scope.walletsBtc.push(scope.wallets[i]);
              }else if(scope.wallets[i].coin == 'dash') {
                scope.walletsDash.push(scope.wallets[i]);
              }else if(scope.wallets[i].coin == 'Nano') {
                scope.walletsNano.push(scope.wallets[i]);
              }else if(scope.wallets[i].coin == 'Ulord') {
                scope.walletsUlord.push(scope.wallets[i]);
              }else {
                scope.walletsBch.push(scope.wallets[i]);
              }
            }
          }
        }

        // scope.$watch('wallets', function(newVal, oldVal) {
        //   var isEqual = lodash.isEqual(newVal, oldVal);
        //   console.log('isqual='+isEqual);
        //   if (!isEqual) separeWallets();
        // });

        scope.hide = function() {
          scope.show = false;
        };
        scope.selectWallet = function(wallet) {
          $timeout(function() {
            scope.hide();
          }, 100);
          scope.onSelect(wallet);
        };

        separeWallets();
      }
    };
  });

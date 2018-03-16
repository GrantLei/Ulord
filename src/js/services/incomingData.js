'use strict';

angular.module('copayApp.services').factory('incomingData', function($log, $state, $timeout, $ionicHistory, bitcore, bitcoreCash, bitcoreNano,bitcoreUlord,$rootScope, payproService, scannerService, appConfigService, popupService, gettextCatalog) {

  var root = {};

  root.showMenu = function(data) {
    $rootScope.$broadcast('incomingDataMenu.showMenu', data);
  };

  root.redir = function(data) {
    $log.debug('Processing incoming data: ' + data);

    function sanitizeUri(data) {
      // Fixes when a region uses comma to separate decimals
      var regex = /[\?\&]amount=(\d+([\,\.]\d+)?)/i;
      var match = regex.exec(data);
      if (!match || match.length === 0) {
        return data;
      }
      var value = match[0].replace(',', '.');
      var newUri = data.replace(regex, value);

      // mobile devices, uris like copay://glidera
      newUri.replace('://', ':');

      return newUri;
    }

    function getParameterByName(name, url) {
      if (!url) return;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function checkPrivateKey(privateKey) {
      try {
        new bitcoreNano.PrivateKey(privateKey, 'main');
      } catch (err) {
        return false;
      }
      return true;
    }

    function goSend(addr, amount, message, coin) {
      $state.go('tabs.send', {}, {
        'reload': true,
        'notify': $state.current.name == 'tabs.send' ? false : true
      });
      // Timeout is required to enable the "Back" button
      $timeout(function() {
        if (amount) {
          $state.transitionTo('tabs.send.confirm', {
            toAmount: amount,
            toAddress: addr,
            description: message,
            coin: coin
          });
        } else {
          $state.transitionTo('tabs.send.amount', {
            toAddress: addr,
            coin: coin
          });
        }
      }, 100);
    }
    // data extensions for Payment Protocol with non-backwards-compatible request
    // if ((/^bitcoin(nano)?:\?r=[\w+]/).exec(data)) {
    //   var coin = 'Nano';
    //   if (data.indexOf('bitcoinnano') === 0) coin = 'Nano';
    //
    //   data = decodeURIComponent(data.replace(/bitcoin(nano)?:\?r=/, ''));
    //
    //   payproService.getPayProDetails(data, function(err, details) {
    //     if (err) {
    //       popupService.showAlert(gettextCatalog.getString('Error'), err);
    //     } else handlePayPro(details, coin);
    //   });
    //
    //   return true;
    // }
    // if ((/^bitcoin(ulord)?:\?r=[\w+]/).exec(data)) {
    //   var coin = 'Ulord';
    //   if (data.indexOf('bitcoinulord') === 0) coin = 'Ulord';
    //
    //   data = decodeURIComponent(data.replace(/bitcoin(ulord)?:\?r=/, ''));
    //
    //   payproService.getPayProDetails(data, function(err, details) {
    //     if (err) {
    //       popupService.showAlert(gettextCatalog.getString('Error'), err);
    //     } else handlePayPro(details, coin);
    //   });
    //
    //   return true;
    // }
    // if ((/^bitcoin(cash)?:\?r=[\w+]/).exec(data)) {
    //   var coin = 'btc';
    //   if (data.indexOf('bitcoincash') === 0) coin = 'bch';
    //
    //   data = decodeURIComponent(data.replace(/bitcoin(cash)?:\?r=/, ''));
    //
    //   payproService.getPayProDetails(data, function(err, details) {
    //     if (err) {
    //       popupService.showAlert(gettextCatalog.getString('Error'), err);
    //     } else handlePayPro(details, coin);
    //   });
    //
    //   return true;
    // }

    data = sanitizeUri(data);

    // Bitcoin  URL
    // if (bitcore.URI.isValid(data)) {
    //     var coin = 'btc';
    //     var parsed = new bitcore.URI(data);
    //
    //     var addr = parsed.address ? parsed.address.toString() : '';
    //     var message = parsed.message;
    //
    //     var amount = parsed.amount ? parsed.amount : '';
    //
    //     if (parsed.r) {
    //       payproService.getPayProDetails(parsed.r, function(err, details) {
    //         if (err) {
    //           if (addr && amount) goSend(addr, amount, message, coin);
    //           else popupService.showAlert(gettextCatalog.getString('Error'), err);
    //         } else handlePayPro(details);
    //       });
    //     } else {
    //       goSend(addr, amount, message, coin);
    //     }
    //     return true;
    // // Cash URI
    // } else if (bitcoreCash.URI.isValid(data)) {
    //   var coin = 'bch';
    //   var parsed = new bitcoreCash.URI(data);
    //
    //   var addr = parsed.address ? parsed.address.toString() : '';
    //   var message = parsed.message;
    //
    //   var amount = parsed.amount ? parsed.amount : '';
    //
    //   // paypro not yet supported on cash
    //   if (parsed.r) {
    //     payproService.getPayProDetails(parsed.r, function(err, details) {
    //       if (err) {
    //         if (addr && amount)
    //           goSend(addr, amount, message, coin);
    //         else
    //           popupService.showAlert(gettextCatalog.getString('Error'), err);
    //       }
    //       handlePayPro(details, coin);
    //     });
    //   } else {
    //     goSend(addr, amount, message, coin);
    //   }
    //   return true;
    //
    //   // Cash URI with bitcoin core address version number?
    // }else
      if (bitcoreNano.URI.isValid(data)) {
      var coin = 'Nano';
      var parsed = new bitcoreNano.URI(data);

      var addr = parsed.address ? parsed.address.toString() : '';
      var message = parsed.message;

      var amount = parsed.amount ? parsed.amount : '';

      // paypro not yet supported on cash
      if (parsed.r) {
        payproService.getPayProDetails(parsed.r, function(err, details) {
          if (err) {
            if (addr && amount)
              goSend(addr, amount, message, coin);
            else
              popupService.showAlert(gettextCatalog.getString('Error'), err);
          }
          handlePayPro(details, coin);
        });
      } else {
        goSend(addr, amount, message, coin);
      }
      return true;

      // Cash URI with bitcoin core address version number?
    }else if (bitcoreUlord.URI.isValid(data)) {
      var coin = 'Ulord';
      var parsed = new bitcoreUlord.URI(data);

      var addr = parsed.address ? parsed.address.toString() : '';
      var message = parsed.message;

      var amount = parsed.amount ? parsed.amount : '';

      // paypro not yet supported on cash
      if (parsed.r) {
        payproService.getPayProDetails(parsed.r, function(err, details) {
          if (err) {
            if (addr && amount)
              goSend(addr, amount, message, coin);
            else
              popupService.showAlert(gettextCatalog.getString('Error'), err);
          }
          handlePayPro(details, coin);
        });
      } else {
        goSend(addr, amount, message, coin);
      }
      return true;

      // Cash URI with bitcoin core address version number?
     }else if (/^https?:\/\//.test(data)) {
      payproService.getPayProDetails(data, function(err, details) {
        if (err) {
          root.showMenu({
            data: data,
            type: 'url'
          });
          return;
        }
        handlePayPro(details);
        return true;
      });
      // Plain Address
    } else if(bitcoreNano.Address.isValid(data, 'main')){
      if ($state.includes('tabs.scan')) {
        root.showMenu({
          data: data,
          type: 'bitcoinAddress',
          coin: 'Nano',
        });
      } else {
        goToAmountPage(data, 'Nano');
      }
    }else if(bitcoreUlord.Address.isValid(data, 'main')){
      if ($state.includes('tabs.scan')) {
        root.showMenu({
          data: data,
          type: 'bitcoinAddress',
          coin: 'Ulord',
        });
      } else {
        goToAmountPage(data, 'Ulord');
      }
    } else if (data && data.indexOf(appConfigService.name + '://glidera') === 0) {
      var code = getParameterByName('code', data);
      $ionicHistory.nextViewOptions({
        disableAnimate: true
      });
      $state.go('tabs.home', {}, {
        'reload': true,
        'notify': $state.current.name == 'tabs.home' ? false : true
      }).then(function() {
        $ionicHistory.nextViewOptions({
          disableAnimate: true
        });
        $state.transitionTo('tabs.buyandsell.glidera', {
          code: code
        });
      });
      return true;

    } else if (data && data.indexOf(appConfigService.name + '://coinbase') === 0) {
      var code = getParameterByName('code', data);
      $ionicHistory.nextViewOptions({
        disableAnimate: true
      });
      $state.go('tabs.home', {}, {
        'reload': true,
        'notify': $state.current.name == 'tabs.home' ? false : true
      }).then(function() {
        $ionicHistory.nextViewOptions({
          disableAnimate: true
        });
        $state.transitionTo('tabs.buyandsell.coinbase', {
          code: code
        });
      });
      return true;

      // BitPayCard Authentication
    } else if (data && (data.substring(0, 2) == '6P' || checkPrivateKey(data))) {
      root.showMenu({
        data: data,
        type: 'privateKey'
      });
    } else if (data && ((data.substring(0, 2) == '1|') || (data.substring(0, 2) == '2|') || (data.substring(0, 2) == '3|'))) {
      $state.go('tabs.home').then(function() {
        $state.transitionTo('tabs.add.import', {
          code: data
        });
      });
      return true;

    } else {
      if ($state.includes('tabs.scan')) {
        root.showMenu({
          data: data,
          type: 'text'
        });
      }
    }
    return false;
  };

  function goToAmountPage(toAddress, coin) {
    $state.go('tabs.send', {}, {
      'reload': true,
      'notify': $state.current.name == 'tabs.send' ? false : true
    });
    $timeout(function() {
      $state.transitionTo('tabs.send.amount', {
        toAddress: toAddress,
        coin: coin,
      });
    }, 100);
  }

  function handlePayPro(payProDetails, coin) {
    var stateParams = {
      toAmount: payProDetails.amount,
      toAddress: payProDetails.toAddress,
      description: payProDetails.memo,
      paypro: payProDetails,
      coin: coin,
    };
    scannerService.pausePreview();
    $state.go('tabs.send', {}, {
      'reload': true,
      'notify': $state.current.name == 'tabs.send' ? false : true
    }).then(function() {
      $timeout(function() {
        $state.transitionTo('tabs.send.confirm', stateParams);
      });
    });
  }

  return root;
});

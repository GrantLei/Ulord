'use strict';

angular.module('copayApp.controllers').controller('activityController',
  function($timeout, $scope, $log, $ionicModal, lodash, txpModalService, profileService, walletService, ongoingProcess, popupService, gettextCatalog, $state) {
    $scope.openTxpModal = txpModalService.open;
    $scope.fetchingNotifications = true;

    $scope.$on("$ionicView.enter", function(event, data) {
      profileService.getNotifications(50, function(err, n) {
        if (err) {
          $log.error(err);
          return;
        }
        var result = [];
        var isRepeated;
        if(n.length >=2) {
          for(var i = 0 , leni = n.length;i < leni;i++){
            isRepeated = false;
            for(var j = 0, lenj = result.length;j < lenj;j++){
              if(n[i]["createdOn"] == result[j]["createdOn"]){
                isRepeated = true;
                break;
              }
            }
            if(!isRepeated){
              result.push(n[i]);
            }
          }
        }
        $scope.fetchingNotifications = false;
        $scope.notifications = result;

        profileService.getTxps({}, function(err, txps, n) {
          if (err) $log.error(err);
          $scope.txps = txps;
          $timeout(function() {
            $scope.$apply();
          });
        });
      });
    });

    $scope.openNotificationModal = function(n) {
      if (n.txid) {
        $state.transitionTo('tabs.wallet.tx-details', {
          txid: n.txid,
          walletId: n.walletId
        });
      } else {
        var txp = lodash.find($scope.txps, {
          id: n.txpId
        });
        if (txp) txpModalService.open(txp);
        else {
          ongoingProcess.set('loadingTxInfo', true);
          walletService.getTxp(n.wallet, n.txpId, function(err, txp) {
            var _txp = txp;
            ongoingProcess.set('loadingTxInfo', false);
            if (err) {
              $log.warn('No txp found');
              return popupService.showAlert(gettextCatalog.getString('Error'), gettextCatalog.getString('Transaction not found'));
            }
            txpModalService.open(_txp);
          });
        }
      }
    };
  });

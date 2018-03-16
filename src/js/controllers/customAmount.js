'use strict';

angular.module('copayApp.controllers').controller('customAmountController', function($scope, $ionicHistory, txFormatService, platformInfo, configService, profileService, walletService, popupService) {

  var showErrorAndBack = function(title, msg) {
    popupService.showAlert(title, msg, function() {
      $scope.close();
    });
  };

  var setProtocolHandler = function() {
    $scope.protocolHandler = walletService.getProtocolHandler($scope.wallet);
  }

  $scope.$on("$ionicView.beforeEnter", function(event, data) {
    var walletId = data.stateParams.id;

    if (!walletId) {
      showErrorAndBack('Error', 'No wallet selected');
      return;
    }

    $scope.showShareButton = platformInfo.isCordova ? (platformInfo.isIOS ? 'iOS' : 'Android') : null;

    $scope.wallet = profileService.getWallet(walletId);

    setProtocolHandler();

    walletService.getAddress($scope.wallet, false, function(err, addr) {
      if (!addr) {
        showErrorAndBack('Error', 'Could not get the address');
        return;
      }

      $scope.address = addr;

      $scope.coin = data.stateParams.coin;
      var parsedAmount = txFormatService.parseAmount(
        $scope.wallet.coin,
        data.stateParams.amount,
        data.stateParams.currency);
      var amount = parsedAmount.amount;
      var currency = parsedAmount.currency;
      $scope.amountUnitStr = parsedAmount.amountUnitStr;
      $scope.amountBtc = amount;

    });
  });

  $scope.close = function() {
    $ionicHistory.nextViewOptions({
      disableAnimate: true
    });
    $ionicHistory.goBack(-2);
  };

  $scope.shareAddress = function() {
    if (!platformInfo.isCordova) return;
    var protocol = 'bitcoin';
    if ($scope.wallet.coin == 'bch') protocol += 'cash';
    if ($scope.wallet.coin == 'Nano') protocol += 'nano';
    if ($scope.wallet.coin == 'dash') protocol += 'dash';
    if ($scope.wallet.coin == 'Ulord') protocol += 'ulord';
    var data = protocol + ':' + $scope.address + '?amount=' + $scope.amountBtc;
    window.plugins.socialsharing.share(data, null, null, null);
  }

  $scope.copyToClipboard = function() {
    var protocol = 'bitcoin';
    if ($scope.wallet.coin == 'bch') protocol += 'cash';
    if ($scope.wallet.coin == 'Nano') protocol += 'nano';
    if ($scope.wallet.coin == 'dash') protocol += 'dash';
    if ($scope.wallet.coin == 'Ulord') protocol += 'ulord';
    return protocol + ':' + $scope.address + '?amount=' + $scope.amountBtc;
  };

});

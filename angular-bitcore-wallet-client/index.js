var bwcModule = angular.module('bwcModule', []);
var Client = require('../node_modules/bitcore-wallet-client');
var ClientDash = require('../node_modules/bitcore-wallet-client-dash');
var ClientNano = require('../node_modules/btcnano-wallet-client');
var ClientUlord = require('../node_modules/bitcore-wallet-client-ulord');

bwcModule.constant('MODULE_VERSION', '1.0.0');

bwcModule.provider("bwcService", function() {
  var provider = {};

  provider.$get = function() {
    var service = {};
    service.getBitcore = function() {
      return Client.Bitcore;
    };
    service.getBitcoreCash = function() {
      return Client.BitcoreCash;
    };
    service.getBitcoreDash = function() {
      return ClientDash.BitcoreDash;
    }
    service.getBitcoreNano = function() {
      return ClientNano.BitcoreNano;
    }
    service.getBitcoreUlord = function() {
      return ClientUlord.BitcoreUlord;
    }

    service.getErrors = function() {
      return Client.errors;
    };

    service.getSJCL = function() {
      return Client.sjcl;
    };

    service.buildTx = Client.buildTx;
    service.parseSecret = Client.parseSecret;
    service.Client = Client;

    service.getUtils = function() {
      return Client.Utils;
    };

    service.getClient = function(walletData, opts) {
      opts = opts || {};
      var bwc = null;
      if(opts){
        var coin = opts.coin;
        if(walletData){
         coin = JSON.parse(walletData).coin;
        }
          if(coin == 'dash'){
            bwc = new ClientDash({
              verbose: opts.verbose,
              timeout: 100000,
              transports: ['polling'],
            });
        }else
          if(coin == 'Nano'){
            bwc = new ClientNano({
              baseUrl: 'http://118.190.150.58:3232/bws/api',
              verbose: opts.verbose,
              timeout: 100000,
              transports: ['polling'],
            });
          }
          else if(coin == 'Ulord'){
            bwc = new ClientUlord({
              baseUrl: 'http://192.168.14.46:3232/bws/api',
              verbose: opts.verbose,
              timeout: 100000,
              transports: ['polling'],
            });
          }
          else{
            bwc = new Client({
              verbose: opts.verbose,
              timeout: 100000,
              transports: ['polling'],
            });
        }
      }
      if (walletData)
        bwc.import(walletData, opts);
      return bwc;
    };
    return service;
  };

  return provider;
});

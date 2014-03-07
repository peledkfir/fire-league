'use strict';

angular.module('fire-league.config', [])
	.config(['FacebookProvider', function(FacebookProvider) {
	     // Here you could set your appId throug the setAppId method and then initialize
	     // or use the shortcut in the initialize method directly.
	     FacebookProvider.init('622249227842681');
	}])
	.constant('FBURL', 'https://fireleague.firebaseio.com');
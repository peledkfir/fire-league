
var fApp = angular.module('fire-dashboard', ['ngRoute', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
	.config(['$routeProvider', function($routeProvider) {
		'use strict';

		$routeProvider.when('/network/:network/league/:league',
			{
				templateUrl: 'templates/LeagueDashboardBig.html',
				controller: 'LeagueCtrl',
				resolve: {
					leagueName: ['$route', function($route) { return $route.current.params.league; }],
					networkName: ['$route', function($route) { return $route.current.params.network; }]
				}
			});
	}]);
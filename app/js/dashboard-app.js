
var fApp = angular.module('fire-dashboard', ['ngRoute', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
	.config(['$routeProvider', function($routeProvider) {
		'use strict';

		$routeProvider.when('/network/:network/season/:season',
			{
				templateUrl: 'templates/SeasonDashboardBig.html',
				controller: 'SeasonCtrl',
				resolve: {
					params: ['$route', function($route) {
						return {
							seasonName: $route.current.params.season,
							networkName: $route.current.params.network
						};
					}]
				}
			});
	}]);
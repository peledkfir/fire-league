
var fApp = angular.module('fire-dashboard', ['ngRoute', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
	.config(['$routeProvider', function($routeProvider) {
		'use strict';

		$routeProvider.when('/league/:league/season/:season',
			{
				templateUrl: 'templates/SeasonDashboardBig.html',
				controller: 'SeasonCtrl',
				resolve: {
					params: ['$route', function($route) {
						return {
							seasonName: $route.current.params.season,
							leagueName: $route.current.params.league
						};
					}]
				}
			});
	}]);
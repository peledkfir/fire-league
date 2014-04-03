
var fApp = angular.module('fire-dashboard', ['ngRoute', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
	.config(['$routeProvider', function($routeProvider) {
		'use strict';

		// backward compatibility for alpha 0.0.2
		$routeProvider.when('/network/:league/league/:season', { redirectTo: '/league/:league/season/:season' });

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
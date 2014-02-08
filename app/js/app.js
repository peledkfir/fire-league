'use strict';


// Declare app level module which depends on filters, and services
var fApp = angular.module('friends-league', ['ui.router', 'ui.sortable', 'ui.bootstrap', 'firebase', 'facebook'])
	.config(function($stateProvider, $urlRouterProvider) {
		$stateProvider
		.state('browse', {
			url: '/browse',
			templateUrl: 'templates/NetworkBrowse.html',
			controller: 'NetworkBrowseCtrl'
		})
		.state('networkCreate', {
			url: '/create/network', 
			templateUrl: 'templates/NetworkCreate.html',
			controller: 'NetworkCreateCtrl'
		})
		.state('leagueCreate', {
			url: '/create/league?network', 
			templateUrl: 'templates/LeagueCreate.html',
			controller: 'LeagueCreateCtrl'
		})
		.state('network', {
			url: '/network/:network',
			templateUrl: 'templates/NetworkLeagues.html',
			controller: 'NetworkLeaguesCtrl'
		})
		.state('league', {
			url: '/network/:network/league/:league', 
			templateUrl: 'templates/League.html',
			controller: 'LeagueCtrl'
		})
		.state('unknown', {
			url: '/pageNotFound', 
			templateUrl: 'templates/NotFound.html',
		})
		//.when('/network/:name/edit')
		// .when('/:leagueName/:teamName', {
		// 	templateUrl: '/templates/PlayerMatches.html',
		// 	controller: '/'
		// })
		// .when('/app/index.html' {
		// 	controller: 'TableGeneratorController'
		// })
		$urlRouterProvider
		.when('', '/browse')
		.otherwise('/pageNotFound');
	})
	.config(['FacebookProvider', function(FacebookProvider) {
	     // Here you could set your appId throug the setAppId method and then initialize
	     // or use the shortcut in the initialize method directly.
	     FacebookProvider.init('');
	}])
	.constant('FBURL', 'https://.firebaseio.com')
	.run(function($rootScope, $state) {
		// Setup underscore.string
		_.mixin(_.str.exports());

		$rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParams) {
			if (_(toState.name).endsWith('Create') && $rootScope.auth.user == null) {
				ev.preventDefault();
				$state.transitionTo('browse');
			}
		});
	});
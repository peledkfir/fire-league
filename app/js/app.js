'use strict';


// Declare app level module which depends on filters, and services
var fApp = angular.module('fire-league', ['ui.router', 'ui.sortable', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
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
		});
		
		$urlRouterProvider
		.when('', '/browse')
		.otherwise('/pageNotFound');
	})
	.run(function($rootScope, $state, $stateParams, $firebaseSimpleLogin, Facebook, leagueService) {
		// Setup underscore.string
		_.mixin(_.str.exports());

	    $rootScope.$state = $state;
    	$rootScope.$stateParams = $stateParams;

		var root = leagueService.res.root.ref();
		$rootScope.auth = $firebaseSimpleLogin(root);

		// Here, usually you should watch for when Facebook is ready and loaded
		var $destroyWatch = $rootScope.$watch(function() {
			return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
		}, function(newVal) {
			if (newVal) {
				$destroyWatch();
				$rootScope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
			}
		});

		$rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
			console.log("Logged in");
		});

		$rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParams) {
			if ($rootScope.auth.user == null) {
				if (_.endsWith(toState.name, 'Create')) {
					ev.preventDefault();
					$state.transitionTo('browse');
				} else if (_.endsWith(toState.name, 'delete')) {
					ev.preventDefault();
					$state.transitionTo(_.strLeftBack(toState.name, '.'), toParams, { location: 'replace' });
					// TODO: report bug for this $state.transitionTo('^', toParams, { location: 'replace', relative: toState });					
				}
			}
		});
	});
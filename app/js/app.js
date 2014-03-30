

// Declare app level module which depends on filters, and services
var fApp = angular.module('fire-league', ['ui.router', 'ui.sortable', 'ui.bootstrap', 'firebase', 'facebook', 'fire-league.config'])
	.value('version', '0.0.2a')
	.config(function($stateProvider, $urlRouterProvider) {
		'use strict';
		
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
		.state('network.edit', {
			url: '/edit',
			views: {
				'@': {
					templateUrl: 'templates/NetworkEdit.html',
					controller: 'NetworkEditCtrl'
				}
			}
		})

		.state('league', {
			abstract: true,
			url: '/network/:network/league/:league',
			templateUrl: 'templates/League.html',
			controller: 'LeagueCtrl',
			resolve: {
				params: function($stateParams) { return { leagueName: $stateParams.league, networkName: $stateParams.network }; }
			}
		})
		.state('league.dashboard', {
			url: '',
			templateUrl: 'templates/LeagueDashboard.html'
		})
		.state('league.player', {
			url: '/player/:player',
			templateUrl: 'templates/LeaguePlayer.html'
		})

		.state('about', {
			url: '/about',
			templateUrl: 'templates/About.html',
			controller: function($scope) {
				$scope.atts = [
					'Soccer Field by Jule Steffen & Matthias Schmidt from The Noun Project',
					'Goal by Uriel Sosa from The Noun Project',
					'Trophy by Amir Neiman from The Noun Project',
					'Creation by Jakob Vogel from The Noun Project',
					'Soccer Field by Erik Wagner from The Noun Project',
					'Soccer by Juan Pablo Bravo from The Noun Project',
					'Goalkeeper by Juan Pablo Bravo from The Noun Project'
				];
			}
		})
		.state('unknown', {
			url: '/pageNotFound',
			templateUrl: 'templates/NotFound.html',
		});
		
		$urlRouterProvider
		.when('', '/browse')
		.otherwise('/pageNotFound');
	})
	.run(function() {
		'use strict';

		// Setup underscore.string
		_.mixin(_.str.exports());
	})
	.run(function($rootScope, $state, $stateParams) {
		'use strict';
		
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		$rootScope.$on('$stateChangeStart', function(ev, toState, toParams, fromState, fromParams) {
			if ($rootScope.auth.user == null) {
				if (_.endsWith(toState.name, 'Create')) {
					ev.preventDefault();
					$state.transitionTo('browse');
				} else if (_.endsWith(toState.name, 'delete') || _.endsWith(toState.name, 'edit')) {
					ev.preventDefault();
					$state.transitionTo(_.strLeftBack(toState.name, '.'), toParams, { location: 'replace' });
					// TODO: report bug for this $state.transitionTo('^', toParams, { location: 'replace', relative: toState });					
				}
			}
		});
	})
	.run(function($http, $templateCache) {
		'use strict';
		
		// cache modals
		_.delay(function() {
			$http.get('templates/LoginModal.html', {cache: $templateCache});
			//$http.get('templates/NetworkDeleteModal.html', {cache: $templateCache});
		}, 2000);
	})
	.run(function($rootScope, Facebook) {
		'use strict';
		
		// Here, usually you should watch for when Facebook is ready and loaded
		var $destroyWatch = $rootScope.$watch(function() {
			return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
		}, function(newVal) {
			if (newVal) {
				$destroyWatch();
				$rootScope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
			}
		});
	})
	.run(function($rootScope, $firebaseSimpleLogin, leagueService) {
		'use strict';
		
		var root = leagueService.res.root.ref();
		$rootScope.auth = $firebaseSimpleLogin(root);
	});
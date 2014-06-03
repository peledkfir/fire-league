

// Declare app level module which depends on filters, and services
var flApp = angular.module('fire-league', ['ui.router', 'ui.sortable', 'ui.bootstrap', 'ui.knob', 'angularUtils.directives.dirDisqus', 'angularMoment', 'facebook', 'fire-league.config', 'firebase', 'cloudinary', 'blueimp.fileupload'])
	.value('version', '0.0.3a')
	.config(function($stateProvider, $urlRouterProvider) {
		'use strict';
		
		$stateProvider
		.state('browse', {
			url: '/browse',
			templateUrl: 'templates/LeagueBrowse.html',
			controller: 'LeagueBrowseCtrl',
			data: {
				pageTitle: function() {
					return 'Fire-League';
				}
			}
		})
		.state('leagueCreate', {
			url: '/create/league',
			templateUrl: 'templates/LeagueCreate.html',
			controller: 'LeagueCreateCtrl',
			data: {
				pageTitle: function() {
					return 'Create new League';	
				} 
			}
		})
		.state('seasonCreate', {
			url: '/create/season?league',
			templateUrl: 'templates/SeasonCreate.html',
			controller: 'SeasonCreateCtrl',
			data: {
				pageTitle: function($stateParams) {
					return $stateParams.league + ': Create new Season';
				}
			}
		})
		.state('league', {
			url: '/league/:league',
			templateUrl: 'templates/LeagueSeasons.html',
			controller: 'LeagueSeasonsCtrl',
			data: {
				pageTitle: function($stateParams) {
					return $stateParams.league;
				}
			}
		})
		.state('league.edit', {
			url: '/edit',
			views: {
				'@': {
					templateUrl: 'templates/LeagueEdit.html',
					controller: 'LeagueEditCtrl'
				}
			},
			data: {
				pageTitle: function($stateParams) {
					return 'Edit: ' + $stateParams.league;
				}
			}
		})

		.state('season', {
			abstract: true,
			url: '/league/:league/season/:season',
			templateUrl: 'templates/Season.html',
			controller: 'SeasonCtrl',
			resolve: {
				params: function($stateParams) { return { seasonName: $stateParams.season, leagueName: $stateParams.league }; }
			}
		})
		.state('season.edit', {
			url: '/edit',
			views: {
				'@': {
					templateUrl: 'templates/SeasonEdit.html',
					controller: 'SeasonEditCtrl'
				}
			},
			data: {
				pageTitle: function($stateParams) {
					return 'Edit: ' + $stateParams.season;
				}
			}
		})
		.state('season.dashboard', {
			url: '',
			templateUrl: 'templates/SeasonDashboard.html',
			data: {
				pageTitle: function($stateParams) {
					return $stateParams.league + ' - ' + $stateParams.season;
				}
			}
		})
		.state('season.player', {
			url: '/player/:player',
			templateUrl: 'templates/SeasonPlayer.html',
			data: {
				pageTitle: function($stateParams) {
					return $stateParams.season + ' - ' + $stateParams.player;
				}
			}
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
					'Goalkeeper by Juan Pablo Bravo from The Noun Project',
					'Soccer Boot by Simon Child from The Noun Project',
					'Football by james zamyslianskyj from The Noun Project',
					'Soccer Ball by Laurent Patain from The Noun Project',
					'Cleat by david fauveau ∞ from The Noun Project',
					'World Cup Trophy by San Salido Martínez from The Noun Project',
					'Soccer by Ruben Sheep from The Noun Project',
					'World Cup Trophy by Marco Hernandez from The Noun Project',
					'Easel by Monika Ciapala from The Noun Project'
				];
			},
			data: {
				pageTitle: function() {
					return 'Fire-League';
				}
			}
		})
		.state('unknown', {
			url: '/pageNotFound',
			templateUrl: 'templates/NotFound.html',
			data: {
				pageTitle: function() {
					return 'Fire-League: Page Not Found';
				}
			}
		});
		
		$urlRouterProvider
		.when('/network/:league/league/:season', '/league/:league/season/:season') // backward compatibility for alpha 0.0.2
		.when('/network/:league', '/league/:league') // backward compatibility for alpha 0.0.2
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
			if ($rootScope.auth == null || $rootScope.auth.user == null) {
				if (_.endsWith(toState.name, 'Create')) {
					ev.preventDefault();
					$state.transitionTo('browse');
				} else if (_.endsWith(toState.name, 'delete') || _.endsWith(toState.name, 'edit')) {
					ev.preventDefault();
					var toState = _.strLeftBack(toState.name, '.');
					// Cannot transition to abstract state
					if (toState == 'season') {
						toState = 'season.dashboard';
					}
					$state.transitionTo(toState, toParams, { location: 'replace' });
					// TODO: report bug for this $state.transitionTo('^', toParams, { location: 'replace', relative: toState });					
				}
			}
		});
	})
	.run(function($http, $templateCache, $timeout) {
		'use strict';
		
		// cache modals
		$timeout(function() {
			$http.get('templates/LoginModal.html', {cache: $templateCache});
			$http.get('templates/MatchEditModal.html', {cache: $templateCache});
			$http.get('templates/MatchImagesModal.html', {cache: $templateCache});
			$http.get('templates/LeagueDeleteModal.html', {cache: $templateCache});
		}, 10000);
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

flApp.directive('flAppVersion', ['version', function(version) {
	'use strict';
    
	return function(scope, elm) {
		elm.text(version);
	};
}])
.directive('flSpinner', function() {
	'use strict';
	
	return {
		restrict: 'A',
		link: function($scope, $element) {
			$element.addClass('fa fa-spin fa-circle-o-notch');
		}
	};
})
.directive('flSeasonTablePanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonTablePanel.html',
		scope: {
			table: '=',
			maximizeUrl: '@'
		},
		link: function($scope) {
			$scope.abs = Math.abs;
		}
	};
})
.directive('flSeasonPlayerProgressPanel', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonPlayerProgressPanel.html',
		scope: {
			stats: '=',
			player: '='
		},
		link: function($scope, $element, $attrs) {
			var chart = false;
			var initChart = function() {
				if (chart) {
					chart.destroy();
				}

				// building amCharts chart
				var graphs = [];
				var data = [];
				var stats = $scope.stats;
				var teamStats = stats.teamStats[$scope.player];
				if (!teamStats) {
					return;
				}

				graphs.push({
					id: teamStats.team.id.toString(),
					title: teamStats.team.name,
					valueField: teamStats.team.id.toString(),
					bulletSize: 16,
					customBulletField: 'customBullet',
					lineColor: '#247BC1',
					showBalloon: false
				});

				var maxPosition = 2;
				
				for (var i = 0; i < stats.season.rounds.length; i++) {
					var roundData = {
						round: i + 1
					};

					if (i + 1 <= stats.currentRound) {
						roundData[teamStats.team.id] = teamStats.posPerRound[i];
						
						var currRndPts = teamStats.ptsPerRound[i] - (i === 0 ? 0 : teamStats.ptsPerRound[i - 1]);

						roundData.customBullet = 'images/' + (currRndPts == 3 ? 'win' : (currRndPts == 1 ? 'draw' : 'lose')) + '_16.png';

						if (teamStats.posPerRound[i] > maxPosition) {
							maxPosition = teamStats.posPerRound[i];
						}
					}

					data.push(roundData);
				}

				chart = AmCharts.makeChart('chartdiv', {
					type: 'serial',
					pathToImages: '',
					categoryField: 'round',
					sequencedAnimation: false,
					zoomOutButtonImage: 'lib/amCharts/lens.png',
					creditsPosition: 'bottom-right',
					fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
					categoryAxis: {
						startOnAxis: true,
						title: 'Round',
						autoGridCount: false,
						gridCount: stats.season.rounds.length
					},
					chartCursor: {
						'animationDuration': 0.09,
						zoomable: false
					},
					trendLines: [],
					graphs: graphs,
					guides: [],
					valueAxes: [
						{
							baseValue: -1,
							id: 'position',
							minimum: 1,
							precision: 0,
							reversed: true,
							autoGridCount: false,
							gridCount: maxPosition,
							minorGridEnabled: true,
							showLastLabel: false,
							title: 'Position'
						}
					],
					allLabels: [],
					titles: [],
					dataProvider: data
				});
			};

			$scope.$watch('stats.teamStats', function(teamStats) {
				if (teamStats) {
					initChart();
				}
			});
		}
	};
})
.directive('flSeasonProgressPanel', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonProgressPanel.html',
		scope: {
			stats: '='
		},
		link: function($scope, $element, $attrs) {
			var chart = false;
			var initChart = function() {
				if (chart) {
					chart.destroy();
				}

				// building amCharts chart
				var graphs = [];
				var data = [];
				var stats = $scope.stats;
				var maxPosition = 2;

				angular.forEach(stats.teamStats, function(teamStats, team) {
					graphs.push({
						id: teamStats.team.id.toString(),
						bullet: 'round',
						title: team,
						valueField: teamStats.team.id.toString(),
						balloonText: '<img class="profile_16" src="//graph.facebook.com/' + teamStats.team.id + '/picture?type=square&width=16&height=16"><small> [[title]]</small>',
						hidden: teamStats.posPerRound[stats.currentRound - 1] > 4
					});
				});

				for (var i = 0; i < stats.season.rounds.length; i++) {
					var roundData = {
						round: i + 1
					};

					if (i + 1 <= stats.currentRound) {
						angular.forEach(stats.teamStats, function(teamStats, team) {
							roundData[teamStats.team.id] = teamStats.posPerRound[i];
						});
					}

					data.push(roundData);
				}

				chart = AmCharts.makeChart('chartdiv', {
					type: 'serial',
					pathToImages: '',
					categoryField: 'round',
					sequencedAnimation: false,
					zoomOutButtonImage: 'lib/amCharts/lens.png',
					creditsPosition: 'bottom-right',
					fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
					categoryAxis: {
						startOnAxis: true,
						title: 'Round',
						autoGridCount: false,
						gridCount: stats.season.rounds.length
					},
					chartCursor: {
						'animationDuration': 0.09,
						zoomable: false
					},
					trendLines: [],
					graphs: graphs,
					guides: [],
					valueAxes: [
						{
							baseValue: -1,
							id: 'position',
							minimum: 1,
							precision: 0,
							reversed: true,
							autoGridCount: false,
							gridCount: stats.season.teams.length,
							minorGridEnabled: true,
							showLastLabel: false,
							title: 'Position'
						}
					],
					allLabels: [],
					balloon: {},
					legend: {
						bottom: 0,
						position: $element.width() > 700 ? 'right' : 'bottom',
						useGraphSettings: true,
						valueWidth: 20
					},
					titles: [],
					dataProvider: data
				});
			};

			$scope.top4 = function() {
				if (chart) {
					var currentRound = $scope.stats.currentRound;
					var teamStats = $scope.stats.teamStats;
					angular.forEach(chart.graphs, function(graph) {
						graph.hidden = teamStats[graph.title].posPerRound[currentRound - 1] > 4;
					});
					chart.validateNow();
				}
			};

			$scope.all = function() {
				if (chart) {
					angular.forEach(chart.graphs, function(graph) {
						graph.hidden = false;
					});
					chart.validateNow();
				}
			};

			$scope.$watch('stats.teamStats', function(teamStats) {
				if (teamStats) {
					initChart();
				}
			});
		}
	};
})
.directive('flPlayerUpcomingPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/PlayerUpcomingPanel.html',
		scope: {
			stats: '=',
			upcoming: '='
		}
	};
})
.directive('flSeasonLatestPanel', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonLatestPanel.html',
		scope: {
			latest: '='
		}
	};
})
.directive('flSeasonGeneralStatsPanel', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonGeneralStatsPanel.html',
		scope: {
			stats: '=',
			onlyProgress: '='
		},
		link: function($scope) {
			$scope.knobDraw = function() {
				$(this.i).val(this.cv + '%');
			};
			$scope.round = function(num) {
				return Math.floor(num * 100);
			};
		}
	};
})
.directive('flSeasonCurrRoundPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonCurrRoundPanel.html',
		scope: {
			stats: '='
		},
		link: function($scope) {
			//Use $watch - will get called every time the value changes:
			$scope.$watch('stats', function(stats) {
				if (!$scope.currPage && stats) {
					$scope.currPage = stats.currentRound;
				}
			});
		}
	};
})
.directive('flSeasonPlayerCompetition', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonPlayerCompetition.html',
		scope: {
			stats: '=',
			player: '='
		},
		link: function($scope) {
			$scope.$watch('stats', function(stats) {
				if (stats) {
					$scope.rounds = _.chain($scope.stats.season.rounds)
						.reduce(function(result, round) {
							var cpy = angular.copy(round);
							cpy.matches = _.filter(cpy.matches, function(match) {
								return match.away.name === $scope.player || match.home.name === $scope.player;
							});

							result.push(cpy);

							return result;
						}, [])
						.value();
				}
			});
		}
	};
})
.directive('flSeasonPlayerGalleryPanel', function() {
	'use strict';
	
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/SeasonPlayerGalleryPanel.html',
		scope: {
			stats: '=',
			player: '='
		},
		link: function($scope) {
			$scope.$watch('stats', function(stats) {
				if (stats) {
					$scope.images = _.chain($scope.stats.season.rounds)
						.flatten('matches')
						.filter(function(match) {
							return match.hasImages() && (match.away.name === $scope.player || match.home.name === $scope.player);
						})
						.reduce(function(result, match) {
							for (var i = 0; i < match.images.length; i++) {
								var text = match.home.name + ' (' + match.result.home + ') - ' + match.away.name + ' (' + match.result.away + ')';
								var idx = match.images.length > 1 ? ' (' + (i + 1) + '/' + match.images.length + ')' : '';
								result.push({
									title: 'Round ' + match.round,
									text: text,
									id: match.images[i],
									idx: idx
								});
							}

							return result;
						}, [])
						.value();
				}
			});
		}
	};
})
.directive('flEditableFriendsList', function() {
	'use strict';

	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/directives/EditableFriendsList.html',
		scope: {
			friends: '='
		},
		controller: function($scope) {
			$scope.addFriend = function(item, model, label) {
				$scope.friends.push({id: parseInt(item.uid), name: item.name, isNew: true});
			};
			
			$scope.removeFriend = function(index) {
				if ($scope.friends[index].isNew) {
					$scope.friends.splice(index, 1);
				} else {
					$scope.friends[index].isDeleted = true;
				}
			};

			$scope.reAddFriend = function(index) {
				$scope.friends[index].isDeleted = false;
			};
		}
	};
});
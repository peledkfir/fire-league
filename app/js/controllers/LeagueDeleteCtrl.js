
fApp.config(function($stateProvider) {
  'use strict';

  var LeagueDeleteCtrl = function($scope, leagueService, league) {
    $scope.dismiss = function() {
      $scope.$dismiss();
    };

    $scope.delete = function() {
      $scope.deleting = true;

      var friends = leagueService.res.league.friends.ref(league);

      // Deletes all league favorites
      friends.once('value', function(snap) {
        snap.forEach(function(friendSnap) {
          leagueService.res.favorites.league.remove(friendSnap.name(), league);
        });

        // deletes all seasons data
        leagueService.res.league.seasonsData.remove(league);

        // deletes all the seasons
        leagueService.res.season.all.remove(league);

        // deletes the league
        leagueService.res.league.ref(league).remove(function() {
          $scope.$close(true);
        });
      });
    };

    $scope.league = league;
    $scope.deleting = false;
  };

	$stateProvider
	.state('league.delete', {
		url: '/delete',
		onEnter: function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'templates/LeagueDeleteModal.html',
        resolve: {
          league: function() { return $stateParams.league; }
        },
        controller: LeagueDeleteCtrl
      })
      .result.then(function(result) {
        if (result) {
          return $state.transitionTo('browse');
        }
      }, function() {
          return $state.go('^');
        });
		}
	});
});
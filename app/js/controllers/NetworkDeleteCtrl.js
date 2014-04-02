
fApp.config(function($stateProvider) {
  'use strict';

  var NetworkDeleteCtrl = function($scope, leagueService, network) {
    $scope.dismiss = function() {
      $scope.$dismiss();
    };

    $scope.delete = function() {
      $scope.deleting = true;

      var friends = leagueService.res.network.friends.ref(network);

      // Deletes all network favorites
      friends.once('value', function(snap) {
        snap.forEach(function(friendSnap) {
          leagueService.res.favorites.network.remove(friendSnap.name(), network);
        });

        // deletes all seasons data
        leagueService.res.network.seasonsData.remove(network);

        // deletes all the seasons
        leagueService.res.season.all.remove(network);

        // deletes the network
        leagueService.res.network.ref(network).remove(function() {
          $scope.$close(true);
        });
      });
    };

    $scope.network = network;
    $scope.deleting = false;
  };

	$stateProvider
	.state('network.delete', {
		url: '/delete',
		onEnter: function($stateParams, $state, $modal) {
      $modal.open({
        templateUrl: 'templates/NetworkDeleteModal.html',
        resolve: {
          network: function() { return $stateParams.network; }
        },
        controller: NetworkDeleteCtrl
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
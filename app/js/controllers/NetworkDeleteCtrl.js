'use strict';

fApp.config(function($stateProvider) {
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
      });

      // deletes all leagues data
      leagueService.res.network.leaguesData.remove(network);

      // deletes all the leagues
      leagueService.res.league.all.remove(network);

      // deletes the network
      leagueService.res.network.ref(network).remove(function() {
       $scope.$close(true);
      });
    };

    $scope.network = network;
    $scope.deleting = false;
  }

	$stateProvider
	.state('network.delete', {
		url: '/delete',
		onEnter: function($stateParams, $state, $modal) {
    	$modal.open({
        	templateUrl: "templates/NetworkDeleteModal.html",
          resolve: {
            network: function() { return $stateParams.network; }
          },
        	controller: NetworkDeleteCtrl
      })
      .result.then(function(result) {
          if (result) {
              return $state.transitionTo("browse");
          }
	    });
		}
	});
});
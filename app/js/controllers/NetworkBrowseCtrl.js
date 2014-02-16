'use strict';

fApp.controller('NetworkBrowseCtrl', function NetworkBrowseCtrl($scope, $timeout, leagueService) {
	$scope.getOwners = function(network) {
		return _.map(network.owners, function(owner) {
			return owner.name;
		}).join(', ');
	};
	$scope.getFriendsNum = function(network) {
		return Object.keys(network.friends).length;
	};
	$scope.loading = false;
	
	var promise = $timeout(function(){
		$scope.loading = true;
	}, 50);
	
	var $networks = $scope.networks = leagueService.res.network.all.sync();
	$networks.$on('loaded', function() {
		$timeout.cancel(promise);
		$scope.loading = false;
	});
});
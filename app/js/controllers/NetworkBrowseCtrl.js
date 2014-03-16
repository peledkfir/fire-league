
fApp.controller('NetworkBrowseCtrl', function NetworkBrowseCtrl($scope, $rootScope, $timeout, leagueService) {
	'use strict';
	
	$scope.isOwner = function(network) {
		var isOwner = false;

		if ($rootScope.auth.user) {
			isOwner = network.owners[$rootScope.auth.user.uid] !== null;
		}

		return isOwner;
	};

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
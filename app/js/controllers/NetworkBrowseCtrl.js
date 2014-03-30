
fApp.controller('NetworkBrowseCtrl', function NetworkBrowseCtrl($scope, $timeout, leagueService) {
	'use strict';
	
	$scope.isOwner = leagueService.logic.network.isOwner;
	$scope.keys = Object.keys;

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
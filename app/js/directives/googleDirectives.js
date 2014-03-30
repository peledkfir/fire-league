
fApp.directive('analytics', function() {
	'use strict';
	
	return {
		restrict: 'A',
		link: function($scope, element, attrs) {
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

			if (_.isArray($scope.config)) {
				console.log('ga: ' + $scope.config);
				ga('create', $scope.config[0],  $scope.config[1]);
				ga('send', 'pageview');
			} else {
				console.log('no ga: '+ $scope.config);
			}
		},
		controller: ['$scope', 'GOOGLE_ANALYTICS', function($scope, GOOGLE_ANALYTICS){
			$scope.config = GOOGLE_ANALYTICS;
		}]
	};
});
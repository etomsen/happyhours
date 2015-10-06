(function(){
	'use strict';
	angular
		.module('happyhours.intro')
		.controller('Intro', Intro);

	Intro.$inject = ['$scope', '$location', '$ionicSlideBoxDelegate'];

	function Intro($scope, $location, $ionicSlideBoxDelegate) {
		$scope.startApp = function() {
			$location.path('/main/map');
		};
		$scope.next = function() {
			$ionicSlideBoxDelegate.next();
		};
		$scope.previous = function() {
			$ionicSlideBoxDelegate.previous();
		};

		$scope.slideChanged = function(index) {
			$scope.slideIndex = index;
		};
	}
}());
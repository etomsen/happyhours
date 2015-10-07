(function(){
	'use strict';
	angular
		.module('happyhours.main')
		.controller('Main', Main);

		Main.$inject = [
			'$rootScope', '$state', '$scope', '$ionicHistory', '$ionicTopMenuDelegate', '$ionicLoading', '$timeout'];

		function Main($rootScope, $state, $scope, $ionicHistory, $ionicTopMenuDelegate, $ionicLoading, $timeout) {

			var history = [];
			$scope.data = {
				showMainMenuBtn: false,
				showBackBtn: false,
				hasTabsTop: true,
				buttons: []
			};

			$scope.navbarButtonClick = function(button) {
				if (button.stateName) {
					$state.go(button.stateName);
					return;
				}
				if (button.clickEvent) {
					$scope.$broadcast(button.clickEvent);
					return;
				}
			};

			function calcHistoryLevel(historyLevel, params) {
				if (typeof(historyLevel) === 'function') {
					return historyLevel(params);
				} else {
					return historyLevel ? historyLevel : 0;
				}
			}

			$scope.init = function(){
				$scope.data.hasTabsTop = $state.current.data.hasTabsTop ? true : false;
				$timeout(function(){
					var historyLevel = calcHistoryLevel($state.current.data.historyLevel, $state.params);
					$scope.data.showMainMenuBtn = historyLevel === 0;
					$scope.data.showBackBtn = historyLevel !== 0;
					$scope.data.buttons = [];
					var buttons = $state.current.data.buttons;
					if (buttons) {
						for (var i = 0; i < buttons.length; i++) {
							$scope.data.buttons.push(buttons[i]);
						}
					}
				}, 10);
			};


			$scope.goBack = function() {
				if (history.length < 2) {
					$state.go('intro');
					return;
				} else {
					var currentState = history.pop();
					var backState;
					while(history.length > 0) {
						if (history[history.length-1].data.historyLevelValue === currentState.data.historyLevelValue) {
							backState = history.pop();
						} else {
							break;
						}
					}
					if (history.length === 0) {
						$state.go(backState.name);
						throw new ENavigation('History is corrupted. Looks like you\'ve pressed back in historyLevel=0 state');
					}
					backState = history[history.length-1];
					backState.data.params.goBack = true;
					$state.go(backState.name, backState.data.params);
				}
			};

			$scope.addStateToHistory = function(toState, toParams) {
				$scope.data = $scope.data || {};
				toState.data = toState.data || {};

				// fix to angular-ui/ui-router#1307: https://github.com/angular-ui/ui-router/issues/1307
				// as $stateChangeStart doesn't fire the first time, we have to inject the inital app state manually
				if (history.length === 0) {
					$state.current.data = $state.current.data || {};
					$state.current.data.historyLevelValue = calcHistoryLevel($state.current.data.historyLevel, $state.params);
					$state.current.data.params = $state.params;
					history.push($state.current);
				}
				var currentStateLevel = history[history.length-1].data.historyLevelValue;
				if (toState.data.historyLevel === undefined) {
					toState.data.historyLevel = currentStateLevel + 1;
					toState.data.historyLevelValue = currentStateLevel + 1;
				} else {
					toState.data.historyLevelValue = calcHistoryLevel(toState.data.historyLevel, toParams);
				}
				toState.data.params = toParams;
				// clearing the history for a root view
				if (toState.data.historyLevelValue === 0) {
					history = [];
					history.push(toState);
					return;
				}

				// pop all deeper states
				while (history.length > 0) {
					if (history[history.length-1].name === toState.name) {
						history.pop();
						continue;
					}
					if (history[history.length-1].data.historyLevelValue > toState.data.historyLevelValue) {
						history.pop();
						continue;
					}
					break;
				}
				if (history.length === 0){
					// there should be always one state in history!!
					throw new ENavigation('Empty history when adding state={0} historyLevel={1}'.f(toState.name, toState.data.historyLevel));
				}
				history.push(toState);
			};

			$scope.$on('tao.event.historyBack', function () {
				$scope.goBack();
			});

			function ENavigation(message) {
  				this.name = 'ENavigation';
  				this.message = message;
			}

			ENavigation.prototype = new Error();
			ENavigation.prototype.constructor = ENavigation;

			$scope.$on('$ionicView.beforeEnter', function() {
				$scope.init();
			});

			$scope.$on('$stateChangeStart', function (event, toState, toParams) {
				if (toState.data && toState.data.params && toState.data.params.goBack) {
					delete toState.data.params.goBack;
				} else {
					$scope.addStateToHistory(toState, toParams);
				}
			});

			$rootScope.$on('$stateChangeSuccess', function(){
				// event, toState, toParams, fromState, fromParams
				if (history.length > 0) {
					history[history.length-1].historyId = history[history.length-1].historyId || $ionicHistory.currentHistoryId();
				}
			});
		}
}());
(function(L){
	'use strict';
	angular
		.module('happyhours.main')
		.controller('Map', Ctrl);

	Ctrl.$inject = ['$scope', 'happyhours', '$ionicLoading', '$timeout'];

	function Ctrl($scope, happyhours, $ionicLoading, $timeout) {

		$scope.actions = [];
		$scope.data = {};
		var clusterer;
		var markers = [];
		var map;
		var weekdayNames = ['Каждый день', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

		function initMap() {
			var center = [53.905378, 27.553738];
			L.mapbox.accessToken = 'pk.eyJ1Ijoibm90dmFkIiwiYSI6IkNmRlM2a2cifQ.K9sNVhElb60G-UDU6SNvGQ';
			var map_id = 'notvad.76101867';
			var mapboxTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/' + map_id + '/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
				attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>'
			});

			map = L.map('happyhours_map', {
				center: center,
				zoom: 12,
				maxZoom: 18
			}).addLayer(mapboxTiles);

			// var lc = L.control.locate({
			// follow: true,
			// strings: {
			// title: "Где я?",
			// popup: "Вы тут где-то в районе {distance} {unit}"
			// },
			// keepCurrentZoomLevel: true,
			// icon: 'glyphicon glyphicon-map-marker',  // class for icon, fa-location-arrow or fa-map-marker
			// iconLoading: 'glyphicon glyphicon-map-marker grey',  // class for loading icon
			// }).addTo(myMap);

			// map.on('startfollowing', function () {
			// 	map.on('dragstart', lc._stopFollowing, lc);
			// }).on('stopfollowing', function () {
			// 	map.off('dragstart', lc._stopFollowing, lc);
			// });
		}



		function onGetActionsSuccess(data) {
			$scope.actions = happyhours.filterActionsData(data.actions);
			updateMap();
		}

		function onGetActionsFail(error) {
			alert(error);
		}


		// function getDay() {
		// 	if ($('.weekday-group .btn.active').length) {
		// 		return parseInt($('.weekday-group .btn.active').attr('data-day'));
		// 	}
		// 	if ($('.tagged-actions').length > 0) {
		// 		return 0;
		// 	}
		// 	return undefined;
		// }


		function updateMarkers() {
			markers = [];
			for (var i = 0; i < $scope.actions.length; i++) {
				var a = $scope.actions[i];
				for (var k = 0; k < a.facilities.length; k++) {
					var f = a.facilities[k];
					var coord = [f.facility.lat, f.facility.lon];
					var popupContent = '<b>' + a.title + '</b><br/>';
					// var day = getDay();
					var day = 0;
					if (day === 0) {
	 					// if any day - show days, not time
						var actionDays = happyhours.getActionDays(a).map(function (el) {
							return weekdayNames[el];
						});
						popupContent += 'Действует: ' + actionDays.join(', ') + '<br/>';
					} else if (f.dt_start) {
						popupContent += 'Действует c ' + f.dt_start.format('HH:mm')+ ' до ' + f.dt_end.format('HH:mm') + '<br/>';
					} else {
						popupContent += '<br/>';
					}
					popupContent += f.facility.name + ', ' + f.facility.address + '<br/>' +
						'<a href="' + a.url + '">Хочу подробности</a>';

					var image = 'default';
					if (a.image) {
						image = a.image;
					}
					var icon = L.divIcon({className: image});
					var marker = L.marker(coord, {icon: icon});
					if (a.title) {
						marker.bindPopup(popupContent);
					}

					var tags = [];
					if (a.tags) {
						tags = a.tags.map(function (el) {
							return el.slug;
						});
					}
					markers.push(marker);
				}
			}
		}

		function updateMap() {
			if (clusterer) {
				for (var i = 0; i < markers.length; i++) {
					clusterer.removeLayer(markers[i]);
				}
			}
			updateMarkers();
			clusterer = new L.MarkerClusterGroup({
				maxClusterRadius: 40
			});

			for (i = 0; i < markers.length; i++) {
				clusterer.addLayer(markers[i]);
			}

        	map.addLayer(clusterer);
        	if (markers.length === 1) {
				map.setView(markers[0].getLatLng());
			}
		}

		$scope.doRefresh = function() {
			delete $scope.data.loadError;
			delete $scope.data.actions;
			$ionicLoading.show({template: 'Loading...'});
			happyhours.getActionsDemo()
				.then(onGetActionsSuccess, onGetActionsFail)
				.finally(function() {
					$scope.$broadcast('scroll.refreshComplete');
					$timeout(function(){$ionicLoading.hide();}, 200);
	     		});
		};

		$scope.data = {};

		$scope.$on('$ionicView.afterEnter', function(){
			$timeout(function(){$scope.data.actionButtonOn = 'on';}, 1000);
		});

		$scope.$on('$ionicView.beforeEnter', function(){
			initMap();
			$scope.doRefresh();
		});

	}
}(L));
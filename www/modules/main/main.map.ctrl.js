(function(){
	'use strict';
	angular
		.module('happyhours.main')
		.controller('Map', Map);

	Map.$inject = ['$scope', '$cordovaGeolocation'];

	function Map($scope, $cordovaGeolocation) {
		$scope.$on('$stateChangeSuccess', function() {
			$scope.map = {
				defaults: {
					tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
					maxZoom: 18,
					zoomControlPosition: 'bottomleft'
				},
				markers : {},
				events: {
					map: {
						enable: ['context'],
						logic: 'emit'
					}
				}
			};
			$scope.centerMap();
		});

		var Location = function() {
			if ( !(this instanceof Location) ) {
				return new Location();
			}
			this.lat  = '';
			this.lng  = '';
			this.name = '';
		};
		/**
		 * Detect user long-pressing on map to add new location
		 */
		$scope.$on('leafletDirectiveMap.contextmenu', function(event, locationEvent){
			$scope.newLocation = new Location();
			$scope.newLocation.lat = locationEvent.leafletEvent.latlng.lat;
			$scope.newLocation.lng = locationEvent.leafletEvent.latlng.lng;
			alert('long press should focus');
		});

		/**
		 * Center map on specific saved location
		 * @param  {[type]} locationKey [description]
		 */
		$scope.centerMap = function() {

			var location =  {
				name : 'Минск, Беларусь',
				lat : 53.9000,
				lng : 27.5667
			};

			$scope.map.center  = {
				lat : location.lat,
				lng : location.lng,
				zoom : 12
			};

			$scope.map.markers['test'] = {
				lat: location.lat,
				lng: location.lng,
				message: location.name,
				focus: true,
				draggable: false
			};
		};

		/**
		 * Center map on user's current position
		 */
		$scope.centerCurrent = function(){
			$cordovaGeolocation.getCurrentPosition().then(function (position) {
				$scope.map.center.lat  = position.coords.latitude;
				$scope.map.center.lng = position.coords.longitude;
				$scope.map.center.zoom = 15;

				$scope.map.markers.now = {
					lat:position.coords.latitude,
					lng:position.coords.longitude,
					message: 'You Are Here',
					focus: true,
					draggable: false
				};
			}, function(err) {
				console.log('Location error!');
				console.log(err);
			});
		};
	}
}());
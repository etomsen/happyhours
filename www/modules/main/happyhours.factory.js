(function() {
	'use strict';
	angular
		.module('happyhours.main')
		.factory('happyhours', factoryFn);

	factoryFn.$inject = ['$q','$http', '$filter', 'moment'];

	function factoryFn($q, $http, $filter, moment) {
		var service = {
			getActionsDemo: getActionsDemo,
			getActions: getActions,
			getActionDays: getActionDays,
			filterActionsData: filterActionsData
		};

		return service;


		function filterActionsData(actions) {
			var now = moment();
			var day = 0;

			for (var i = 0; i < actions.length; i++) {
				var actionData = actions[i];
				actionData.facilities = [];
				var actionFacilities = actionData.action_facilities;

				for (var k = 0; k < actionFacilities.length; k++) {
					var actionFacility = actionFacilities[k];
					var facilitiesIds = [];
					if (actionFacility.id === 494 || actionFacility.id === 481) {
						console.log(494, 481);
					}
					var actionTimes = actionFacility.action_times;
					for (var j = 0; j < actionTimes.length; j++) {
						var actionTime = actionTimes[j];
						var filteredActionTime = null;
						var currentDay = day;
						if (day === undefined) {
							currentDay = moment().isoWeekday();
						}
						if (day === 0 || actionTime.week_day_start === currentDay || actionTime.week_day_end === currentDay || (actionTime.week_day_start === 0 && actionTime.week_day_end === 0)) {
							filteredActionTime = actionTime;
						}
						if (filteredActionTime) {
							var actionStartEndDt = getActionStartEndDatetime(filteredActionTime);
							if (day !== undefined) {
								for (var abrval = 0; abrval < actionFacility.facilities.length; abrval++) {
									var facility = actionFacility.facilities[abrval];
									if (facilitiesIds.indexOf(facility.id) === -1) {
										facilitiesIds.push(facility.id);
										actionData.facilities.push({
											facility: facility,
											dt_start: actionStartEndDt[0],
											dt_end: actionStartEndDt[1]
										});
									}
								}
							} else if (actionStartEndDt[0] < now && now < actionStartEndDt[1] && actionFacility.facilities.length) {
								for (abrval = 0; abrval < actionFacility.facilities.length; abrval++) {
									actionData.facilities.push({
										facility: actionFacility.facilities[abrval],
										dt_start: actionStartEndDt[0],
										dt_end: actionStartEndDt[1]
									});
								}
							}
						}
					}
				}
				if (!actionData.facilities.length) {
					console.log('no facility', actionData.id);
				} else {
					actionData.dt_start = actionData.facilities[0].dt_start;
					actionData.dt_end = actionData.facilities[0].dt_end;
					actionData.facility = actionData.facilities[0].facility;
				}
			}
			actions = actions.filter(function (el) {
				return el.facility;
			});
			actions.sort(function (a, b) {
				return a.dt_end <= b.dt_end ? -1 : 1;
			});
			return actions;
		}

		function getActionStartEndDatetime(actionTime, currDatetime) {
			if (currDatetime) {
				currDatetime = moment(currDatetime);
			} else {
				currDatetime = moment();
			}
			var timeStart = moment(actionTime.time_start, 'HH:mm:ss');
			var timeEnd = moment(actionTime.time_end, 'HH:mm:ss');

			var clonedCurrDatetime = currDatetime.clone();
			clonedCurrDatetime.hour(timeStart.hour());
			clonedCurrDatetime.minute(timeStart.minute());
			var datetimeStart = clonedCurrDatetime.clone();

			clonedCurrDatetime.hour(timeEnd.hour());
			clonedCurrDatetime.minute(timeEnd.minute());
			var datetimeEnd = clonedCurrDatetime;

			if (actionTime.week_day_start === 0 && actionTime.week_day_end === 0) {
				if (timeStart >= timeEnd) {
					if (currDatetime < datetimeEnd) {
						datetimeStart.subtract(1, 'days');
					} else {
						datetimeEnd.add(1, 'days');
					}
				}
			} else {
				if (actionTime.week_day_start !== actionTime.week_day_end) {
					if (actionTime.week_day_start === currDatetime.isoWeekday()) {
						datetimeEnd.add(1, 'days');
					} else if (actionTime.week_day_end === currDatetime.isoWeekday()) {
						datetimeStart.subtract(1, 'days');
					}
				}

			}
			return [datetimeStart, datetimeEnd];
		}

		function getActionDays(a) {
			var actionDays = [];
			for (var i = 0; i < a.action_facilities.length; i++) {
				var action_times = a.action_facilities[i].action_times;
				for (var k = 0; k < action_times.length; k++) {
					var action_day = action_times[k].week_day_start;
					if (actionDays.indexOf(action_day) === -1) {
						actionDays.push(action_day);
					}
				}
			}
			if (actionDays.indexOf(0) !== -1 || actionDays.length === 7) {
				actionDays = [0];
			}
			actionDays.sort();
			return actionDays;
		}

		function getActionsDemo(data) {
			var deferred = $q.defer();
			data = data || {};
			$http.get('./data/actions.json').then(
				function(actions){
					if (actions.status !== 200) {
						deferred.reject({errCode: 'happyhours.error.restapi.status.'+actions.status});
						return;
					}
					if (!actions.data || !(actions.data instanceof Array)) {
						deferred.reject({errCode: 'happyhours.error.restapi.dataFormat'});
						return;
					}
					data.actions = actions.data;
					deferred.resolve(data);
				},
				function(){
					deferred.reject({errCode: 'happyhours.error.restapi.noData'});
				});
			return deferred.promise;
		}

		function getActions(data) {
			var deferred = $q.defer();
			data = data || {};
			$http({
				method: 'GET',
				url: 'http://www.happyhours.by/api/v1/actions/',
				headers: {
					'Content-Type': 'application/json'
				},
				timeout: 10000
			}).then(function(actions){
				if (actions.status !== 200) {
					deferred.reject({errCode: 'happyhours.error.restapi.status.'+actions.status});
					return;
				}
				if (!actions.data || !(actions.data instanceof Array)) {
					deferred.reject({errCode: 'happyhours.error.restapi.dataFormat'});
					return;
				}
				data.actions = actions.data;
				deferred.resolve(data);
			}, function(error){
				console.log(error);
				deferred.reject({errCode: 'happyhours.error.restapi.noData'});
			});
			return deferred.promise;
		}
	}
})();
'use strict';

/* Controllers */

angular.module('coreBOSJSTickets.controllers')
.controller('timecontrolCtrl',function($scope, $filter, $i18next, coreBOSWSAPI, $interval) {
	var _vtappClockInterval = 0;
	var _vtappClockSeconds = 0;
	var _vtappupdateClock = function() {
		_vtappClockSeconds++;
		var hours = parseInt(_vtappClockSeconds / 60 / 60);
		var minutes = parseInt(_vtappClockSeconds / 60) % 60;
		if (hours < 10) hours = '0' + hours;
		if (minutes < 10) minutes = '0' + minutes;
		if (_vtappClockSeconds % 2 != 0) {
			$scope.ttime = hours+':'+minutes;
		} else {
			$scope.ttime = hours+' '+minutes;
		}
	};
	var _vtappstartClock = function() {
		_vtappClockInterval = $interval(_vtappupdateClock, 1000);
	};
	var _vtappstopClock = function() {
		$interval.cancel(_vtappClockInterval);
		_vtappClockSeconds = 0;
	};
	$scope.tcsItemsCount = 0;
	$scope.tcsTotalCount = 0;
	$scope.tcsList = [];
	var current_user_id = '19x142';
	var gridModule = 'Timecontrol';
	var sqlr = "select id,date_start,time_start,time_end,relatedname,product_id,totaltime from " + gridModule + ' ';
	var sqlw = " where assigned_user_id='" + current_user_id + "'";
	var sqlc = 'select count(*) from ' + gridModule + ' ';
	$scope.getGridContents = function() {
		$scope.tcsItemsCount = 0;
		$scope.tcsTotalCount = 0;
		$scope.tcsList = [];
		coreBOSWSAPI.doQuery(sqlr + sqlw + ' order by date_start desc limit 5').then(function(tcrs) {
			var derefcols = ["product_id"];
			var refids = coreBOSWSAPI.getReferenceIDsFromResultSet(tcrs.data.result,derefcols);
			coreBOSWSAPI.doInvoke('getReferenceValue',{'id':coreBOSWSAPI.serialize(refids)},'POST').then(function(derefrs) {
				var derefids = coreBOSWSAPI.unserialize(derefrs.data.result);
				angular.forEach(tcrs.data.result, function(row, pos) {
					tcrs.data.result[pos]['tcbillw'] = derefids[row['product_id']] != undefined ? derefids[row['product_id']].reference : '';
				});
				$scope.tcsList = tcrs.data.result;
				$scope.tcsItemsCount = tcrs.data.result.length;
			});
		});
		coreBOSWSAPI.doQuery(sqlc + sqlw).then(function(response) {
			$scope.tcsTotalCount = response.data.result[0].count;
		});
	};
	$scope.onServerSideOrdersRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
		var where = coreBOSWSAPI.getWhereCondition($scope.tcsList[0],filterBy, filterByFields, orderBy, orderByReverse, ' and ', sqlw);
		var limit = coreBOSWSAPI.getLimit(pageItems,currentPage*pageItems);
		var query = sqlr + where + limit;
		coreBOSWSAPI.doQuery(query).then(function(tcrs) {
			var derefcols = ["product_id"];
			var refids = coreBOSWSAPI.getReferenceIDsFromResultSet(tcrs.data.result,derefcols);
			coreBOSWSAPI.doInvoke('getReferenceValue',{'id':coreBOSWSAPI.serialize(refids)},'POST').then(function(derefrs) {
				var derefids = coreBOSWSAPI.unserialize(derefrs.data.result);
				angular.forEach(tcrs.data.result, function(row, pos) {
					tcrs.data.result[pos]['tcbillw'] = derefids[row['product_id']] != undefined ? derefids[row['product_id']].reference : '';
				});
				$scope.tcsList = tcrs.data.result;
				$scope.tcsItemsCount = tcrs.data.result.length;
			});
		});
		coreBOSWSAPI.doQuery(sqlc + where).then(function(response) {
			$scope.tcsTotalCount = response.data.result[0].count;
		});
	};
	$scope.setEmptyTC = function() {
		_vtappstopClock();
		$scope.ttime = '';
		$scope.lblstartstop = i18n.t('LBL_WATCH_START');
		$scope.classstartstop = 'start-button';
		$scope.watchonoff = 'watchoff';
		$scope.lastTC = {timecontrolid: 0};
	};
	$scope.setEmptyTC();
	coreBOSWSAPI.doDescribe('Timecontrol').then(function(response) {
		// $scope.idPrefix = response.data.result.idPrefix;
		// $scope.createable = response.data.result.createable;
		// $scope.updateable = response.data.result.updateable;
		// $scope.deleteable = response.data.result.deleteable;
		// $scope.retrieveable = response.data.result.retrieveable;
		// $scope.modulename = response.data.result.name;
		$scope.modulefields = response.data.result.fields;
		var found = $filter('getArrayElementById')($scope.modulefields, 'relconcept', 'name');
		if (found) {
			$scope.tcrelconcepts = found.type.picklistValues;
		}
	});
	$scope.getRelatedTo  = function(viewValue) {
		return coreBOSWSAPI.doInvoke('getReferenceAutocomplete',{
			'term':viewValue,
			'filter':'startswith',
			'searchinmodules':'',
			'limit':'30',
			},'GET').then(function(records) {
				return records.data.result;
				// var ret = records.data.result.map(function(item){
					// return item.crmname;
				// });
				return ret;
			});
	};
	$scope.reltoSelect = function($item, $model, $label) {
		$scope.lastTC.relatedto = $item.crmid;
	};
	$scope.getRelatedPS  = function(viewValue) {
		return coreBOSWSAPI.doInvoke('getReferenceAutocomplete',{
			'term':viewValue,
			'filter':'startswith',
			'searchinmodules':'Products,Services',
			'limit':'30',
			},'GET').then(function(records) {
				return records.data.result;
				// var ret = records.data.result.map(function(item){
					// return item.crmname;
				// });
				return ret;
			});
	};
	$scope.relpsSelect = function($item, $model, $label) {
		$scope.lastTC.product_id = $item.crmid;
	};
	$scope.getActiveTC = function(acttcid) {
		$scope.lastTC = {timecontrolid: 0};
		if (acttcid == undefined || acttcid == 0 || acttcid == '') { // get My Lastest Open TC
			var tcq = "SELECT relconcept,date_start,time_start,date_end,time_end,relatedto,relatedname,product_id,totaltime FROM timecontrol WHERE time_end=' ' order by date_start desc limit 1";
		} else {
			var tcq = "SELECT relconcept,date_start,time_start,date_end,time_end,relatedto,relatedname,product_id,totaltime FROM timecontrol WHERE id='" + acttcid + "'";
		}
		coreBOSWSAPI.doQuery(tcq).then(function(acttcrs) {
			if (acttcrs.data.success && acttcrs.data.result.length > 0) {
				$scope.lastTC = {
					timecontrolid: acttcrs.data.result[0].id,
					relatedname: acttcrs.data.result[0].relatedname,
					relatedto: acttcrs.data.result[0].relatedto,
					totaltime: acttcrs.data.result[0].totaltime,
					time_start: acttcrs.data.result[0].time_start.substring(0, 5),
					//time_end: acttcrs.data.result[0].time_end.substring(0, 5),
					date_start: acttcrs.data.result[0].date_start,
					product_name: '',
					product_id: acttcrs.data.result[0].product_id,
					relconcept: acttcrs.data.result[0].relconcept
				};
				if ($scope.lastTC.product_id != '') {
					coreBOSWSAPI.doInvoke('getReferenceValue',{'id':coreBOSWSAPI.serialize([$scope.lastTC.product_id])},'POST').then(function(derefrs) {
						var derefids = coreBOSWSAPI.unserialize(derefrs.data.result);
						$scope.lastTC.product_name = derefids[$scope.lastTC.product_id] != undefined ? derefids[$scope.lastTC.product_id].reference : '';
					});
				}
				var dr = $scope.lastTC.date_start.split('-');
				var tr = $scope.lastTC.time_start.split(':');
				var t1 = new Date(dr[0], dr[1]-1, dr[2], tr[0], tr[1]);
				var t2 = new Date();
				var dif = t2.getTime()-t1.getTime();
				var Seconds_from_T1_to_T2 = dif / 1000;
				_vtappClockSeconds = Math.round(Seconds_from_T1_to_T2);
				_vtappstartClock();
			}
			if ($scope.tcrelconcepts != undefined) {
				var found = $filter('getArrayElementById')($scope.tcrelconcepts, $scope.lastTC.relconcept, 'value');
				if (found) {
					$scope.tcrelconcept = found;
				}
			}
			$scope.watchonoff = ($scope.lastTC.timecontrolid == '' || $scope.lastTC.timecontrolid == 0) ? 'watchoff' : 'watchon';
			if ($scope.lastTC.timecontrolid == '' || $scope.lastTC.timecontrolid == 0) {
				$scope.lblstartstop = i18n.t('LBL_WATCH_START');
				$scope.classstartstop = 'start-button';
			} else {
				$scope.lblstartstop = i18n.t('LBL_WATCH_STOP');
				$scope.classstartstop = 'stop-button';
			}
		},function(rdo) {
			$scope.setEmptyTC();
		});
	};
	$scope.getActiveTC(0);
	$scope.$watch(function(scope) { return scope.tcrelconcepts; },
		function(newValue, oldValue) {
			if ((oldValue == undefined && newValue != undefined) || (oldValue==newValue && oldValue != undefined)) {
				var found = $filter('getArrayElementById')($scope.tcrelconcepts, $scope.lastTC.relconcept, 'value');
				if (found) {
					$scope.tcrelconcept = found;
				}
			}
	});
	$scope.$watch(function(scope) { return scope.tcrelconcept; },
		function(newValue, oldValue) {
			if (newValue != undefined) $scope.lastTC.relconcept = newValue.value;
	});
	$scope.continuetc = function(tcid) {
		var found = $filter('getArrayElementById')($scope.tcsList, tcid, 'id');
		if (found) {
			coreBOSWSAPI.doQuery("select * from Timecontrol where id = '" + tcid + "'").then(function(acttcrs) {
				if (acttcrs.data.success && acttcrs.data.result.length > 0) {
					var currentDate = new Date();
					var day = currentDate.getDate();
					var month = currentDate.getMonth() + 1;
					var year = currentDate.getFullYear();
					var hours = currentDate.getHours();
					var minutes = currentDate.getMinutes();
					if (hours < 10)
						hours = "0" + hours;
					if (minutes < 10)
						minutes = "0" + minutes;
					var newtc = acttcrs.data.result[0];
					newtc.date_start = year + '-' + month + '-' + day;
					newtc.time_start = hours + ':' + minutes;
					newtc.date_end = '';
					newtc.time_end = '';
					coreBOSWSAPI.doCreate('Timecontrol',newtc).then(function(rdo) {
						$scope.getActiveTC(rdo.data.result.id);
						$scope.getGridContents();
					});
				}
			});
		}
	};
	$scope.deletetc = function(tcid) {
		var msg = i18n.translate('DeleteTC') + "\n";
		var found = $filter('getArrayElementById')($scope.tcsList, tcid, 'id');
		if (found) {
			msg = msg + found.relatedname + "\n";
			msg = msg + found.date_start + "\n";
			msg = msg + found.totaltime + "\n";
		}
		if (confirm(msg)) {
			coreBOSWSAPI.doDelete(tcid).then(function(rdo) {
				$scope.getGridContents();
				// FIXME: this should be a fading popup
				if (rdo.data.result.status == 'successful') {
					alert(i18n.translate('TCDeletedOK'));
				} else {
					alert(i18n.translate('TCDeletedNOK'));
				}
			});
		}
	};
	$scope.startstopbtn = function() {
		var currentDate = new Date();
		var day = currentDate.getDate();
		var month = currentDate.getMonth() + 1;
		var year = currentDate.getFullYear();
		var hours = currentDate.getHours();
		var minutes = currentDate.getMinutes();
		if (hours < 10)
			hours = "0" + hours;
		if (minutes < 10)
			minutes = "0" + minutes;
		if ($scope.lastTC.timecontrolid == undefined || $scope.lastTC.timecontrolid == '' || $scope.lastTC.timecontrolid == 0) {
			// create TC
			var newtc = {};
			newtc.date_start = year + '-' + month + '-' + day;
			newtc.time_start = hours + ':' + minutes;
			newtc.date_end = '';
			newtc.time_end = '';
			newtc.tcunits = '0';
			newtc.description = '';
			newtc.relatedto = $scope.lastTC.relatedto;
			newtc.relconcept = $scope.lastTC.relconcept;
			newtc.product_id = $scope.lastTC.product_id;
			coreBOSWSAPI.doCreate('Timecontrol',newtc).then(function(rdo) {
				$scope.getActiveTC(rdo.data.result.id);
				$scope.getGridContents();
			});
		} else {
			// close TC
			var closetc = {};
			closetc.id = $scope.lastTC.timecontrolid;
			closetc.date_start = $scope.lastTC.date_start;
			closetc.time_start = $scope.lastTC.time_start;
			closetc.date_end = year + '-' + month + '-' + day;
			closetc.time_end = hours + ':' + minutes;
			closetc.relatedto = $scope.lastTC.relatedto;
			closetc.relconcept = $scope.lastTC.relconcept;
			closetc.product_id = $scope.lastTC.product_id;
			coreBOSWSAPI.doUpdate('Timecontrol',closetc).then(function(rdo) {
				$scope.setEmptyTC();
				$scope.getGridContents();
			});
		}
	};
});


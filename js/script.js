angular.module('reporting', [
		'ui.bootstrap', 
		'ngRoute', 
		'angularMoment', 
		'angular-loading-bar'
	])

	.constant('moment', moment)

	.config(function($routeProvider){
		$routeProvider
			.when('/', {
				templateUrl: 'partials/summaries.html', 
				controller: 'SummariesCtrl', 
				resolve: {
							summaryData: function($http, $q, CSVConverterService){
								var deferred = $q.defer();
								$http.get('data/ViewsByUserActivity_01.01.2014_12.31.2014.xls')
									.success(function (data) {
										deferred.resolve(CSVConverterService.csvToJSON(data));
									});
									return deferred.promise;
							}, 
							dateToMonth: function(DateConverterService) {
								
							}
						}
			})
			.when('/topten', {
				templateUrl: 'partials/topten.html', 
				controller: 'ToptenCtrl'
			})
			.otherwise({redirectTo:'/'})
	})

	.controller('HeaderCtrl', function($scope){
		$scope.date = Date.now();
	})

	.controller('SummariesCtrl', function($scope, summaryData, moment){

		// get latest record in data 
		var getLatestRecord = function() {
			// return newest record 
			var latestRecord = null;

			// loop through data
			for (var i = 0; i < summaryData.length; i++) {
				// grab date record
				var dateRecords = summaryData[i].IntervalStartDate;
				// parse string into date
				var dateRecordtoDate = new Date(dateRecords);
				if (latestRecord == null || latestRecord < dateRecordtoDate) {
					latestRecord = dateRecordtoDate;
				}
			}

			// return latest record date
			return latestRecord;
		}

		// get week ending date
		Date.prototype.endOfMonth = function(){
		  return new Date( 
		      this.getFullYear(), 
		      this.getMonth()
		  );
		};

		Date.prototype.endOfWeek = function(){
		  return new Date( 
		      this.getFullYear(), 
		      this.getMonth(), 
		      this.getDate() + 7 - this.getDay() 
		  );
		};

		// date ranges for data dates to pass through to find which "range" it belongs to
		var dateRangeFilter = function(dateRange, row) {
	
			var rowDate = new Date(row.IntervalStartDate);
			var rowDateFormatted = moment(rowDate);

			if (dateRange.start <= rowDateFormatted && rowDateFormatted <= dateRange.end) {
				return row;
			}
		}

		// 2. Check Active and Guest Users

		var checkIfActiveUser = function(row){

			if (!row.UserName.match(/^@mediafly\.com|@appirio\.com|@liveaxle\.com|john\.lark@sap\.com|gregory\.spray@sap\.com|kami\.kawai@sap\.com|Guest of /)) {
				return true;
			}

			return false;
		};

		var checkIfGuest = function(row) {

			if (row.UserName.match(/Guest of/)) {
				return true;
			}

			return false;
		};

			// heavy lifting for users

		var rollUpDataForRecord = function(rolledUpData, record) {

  			// increment allViewsCount
			rolledUpData.allViewsCount += Number(record.Views - 1);

			// do user related things
			var isUser = checkIfActiveUser(record);
			if (isUser) {
	  			if (rolledUpData.activeUsers.indexOf(record.UserName) === -1) {
	  				rolledUpData.activeUsers.push(record.UserName);
	  			}
			}

			// do user guest things
			var isGuest = checkIfGuest(record);
			if (isGuest) {
				rolledUpData.guestUsersCount++;
				rolledUpData.guestViewsCount += Number(record.Views - 1);
			}

  			return rolledUpData;
		};



		// quarter table starts here

		var quarterFilter = function(quarter, row) {

			var startDate = new Date(row.IntervalStartDate);
			var startMonth = startDate.getMonth();
//			var startYear = startDate.getYear();

			var firstQ  = moment().subtract(1, 'quarter').format('QqYY');
			var secondQ = moment().subtract(2, 'quarter').format('QqYY');
			var thirdQ  = moment().subtract(3, 'quarter').format('QqYY');
			var fourthQ = moment().subtract(4, 'quarter').format('QqYY');

			if (quarter == firstQ && (startMonth <= 2)) {
				return row;
			}

			if (quarter == secondQ && (startMonth > 2 && startMonth <= 5)) {
				return row;
			}

			if (quarter == thirdQ && (startMonth > 5 && startMonth <= 7)) {
				return row;
			}

			if (quarter == fourthQ && (startMonth > 7)) {
				return row;
			}

		}

		var quarterReduction = function(previousRolledUpData, record) {

			// init rolledUpData
  			var rolledUpData = {
  				date: previousRolledUpData.date || displayQuarterDate(record),
			    activeUsers: (previousRolledUpData.activeUsers || []),
			    allViewsCount: Number(previousRolledUpData.allViewsCount || 0), 
	  			guestUsersCount: previousRolledUpData.guestUsersCount || 0,
			    guestViewsCount: Number(previousRolledUpData.guestViewsCount || 0)
  			}; 

  			return rollUpDataForRecord(rolledUpData, record);
		};

		function outputQuarters() {
			var date = new Date(new Date().getFullYear(), 0, 1);
			return [
				moment(date).subtract(1, 'quarter').format('QqYY'),
				moment(date).subtract(2, 'quarter').format('QqYY'),
				moment(date).subtract(3, 'quarter').format('QqYY'),
				moment(date).subtract(4, 'quarter').format('QqYY'),
			];
		}

		function displayQuarterDate(record) { 

			var startDate  = new Date(record.IntervalStartDate);
			var startMonth = startDate.getMonth();

			var firstQ  = moment().subtract(1, 'quarter').format('QqYY');
			var secondQ = moment().subtract(2, 'quarter').format('QqYY');
			var thirdQ  = moment().subtract(3, 'quarter').format('QqYY');
			var fourthQ = moment().subtract(4, 'quarter').format('QqYY');

			if (startMonth <= 2) {
				return  firstQ;
			} else if (startMonth > 2 && startMonth <= 5) {
				return secondQ;
			} else if (startMonth > 5 && startMonth <= 7) {
				return thirdQ;
			} else if (startMonth > 7) {
				return fourthQ;
			}

		}

		$scope.quarters = outputQuarters().map(function(quarter){

			var data = summaryData
				.filter(quarterFilter.bind(this, quarter))
				.reduce(quarterReduction);

			return data;
		});

		// month table starts here
		function getMonthRanges() {
			var latestRecord = getLatestRecord();

			var start = latestRecord.endOfMonth();
			var end   = latestRecord;

			return [
				{ start: moment(start), end: moment(end) },
				{ start: moment(start).subtract(1, 'month'), end: moment(end).subtract(1, 'month') },
				{ start: moment(start).subtract(2, 'month'), end: moment(end).subtract(2, 'month') },
				{ start: moment(start).subtract(3, 'month'), end: moment(end).subtract(3, 'month') },
				{ start: moment(start).subtract(4, 'month'), end: moment(end).subtract(4, 'month') }
			]
		}

		function displayMonthDate(record) { 

			var recordDate  = new Date(record.IntervalStartDate);

			var end = recordDate.endOfMonth();

			return moment(end).format("MMM YYYY");

		}

		var monthReduction = function(previousRolledUpData, record) {

			// init rolledUpData
  			var rolledUpData = {
  				date: previousRolledUpData.date || displayMonthDate(record),
			    activeUsers: (previousRolledUpData.activeUsers || []),
			    allViewsCount: Number(previousRolledUpData.allViewsCount || 0), 
	  			guestUsersCount: previousRolledUpData.guestUsersCount || 0,
			    guestViewsCount: Number(previousRolledUpData.guestViewsCount || 0)
  			}; 

  			return rollUpDataForRecord(rolledUpData, record);
		};

		// output to view
		$scope.months = getMonthRanges().map(function(month){

			console.log("************************* " + month.start + " - " + month.end);

			var data = summaryData
				.filter(dateRangeFilter.bind(this, month))
				.reduce(monthReduction);

			return data;
		});

		var endofWeekDate = getLatestRecord().endOfWeek();

		// get Monday, start of week
		var getMonday = moment(endofWeekDate).weekday(-6).format('l');

		// week table starts here
		function getWeekRanges() {

			var latestRecord = getLatestRecord();

			var end = latestRecord.endOfWeek();
			var start = moment(end).weekday(-6);

			return [
				{ start: moment(start), end: moment(end) },
				{ start: moment(start).subtract(1, 'week'), end: moment(end).subtract(1, 'week') },
				{ start: moment(start).subtract(2, 'week'), end: moment(end).subtract(2, 'week') },
				{ start: moment(start).subtract(3, 'week'), end: moment(end).subtract(3, 'week') },
				{ start: moment(start).subtract(4, 'week'), end: moment(end).subtract(4, 'week') }
			];
		}

		function displayWeekDate(record) { 

			var recordDate  = new Date(record.IntervalStartDate);

			var end = recordDate.endOfWeek();

			return moment(end).format("l");
		}

		var weekReduction = function(previousRolledUpData, record) {

			// init rolledUpData
  			var rolledUpData = {
  				date: previousRolledUpData.date || displayWeekDate(record),
			    activeUsers: (previousRolledUpData.activeUsers || []),
			    allViewsCount: Number(previousRolledUpData.allViewsCount || 0), 
	  			guestUsersCount: previousRolledUpData.guestUsersCount || 0,
			    guestViewsCount: Number(previousRolledUpData.guestViewsCount || 0)
  			}; 

  			return rollUpDataForRecord(rolledUpData, record);
		};

		$scope.weeks = getWeekRanges().map(function(week){

			// console.log("************************* " + week.start + " - " + week.end);

			var data = summaryData
				.filter(dateRangeFilter.bind(this, week))
				.reduce(weekReduction);

			return data;
		});
	
	})

    .controller('DatepickerDemoCtrl', function ($scope) {
	  $scope.today = function() {
	    $scope.dt = new Date();
	  };
	  $scope.today();

	  $scope.clear = function () {
	    $scope.dt = null;
	  };

	  // Disable weekend selection
	  $scope.disabled = function(date, mode) {
	    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	  };

	  $scope.toggleMin = function() {
	    $scope.minDate = $scope.minDate ? null : new Date();
	  };
	  $scope.toggleMin();

	  $scope.open = function($event) {
	    $event.preventDefault();
	    $event.stopPropagation();

	    $scope.opened = true;
	  };

	  $scope.dateOptions = {
	    formatYear: 'yy',
	    startingDay: 1
	  };

	  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate', 'MM.dd.yyyy'];
	  $scope.format = $scope.formats[0];
	})

	.controller('ToptenCtrl', function($scope){
		$scope.number = 10;
		$scope.getNumber = function(num) {
			return new Array(num);
		}
	})


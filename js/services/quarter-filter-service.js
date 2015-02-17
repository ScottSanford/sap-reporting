angular.module('reporting').factory('quarterFilterService', [function () {

		return function(quarter, row) {

			var startDate = new Date(row.IntervalStartDate);
			var startMonth = startDate.getMonth();
//			var startYear = startDate.getYear();

			if (quarter == "1q14" && (startMonth <= 2)) {
				return row;
			}

			if (quarter == "2q14" && (startMonth > 2 && startMonth <= 5)) {
				return row;
			}

			if (quarter == "3q14" && (startMonth > 5 && startMonth <= 7)) {
				return row;
			}

			if (quarter == "4q14" && (startMonth > 7)) {
				return row;
			}

		}
angular.module('reporting').factory("reportingInitialData", function($http, $q, CSVConverterService) {
    return function() {
        var deferred = $q.defer();
        $http.get('data/ViewsByUserActivity_01.01.2014_12.31.2014.xls')
         .success(function (data) {
            deferred.resolve(CSVConverterService.csvToJSON(data));
        });
    return deferred.promise;
    }
});
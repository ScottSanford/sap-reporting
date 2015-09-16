angular.module('reporting').factory("reportingInitialData", function($http, $q, CSVConverterService) {
    return function() {
        var deferred = $q.defer();

        // mflyCommands.search('@ReportingViewsByUserActivity')
        //     .done(function(data){  
        //         console.log("Data :: " , data);
        //         var userActivityID = data[0]['id'];
        //         // console.log(userActivityID);
        //         mflyCommands.getData(userActivityID)
        //             .done(function(data){
        //                 deferred.resolve(CSVConverterService.csvToJSON(data));
        //             })
        //     })
        // CODE BELOW IS FOR LOCAL STORAGE    
        $http.get('data/ViewsByUserActivity_01.01.2015_02.18.2015.xls')
         .success(function (data) {
         	 deferred.resolve(CSVConverterService.csvToJSON(data));
        });
    return deferred.promise;
    }
});
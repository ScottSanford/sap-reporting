angular.module('reporting').factory("registeredUsersData", function($http, $q, CSVConverterRegisteredUsers) {
    var self = {};

	var deferred = $q.defer();
			// dynamically get data from Airship
	        // mflyCommands.search('@ReportingRegisteredUsers')
         //        .done(function(data){
         //            // var h = JSON.stringify(data, null, '\t');
         //            var activeUsersID = data[0]['id'];
         //            // console.log("id == " + userActivityID);
         //            mflyCommands.getData(activeUsersID)
         //                .done(function(data){
         //                    deferred.resolve(CSVConverterRegisteredUsers.csvToJSON(data));
         //                })
        	// })
    // CODE BELOW IS FOR LOCAL STORAGE
    $http.get('data/2-18-2015_Ariba_Saleskit_users.xls')
     .success(function (data) {
        deferred.resolve(CSVConverterRegisteredUsers.csvToJSON(data));
    });
	self.registeredUsers = deferred.promise;

    return self; 

});
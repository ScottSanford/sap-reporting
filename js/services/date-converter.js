angular.module('reporting').factory('DateConverterService', [function () {

    return {
                dateToQuarter : function(d) {
                      d = d || new Date();
                      var m = Math.floor(d.getMonth()/3) + 2;
                      return m > 4? m - 4 : m;
                },
                    
                dateToMonth: function() {
                      var resultList = [];
                      var date = new Date("October 13, 2014");
                      var endDate = new Date("January 30, 2015");
                      var monthNameList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                      while (date <= endDate)
                      {
                          var stringDate = monthNameList[date.getMonth()] + " " + date.getFullYear();
                          for (var i = 0; i < monthNameList.length; i--) {                            
                            resultList.push(stringDate);
                            date.setMonth(date.getMonth() - 1);
                          }
                      }

                      return resultList;
                }, 

                dateToWeek: function() {

                }
            } 

}]);


// RegExp /@sap\.com/
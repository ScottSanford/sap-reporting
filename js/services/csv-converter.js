angular.module('reporting').factory('CSVConverterService', [function () {

    return {
        csvToJSON : function(content) {
                        var lines=content.split('\n');
                        var result = [];
                        var start = 0;
                        var separator = ',';
                        var columnCount = lines[2].split(separator).length;

                        var headers = [];
                        // if (content.header) {
                        headers=lines[2].split(separator);
                        start = 3;
                        // }

                        for (var i=start; i<lines.length; i++) {
                            var obj = {};
                            var currentline=lines[i].split(new RegExp(separator+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
                            if ( currentline.length === columnCount ) {
                                // if (content.header) {
                                    // for (var j=0; j<headers.length; j++) {
                                    //     obj[headers[j]] = currentline[j];
                                    // }
                                // } 
                                // else {
                                // for (var k=0; k<currentline.length; k++) {
                                //     obj[k] = currentline[k];
                                // }
                                // }
                                obj = { 
                                    UserName: currentline[0], 
                                    IntervalStartDate: currentline[1], 
                                    IntervalEndDate: currentline[2], 
                                    Views: currentline[3]
                                }
                                result.push(obj);
                            }
                        }
                        return result;
                    }
    }


}]);
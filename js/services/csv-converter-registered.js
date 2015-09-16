angular.module('reporting').factory('CSVConverterRegisteredUsers', [function () {

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
                        start = 1;
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
                                    User: currentline[0], 
                                }
                                result.push(obj);
                            }
                        }
                        return result;
                    }
    }


}]);

var app = angular.module('postalCodeApp', []);

app.run(function($rootScope) {
    $rootScope.$on('requestClear', function() {
        $rootScope.$broadcast('broadcastClear');
    });
});

app.controller('ClearPostalCodeCtrl', function($scope) {
    $scope.causeClearPostalCodes = function() {
        $scope.$emit('requestClear');
    }
});

app.controller('PostalCodeCtrl', function($scope) {

    $scope.postalCodeList = [];
    $scope.otherValue = "";

    $scope.$on('broadcastClear', function() {
        $scope.clearPostalCodes();
    });

    $scope.getTotalPostalCodeCount = function() {
        return $scope.postalCodeList.length;
    };

    $scope.clearPostalCodes = function() {
        $scope.postalCodeList = {};
        $scope.otherValue = {};
    };

    $scope.getPostalCodes = function(){
        $.ajax({
            type : 'POST',
            // dataType : 'jsonp',
            dataType : 'json',
			contentType: "application/json; charset=utf-8",
            // url: 'http://api.geonames.org/postalCodeSearchJSON?&maxRows=500&placename=MN&username=rohn',
            url: 'postalcodes.json',
            data: {},
			success: function(data){
				$scope.$apply(function(){ //necessary to $apply the changes
					$scope.postalCodeList = data.postalCodes;
				});
			},
            error : function(xhr, ajaxOptions, thrownError) {
                alert( "Error: " + xhr.responseText + "\n" + thrownError );
            }
        });
        $.ajax({
            type : 'POST',
            dataType : 'json',
            contentType: "application/json; charset=utf-8",
            url: 'states.json',
            data: {},
            success: function(data) {
                $scope.$apply(function(){
                    $scope.otherValue = data;
                    $scope.otherValue.sort(compare);
                });
            }
        });
        compare = function(a,b) {
            if (a.Abbreviation   < b.Abbreviation )
                return -1;
            if (a.Abbreviation   > b.Abbreviation )
                return 1;
            return 0;
        }
    };

});




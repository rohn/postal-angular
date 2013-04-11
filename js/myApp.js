var app = angular.module('postalCodeApp', []);

app.run(function($rootScope) {
    $rootScope.$on('requestClear', function() {
        $rootScope.$broadcast('broadcastClear');
    });
    $(".alert").hide();
});

app.controller('ClearPostalCodeCtrl', function($scope) {
    $scope.causeClearPostalCodes = function() {
        $scope.$emit('requestClear');
    }
});

app.controller('PostalCodeCtrl', function($scope) {

    $scope.postalCodeList = [];
    $scope.allStates = "";

    $scope.$on('broadcastClear', function() {
        $scope.clearPostalCodes();
    });

    $scope.getTotalPostalCodeCount = function() {
        return $scope.postalCodeList.length;
    };

    $scope.clearPostalCodes = function() {
        $scope.postalCodeList = {};
        $scope.allStates = {};
        $("#wordcloud").empty();
    };

    $scope.getPostalCodes = function() {
        var usrname = $('input').val() || 'demo';
        $(".alert").addClass("in");
        $(".alert").show();
        // first let's get states and their abbreviations
        // we're doing this one locally until I can find
        // a good API call to make
        $.ajax({
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            url: 'states.json',
            data: {},
            success: function(data) {
                $scope.$apply(function() {
                    $scope.allStates = data;
                    $scope.allStates.sort(compare);
                    getcodes();
                });
            }
        });

        getZipsForState = function(stateAbbreviation){
            var stateURL = 'http://api.geonames.org/postalCodeSearch?&placename=' + stateAbbreviation + '&country=US&username=' + username;
            return $.ajax({
                url: stateURL,
                type: 'GET',
                res: {},
                success: function(res) {
                    $scope.$apply(function() {
                        var postalCodeForState = parsePostalCodeData(res);
                        var thisIndex = getStateIndex(res);
                        $scope.allStates[thisIndex]['totalPostalCodes'] = postalCodeForState;
                    });
                }
            });
        };

        getcodes = function() {
            // now let's iterate through all states and get
            // ourselves some postal code counts
            var promises = [];
            for (var i = 0, l = $scope.allStates.length; i < l; i++) {
                var stateAbbreviation = $scope.allStates[i].Abbreviation;
                promises.push(getZipsForState(stateAbbreviation));
            };
            $.when.apply($, promises).done(function() {
                createCloud();
            });
        };

        getStateIndex = function(response) {
            var indexOfState = 0;
            var thisState = $(response).find('adminCode1').eq(0).text();
            var foundState = _.find($scope.allStates, function(obj) {
                return obj.Abbreviation === thisState;
            });
            indexOfState = $scope.allStates.indexOf(foundState);
            return indexOfState;
        };

        parsePostalCodeData = function(response) {
            var totalPostalCodes = $(response).find('totalResultsCount').text();
            return totalPostalCodes;
        };

        // custom sorter to sort the objects by the abbreviation property
        compare = function(a, b) {
            if (a.Abbreviation < b.Abbreviation) return -1;
            if (a.Abbreviation > b.Abbreviation) return 1;
            return 0;
        };

        createCloud = function() {
            var state_list = [];
            for (var i = 0, l = $scope.allStates.length; i < l; i++) {
                if ($scope.allStates[i].hasOwnProperty('totalPostalCodes')) {
                    state_list.push({
                        text: $scope.allStates[i].State,
                        weight: $scope.allStates[i].totalPostalCodes
                    });
                }
            };
            $("#wordcloud").jQCloud(state_list);
            $(".alert").hide();
        }
    };

});
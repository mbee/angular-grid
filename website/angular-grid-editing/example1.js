
var module = angular.module("example", ["angularGrid"]);

module.controller("exampleCtrl", function($scope, $timeout) {

    var columnDefs = [
        {displayName: "Default String", field: "defaultString", width: 150, editable: true},
        {displayName: "Upper Case Only", field: "upperCaseOnly", width: 150, editable: true, newValueHandler: upperCaseNewValueHandler},
        {displayName: "Number", field: "number", width: 150, editable: true, newValueHandler: numberNewValueHandler},
        {displayName: "Custom With Angular", field: "setAngular", width: 175, cellRenderer: customEditorUsingAngular},
        {displayName: "Custom No Angular", field: "setNoAngular", width: 175, cellRenderer: customEditorNoAngular}
    ];

    var data = [
        {defaultString: 'Apple', upperCaseOnly: 'APPLE', number: 11, setAngular: 'AAA', setNoAngular: 'AAA'},
        {defaultString: 'Orange', upperCaseOnly: 'ORANGE', number: 22, setAngular: 'BBB', setNoAngular: 'BBB'},
        {defaultString: 'Banana', upperCaseOnly: 'BANANA', number: 33, setAngular: 'CCC', setNoAngular: 'CCC'},
        {defaultString: 'Pear', upperCaseOnly: 'PEAR', number: 44, setAngular: 'DDD', setNoAngular: 'DDD'}
    ];

    var setSelectionOptions = ['AAA','BBB','CCC','DDD','EEE','FFF','GGG'];

    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: data,
        angularCompileRows: true
    };

    function upperCaseNewValueHandler(data, newValue, colDef) {
        data[colDef.field] = newValue.toUpperCase();
    }

    function numberNewValueHandler(data, newValue, colDef) {
        var valueAsNumber = parseInt(newValue);
        if (isNaN(valueAsNumber)) {
            window.alert("Invalid value " + newValue + ", must be a number");
        } else {
            data[colDef.field] = valueAsNumber;
        }
    }

    function customEditorUsingAngular(params) {
        params.$scope.setSelectionOptions = setSelectionOptions;

        var html = '<span ng-show="!editing" ng-click="startEditing()">{{rowData.'+params.colDef.field+'}}</span> ' +
            '<select ng-blur="editing=false" ng-change="editing=false" ng-show="editing" ng-options="item for item in setSelectionOptions" ng-model="rowData.'+params.colDef.field+'">';

        // we could return the html as a string, however we want to add a 'onfocus' listener, which is no possible in AngularJS
        var domElement = document.createElement("span");
        domElement.innerHTML = html;

        params.$scope.startEditing = function() {
            params.$scope.editing = true; // set to true, to show dropdown

            // put this into $timeout, so it happens AFTER the digest cycle,
            // otherwise the item we are trying to focus is not visible
            $timeout(function () {
                var select = domElement.querySelector('select');
                select.focus();
            }, 0);
        };

        return domElement;
    }

    function customEditorNoAngular(params) {

        var editing = false;

        var eCell = document.createElement('span');
        var eLabel = document.createTextNode(params.value);
        eCell.appendChild(eLabel);

        var eSelect = document.createElement("select");

        setSelectionOptions.forEach(function(item) {
            var eOption = document.createElement("option");
            eOption.setAttribute("value", item);
            eOption.innerHTML = item;
            eSelect.appendChild(eOption);
        });

        eCell.addEventListener('click', function () {
            if (!editing) {
                eCell.removeChild(eLabel);
                eCell.appendChild(eSelect);
                eSelect.focus();
                editing = true;
            }
        });

        eSelect.addEventListener('blur', function () {
            if (editing) {
                editing = false;
                eCell.removeChild(eSelect);
                eCell.appendChild(eLabel);
            }
        });

        eSelect.addEventListener('change', function () {
            if (editing) {
                editing = false;
                var newValue = eSelect.value;
                params.data[params.colDef.field] = newValue;
                eLabel.innerHTML = newValue;
                eCell.removeChild(eSelect);
                eCell.appendChild(eLabel);
            }
        });

        return eCell;
    }

});

(function(angular){

'use strict';

var app = angular.module('backendApp');

app.controller('invoiceCtrl', ['$scope', 'ycsUtil', 'ycsApi', 'Notification', '$modal', function (sc, ycsUtil, ycsApi, Notification, $modal) {
	sc.loadingGrid = true;

  sc.gridOptions = {
    enableSorting: true,
    flatEntityAccess: true,
		columnDefs: [
      {
        field: 'id',
        displayName: '操作',
        width: 80,
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableColumnMenu: false,
        enableHiding: false,
        cellTemplate: '<div class="ui-grid-cell-contents"><a ng-click="grid.appScope.editData(COL_FIELD, \'edit\')">编辑</a></div>',
        enableSorting: false
      },
      {
        field: 'name',
        displayName: '发票类型名称',
        enableHiding: false
      },
      {
        field: 'description',
        displayName: '相关描述',
        enableHiding: false,
        enableSorting: false
      },
      {
        field: 'sort',
        displayName: '排序',
        width: 100,
        type: 'number',
        cellClass:'text-center',
        headerCellClass: 'text-center',
        enableHiding: false,
        enableSorting: true
      }
    ]
	};

  sc.fillExitingData = function fillExitingData(data){
    sc.gridOptions.data = data.re.tabList;
    sc.loadingGrid = false;
  };

  sc.getExistingData = function getExistingData(){
    sc.loadingGrid = true;

  	var ajaxUrl = 'admin/specdefine/specdefineList';
  	var qData = { pid : 4 };
  	ycsApi.post(ajaxUrl, qData, sc.fillExitingData);
	};  	

  sc.openModal = function openModal (id, func, data) {
	  var modalInstance = $modal.open({
	    animation: true,
	    templateUrl: 'tpl/modal/predefinded/edit.html',
	    size: 'lg',
	    controller: 'invoiceModalCtrl',
      backdrop: 'static',
      resolve: {
        predefInfo: function() {
          return {
            id: id,
            func: func,
            data: data.re || {}
          };
        }
      }
	  });

	  modalInstance.result.then(function (predefInfo){
		  sc.getExistingData();
	  });
	};

  sc.editData = function editData (id, func) {
    if (func === 'edit'){
      var ajaxUrl = 'admin/specdefine/specdefineById';
      var qData = {specdefineid: id};

      ycsApi.post(ajaxUrl, qData, sc.openModal.bind(this, id, func));

    } else {
      sc.openModal(null, 'add', {});
    }
  };

  sc.getExistingData();
}]);


// Modal: 发票
app.controller('invoiceModalCtrl', ['$scope', 'predefInfo', '$modalInstance', 'ycsApi', 'Notification', function(sc, predefInfo, $modalInstance, ycsApi, Notification){
	sc.predefInfo = predefInfo;

	sc.isEdit = false;
	sc.title = 'invoice';

	if ( predefInfo.func === 'add' ){
		sc.detail = {};

	} else {
		sc.isEdit = true;
		sc.detail = angular.extend({}, predefInfo.data);

	}

  // ‘排序’预处理，避免和预留字段冲突
  sc.detail.itemSort = angular.isNumber(sc.detail.sort) && sc.detail.sort > 0 ? sc.detail.sort : 0;

	sc.dataSaved = function dataSaved(){
		Notification.success('保存成功！');
		$modalInstance.close(predefInfo);
	};

  sc.save = function save(detail){
  	var ajaxUrl;
  	var qData = detail;

  	if ( !sc.isEdit ) {
  		ajaxUrl = 'admin/specdefine/addSpecdefine';

  	} else {
  		ajaxUrl = 'admin/specdefine/editSpecdefine';
  		qData.specdefineid = sc.detail.id;
  	}

  	qData.pid = 4;
  	qData.type = 0;
  	
    qData.sort = angular.isNumber(detail.itemSort) && detail.itemSort > 0 ? detail.itemSort : 0;

  	ycsApi.post(ajaxUrl, qData, sc.dataSaved);
  };

	sc.cancel = function cancel () {
		$modalInstance.dismiss('cancel');
	};

}]);

})(window.angular);
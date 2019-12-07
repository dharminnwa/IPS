'use strict';
app.factory('progressBar', ['$http', '$q', function ($http, $q) {

    function onClose() {
        this.destroy();
    }

    function startProgress() {
        App.startPageLoading({ animate: !0 });
        //$('#auxiliaryView').html("<div id='progressBar'><img src='images/progressBar.gif'  /><div>Please be patient while data is processing, thank you!</div></div>");

        //if (!$("#progressBar").length > 0) {
        //    var html = '<div id="progressBar" class="modal fade">  <div class="modal-dialog modal-dialog-centered" role="document">' +
        //               '<div class="modal-content">' +
        //               '<div class="modal-body">' +
        //               '<img src="images/progressBar.gif">' +
        //               '<div class="text-center">Please be patient while data is processing, thank you!</div>' +
        //               '</div>' +
        //               '</div>' +
        //               '</div></div>';
        //    $('#auxiliaryView').html(html);
        //}

        //var progressBarWindow = $('#progressBar').kendoWindow({
        //    visible: false,
        //    draggable: false,
        //    modal: true,
        //    resizable: false,
        //    actions: {},
        //    close: onClose
        //}).data('kendoWindow');
        //$('#progressBar').parent().find('.k-window-titlebar,.k-header').css('display', 'none');

        //$('.k-window-titlebar').removeClass('k-window-titlebar');
        //$('#progressBar').modal({
        //    backdrop: 'static',
        //    keyboard: false
        //});
        //$('#progressBar').modal("show")
        //progressBarWindow.center().open();
    }

    function stopProgress() {
        App.stopPageLoading();
        //if ($('#progressBar').length > 0) {
        //    $('#progressBar').data('kendoWindow').close();
        //    //$('#progressBar').modal("hide");
        //    //$('body').removeClass('modal-open');
        //    //$('.modal-backdrop').remove();
        //}
    }

    return {
        startProgress: startProgress,
        stopProgress: stopProgress
    };


}]);
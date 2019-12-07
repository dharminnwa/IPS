(function () {
    'use strict';

    angular
        .module('ips.notification')

        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
            var baseNewNotificationTemplateResolve = {
                pageName: function ($translate) {
                    return $translate.instant('NOTIFICATION_NEW_NOTIFICATION_TEMPLATE');
                },
                cultures: function (notificationManager) {
                    return notificationManager.getCultures().then(function (data) {
                        return data;
                    });
                },
                evaluationRoles: function (notificationManager) {
                    return notificationManager.getEvaluationRoles().then(function (data) {
                        return data;
                    });
                },
                stageTypes: function (notificationManager) {
                    return notificationManager.getStageTypes();
                },
                stateTypes: function (notificationManager) {
                    return notificationManager.getStateTypes();
                },
                templateTypes: function (notificationManager) {
                    return notificationManager.getNotificationTemplateTypes();
                },
                organizations: function (notificationManager) {
                    return notificationManager.getOrganizations();
                }
            };
            $stateProvider
                .state('home.notificationTemplates.new', {
                    url: "/new",
                    templateUrl: "views/notificationTemplates/views/notificationTemplatesEdit.html",
                    controller: "notificationTemplatesNewCtrl",
                    resolve: baseNewNotificationTemplateResolve,
                    data: {
                        displayName: '{{pageName}}',//'New Notification Template',
                        paneLimit: 1,
                        depth: 3,
                        resource: "Notification Templates"
                    }
                })
        }])

        .controller('notificationTemplatesNewCtrl', notificationTemplatesNewCtrl);

    notificationTemplatesNewCtrl.$inject = ['$scope', '$stateParams', 'cssInjector', '$location', 'notificationManager', 'apiService', 'cultures', 'evaluationRoles', 'stageTypes', 'templateTypes', 'organizations', 'templateTypeEnum', 'stateTypes', 'stageTypesEnum', '$translate'];

    function notificationTemplatesNewCtrl($scope, $stateParams, cssInjector, $location, notificationManager, apiService, cultures, evaluationRoles, stageTypes, templateTypes, organizations, templateTypeEnum, stateTypes, stageTypesEnum, $translate) {
        cssInjector.removeAll();
        cssInjector.add('views/notificationTemplates/notificationTemplates.css');
        $scope.organizations = organizations;
        $scope.cultures = cultures;

        $scope.notification = {
            stageTypeId: null,
            evaluationRoleId: null,
            notificationTemplateTypeId: null,
            stateTypeId: null,
            profileTypeId: null,
            projectTypeId: null,
            cultureId: null,
            emailBody: "",
            organizationId: $stateParams.organizationId ? $stateParams.organizationId : null,
        };

        $scope.isApplyTheme = true;

        $scope.applyTheme = function () {
            $scope.notification.emailBody = themeContent();
            $scope.isApplyTheme = false;
        }

        evaluationRoles.unshift({ id: null, name: $translate.instant('NOTIFICATION_SELECT_ROLE'), text: "", value: null });
        $scope.evaluationRoles = evaluationRoles;

        stageTypes.unshift({ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_STAGE_TYPE') });
        $scope.stageTypes = stageTypes;

        templateTypes.unshift({ 'id': null, 'name': $translate.instant('NOTIFICATION_SELECT_TYPE') });
        $scope.templateTypes = templateTypes;

        stateTypes.unshift({ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_STATE') });
        $scope.stateTypes = stateTypes;

        $scope.profileTypes = [{ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_PROFILE_TYPE') },
        { 'value': 1, 'text': $translate.instant('COMMON_SOFT_PROFILE') },
        { 'value': 5, 'text': $translate.instant('NOTIFICATION_KNOWLEDGE') }
        ];
        $scope.projectTypes = [{ 'value': null, 'text': $translate.instant('NOTIFICATION_SELECT_PROJECT_TYPE') },
        { 'value': 1, 'text': $translate.instant('NOTIFICATION_CORPORATE') },
        { 'value': 2, 'text': $translate.instant('NOTIFICATION_PERSONAL') }
        ];

        function save() {
            !isEdit() ? saveNotification() : '';
        }

        function isEdit() {
            return ($location.path().indexOf('notificationTemplates/edit') > -1);
        }

        function saveNotification() {
            if ($scope.notification && $scope.notification.culture) {
                $scope.notification.cultureId = $scope.notification.culture.id;
            }

            notificationManager.saveNotification($scope.notification).then(
                function (data) {
                    notificationManager.returnToPerviousPage();
                },
                function (data) {
                    console.log(data);
                }
            );
        }

        function goBack() {
            history.back();
        }

        $scope.save = save;

        $scope.isEdit = isEdit;

        $scope.goBack = goBack;
        $scope.showHTMLClick = function () {
            $scope.notification.showHTML = !$scope.notification.showHTML;
        }

        $scope.showStageDDL = function () {
            if ($scope.notification.notificationTemplateTypeId == templateTypeEnum.MilestoneStartNotification
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.MilestoneCompleteNotification
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.MilestoneResultNotification
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.GreenMilestoneAlarm
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.YellowMilestoneAlarm
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.RedMilestoneAlarm
                || $scope.notification.notificationTemplateTypeId == templateTypeEnum.Tasks) {
                return true;
            }
            else {
                return false;
            }
        }

        $scope.showStateDDL = function () {
            if ($scope.notification.notificationTemplateTypeId == templateTypeEnum.RecurrentTrainingNotification) {
                return true;
            }
            else {
                return false;
            }
        }
        $scope.filterStageTypes = function (item) {
            if ($scope.notification.notificationTemplateTypeId == templateTypeEnum.Tasks) {
                if (item.value != null) {
                    if (item.value == stageTypesEnum.TaskCreation || item.value == stageTypesEnum.TaskReminder || item.value == stageTypesEnum.MeetingSchedule || item.value == stageTypesEnum.FollowupSchedule || item.value == stageTypesEnum.SalesAgreed) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
            else {
                if (item.value != stageTypesEnum.TaskCreation || item.value != stageTypesEnum.TaskReminder || item.value != stageTypesEnum.MeetingSchedule || item.value != stageTypesEnum.FollowupSchedule || item.value != stageTypesEnum.SalesAgreed) {
                    return true;
                }
            }
        }
        function themeContent() {
            var cultureInfo = $scope.cultures.filter(function (obj) {
                if (obj.id == $scope.notification.cultureId) {
                    return obj.cultureName
                }
            })[0];
            var notificationTemplate = '<table bgcolor="#425464" border="0" cellpadding="0" cellspacing="0" name="bmeMainBody" style="background-color:#425464;color:#4d4d4d;" width="100%">' +
                '   <tbody>' +
                '      <tr style="height:40px;">' +
                '         <td></td>' +
                '      </tr>' +
                '      <tr>' +
                '         <td align="center" valign="top" width="100%">' +
                '            <table border="0" cellpadding="0" cellspacing="0" name="bmeMainColumnParentTable" style="background:#fff;border-radius:10px;width:600px;">' +
                '               <tbody>' +
                '                  <tr>' +
                '                     <td name="bmeMainColumnParent">' +
                '                        <table align="center" border="0" cellpadding="0" cellspacing="0" class="bmeHolder k-table" name="bmeMainColumn" style="max-width:600px;overflow:visible;width:100%;">' +
                '                           <tbody>' +
                '                              <tr>' +
                '                                 <td align="left" bgcolor="#e6e6e8" class="blk_container bmeHolder" name="bmePreHeader" style="color:#666666;border:0px none transparent;background-color:#e6e6e8;" valign="top" width="100%"></td>' +
                '                              </tr>' +
                '                              <tr>' +
                '                                 <td align="left" class="bmeHolder" name="bmeMainContentParent" style="border-color:#808080;border-radius:0px;border-collapse:separate;border-spacing:0px;padding-top:0px;" valign="top" width="100%">' +
                '                                    <table align="center" border="0" cellpadding="0" cellspacing="0" name="bmeMainContent" style="border-radius:8px;border-collapse:separate;border-spacing:0px;overflow:hidden;" width="100%">' +
                '                                       <tbody>' +
                '                                          <tr style="padding:5px;background:#000000;">' +
                '                                             <td align="left" style="padding:5px;margin:5px;">' +
                '                                                <div><img height="60" src="https://localhost:8477/app/images/logoWhite.png" style="display:block;max-width:270px;" width="auto" /></div>' +
                '                                             </td>' +
                '                                          </tr>' +
                '                                          <tr style="background:#f0f0f0;">' +
                '                                             <td align="center" style="background:#f0f0f0;color:#000000;font-size:22px;font-weight:lighter;text-align:center;font-family:Segoe UI,Helvetica,Arial,sans-serif;"></td>' +
                '                                          </tr>' +
                '                                          <tr>' +
                '                                             <td style="padding-left:36px;padding-top:30px;color:#4d4d4d;">' +
                '                                                <div style="font-size:15px;padding-top:4px;display:block;font-family:Segoe UI,Helvetica,Arial,sans-serif;">';

            notificationTemplate += $scope.notification.emailBody;

            notificationTemplate += '<br /></div > ' +
                '</td>' +
                '                                          </tr>' +
                '                                       </tbody>' +
                '                                    </table>' +
                '                                 </td>' +
                '                              </tr>' +
                '                           </tbody>' +
                '                        </table>' +
                '                     </td>' +
                '                  </tr>' +
                '               </tbody>' +
                '            </table>' +
                '            <br />' +
                '            <table style="color:#d9dde0;font-weight:normal;font-size:14px;">' +
                '               <tbody>' +
                '                  <tr>' +
                '                     <td style="text-align:center;font-family:Segoe UI,Helvetica,Arial,sans-serif;">Please do not reply to this email   |  IPS Automated Notifications                                 </td>' +
                '                  </tr>' +
                '                  <tr>' +
                '                     <td style="text-align:center;font-family:Segoe UI,Helvetica,Arial,sans-serif;"></td>' +
                '                  </tr>' +
                '                   <tr>' +
                '                     <td style="text-align:center;padding-top:25px;font-size:13px;font-weight:bold;font-family:Segoe UI,Helvetica,Arial,sans-serif;">' +
                '                        <div>Improve Performance International AS - ResultatPartner AS</div>';
            if (cultureInfo.cultureName == "nb-NO") {
                notificationTemplate += '<div style="margin:5px 0px;">Kontakt: Ronny A. Nilsen - M: +47 9280 4155</div>';
            }
            else {
                notificationTemplate += '<div style="margin:5px 0px;">Contact: Ronny A. Nilsen - M: +47 9280 4155 </div>';
            }

            notificationTemplate += '<a href="mailto:?subject=Improve Perfomance System" style="color:#66c8f4;font-weight:normal;text-decoration:none;text-decoration:none !important;font-size:12px;"> <span style="text-decoration:none;text-decoration:none !important;">contact@improve.no</span> </a> ' +
                '                     </td>' +
                '                   </tr>' +
                '                  <tr>' +
                '                     <td style="text-align:center;padding-top:20px;padding-bottom:50px;"></td>' +
                '                  </tr>' +
                '               </tbody>' +
                '            </table>' +
                '         </td>' +
                '      </tr>' +
                '   </tbody>' +
                '</table>';

            return notificationTemplate;
        }
    }

})();
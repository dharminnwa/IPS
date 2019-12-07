'use strict';

angular.module('ips.profiles')
    .controller('ProfilePreviewCtrl', ['$scope', '$translate',
        function ($scope, $translate) {

            $scope.selectedProfile.organizationName = $scope.private.getById($scope.selectedProfile.organizationId, $scope.organizations).name;
            $scope.selectedProfile.levelName = $scope.private.getById($scope.selectedProfile.levelId, $scope.profileLevels).name;
            $scope.selectedProfile.categoryName = "";
            if ($scope.private.getById($scope.selectedProfile.categoryId, $scope.profileCategories)) {
                $scope.selectedProfile.categoryName = $scope.private.getById($scope.selectedProfile.categoryId, $scope.profileCategories).name;
            }
            $scope.selectedProfile.questionDisplayRuleName = $scope.private.getById($scope.selectedProfile.questionDisplayRuleId, $scope.questionDisplayRule).name;

            $scope.finalProfileData = [];
            angular.forEach($scope.selectedProfile.performanceGroups, function (pg, pgIndex) {
                var pgItem = {
                    id: pgIndex,
                    perspective: "",
                    pgName: "",
                    pgDescription: "",
                    skillName: "",
                    skillDescription: "",
                    skill1Name: "",
                    skill1Description: "",
                    quesstionText: "",
                    trainingText: ""
                };
                pgItem.perspective = pg.scorecardPerspective ? pg.scorecardPerspective.name : "";
                pgItem.pgName = pg.name;
                pgItem.pgDescription = pg.description;
                if (pg.link_PerformanceGroupSkills.length > 0) {
                    angular.forEach(pg.link_PerformanceGroupSkills, function (pgs, pgsIndex) {
                        var pgsItem = angular.copy(pgItem);
                        pgsItem.id = pgs.id;
                        pgsItem.skillName = pgs.skill ? pgs.skill.name : "";
                        pgsItem.skillDescription = pgs.skill ? pgs.skill.description : "";
                        pgsItem.skill1Name = pgs.skill1 ? pgs.skill1.name : "";
                        pgsItem.skill1Description = pgs.skill1 ? pgs.skill1.description : "";

                        var qtLength = pgs.trainings.length > pgs.questions.length ? pgs.trainings.length : pgs.questions.length;

                        if (!qtLength) {
                            $scope.finalProfileData.push(pgsItem);
                        }

                        for (var i = 0; i < qtLength; i++) {
                            var pgsq = pgs.questions[i];
                            var pgst = pgs.trainings[i];

                            if ((pgsq) && (pgst)) {
                                var pgsqtItem = angular.copy(pgsItem);
                                pgsqtItem.id = pgsq.id;
                                pgsqtItem.quesstionText = pgsq.questionText;
                                pgsqtItem.trainingText = pgst.how;
                                pgsqtItem.trainingMaterials = pgst.trainingMaterials;
                                $scope.finalProfileData.push(pgsqtItem);
                            } else if (pgst) {
                                var pgstItem = angular.copy(pgsItem);
                                pgstItem.id = pgst.id;
                                pgstItem.quesstionText = "";
                                pgstItem.trainingText = pgst.how;
                                pgstItem.trainingMaterials = pgst.trainingMaterials;
                                $scope.finalProfileData.push(pgstItem);
                            } else if (pgsq) {
                                var pgsqItem = angular.copy(pgsItem);
                                pgsqItem.id = pgsq.id;
                                pgsqItem.quesstionText = pgsq.questionText;
                                pgsqItem.trainingText = "";
                                pgsqItem.trainingMaterials = [];
                                $scope.finalProfileData.push(pgsqItem);
                            }
                        }
                    });
                }
                else {
                    $scope.finalProfileData.push(pgItem);
                }

            });
            
            $scope.gridFinalProfileOptions = {
                dataSource: {
                    type: "json",
                    data: $scope.finalProfileData,
                    sort: {
                        field: "pgName",
                        dir: "asc"
                    },
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: 'number' },
                                quesstionText: { type: 'string' },
                                skillName: { type: 'string' },
                                skillDescription: { type: 'string' },
                                skill1Name: { type: 'string' },
                                skill1Description: { type: 'string' },
                                pgName: { type: 'string' },
                                pgDescription: { type: 'string' },
                                trainingText: { type: 'string' },
                            }
                        }
                    }
                },
                sortable: true,
                filterable: {
                    mode: "row"
                },
                columnMenu: false,
                columns: [
                    { field: "pgName", title: $translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_NAME'), width: "250px" },
                    { field: "pgDescription", title: $translate.instant('SOFTPROFILE_PERFORMANCE_GROUP_DESCRIPTION'), width: "270px" },
                    { field: "perspective", title: $translate.instant('COMMON_PERSPECTIVE'), width: "150px" },
                    { field: "skillName", title: $translate.instant('COMMON_SKILL'), width: "250px" },
                    { field: "skillDescription", title: $translate.instant('SOFTPROFILE_SKILL_DESCRIPTION'), width: "250px", template: "<div class='readmoreText' title='#= skillDescription #'>#= skillDescription # </div>" },
                    { field: "skill1Name", title: $translate.instant('SOFTPROFILE_SUB_SKILL'), width: "250px" },
                    { field: "skill1Description", title: $translate.instant('SOFTPROFILE_SUB_SKILL_DESCRIPTION'), width: "200px", template: "<div class='readmoreText' title='#= skill1Description #'>#= skill1Description # </div>" },
                    { field: "quesstionText", title: $translate.instant('SOFTPROFILE_QUESTION'), width: "200px" },
                    { field: "trainingText", title: $translate.instant('COMMON_TRAINING'), width: "200px", template: "<div class='readmoreText' title='#= trainingText #'>#= trainingText # </div>" },
                    {
                        field: "trainingMaterials", title: $translate.instant('SOFTPROFILE_TRAINING_MATERIALS'), width: "200px", filterable: false,
                        template: function (dataItem) {
                            var result = "<div>";
                            _.forEach(dataItem.trainingMaterials, function (item) {
                                if (item.materialType == 'Link') {
                                    if (item.link) {
                                        var name = item.title ? item.title : item.link;
                                        result += '<div><a href="' + item.link + '" target="_blank">' + name + '</a></div>';
                                    }
                                }
                                else {
                                    if (item.name) {
                                        var name = item.title ? item.title : item.name;
                                        result += '<div><a href="' + webConfig.trainingMaterialsController + item.name + '" target="_blank">' + name + '</a></div>';
                                    }
                                }
                            });
                            result += "</div>";
                            return result;
                        }
                    }
                ]
            };

            $scope.tooltipOptions = {
                filter: "th.k-header", // show tooltip only on these elements
                position: "top",
                animation: {
                    open: {
                        effects: "fade:in",
                        duration: 200
                    },
                    close: {
                        effects: "fade:out",
                        duration: 200
                    }
                },
                // show tooltip only if the text of the target overflows with ellipsis
                show: function (e) {
                    if (this.content.text() != "") {
                        $('[role="tooltip"]').css("visibility", "visible");
                    }
                }
            };
        }]);
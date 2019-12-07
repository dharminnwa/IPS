using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.OData;
using IPS.BusinessModels.Enums;
using IPS.Data.Enums;
using IPS.BusinessModels.SalesActivityModels;
using IPS.WebApi.Filters;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class PerformanceController : BaseController
    {
        private static readonly string[] DefaultSeparators = { ";" };

        private readonly IPerformanceService _performanceService;
        private readonly IAuthService _authService;
        private readonly IProfileService _profileService;
        private readonly ISurveyService _surveyService;
        private readonly IStagesService _stagesService;

        public PerformanceController(IPerformanceService performanceService, IAuthService authService, IProfileService profileService,
            ISurveyService surveyService, IStagesService stagesService)
        {
            _performanceService = performanceService;
            _authService = authService;
            _profileService = profileService;
            _surveyService = surveyService;
            _stagesService = stagesService;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        public IpsUserProfiles GetActiveProfilesByUserKey(string id)
        {
            var result = new IpsUserProfiles(new List<IpsUserProfile>(), new List<IpsUserProfile>(), new List<IpsUserProfile>());
            var user = _authService.GetUserById(id);
            if (user != null)
            {
                result = _performanceService.GetUserProfiles(user.User.Id);
            }

            return result;
        }


        [HttpGet]
        [Route("api/performance/userprofiles/{userKey}/{projectId?}/{profileId?}")]
        public IpsUserProfiles GetActiveProfilesByProfileId(string userKey, int projectId, int? profileId)
        {
            var result = new IpsUserProfiles(new List<IpsUserProfile>(), new List<IpsUserProfile>(), new List<IpsUserProfile>());
            var user = _authService.GetUserById(userKey);
            if (user != null)
            {
                result = _performanceService.GetUserProfilesByProjectProfile(user.User.Id, projectId, profileId);
            }

            return result;
        }

        [Route("api/performance/profilescorecard/{profileId}/{isBenchmarkNeeded}/{participantIds?}/{evaluatorIds?}/{stageId?}/{typeOfProfile?}/{statusOn?}/{stageGroupId?}")]
        [HttpGet]
        public IpsProfileScorecard GetProfileScoreCards(int profileId, bool isBenchmarkNeeded, string participantIds, string evaluatorIds, int? stageId, int? typeOfProfile, DateTime? statusOn = null, int? stageGroupId = null)
        {
            if (statusOn == null)
                statusOn = DateTime.Now;

            var participantsIds = GetParamsFromString(participantIds, DefaultSeparators);
            var evaluatorsIds = GetParamsFromString(evaluatorIds, DefaultSeparators);
            var resultType = TypeOfProfile.None;

            if (typeOfProfile.HasValue)
                resultType = (TypeOfProfile)typeOfProfile;
            else
            {
                resultType = TypeOfProfile.Undefined;
            }

            var stage = 0;
            if (stageId.HasValue)
            {
                stage = stageId.Value;
            }

            return _performanceService.GetProfileScoreCards(profileId, isBenchmarkNeeded, participantsIds, evaluatorsIds, stage, resultType, statusOn, stageGroupId);
        }

        [Route("api/performance/ktscorecarddata/{profileId}/{participantIds?}/{stageId}/{isStartStage?}/{evolutionStageId}")]
        [HttpGet]
        public IPSKTScorecard GetKTScorecardData(int profileId, string participantIds, int stageId, bool isStartStage, int evolutionStageId)
        {
            var userIds = GetParamsFromString(participantIds, DefaultSeparators);
            List<int> participantsIds = new List<int>();
            foreach (var userId in userIds)
            {
                if (userId == -1)
                {
                    participantsIds.Add(userId);
                }
                else
                {
                    participantsIds.AddRange(_performanceService.GetParticipants(profileId, userId));
                }
            }

            return _performanceService.GetKTScorecardData(profileId, participantsIds, stageId, isStartStage, evolutionStageId);
        }

        [Route("api/performance/ktprofilescorecard/{participantIds}/{profileId}/{stageId}/{isStartStage}")]
        [HttpGet]
        public IpsKTStageResult GetKTProfileScoreCards(string participantIds, int profileId, int stageId, bool isStartStage)
        {
            var userIds = GetParamsFromString(participantIds, DefaultSeparators);
            List<int> participantsIds = new List<int>();
            foreach (var userId in userIds)
            {
                if (userId == -1)
                {
                    participantsIds.Add(userId);
                }
                else
                {
                    participantsIds.AddRange(_performanceService.GetParticipants(profileId, userId));
                }
            }

            List<IpsParticipantSurveyResult> participantsResults = new List<IpsParticipantSurveyResult>();
            IpsKTStageResult benchmarkResult = null;
            foreach (var participantId in participantsIds)
            {
                if (participantId == -1)
                {
                    benchmarkResult = _performanceService.GetKTProfileBenchmarkResult(profileId, stageId);
                    continue;
                }
                IpsParticipantSurveyResult participantResult = new IpsParticipantSurveyResult() { ParticipantId = participantId };
                if (isStartStage)
                {
                    participantResult.StageEvolutionId = null;
                    participantResult.StageId = stageId;
                    participantResult.Answers = _surveyService.GetStartStageResult(stageId, participantId);

                }
                else
                {
                    participantResult.StageEvolutionId = _stagesService.GetLastStageEvolutionId(stageId, participantId);
                    if (participantResult.StageEvolutionId == null)
                    {
                        participantResult.StageId = stageId;
                        participantResult.Answers = _surveyService.GetStartStageResult(stageId, participantId);
                    }
                    else
                    {
                        participantResult.StageId = null;
                        participantResult.Answers = _surveyService.GetFinalStageResult(participantResult.StageEvolutionId.Value, participantId);
                    }
                }
                if (participantResult.Answers.Count != 0)
                {
                    participantsResults.Add(participantResult);
                }
            }
            IpsKTStageResult participantsResult = null;
            if (participantsResults.Count > 0)
            {
                participantsResult = _performanceService.GetKTProfileStageResult(participantsResults, profileId);
                participantsResult.StageId = stageId;
            }
            if (participantsResult == null)
            {
                return benchmarkResult;
            }
            else if (benchmarkResult == null)
            {
                return participantsResult;
            }
            else
            {
                participantsResult.CorrectAnswersCount += benchmarkResult.CorrectAnswersCount;
                participantsResult.CorrectAnswersCount = (int)Math.Ceiling(participantsResult.CorrectAnswersCount * 1.0 / 2);
                participantsResult.Score += benchmarkResult.Score;
                participantsResult.Score = (int)Math.Ceiling(participantsResult.Score * 1.0 / 2);
                participantsResult.TimeSpent += benchmarkResult.TimeSpent;
                participantsResult.TimeSpent = (int)Math.Ceiling(participantsResult.TimeSpent * 1.0 / 2);
                return participantsResult;
            }
        }

        [Route("api/performance/ktlaststageevolutionId/{profileId}/{userId}/{stageId}")]
        [HttpGet]
        public int? GetKTLastStageEvolutionId(int profileId, int userId, int stageId)
        {
            int participantId = _performanceService.GetParticipants(profileId, userId).FirstOrDefault();
            int? lastStageEval = _stagesService.GetLastStageEvolutionId(stageId, participantId);
            if (lastStageEval.HasValue && !_surveyService.StageEvolutionHasAnswers(lastStageEval.Value, participantId))
            {
                lastStageEval = null;
            }
            return lastStageEval;
        }

        [Route("api/performance/ktstagehasdevcontract/{profileId}/{stageId?}/{stageEvolutionId?}/{userId}")]
        [HttpGet]
        public bool KTStageHasDevContract(int profileId, int? stageId, int? stageEvolutionId, int userId)
        {
            int participantId = _performanceService.GetParticipants(profileId, userId).FirstOrDefault();
            return _surveyService.HasDevContract(stageId, stageEvolutionId, participantId);
        }

        [Route("api/performance/ktprofilebenchmark/{profileId}/{stageId}")]
        [HttpGet]
        public IpsKTStageResult GetKTProfileBenchmark(int profileId, int stageId)
        {
            return _performanceService.GetKTProfileBenchmarkResult(profileId, stageId);
        }

        [Route("api/performance/ktprofileallstagesbenchmarks/{profileId}")]
        [HttpGet]
        public List<IpsKTStageResult> GetKTProfileAllStagesBenchmarks(int profileId)
        {
            List<IpsKTStageResult> result = new List<IpsKTStageResult>();
            var stages = _performanceService.GetProfileParticipantsSameStages(profileId, null);
            foreach (var stage in stages)
            {
                result.Add(_performanceService.GetKTProfileBenchmarkResult(profileId, stage.Id));
            }
            return result;
        }

        [Route("api/performance/profilescorecard/{stageId}/{participantIds}")]
        [HttpGet]
        public List<IpsQuestionInfo> GetProfileScoreCards(int stageId, string participantIds)
        {
            var ids = GetParamsFromString(participantIds, DefaultSeparators);

            return _performanceService.GetParticipantProfileScorecard(stageId, ids);
        }


        [Route("api/performance/getProsepectingActvitiyPerformanceData/{profileId}/{stageId}/{participantId}")]
        [HttpGet]
        public ProspectingGoalResultModel getProsepectingActvitiyPerformanceData(int profileId, int stageId, int participantId)
        {
            return _performanceService.getProsepectingActvitiyPerformanceData(profileId, stageId, participantId);
        }


        [Route("api/performance/GetDevContractDetail/{stageId}/{participantId}")]
        [HttpGet]
        public IpsDevContractInfo GetDevContractDetail(int stageId, int participantId)
        {

            return _performanceService.GetDevContractDetail(stageId, participantId);
        }


        [Route("api/performance/previousStageAnswers/{stageId}/{participantId}")]
        [HttpGet]
        public List<Answer> GetPreviousStageAnswers(int stageId, int participantId)
        {
            return _performanceService.GetPreviousEvaluationScores(stageId, participantId);
        }

        [Route("api/performance/profileparticipants/{profileId}/{statusOn?}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetProfileParticipants(int profileId, DateTime? statusOn = null)
        {
            if (statusOn == null)
            {
                statusOn = DateTime.Today;
            }

            var allParticipantsOfProfile = _performanceService.GetProfileParticipants(profileId, statusOn.Value);

            return allParticipantsOfProfile;
        }


        [Route("api/performance/profileparticipantsbystageid/{profileId}/{stageid?}/{projectIds?}/{departmentIds?}/{teamIds?}/{stageGroupId?}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetProfileParticipantsByStageId(int profileId, int stageId, string projectIds, string departmentIds, string teamIds, int? stageGroupId)
        {
            var projectsIds = GetParamsFromString(projectIds, DefaultSeparators);
            var departmentsIds = GetParamsFromString(departmentIds, DefaultSeparators);
            var teamsIds = GetParamsFromString(teamIds, DefaultSeparators);

            var allParticipantsOfProfile = _performanceService.GetProfileParticipants(profileId, stageId, projectsIds, departmentsIds, teamsIds, stageGroupId);
            return allParticipantsOfProfile;
        }


        [Route("api/performance/evaluatorsforparticipant/{profileId}/{participantIds}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetEvaluatorsForParticipant(int profileId, string participantIds)
        {
            var partIds = GetParamsFromString(participantIds, DefaultSeparators);
            var allParticipantsOfProfile = _performanceService.GetEvaluatorsForParticipant(profileId, partIds);
            return allParticipantsOfProfile;
        }



        [Route("api/performance/profileevaluators/{profileId}/{statusOn?}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetProfileEvaluators(int profileId, DateTime? statusOn = null)
        {
            if (statusOn == null)
            {
                statusOn = DateTime.Today;
            }

            return _performanceService.GetProfileEvaluators(profileId, statusOn.Value);
        }

        [HttpGet]
        [Route("api/performance/profileevaluationperiods/{profileId}/{participantId?}")]
        public List<IpsScorecardPeriod> GetProfileEvaluationPeriods(int profileId, int? participantId)
        {
            return _performanceService.GetProfileEvaluationPeriods(profileId, participantId);
        }

        [HttpGet]
        [Route("api/performance/evolutionstages/{originalStageId}/{participantId}")]
        public List<IpsStageEvolution> GetEvolutionStages(int originalStageId, int participantId)
        {
            return _performanceService.GetEvolutionStages(originalStageId, participantId);
        }

        [HttpGet]
        [Route("api/performance/profileevaluationstages/{profileId}/{participantId?}/{stageGroupId?}")]
        public List<IpsStage> GetProfileStages(int profileId, int? participantId, int? stageGroupId)
        {
            return _performanceService.GetProfileStages(profileId, participantId, stageGroupId);
        }

        [HttpGet]
        [Route("api/performance/profileevaluationparticipantssamestages/{profileId}/{participantsId?}")]
        public List<IpsStage> GetProfileStages(int profileId, string participantsId)
        {
            var participantsIds = GetParamsFromString(participantsId, DefaultSeparators);
            return _performanceService.GetProfileParticipantsSameStages(profileId, participantsIds);
        }

        [HttpGet]
        [Route("api/performance/profileallstagesresult/{profileId}/{participantsId?}/{isStartStage}")]
        public List<IpsKTStageResult> GetProfileAllStagesResult(int profileId, string participantsId, bool isStartStage)
        {
            var userIds = GetParamsFromString(participantsId, DefaultSeparators);
            List<int> participantsIds = new List<int>();
            bool isPartisipantsContainsBenchmark = false;
            foreach (var userId in userIds)
            {
                if (userId == -1)
                {
                    isPartisipantsContainsBenchmark = true;
                }
                else
                {
                    participantsIds.AddRange(_performanceService.GetParticipants(profileId, userId));
                }
            }


            List<IpsKTStageResult> result = new List<IpsKTStageResult>();

            var stages = _performanceService.GetProfileParticipantsSameStages(profileId, participantsIds);
            foreach (var stage in stages)
            {
                List<IpsParticipantSurveyResult> participantsResults = new List<IpsParticipantSurveyResult>();
                foreach (var participantId in participantsIds)
                {
                    IpsParticipantSurveyResult participantResult = new IpsParticipantSurveyResult() { ParticipantId = participantId };
                    if (isStartStage)
                    {
                        participantResult.StageEvolutionId = null;
                        participantResult.StageId = stage.Id;
                        participantResult.Answers = _surveyService.GetStartStageResult(stage.Id, participantId);

                    }
                    else
                    {
                        participantResult.StageEvolutionId = _stagesService.GetLastStageEvolutionId(stage.Id, participantId);
                        if (participantResult.StageEvolutionId == null)
                        {
                            participantResult.StageId = stage.Id;
                            participantResult.Answers = _surveyService.GetStartStageResult(stage.Id, participantId);
                        }
                        else
                        {
                            participantResult.StageId = null;
                            participantResult.Answers = _surveyService.GetFinalStageResult(participantResult.StageEvolutionId.Value, participantId);
                        }
                    }
                    if (participantResult.Answers.Count != 0)
                    {
                        participantsResults.Add(participantResult);
                    }
                }

                IpsKTStageResult stageRes = null;
                if (participantsIds.Count > 0)
                {
                    stageRes = _performanceService.GetKTProfileStageResult(participantsResults, profileId);
                    stageRes.StageId = stage.Id;
                    stageRes.StageName = stage.Name;
                }

                if (isPartisipantsContainsBenchmark)
                {
                    var benchmarkResult = _performanceService.GetKTProfileBenchmarkResult(profileId, stage.Id);
                    if (stageRes != null)
                    {
                        stageRes.CorrectAnswersCount += benchmarkResult.CorrectAnswersCount;
                        stageRes.CorrectAnswersCount = (int)Math.Ceiling(stageRes.CorrectAnswersCount * 1.0 / 2);
                        stageRes.Score += benchmarkResult.Score;
                        stageRes.Score = (int)Math.Ceiling(stageRes.Score * 1.0 / 2);
                        stageRes.TimeSpent += benchmarkResult.TimeSpent;
                        stageRes.TimeSpent = (int)Math.Ceiling(stageRes.TimeSpent * 1.0 / 2);
                        result.Add(stageRes);
                    }
                    else
                    {
                        result.Add(benchmarkResult);
                    }
                }
                else
                {
                    result.Add(stageRes);
                }
            }


            return result;
        }


        [HttpGet]
        [Route("api/performance/participantevaluators/{stageId}/{participantId}")]
        public List<IpsParticipantInfo> GetParticipantEvaluators(int stageId, int participantId)
        {
            return _performanceService.GetParticipantEvaluators(stageId, participantId);
        }

        [HttpGet]
        [Route("api/performance/participantprofilescorecardbyevaluatee/{stageId}/{evaluateeId}/{evaluatorId?}")]
        public List<IpsQuestionInfo> GetParticipantProfileScorecardByEvaluatee(int stageId, int evaluateeId, int? evaluatorId)
        {
            return _performanceService.GetParticipantProfileScorecardByEvaluatee(stageId, evaluateeId, evaluatorId);
        }

        [HttpGet]
        [Route("api/performance/GetProfileKPITrainings/{profileId}/{stageId}")]
        public List<IpsQuestionInfo> GetProfileKPITrainings(int profileId, int stageId)
        {
            return _performanceService.GetProfileKPITrainings(profileId, stageId);
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/performance/GetEvaluatedProfiles/{organizationId}/{profileStatus}")]
        public IQueryable<Profile> GetEvaluatedProfiles(int organizationId, bool? profileStatus)
        {
            bool accessToOtherProfiles = _authService.IsPermissionGranted(organizationId, "Dashboard", Operations.Read, false);
            if (accessToOtherProfiles)
                return _performanceService.GetEvaluatedProfiles(organizationId, null, profileStatus);
            return _performanceService.GetEvaluatedProfiles(organizationId, _authService.GetCurrentUserId(), profileStatus);
        }

        [HttpGet]
        [Route("api/performance/GetProjectEvaluatedProfiles/{projectIds}/{profileStatus}")]
        public List<Profile> GetProjectEvaluatedProfiles(string projectIds, bool? profileStatus)
        {
            List<int> projects = GetParamsFromString(projectIds, DefaultSeparators);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            bool accessToOtherProfiles = _authService.IsPermissionGranted(userOrganizationId, "Dashboard", Operations.Read, false);
            if (accessToOtherProfiles)
            {
                return _performanceService.GetProjectEvaluatedProfiles(projects, null, profileStatus);
            }
            else
            {
                return _performanceService.GetProjectEvaluatedProfiles(projects, _authService.GetCurrentUserId(), profileStatus);
            }
        }

        [HttpGet]
        [Route("api/performance/IsRCTAdded/{profileId}/{stageId}/{participantId}/{profileTypeId}")]
        public bool IsRCTAdded(int profileId, int stageId, int participantId, int profileTypeId)
        {
            ProfileTypeEnum profileTypeEnum = (ProfileTypeEnum)profileTypeId;
            return _performanceService.IsRCTAdded(profileId, stageId, participantId, profileTypeEnum);
        }


        [HttpGet]
        [Route("api/performance/AddPreviousStageRCT/{profileId}/{stageId}/{participantId}/{evaluateeId}")]
        public bool AddPreviousStageRCT(int profileId, int stageId, int participantId, int evaluateeId)
        {
            return _performanceService.AddPreviousStageRCT(profileId, stageId, participantId, evaluateeId);
        }

        [Route("api/performance/getTaskProsepectingActvitiyPerformnaceData/{goalId}/{activityId}/{userId}")]
        [HttpGet]
        public ProspectingGoalResultModel getTaskProsepectingActvitiyPerformnaceData(int goalId, int activityId, int userId)
        {
            return _performanceService.getTaskProsepectingActvitiyPerformnaceData(goalId, activityId, userId);
        }

        [Route("api/performance/GetProspectingGoalResultSummary")]
        [HttpGet]
        public List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummary()
        {
            return _performanceService.GetProspectingGoalResultSummary();
        }

        [Route("api/performance/GetProspectingGoalResultSummaryByGoalId/{goalId}")]
        [HttpGet]
        public ProspectingGoalResultSummaryModel GetProspectingGoalResultSummaryByGoalId(int goalId)
        {
            return _performanceService.GetProspectingGoalResultSummaryByGoalId(goalId);
        }


        [Route("api/performance/getProsepectingActivityResultData/{activityId}")]
        [HttpGet]
        public List<ProsepectingActivityResultModel> getProsepectingActivityResultData(int activityId)
        {
            return _performanceService.getProsepectingActivityResultData(activityId);
        }

        [Route("api/performance/GetProspectingGoalResultSummaryByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummaryByUserId(int userId)
        {
            return _performanceService.GetProspectingGoalResultSummaryByUserId(userId);
        }

        [Route("api/performance/GetProjectProspectingGoalResultSummaryByUserId/{userId}/{projectId}")]
        [HttpGet]
        public List<ProspectingGoalResultSummaryModel> GetProjectProspectingGoalResultSummaryByUserId(int userId, int projectId)
        {
            return _performanceService.GetProjectProspectingGoalResultSummaryByUserId(userId, projectId);
        }

        [Route("api/performance/getServiceProspectingGoalResultSummaryByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalResultSummaryModel> getServiceProspectingGoalResultSummaryByUserId(int userId)
        {
            return _performanceService.getServiceProspectingGoalResultSummaryByUserId(userId);
        }
        [Route("api/performance/getProjectServiceProspectingGoalResultSummaryByUserId/{userId}/{projectId}")]
        [HttpGet]
        public List<ProspectingGoalResultSummaryModel> getProjectServiceProspectingGoalResultSummaryByUserId(int userId, int projectId)
        {
            return _performanceService.getProjectServiceProspectingGoalResultSummaryByUserId(userId, projectId);
        }
        private List<int> GetParamsFromString(string input, string[] separators)
        {
            var inputStrArray = input.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            var result = new List<int>();
            foreach (var inputPart in inputStrArray)
            {
                int intId;
                if (int.TryParse(inputPart, out intId))
                {
                    result.Add(intId);
                }
            }
            return result;
        }
    }
}
using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Linq;
using System.Collections.Generic;
using IPS.BusinessModels.Enums;
using IPS.Data.Enums;
using IPS.BusinessModels.SalesActivityModels;

namespace IPS.Business
{
    public interface IPerformanceService
    {
        IpsProfileScorecard GetProfileScoreCards(int profileId, bool isBenchmarkRequested, List<int> participantIds, List<int> evaluatorIds, int stageId, TypeOfProfile profileType, DateTime? statusOn, int? stageGroupId);
        IpsUserProfiles GetUserProfiles(int userId);
        IpsUserProfiles GetUserProfilesByProjectProfile(int userId, int projectId, int? profileId);
        List<IpsEvaluationUser> GetProfileParticipants(int profileId, DateTime statusOn);
        List<IpsEvaluationUser> GetProfileParticipants(int profileId, int stageId, List<int> projectId, List<int> departmentId, List<int> teamId, int? stageGroupId);
        List<IpsEvaluationUser> GetProfileEvaluators(int profileId, DateTime statusOn);
        List<IpsEvaluationUser> GetEvaluatorsForParticipant(int profileId, List<int> participantId);
        List<IpsScorecardPeriod> GetProfileEvaluationPeriods(int profileId, int? participantId);
        List<IpsStage> GetProfileStages(int profilId, int? participantId, int? stageGroupId);
        List<IpsStage> GetProfileParticipantsSameStages(int profileId, List<int> participantsId);
        List<IpsQuestionInfo> GetParticipantProfileScorecard(int stageId, List<int> evaluatorId);
        List<Answer> GetPreviousEvaluationScores(int stageId, int participantId);
        List<IpsParticipantInfo> GetParticipantEvaluators(int stageId, int participantId);
        List<IpsQuestionInfo> GetProfileKPITrainings(int profileId, int stageId);
        List<IpsQuestionInfo> GetParticipantProfileScorecardByEvaluatee(int stageId, int evaluateeId, int? evaluatorId);
        IQueryable<Profile> GetEvaluatedProfiles();
        List<Profile> GetProjectEvaluatedProfiles(List<int> projects, int? userId, bool? profileStatus);
        IQueryable<Profile> GetEvaluatedProfiles(int organizationId, int? userId, bool? profileStatus);
        bool NeedToEvaluateTextQuestions(int participantId, int? stageId, int? stageEvolutionId, ProfileTypeEnum profileTypeId);
        IpsKTStageResult GetKTProfileStageResult(List<IpsParticipantSurveyResult> participantsResults, int profileId);
        List<int> GetParticipants(int profileId, int participantId);
        IPSKTScorecard GetKTScorecardData(int profileId, List<int> participantsIds, int stageId, bool isStartStage, int evolutionStageId);
        IpsKTStageResult GetKTProfileBenchmarkResult(int profileId, int stageId);
        List<IpsStageEvolution> GetEvolutionStages(int originalStageId, int participantId);
        bool AddPreviousStageRCT(int profileId, int stageId, int participantId, int evaluateeId);
        bool IsRCTAdded(int profileId, int? stageId, int participantId, ProfileTypeEnum profileTypeId);
        ProspectingGoalResultModel getProsepectingActvitiyPerformanceData(int profileId, int stageId, int participantId);
        IpsDevContractInfo GetDevContractDetail(int stageId, int participantId);
        ProspectingGoalResultModel getTaskProsepectingActvitiyPerformnaceData(int goalId, int activityId, int userId);
        List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummary();
        List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummaryByUserId(int userId);
        List<ProspectingGoalResultSummaryModel> getServiceProspectingGoalResultSummaryByUserId(int userId);
        List<ProspectingGoalResultSummaryModel> GetProjectProspectingGoalResultSummaryByUserId(int userId,int projectId);
        List<ProspectingGoalResultSummaryModel> getProjectServiceProspectingGoalResultSummaryByUserId(int userId,int projectId);
        
        ProspectingGoalResultSummaryModel GetProspectingGoalResultSummaryByGoalId(int goalId);
        List<ProsepectingActivityResultModel> getProsepectingActivityResultData(int activityId);
    }
}
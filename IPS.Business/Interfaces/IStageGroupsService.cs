using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Enums;
using IPS.Data.Enums;
using IPS.BusinessModels.ProfileModels;

namespace IPS.Business
{
    public interface IStageGroupsService
    {
        StageGroup AddStageGroup(StageGroup stageGroup);
        bool DeleteStageGroup(StageGroup stageGroup);
        IQueryable<StageGroup> GetStageGroups();
        IQueryable<StageGroup> GetStageGroupById(int id);
        bool UpdateStageGroup(StageGroup stageGroup);
        bool UpdateStageGroupBasicInfo(StageGroup stageGroup);
        bool UpdateParticipantsInStageGroup(int stageGroupId,IpsStageGroupParticipant[] StageGroupsParticipants);
        List<IpsEvaluationUser> GetParticipants(int stageGroupId);
        List<IpsStageGroupEvaluation> GetStageGroupEvaluation(int stageGroupId);
        List<IpsEvaluationUser> GetEvaluators(int stageGroupId);
        bool RemoveParticipant(int participantId);
        bool RemoveAllParticipants(int stageGroupId, int? roleId);
        bool selfEvaluationUpdate(int participantId, bool IsSelfEvaluation);
        bool LockUpdate(int participantId, bool isLocked);
        List<IpsSurveyProgress> GetStatusAndProgress(int stageGroupId, int stageId, ProfileTypeEnum profileType);
        bool ReopenParticipantAnswers(int stageId, int participantId);
        bool ScoreManagerUpdate(int participantId, bool isScoreManager);
        void RestartProfile(int sourceStageGroupId, StageGroup newStageGroup);
        Profile RestartSoftProfile(int sourceStageGroupId,int participantId, StageGroup newStageGroup);
        bool IsStageGroupInUse(int stageGroupId);
        IpsStageStatusInfo[] GetStagesStatus(int stageGroupId);
        List<Stage> GetAllStageGroupStages(int stageId);
        List<Stage> GetAllStagesByStageGroupId(int stageGroupId);
        StageStatusEnum GetStageStatus(int? stageId, int? stageEvolutionId, int participantId);
        IpsRecurrentTrainingModel AddRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel);
        int UpdateRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel);
        List<IpsEvaluationUser> GetStageParticipants(int stageGroupId);
    }
}
using System.Diagnostics;
using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using IPS.BusinessModels.Enums;
using System.Globalization;
using IPS.Data.Enums;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.UserModel;
using IPS.Business.Utils;
using IPS.BusinessModels.SalesActivityModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.Enum;

namespace IPS.Business
{
    public class PerformanceService : BaseService, IPerformanceService
    {
        public PerformanceService()
            : base()
        {
            _ipsDataContext.Configuration.ProxyCreationEnabled = false;
        }

        /// <summary>
        /// Gets lists of active (requires evaluation and KPI setting), completed (Final KPI defined) and profiles executed in the past
        /// </summary>
        /// <param name="userId">Defines id of user who should execute evaluation</param>
        /// <returns></returns>
        public IpsUserProfiles GetUserProfiles(int userId)
        {
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> activeProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> completedProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> historyProfiles = new List<IpsUserProfile>();
            ProjectService _ProjectService = new ProjectService();
            List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants
                .Include("StageGroup.Profiles.Project")
                .Include("StageGroup.Stages")
                .Include("Answers")
                .Include("EvaluationStatuses")
                .Include("EvaluationAgreements")
                .Include("EvaluationParticipant1.Answers")
                .Include("EvaluationParticipant1.EvaluationStatuses")
                .Include("EvaluationParticipant1.EvaluationAgreements")
                .Where(ep => ep.UserId == userId && ep.IsLocked == false)
                .AsNoTracking()
                .ToList();

            foreach (var evaluator in participants)
            {
                IpsProfile profile = evaluator.StageGroup.Profiles.Select(x => new IpsProfile
                {
                    Id = x.Id,
                    Name = x.Name,
                    ProfileTypeId = (ProfileTypeEnum)x.ProfileTypeId,
                    Project = x.Project != null ? new IpsProjectModel()
                    {
                        Id = x.Project.Id,
                        ExpectedEndDate = x.Project.ExpectedEndDate,
                        ExpectedStartDate = x.Project.ExpectedStartDate,
                        IsActive = x.Project.IsActive,
                        MissionStatement = x.Project.MissionStatement,
                        Name = x.Project.Name,
                        Summary = x.Project.Summary,
                        VisionStatement = x.Project.VisionStatement,
                    } : null,

                }).FirstOrDefault();
                if (profile != null)
                {
                    if (profile.Project != null)
                    {
                        if (!profile.Project.IsActive)
                        {
                            profile = null;
                        }
                    }

                }

                if (profile == null)
                    continue;
                List<Stage> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                List<int> stageIds = stages.Select(s => s.Id).ToList();
                List<EvaluationAgreement> agreements;
                var participantId = evaluator.Id;
                if (evaluator.EvaluationParticipant1 == null)
                {
                    // is participant
                    agreements = evaluator.EvaluationAgreements.ToList();
                }
                else
                {
                    agreements = evaluator.EvaluationParticipant1.EvaluationAgreements.ToList();
                    participantId = evaluator.EvaluationParticipant1.Id;
                }

                User user = evaluator.EvaluationParticipant1 != null ? _ipsDataContext.Users.FirstOrDefault(u => u.Id == evaluator.EvaluationParticipant1.UserId) : null;
                for (var i = 0; i < stages.Count; i++)
                {
                    Stage stage = stages[i];
                    DateTime testStartDate = getDefaultStartDateTime(stage.StartDateTime);
                    DateTime testenddate = getDefaultEndDateTime(stage.EndDateTime);
                    if (stage.StartDateTime > todayDate)
                        continue;
                    bool hasPreviousStage = i > 0;
                    var stageModel = new IpsStageEvolution
                    {
                        Id = stage.Id,
                        Name = stage.Name,
                        EndDateTime = stage.EndDateTime,
                        StartDateTime = stage.StartDateTime,
                        StageGroupId = stage.StageGroupId,
                        EvaluationStartDate = stage.EvaluationStartDate,
                        EvaluationEndDate = stage.EvaluationEndDate,
                        IsPaused = stage.IsPaused,
                        IsStopped = stage.IsStopped
                    };
                    GetUserProfile(evaluator, stageModel, profile, stageIds, agreements, todayDate, hasPreviousStage, user, completedProfiles, activeProfiles, historyProfiles);
                    if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        var stagesEvolution =
                            _ipsDataContext.StagesEvolutions
                            .Include(x => x.Stage)
                            .Where(
                                x => x.OriginalStageId == stage.Id && x.ParticipantId == participantId).OrderBy(x => x.StartDate).ToList();
                        for (int j = 0; j < stagesEvolution.Count; j++)
                        {
                            var stageEvo = stagesEvolution[j];
                            hasPreviousStage = true;
                            stageModel = new IpsStageEvolution
                            {
                                StageEvolutionId = stageEvo.Id,
                                Name = stageEvo.Name,
                                EndDateTime = stageEvo.DueDate,
                                StartDateTime = stageEvo.StartDate,
                                StageGroupId = stageEvo.Stage.StageGroupId,
                                EvaluationStartDate = stageEvo.StartDate,
                                EvaluationEndDate = stageEvo.DueDate
                            };
                            GetUserProfile(evaluator, stageModel, profile, stageIds, agreements, todayDate, hasPreviousStage, user, completedProfiles, activeProfiles, historyProfiles);
                        }
                    }
                }
            }
            expiredProfiles = activeProfiles.Where(x => x.IsExpired == true).ToList();
            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
            if (expiredStageGroupIds.Count() > 0)
            {
                foreach (IpsUserProfile profile in activeProfiles)
                {
                    if (profile.IsExpired == false && profile.PreviousStage == true)
                    {
                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                        {
                            profile.IsExpired = true;
                            profile.IsBlocked = true;
                        }
                    }
                }
                activeProfiles = activeProfiles.OrderBy(p => p.Stage.EndDateTime).ToList();
            }
            else
            {
                activeProfiles = activeProfiles.OrderBy(p => p.Stage.EndDateTime).ToList();
            }
            completedProfiles = completedProfiles.OrderBy(p => p.Status.EndedAt).ToList();
            historyProfiles = historyProfiles.OrderByDescending(p => p.Stage.EndDateTime).ToList();

            return new IpsUserProfiles(activeProfiles, completedProfiles, historyProfiles);
        }

        public IpsUserProfiles GetUserProfilesByProjectProfile(int userId, int projectId, int? profileId)
        {
            //get profiles to be executed
            ProjectService _ProjectService = new ProjectService();
            DateTime todayDate = DateTime.Now;
            List<IpsUserProfile> activeProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> completedProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> historyProfiles = new List<IpsUserProfile>();

            List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants
                .Include("StageGroup.Profiles")
                .Include("StageGroup.Stages")
                .Include("Answers")
                .Include("EvaluationStatuses")
                .Include("EvaluationAgreements")
                .Include("EvaluationParticipant1.Answers")
                .Include("EvaluationParticipant1.EvaluationStatuses")
                .Include("EvaluationParticipant1.EvaluationAgreements")
                .Where(ep => ep.UserId == userId && ep.IsLocked == false)
                .AsNoTracking()
                .ToList();

            foreach (var evaluator in participants)
            {
                Profile userProfile = evaluator.StageGroup.Profiles.FirstOrDefault();
                IpsProfile profile = null;
                if (userProfile != null)
                {
                    if (userProfile.ProjectId == projectId)
                    {
                        if (profileId.HasValue)
                        {
                            if (profileId == userProfile.Id)
                            {
                                if (_ProjectService.IsProjectActive(projectId))
                                {
                                    profile = evaluator.StageGroup.Profiles.Select(x => new IpsProfile
                                    {
                                        Id = x.Id,
                                        Name = x.Name,
                                        ProfileTypeId = (ProfileTypeEnum)x.ProfileTypeId

                                    }).FirstOrDefault();
                                }
                            }

                        }
                        else
                        {
                            if (_ProjectService.IsProjectActive(projectId))
                            {
                                profile = evaluator.StageGroup.Profiles.Select(x => new IpsProfile
                                {
                                    Id = x.Id,
                                    Name = x.Name,
                                    ProfileTypeId = (ProfileTypeEnum)x.ProfileTypeId

                                }).FirstOrDefault();
                            }
                        }
                    }
                }
                if (profile == null)
                    continue;
                List<Stage> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                List<int> stageIds = stages.Select(s => s.Id).ToList();
                List<EvaluationAgreement> agreements;
                var participantId = evaluator.Id;
                if (evaluator.EvaluationParticipant1 == null)
                {
                    // is participant
                    agreements = evaluator.EvaluationAgreements.ToList();
                }
                else
                {
                    agreements = evaluator.EvaluationParticipant1.EvaluationAgreements.ToList();
                    participantId = evaluator.EvaluationParticipant1.Id;
                }

                User user = evaluator.EvaluationParticipant1 != null ? _ipsDataContext.Users.FirstOrDefault(u => u.Id == evaluator.EvaluationParticipant1.UserId) : null;
                for (var i = 0; i < stages.Count; i++)
                {
                    Stage stage = stages[i];
                    if (stage.StartDateTime > todayDate)
                        continue;
                    bool hasPreviousStage = i > 0;
                    var stageModel = new IpsStageEvolution
                    {
                        Id = stage.Id,
                        Name = stage.Name,
                        EndDateTime = stage.EndDateTime,
                        StartDateTime = stage.StartDateTime,
                        StageGroupId = stage.StageGroupId,
                        EvaluationStartDate = stage.EvaluationStartDate,
                        EvaluationEndDate = stage.EvaluationEndDate,
                        IsPaused = stage.IsPaused,
                        IsStopped = stage.IsStopped
                    };
                    GetUserProfile(evaluator, stageModel, profile, stageIds, agreements, todayDate, hasPreviousStage, user, completedProfiles, activeProfiles, historyProfiles);
                    if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        var stagesEvolution =
                            _ipsDataContext.StagesEvolutions
                            .Include(x => x.Stage)
                            .Where(
                                x => x.OriginalStageId == stage.Id && x.ParticipantId == participantId).OrderBy(x => x.StartDate).ToList();
                        for (int j = 0; j < stagesEvolution.Count; j++)
                        {
                            var stageEvo = stagesEvolution[j];
                            hasPreviousStage = true;
                            stageModel = new IpsStageEvolution
                            {
                                StageEvolutionId = stageEvo.Id,
                                Name = stageEvo.Name,
                                EndDateTime = stageEvo.DueDate,
                                StartDateTime = stageEvo.StartDate,
                                StageGroupId = stageEvo.Stage.StageGroupId,
                                EvaluationStartDate = stageEvo.StartDate,
                                EvaluationEndDate = stageEvo.DueDate
                            };
                            GetUserProfile(evaluator, stageModel, profile, stageIds, agreements, todayDate, hasPreviousStage, user, completedProfiles, activeProfiles, historyProfiles);
                        }
                    }
                }
            }

            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
            expiredProfiles = activeProfiles.Where(x => x.IsExpired == true).ToList();
            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
            if (expiredStageGroupIds.Count() > 0)
            {
                foreach (IpsUserProfile profile in activeProfiles)
                {
                    if (profile.IsExpired == false && profile.PreviousStage == true)
                    {
                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                        {
                            profile.IsExpired = true;
                            profile.IsBlocked = true;
                        }
                    }
                }
            }
            activeProfiles = activeProfiles.OrderBy(p => p.Stage.EndDateTime).ToList();
            completedProfiles = completedProfiles.OrderBy(p => p.Status.EndedAt).ToList();
            historyProfiles = historyProfiles.OrderByDescending(p => p.Stage.EndDateTime).ToList();

            return new IpsUserProfiles(activeProfiles, completedProfiles, historyProfiles);
        }

        private void GetUserProfile(EvaluationParticipant evaluator, IpsStageEvolution stage, IpsProfile profile, List<int> stageIds,
            List<EvaluationAgreement> agreements, DateTime todayDate, bool hasPreviousStage, User user, List<IpsUserProfile> completedProfiles, List<IpsUserProfile> activeProfiles,
            List<IpsUserProfile> historyProfiles)
        {
            var evaluationRoleId = (EvaluationRoleEnum)evaluator.EvaluationRoleId;
            EvaluationStatus status;
            if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge && evaluationRoleId == EvaluationRoleEnum.Evaluator)
            {
                status =
                    _ipsDataContext.EvaluationStatuses.FirstOrDefault(
                        x => x.ParticipantId == evaluator.EvaluateeId
                             && (stage.StageEvolutionId.HasValue
                                 ? x.StageEvolutionId == stage.StageEvolutionId
                                 : x.StageId == stage.Id));
            }
            else
            {
                status = evaluator.EvaluationStatuses.FirstOrDefault(es =>
                    stage.StageEvolutionId.HasValue
                        ? es.StageEvolutionId == stage.StageEvolutionId
                        : es.StageId == stage.Id);
            }

            var participantId = GetParticipantId(evaluator);
            bool isSurveyPassed = IsSurveyPassed(evaluator.Answers, stage.Id, participantId, profile.ProfileTypeId, stage.StageEvolutionId);
            bool isParticipantPassedSurvey = IsParticipantPassedSurvey(profile.ProfileTypeId, evaluator, isSurveyPassed, stage.Id, stage.StageEvolutionId);

            bool isKPISet = evaluator.Answers.Any(a => stageIds.Contains((int)a.StageId) && a.KPIType > 0);
            // if it is set on any stage

            bool isFinalKPISet;
            if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
            {
                isFinalKPISet = _ipsDataContext.StagesEvolutions.Where(x => x.ParticipantId == participantId)
                    .Any(x => stage.StageEvolutionId.HasValue
                    ? x.ParentStageEvolutionId == stage.StageEvolutionId
                    : x.OriginalStageId == stage.Id);
            }
            else
            {
                isFinalKPISet = agreements.Any(ea => ea.StageId == stage.Id);
            }
            bool isExpired = stage.EndDateTime < todayDate && (!isFinalKPISet || !isSurveyPassed);
            IpsUserModel ipsUser = _ipsDataContext.Users.Where(u => u.Id == evaluator.UserId).Select(u => new IpsUserModel()
            {
                Id = u.Id,
                Email = u.WorkEmail,
                FirstName = u.FirstName,
                ImageUrl = u.ImagePath,
                IsActive = u.IsActive,
                LastName = u.LastName,
                OrganizationName = u.Organization.Name,
            }).FirstOrDefault();
            IpsUserProfile up = new IpsUserProfile
            {
                Profile = profile,
                Stage = stage,
                PreviousStage = hasPreviousStage,
                Participant = evaluator,
                Evaluatee = user,
                IsSurveyPassed = isSurveyPassed,
                IsParticipantPassedSurvey = isParticipantPassedSurvey,
                IsKPISet = isKPISet,
                IsFinalKPISet = isFinalKPISet,
                IsExpired = isExpired,
                Status = status,
                NeedToEvaluateTextQuestions = NeedToEvaluateTextQuestions(evaluator, stage.Id, stage.StageEvolutionId, profile.ProfileTypeId),
                User = ipsUser,
                IsPaused = stage.IsPaused,
                IsStopped = stage.IsStopped
            };

            if (stage.EndDateTime >= todayDate)
            {
                // active or completed
                if (isSurveyPassed && isParticipantPassedSurvey && isFinalKPISet &&
                    (status == null || (status != null && !status.IsOpen)))
                {
                    // completed
                    completedProfiles.Add(up);
                }
                else
                {
                    // active
                    if (profile.ProfileTypeId == ProfileTypeEnum.Soft && up.IsSurveyPassed && status != null &&
                        status.IsOpen)
                    {
                        up.IsSurveyPassed = false;
                    }
                    up.IsRCTAdded = IsRCTAdded(profile.Id, stage.Id, participantId, profile.ProfileTypeId);
                    activeProfiles.Add(up);
                }
            }
            else
            {
                if (isSurveyPassed && isParticipantPassedSurvey && isFinalKPISet &&
                    (status == null || (status != null && !status.IsOpen)))
                {
                    up.IsLastEvaluatedStage = checkIsLastEvaluated(up);
                    up.IsLastStage = checkIsLastStage(up);
                    historyProfiles.Add(up);
                }
                else
                { activeProfiles.Add(up); }
            }
        }

        private bool checkIsLastStage(IpsUserProfile ipsUserProfile)
        {
            bool result = false;
            List<int> stageIds = _ipsDataContext.Stages.Where(x => x.StageGroupId == ipsUserProfile.Stage.StageGroupId).OrderBy(x => x.StartDateTime).Select(x => x.Id).ToList();
            if (stageIds.Count() > 0)
            {
                if (stageIds.Last() == ipsUserProfile.Stage.Id)
                {
                    result = true;
                }
            }
            return result;
        }
        private bool checkIsLastEvaluated(IpsUserProfile ipsUserProfile)
        {
            bool result = false;
            List<int> stageIds = _ipsDataContext.Stages.Where(x => x.StageGroupId == ipsUserProfile.Stage.StageGroupId).Select(x => x.Id).ToList();
            if (stageIds.Count > 0)
            {
                EvaluationAgreement lastEvalutionAgreementStage = _ipsDataContext.EvaluationAgreements.Where(x => stageIds.Contains(x.StageId)).OrderByDescending(x => x.StageId).FirstOrDefault();
                if (lastEvalutionAgreementStage != null)
                {
                    if (lastEvalutionAgreementStage.StageId == ipsUserProfile.Stage.Id && lastEvalutionAgreementStage.KPIType > 0)
                    {
                        result = true;
                    }
                }
            }
            return result;
        }
        private bool NeedToEvaluateTextQuestions(EvaluationParticipant participant, int? stageId, int? stageEvolutionId, ProfileTypeEnum profileTypeId)
        {
            var participantId = GetParticipantId(participant);
            return NeedToEvaluateTextQuestions(participantId, stageId, stageEvolutionId, profileTypeId);
        }

        public bool NeedToEvaluateTextQuestions(int participantId, int? stageId, int? stageEvolutionId,
            ProfileTypeEnum profileTypeId)
        {
            if (profileTypeId == ProfileTypeEnum.Knowledge)
            {
                var textQuestionTypeId = (int)QuestionTypeEnum.Text;
                var query = _ipsDataContext.SurveyResults
                    .Include(x => x.SurveyAnswers.Select(a => a.Question))
                    .Where(x => x.ParticipantId == participantId);
                query = stageEvolutionId.HasValue
                    ? query.Where(x => x.StageEvolutionId == stageEvolutionId)
                    : query.Where(x => x.StageId == stageId);
                return query.Any(x => x.SurveyAnswers.Any(a => a.Question.AnswerTypeId == textQuestionTypeId
                                                               && a.IsCorrect == null));
            }
            return false;
        }

        private int GetParticipantId(EvaluationParticipant participant)
        {
            if (participant.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator)
            {
                return participant.EvaluateeId.Value;
            }
            return participant.Id;
        }

        private bool IsSurveyPassed(ICollection<Answer> answers, int? stageId, int participantId, ProfileTypeEnum profileTypeId, int? stageEvolutionId)
        {
            bool isSurveyPassed = false;
            switch (profileTypeId)
            {
                case ProfileTypeEnum.Soft:
                    isSurveyPassed = answers.Any(a => a.StageId == stageId);
                    break;
                case ProfileTypeEnum.Knowledge:
                    var query = _ipsDataContext.SurveyResults
                        .Where(x => x.ParticipantId == participantId);
                    query = stageEvolutionId.HasValue
                        ? query.Where(x => x.StageEvolutionId == stageEvolutionId)
                        : query.Where(x => x.StageId == stageId);
                    isSurveyPassed = query.Any();
                    break;
            }
            return isSurveyPassed;
        }


        public bool IsRCTAdded(int profileId, int? stageId, int participantId, ProfileTypeEnum profileTypeId)
        {
            bool isRCTAdded = false;
            switch (profileTypeId)
            {
                case ProfileTypeEnum.Soft:
                    {
                        isRCTAdded = _ipsDataContext.EvaluationAgreements.Any(a => a.StageId == stageId && a.ParticipantId == participantId);
                        break;
                    }
                case ProfileTypeEnum.Knowledge:
                    {
                        break;
                    }
            }
            return isRCTAdded;
        }

        private bool IsParticipantPassedSurvey(ProfileTypeEnum profileTypeId, EvaluationParticipant evaluator,
            bool isSurveyPassed, int? stageId, int? stageEvolutionId)
        {
            bool isParticipantPassedSurvey = false;
            switch (profileTypeId)
            {
                case ProfileTypeEnum.Soft:
                    if (evaluator.EvaluationParticipant1 == null)
                    {
                        // is participant
                        isParticipantPassedSurvey = (isSurveyPassed &&
                                                     (!evaluator.IsSelfEvaluation.HasValue || !(bool)evaluator.IsSelfEvaluation)) ||
                                                    ((bool)evaluator.IsSelfEvaluation &&
                                                     evaluator.Answers.Any(a => a.StageId == stageId && a.KPIType > 0));
                    }
                    else
                    {
                        isParticipantPassedSurvey = ((!evaluator.EvaluationParticipant1.IsSelfEvaluation.HasValue ||
                                                      !(bool)evaluator.EvaluationParticipant1.IsSelfEvaluation) &&
                                                     evaluator.EvaluationParticipant1.Answers.Any(a => a.StageId == stageId)) ||
                                                    ((bool)evaluator.EvaluationParticipant1.IsSelfEvaluation &&
                                                     evaluator.EvaluationParticipant1.Answers.Any(
                                                         a => a.StageId == stageId && a.KPIType != null));
                    }
                    break;
                case ProfileTypeEnum.Knowledge:
                    var participantId = GetParticipantId(evaluator);
                    var query = _ipsDataContext.SurveyResults
                       .Include(x => x.SurveyAnswers)
                       .Where(x => x.ParticipantId == participantId);
                    query = stageEvolutionId.HasValue
                        ? query.Where(x => x.StageEvolutionId == stageEvolutionId)
                        : query.Where(x => x.StageId == stageId);

                    isParticipantPassedSurvey = query.Any(x => x.SurveyAnswers.All(a => a.IsCorrect.HasValue));
                    break;
            }
            return isParticipantPassedSurvey;
        }

        /// <summary>
        /// Selects scores defined before stage with stageId identifier  
        /// </summary>
        /// <param name="stageId">current stage</param>
        /// <param name="participantId">evaluationg participant (not evaluator) </param>
        public List<Answer> GetPreviousEvaluationScores(int stageId, int participantId)
        {
            var innerQuery = from s in _ipsDataContext.Stages where s.Id == stageId select s.StageGroupId;
            var pQuery = from s in _ipsDataContext.Stages
                         join ea in _ipsDataContext.EvaluationAgreements on new { StageId = s.Id, ParticipantId = participantId } equals new { StageId = (int)ea.StageId, ParticipantId = (int)ea.ParticipantId } into agreements
                         join a in _ipsDataContext.Answers on new { StageId = s.Id, ParticipantId = participantId } equals new { StageId = (int)a.StageId, ParticipantId = (int)a.ParticipantId } into answers
                         where innerQuery.Contains(s.StageGroupId)
                         orderby s.StartDateTime
                         select new { s, agreements, answers };

            var stagesInfo = pQuery.AsNoTracking().ToList();
            int currentStageIndex = stagesInfo.FindIndex(si => si.s.Id == stageId);
            for (int i = currentStageIndex - 1; i >= 0; i--)
            {
                if (stagesInfo[i].agreements != null && stagesInfo[i].agreements.Count() > 0)
                {
                    List<Answer> listAnswers = new List<Answer>();
                    foreach (EvaluationAgreement ea in stagesInfo[i].agreements)
                    {
                        Answer a = new Answer();
                        a.Id = ea.Id;
                        a.KPIType = ea.KPIType;
                        a.ParticipantId = ea.ParticipantId;
                        a.QuestionId = ea.QuestionId;
                        a.Comment = ea.Comment;
                        a.StageId = ea.StageId;
                        a.Answer1 = ea.FinalScore.HasValue ? ConvertToString(Decimal.ToDouble(ea.FinalScore.Value)) : String.Empty;
                        listAnswers.Add(a);
                    }
                    return listAnswers;
                }
                if (stagesInfo[i].answers != null && stagesInfo[i].answers.Count() > 0)
                {
                    return stagesInfo[i].answers.ToList();
                }
            }
            return new List<Answer>();
        }

        /// <summary>
        /// Selects aggregated scores defined on stage with stageId identifier  
        /// </summary>
        /// <param name="stageId">current stage</param>
        /// <param name="participantId">evaluationg participant (not evaluator) </param>
        public List<Answer> GetEvaluationAggregatedScores(int stageId, int participantId)
        {
            var result = new List<Answer>();
            var query = from a in _ipsDataContext.Answers
                        join p in _ipsDataContext.EvaluationParticipants on a.ParticipantId equals p.Id
                        where a.StageId == stageId && (p.Id == participantId || p.EvaluateeId == participantId)
                        select a;

            var answers = query.AsNoTracking().ToList();
            List<int> questionsId = answers.Select(a => a.QuestionId).Distinct().ToList();
            foreach (var qid in questionsId)
            {
                var questionAnswers = answers.Where(a => a.QuestionId == qid).ToList();
                double avgScore = 0;
                foreach (var a in questionAnswers)
                {
                    avgScore = avgScore + ConvertToDouble(a.Answer1);
                }
                avgScore = Math.Round(avgScore / questionAnswers.Count, 1);
                Answer answer = new Answer();
                answer.QuestionId = qid;
                answer.Answer1 = ConvertToString(avgScore);
                result.Add(answer);
            }
            return result;
        }

        //TODO REVISE
        //superAdmin can see all

        //admin can see his own team if he is not in any team = participant

        //evaluator his participnts + his own results in profile if such exists

        //participant his own results  + his evaluator resulsts about him if such exists

        //only team members

        //remember rules about visibility for admin and superadmin ADMIN - ONLY in his own team -- SUPERADMIN - all organization
        private IQueryable<EvaluationParticipant> SetExtraFilters(IQueryable<EvaluationParticipant> source, IpsUser user, int? organiztionid, ICollection<int> projectIds, ICollection<int> departmentIds, ICollection<int> teamIds)
        {
            var isAdmin = _authService.IsInOrganizationInRoleOf("Admin", organiztionid);
            var isSuperAdmin = _authService.IsInOrganizationInRoleOf("Super Admin", organiztionid);

            if (projectIds != null && projectIds.Any() && !isSuperAdmin)
            {
                var usersInProject = _ipsDataContext.Link_ProjectUsers.Where(_ => projectIds.Contains(_.ProjectId) && _.UserId == user.User.Id).Select(_ => _.UserId).ToList();
                source = source.Where(_ => usersInProject.Contains(_.UserId));
            }

            if (departmentIds != null && departmentIds.Any() && !isSuperAdmin)
            {
                var departments = _ipsDataContext.Departments.Where(_ => departmentIds.Contains(_.Id));
                if (departments.Any())
                {
                    var usersInDepartment = departments.SelectMany(_ => _.Users).Select(_ => _.Id);
                    source = source.Where(_ => _.EvaluateeId != null && usersInDepartment.Contains(_.EvaluateeId.Value));
                }
            }

            if (teamIds != null && teamIds.Any() && !isAdmin && !isSuperAdmin)
            {
                var usersInTeam =
                    _ipsDataContext.Link_TeamUsers.Where(_ => teamIds.Contains(_.TeamId)).Select(_ => _.UserId);
                source = source.Where(_ => _.EvaluateeId != null && usersInTeam.Contains(_.EvaluateeId.Value));
            }

            return source;
        }

        public List<IpsEvaluationUser> GetEvaluatorsForParticipant(int profileId, List<int> participantIds)
        {
            var profile = _ipsDataContext.Profiles
                .Include("StageGroups.EvaluationParticipants").FirstOrDefault(p => p.Id == profileId);

            var evaluators = new List<IpsEvaluationUser>();
            if (profile != null)
            {
                var stageGroups =
                    profile.StageGroups.Where(_ => _.StartDate <= DateTime.Now && _.EndDate >= DateTime.Now);
                foreach (var stageGroup in stageGroups)
                {
                    if (participantIds != null && participantIds.Any())
                    {
                        UserService service = new UserService();
                        foreach (var ep in stageGroup.EvaluationParticipants.Where(p => p.StageGroupId == stageGroup.Id && p.EvaluateeId == participantIds.First()))
                        {
                            if (ep.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator)
                            {
                                IpsEvaluationUser user = new IpsEvaluationUser();
                                user.ParticipantId = ep.Id;
                                user.RoleId = ep.EvaluationRoleId;
                                user.UserId = ep.UserId;
                                user.EvaluateeId = ep.EvaluateeId;
                                user.IsSelfEvaluation = ep.IsSelfEvaluation;
                                user.IsScoreManager = ep.IsScoreManager;
                                user.User = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == ep.UserId).AsNoTracking().FirstOrDefault();
                                user.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                                User userInfo = service.GetById(ep.UserId);
                                if (userInfo != null)
                                {
                                    user.FirstName = userInfo.FirstName;
                                    user.LastName = userInfo.LastName;
                                    evaluators.Add(user);
                                }
                            }
                        }
                    }
                }
            }
            return evaluators;
        }

        public List<IpsEvaluationUser> GetProfileParticipants(int profileId, int stageId, List<int> projectIds,
            List<int> departmentIds, List<int> teamIds, int? stageGroupId)
        {
            var profile = _ipsDataContext.Profiles
                .Include("StageGroups.EvaluationParticipants")
                .Include("StageGroups.Stages.Answers")
                .Include("StageGroups.Stages.SurveyResults")
                .FirstOrDefault(p => p.Id == profileId);

            var curUser = _authService.getCurrentUser();
            var ipsUser = _authService.GetUserById(curUser.Id);

            var result = new List<IpsEvaluationUser>();
            if (profile != null)
            {
                var service = new UserService();
                if (stageGroupId.HasValue)
                {
                    var stageGroups = profile.StageGroups.Where(
                          sg => sg.Id == stageGroupId);

                    foreach (var stageGroup in stageGroups)
                    {
                        var evaluationParticipants = stageGroup.EvaluationParticipants.AsQueryable();

                        evaluationParticipants = SetExtraFilters(evaluationParticipants, ipsUser, profile.OrganizationId,
                            projectIds, departmentIds, teamIds);

                        var participants =
                            evaluationParticipants.Where(
                                _ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && _.IsLocked == false).ToList();
                        // Added for get Participant for other Evaluator User  who is notAdmin nor super Admin 
                        // Added for get Participant for other Evaluator User  who is notAdmin nor super Admin 
                        var evaluatorParticipants = evaluationParticipants.Where(_ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator).Select(x => x.EvaluationParticipant1).ToList();
                        if (evaluatorParticipants.Count() > 0)
                        {
                            foreach (var participant in evaluatorParticipants)
                            {
                                if (!participants.Any(x => x.Id == participant.Id))
                                {
                                    participants.Add(participant);
                                }
                            }
                        }
                        //
                        //

                        foreach (var participant in participants)
                        {
                            var hasAnswers = false;
                            if (stageId > 0 && (ProfileTypeEnum)profile.ProfileTypeId == ProfileTypeEnum.Soft)
                            {
                                var stage = stageGroup.Stages.FirstOrDefault(_ => _.Id == stageId);
                                if (stage != null)
                                {
                                    if (stage.Answers.Any(_ => _.ParticipantId == participant.Id))
                                        hasAnswers = true;
                                }
                            }
                            else if ((ProfileTypeEnum)profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                            {
                                foreach (var stage in stageGroup.Stages)
                                {
                                    if (stage.SurveyResults.Any(sr => sr.ParticipantId == participant.Id))
                                    {
                                        hasAnswers = true;
                                        break;
                                    }
                                }
                            }

                            if (hasAnswers)
                            {
                                var userInfo = service.GetById(participant.UserId);
                                var appUser = _ipsDataContext.Users.Where(u => u.Id == participant.UserId)
                                    .AsNoTracking()
                                    .FirstOrDefault();

                                if (userInfo == null || appUser == null) continue;

                                var organization = _ipsDataContext.Organizations.Where(o => o.Id == appUser.OrganizationId)
                                    .AsNoTracking()
                                    .FirstOrDefault();

                                const string emptyOrganizationName = "Private";

                                var user = new IpsEvaluationUser
                                {
                                    FirstName = userInfo.FirstName,
                                    LastName = userInfo.LastName,
                                    ParticipantId = participant.Id,
                                    RoleId = participant.EvaluationRoleId,
                                    UserId = participant.UserId,
                                    EvaluateeId = participant.EvaluateeId,
                                    IsSelfEvaluation = participant.IsSelfEvaluation,
                                    OrganizationName =
                                        organization != null
                                            ? organization.Name ?? emptyOrganizationName
                                            : emptyOrganizationName,
                                    User = appUser
                                };
                                result.Add(user);
                            }
                        }
                    }

                }
                else
                {
                    List<StageGroup> stageGroups = new List<StageGroup>();
                    if (stageId > 0)
                    {
                        int stagegroupid = _ipsDataContext.Stages.Where(x => x.Id == stageId).Select(x => x.StageGroupId).FirstOrDefault();
                        if (stagegroupid > 0)
                        {
                            stageGroups = profile.StageGroups.Where(sg => sg.Id == stagegroupid).ToList();
                        }
                    }
                    else
                    {
                        stageGroups = profile.StageGroups.Where(
                            sg => sg.StartDate <= DateTime.Now && sg.EndDate >= DateTime.Now).ToList();
                    }
                    foreach (var stageGroup in stageGroups)
                    {
                        var evaluationParticipants = stageGroup.EvaluationParticipants.AsQueryable();

                        evaluationParticipants = SetExtraFilters(evaluationParticipants, ipsUser, profile.OrganizationId,
                            projectIds, departmentIds, teamIds);

                        var participants = evaluationParticipants.Where(_ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && _.IsLocked == false).ToList();
                        // Added for get Participant for other Evaluator User  who is notAdmin nor super Admin 
                        var evaluatorParticipants = evaluationParticipants.Where(_ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator).Select(x => x.EvaluationParticipant1).ToList();
                        if (evaluatorParticipants.Count() > 0)
                        {
                            foreach (var participant in evaluatorParticipants)
                            {
                                if (!participants.Any(x => x.Id == participant.Id))
                                {
                                    participants.Add(participant);
                                }
                            }
                        }
                        //
                        foreach (var participant in participants)
                        {
                            var hasAnswers = false;
                            if (stageId > 0 && (ProfileTypeEnum)profile.ProfileTypeId == ProfileTypeEnum.Soft)
                            {
                                var stage = stageGroup.Stages.FirstOrDefault(_ => _.Id == stageId);
                                if (stage != null)
                                {
                                    if (stage.Answers.Any(_ => _.ParticipantId == participant.Id))
                                        hasAnswers = true;
                                }
                            }
                            else if ((ProfileTypeEnum)profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                            {
                                foreach (var stage in stageGroup.Stages)
                                {
                                    if (stage.SurveyResults.Any(sr => sr.ParticipantId == participant.Id))
                                    {
                                        hasAnswers = true;
                                        break;
                                    }
                                }
                            }

                            if (hasAnswers)
                            {
                                var userInfo = service.GetById(participant.UserId);
                                var appUser = _ipsDataContext.Users.Where(u => u.Id == participant.UserId)
                                    .AsNoTracking()
                                    .FirstOrDefault();

                                if (userInfo == null || appUser == null) continue;

                                var organization = _ipsDataContext.Organizations.Where(o => o.Id == appUser.OrganizationId)
                                    .AsNoTracking()
                                    .FirstOrDefault();

                                const string emptyOrganizationName = "Private";

                                var user = new IpsEvaluationUser
                                {
                                    FirstName = userInfo.FirstName,
                                    LastName = userInfo.LastName,
                                    ParticipantId = participant.Id,
                                    RoleId = participant.EvaluationRoleId,
                                    UserId = participant.UserId,
                                    EvaluateeId = participant.EvaluateeId,
                                    IsSelfEvaluation = participant.IsSelfEvaluation,
                                    OrganizationName =
                                        organization != null
                                            ? organization.Name ?? emptyOrganizationName
                                            : emptyOrganizationName,
                                    User = appUser
                                };
                                result.Add(user);
                            }
                        }
                    }
                }

            }
            if ((ProfileTypeEnum)profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
            {
                result = result.GroupBy(r => r.UserId).Select(r => r.First()).ToList();
            }
            return result;
        }

        public List<int> GetParticipants(int profileId, int participantId)
        {
            var profile = _ipsDataContext.Profiles
                .Include(p => p.StageGroups)
                .Include("StageGroups.EvaluationParticipants")
                .FirstOrDefault(p => p.Id == profileId);

            var result = new List<int>();

            int? userId = _ipsDataContext.EvaluationParticipants.Where(e => e.Id == participantId).Select(e => e.UserId).FirstOrDefault();

            foreach (var stageGroup in profile.StageGroups)
            {
                var evaluationParticipants = stageGroup.EvaluationParticipants.Where(e => e.UserId == userId);

                var participants =
                    evaluationParticipants.Where(
                        _ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && _.IsLocked == false).ToList();

                foreach (var participant in participants)
                {
                    result.Add(participant.Id);
                }
            }

            return result;
        }

        public List<IpsEvaluationUser> GetProfileParticipants(int profileId, DateTime statusOn)
        {
            var watch = new Stopwatch();
            watch.Start();

            Profile profile = _ipsDataContext.Profiles
                .Include("StageGroups.EvaluationParticipants")
                .Include("StageGroups.Stages.Answers").FirstOrDefault(p => p.Id == profileId);

            var appUserOrgId = _authService.GetCurrentUserOrgId();
            var curUser = _authService.getCurrentUser();
            var ipsUser = _authService.GetUserById(curUser.Id);

            List<IpsEvaluationUser> participants = new List<IpsEvaluationUser>();
            if (profile != null)
            {
                var profileOrgId = profile.OrganizationId;
                UserService service = new UserService();
                var isAdminOnProfileOrganiztion = _authService.IsInOrganizationInRoleOf("Admin", profileOrgId);
                var isSuperAdminonProfileOrganization = _authService.IsInOrganizationInRoleOf("Super Admin", profileOrgId);

                StageGroup stageGroup =
                    profile.StageGroups.FirstOrDefault(sg => sg.StartDate <= statusOn && sg.EndDate >= statusOn);
                if (stageGroup != null)
                {
                    var evaluationParticipants = stageGroup.EvaluationParticipants;

                    if (profileOrgId != appUserOrgId && !isSuperAdminonProfileOrganization && !isAdminOnProfileOrganiztion)
                    {
                        var intermidiateResult = new List<EvaluationParticipant>();

                        var evaluator = evaluationParticipants.FirstOrDefault(_ => _.UserId == ipsUser.User.Id && _.EvaluationRoleId == 1);

                        var participant = evaluationParticipants.FirstOrDefault(_ => _.UserId == ipsUser.User.Id && _.EvaluationRoleId == 2);

                        if (evaluator != null)
                        {
                            var evaluteeIds =
                                evaluationParticipants.Where(ep => ep.UserId == evaluator.UserId).Select(_ => _.EvaluateeId);

                            intermidiateResult =
                                evaluationParticipants.Where(_ => evaluteeIds.Contains(_.Id)).ToList();
                            intermidiateResult.Add(evaluator);
                        }
                        else if (participant != null)
                        {
                            intermidiateResult.Add(participant);
                        }
                        evaluationParticipants = intermidiateResult;
                    }

                    foreach (var ep in evaluationParticipants)
                    {
                        bool areAnswers = false;
                        foreach (var stage in stageGroup.Stages)
                        {
                            List<int> evaluatorsId = _ipsDataContext.EvaluationParticipants
                                .Where(p => p.StageGroupId == stage.StageGroupId && p.EvaluateeId == ep.Id
                                    )
                                .Select(p => p.Id)
                                .ToList();

                            if (stage.Answers.Any(a => a.ParticipantId == ep.Id || evaluatorsId.Contains((int)a.ParticipantId)))
                            {
                                areAnswers = true;
                                break;
                            }
                        }

                        if (areAnswers)
                        {
                            IpsEvaluationUser user = new IpsEvaluationUser();
                            user.ParticipantId = ep.Id;
                            user.RoleId = ep.EvaluationRoleId;
                            user.UserId = ep.UserId;
                            user.EvaluateeId = ep.EvaluateeId;
                            user.IsSelfEvaluation = ep.IsSelfEvaluation;
                            user.User =
                                _ipsDataContext.Users.Include("JobPositions")
                                    .Where(u => u.Id == ep.UserId)
                                    .AsNoTracking()
                                    .FirstOrDefault();
                            user.OrganizationName =
                                _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId)
                                    .AsNoTracking()
                                    .FirstOrDefault()
                                    .Name;
                            User userInfo = service.GetById(ep.UserId);
                            if (userInfo != null)
                            {
                                user.FirstName = userInfo.FirstName;
                                user.LastName = userInfo.LastName;
                                participants.Add(user);
                            }
                        }
                    }
                }
            }

            watch.Stop();
            Debug.WriteLine(watch.ElapsedMilliseconds + "GetParticipants");
            return participants;
        }

        public List<IpsEvaluationUser> GetProfileEvaluators(int profileId, DateTime statusOn)
        {
            Profile profile = _ipsDataContext.Profiles
               .Include("StageGroups.EvaluationParticipants")
               .Where(p => p.Id == profileId)
               .FirstOrDefault();
            List<IpsEvaluationUser> evaluators = new List<IpsEvaluationUser>();
            if (profile != null)
            {
                StageGroup stageGroup = profile.StageGroups.Where(sg => sg.StartDate <= statusOn && sg.EndDate >= statusOn).FirstOrDefault();
                if (stageGroup != null)
                {
                    UserService service = new UserService();
                    foreach (var ep in stageGroup.EvaluationParticipants)
                    {
                        if (ep.EvaluationRoleId == 1)
                        {
                            IpsEvaluationUser user = new IpsEvaluationUser();
                            user.ParticipantId = ep.Id;
                            user.RoleId = ep.EvaluationRoleId;
                            user.UserId = ep.UserId;
                            user.EvaluateeId = ep.EvaluateeId;
                            user.IsSelfEvaluation = ep.IsSelfEvaluation;
                            user.User = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == ep.UserId).AsNoTracking().FirstOrDefault();
                            user.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                            User userInfo = service.GetById(ep.UserId);
                            if (userInfo != null)
                            {
                                user.FirstName = userInfo.FirstName;
                                user.LastName = userInfo.LastName;
                                evaluators.Add(user);
                            }
                        }
                    }
                }
            }

            return evaluators;
        }

        public IQueryable<Profile> GetEvaluatedProfiles()
        {
            List<Profile> profiles = _ipsDataContext.Profiles
               .Include("StageGroups.Stages.Answers")
               .Include("StageGroups.EvaluationParticipants")
               .OrderBy(p => p.Name).AsNoTracking().ToList();
            List<Profile> result = new List<Profile>();
            DateTime today = DateTime.Now;
            foreach (var p in profiles)
            {
                bool profileHandled = false;
                if (p.StageGroups != null && p.StageGroups.Count > 0)
                {
                    foreach (var sg in p.StageGroups)
                    {
                        if (sg.StartDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                        {
                            foreach (var s in sg.Stages)
                            {
                                if (s.StartDateTime < today && s.Answers.Count > 0)
                                {
                                    result.Add(p);
                                    profileHandled = true;
                                    break;
                                }
                            }
                            if (profileHandled)
                                break;
                        }
                    }
                }
            }

            return result.AsQueryable();
        }


        public List<Profile> GetProjectEvaluatedProfiles(List<int> projects, int? userId, bool? profileStatus)
        {
            List<Profile> result = new List<Profile>();
            DateTime today = DateTime.Today;
            int currentUserId = _authService.GetCurrentUserId();
            foreach (int projectId in projects)
            {
                if (projectId > 0)
                {
                    int userProjectRole = 0;
                    if (userId.HasValue)
                    {
                        userProjectRole = _ipsDataContext.Link_ProjectUsers.Where(x => x.ProjectId == projectId && x.UserId == userId.Value).Select(x => x.RoleId).FirstOrDefault();
                    }
                    else
                    {

                        userProjectRole = _ipsDataContext.Link_ProjectUsers.Where(x => x.ProjectId == projectId && x.UserId == currentUserId).Select(x => x.RoleId).FirstOrDefault();
                    }
                    List<Profile> profiles = _ipsDataContext.Profiles
                      .Include("StageGroups.Stages.Answers")
                      .Include("StageGroups.Stages.SurveyResults")
                      .Include("StageGroups.EvaluationParticipants")
                      .Where(p => p.ProjectId == projectId)
                      .OrderBy(p => p.Name).AsNoTracking().ToList();
                    if (userProjectRole == (int)ProjectRoleEnum.Participant || userProjectRole == (int)ProjectRoleEnum.Evaluator || userProjectRole == (int)ProjectRoleEnum.Trainer || userProjectRole == (int)ProjectRoleEnum.FinalScoreManager)
                    {
                        // For Normal User
                        foreach (var p in profiles)
                        {
                            bool profileHandled = false;
                            if (p.StageGroups != null && p.StageGroups.Count > 0)
                            {
                                foreach (var sg in p.StageGroups)
                                {
                                    if (profileStatus == true)
                                    {
                                        if (sg.StartDate < today && sg.EndDate >= today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (isParticipant)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }
                                    }
                                    else if (profileStatus == false)
                                    {
                                        if (sg.StartDate < today && sg.EndDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (isParticipant)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }

                                    }
                                    else
                                    {
                                        if (sg.StartDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (isParticipant)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        // For Project Manager , Manager , Admin User / Super Admin User
                        foreach (var p in profiles)
                        {
                            bool profileHandled = false;
                            if (p.StageGroups != null && p.StageGroups.Count > 0)
                            {
                                foreach (var sg in p.StageGroups)
                                {
                                    if (profileStatus == true)
                                    {
                                        if (sg.StartDate < today && sg.EndDate >= today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }
                                    }
                                    else if (profileStatus == false)
                                    {
                                        if (sg.StartDate < today && sg.EndDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }

                                    }
                                    else
                                    {
                                        if (sg.StartDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                        {
                                            bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                            foreach (var s in sg.Stages)
                                            {
                                                if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                                {
                                                    if (s.StartDateTime < today &&
                                                        ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                         (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                    {
                                                        result.Add(p);
                                                        profileHandled = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            if (profileHandled)
                                                break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else
                {
                    List<Profile> profiles = _ipsDataContext.Profiles
                      .Include("StageGroups.Stages.Answers")
                      .Include("StageGroups.Stages.SurveyResults")
                      .Include("StageGroups.EvaluationParticipants")
                      .Where(p => p.ProjectId == null)
                      .OrderBy(p => p.Name).AsNoTracking().ToList();

                    // For Normal User
                    foreach (var p in profiles)
                    {
                        bool profileHandled = false;
                        if (p.StageGroups != null && p.StageGroups.Count > 0)
                        {
                            foreach (var sg in p.StageGroups)
                            {
                                if (profileStatus == true)
                                {
                                    if (sg.StartDate < today && sg.EndDate >= today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                    {
                                        bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                        foreach (var s in sg.Stages)
                                        {
                                            if (isParticipant)
                                            {
                                                if (s.StartDateTime < today &&
                                                    ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                     (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                {
                                                    result.Add(p);
                                                    profileHandled = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (profileHandled)
                                            break;
                                    }
                                }
                                else if (profileStatus == false)
                                {
                                    if (sg.StartDate < today && sg.EndDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                    {
                                        bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                        foreach (var s in sg.Stages)
                                        {
                                            if (isParticipant)
                                            {
                                                if (s.StartDateTime < today &&
                                                    ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                     (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                {
                                                    result.Add(p);
                                                    profileHandled = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (profileHandled)
                                            break;
                                    }

                                }
                                else
                                {
                                    if (sg.StartDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                                    {
                                        bool isParticipant = sg.EvaluationParticipants.Any(ep => ep.UserId == currentUserId && ep.IsLocked == false);
                                        foreach (var s in sg.Stages)
                                        {
                                            if (isParticipant)
                                            {
                                                if (s.StartDateTime < today &&
                                                    ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                                     (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                                {
                                                    result.Add(p);
                                                    profileHandled = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (profileHandled)
                                            break;
                                    }
                                }
                            }
                        }
                    }

                }
            }
            return result;
        }

        public IQueryable<Profile> GetEvaluatedProfiles(int organizationId, int? userId, bool? profileStatus)
        {
            List<Profile> profiles = _ipsDataContext.Profiles
               .Include("StageGroups.Stages.Answers")
               .Include("StageGroups.Stages.SurveyResults")
               .Include("StageGroups.EvaluationParticipants")
               .Where(p => p.OrganizationId == organizationId)
               .OrderBy(p => p.Name).AsNoTracking().ToList();
            List<Profile> result = new List<Profile>();
            DateTime today = DateTime.Now;
            foreach (var p in profiles)
            {
                bool profileHandled = false;
                if (p.StageGroups != null && p.StageGroups.Count > 0)
                {
                    foreach (var sg in p.StageGroups)
                    {
                        if (profileStatus == true)
                        {
                            if (sg.StartDate < today && sg.EndDate >= today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                            {
                                bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                foreach (var s in sg.Stages)
                                {
                                    if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                    {
                                        if (s.StartDateTime < today &&
                                            ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                             (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                        {
                                            result.Add(p);
                                            profileHandled = true;
                                            break;
                                        }
                                    }
                                }
                                if (profileHandled)
                                    break;
                            }
                        }
                        else if (profileStatus == false)
                        {
                            if (sg.StartDate < today && sg.EndDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                            {
                                bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                foreach (var s in sg.Stages)
                                {
                                    if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                    {
                                        if (s.StartDateTime < today &&
                                            ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                             (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                        {
                                            result.Add(p);
                                            profileHandled = true;
                                            break;
                                        }
                                    }
                                }
                                if (profileHandled)
                                    break;
                            }

                        }
                        else
                        {
                            if (sg.StartDate < today && sg.Stages.Count > 0 && sg.EvaluationParticipants.Count > 0)
                            {
                                bool isParticipant = userId == null ? false : sg.EvaluationParticipants.Any(ep => ep.UserId == userId);
                                foreach (var s in sg.Stages)
                                {
                                    if (userId == null || isParticipant || s.ManagerId == userId || s.TrainerId == userId)
                                    {
                                        if (s.StartDateTime < today &&
                                            ((s.Answers.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Soft) ||
                                             (s.SurveyResults.Count > 0 && (ProfileTypeEnum)p.ProfileTypeId == ProfileTypeEnum.Knowledge)))
                                        {
                                            result.Add(p);
                                            profileHandled = true;
                                            break;
                                        }
                                    }
                                }
                                if (profileHandled)
                                    break;
                            }
                        }
                    }
                }
            }

            return result.AsQueryable();
        }

        public List<IpsStage> GetProfileStages(int profileId, int? participantId, int? stageGroupId)
        {
            var result = new List<IpsStage>();
            var profileType = _ipsDataContext.Profiles.Where(p => p.Id == profileId).Select(p => p.ProfileTypeId).FirstOrDefault();

            const string notStartedText = "Not Started";
            const string activeText = "Active";
            const string completedText = "Completed";
            const string expiredText = "Expired";
            const string stoppedText = "Stopped";
            const string pausedText = "Paused";
            if ((ProfileTypeEnum)profileType == ProfileTypeEnum.Soft)
            {
                var profile = _ipsDataContext.Profiles.Include("StageGroups.Stages.Answers")
                    .Include("StageGroups.EvaluationParticipants")
                    .FirstOrDefault(_ => _.Id == profileId);

                if (profile != null)
                {
                    var stageGroups = profile.StageGroups.Where(s => s.StartDate <= DateTime.Today).OrderBy(s => s.StartDate).ToList();
                    if (stageGroups.Any())
                    {
                        if (stageGroupId.HasValue)
                        {

                            var currentStageGroup = stageGroups.Where(x => x.Id == stageGroupId.Value).FirstOrDefault();
                            if (currentStageGroup != null)
                            {
                                var stages =
                                    currentStageGroup.Stages
                                    .OrderBy(s => s.EndDateTime);


                                foreach (var stage in stages)
                                {
                                    var statusText = "";
                                    if (stage.StartDateTime > DateTime.Now)
                                    {
                                        statusText = notStartedText;
                                    }
                                    if (stage.StartDateTime <= DateTime.Now && stage.EndDateTime >= DateTime.Now)
                                    {
                                        statusText = activeText;
                                    }
                                    if (stage.EndDateTime < DateTime.Now)
                                    {
                                        if (stage.Answers.Count > 0)
                                        {
                                            statusText = completedText;
                                        }
                                        else
                                        {
                                            statusText = expiredText;
                                        }
                                    }
                                    if (stage.IsPaused)
                                    {
                                        statusText = pausedText;
                                    }
                                    if (stage.IsStopped)
                                    {
                                        statusText = stoppedText;
                                    }
                                    result.Add(new IpsStage
                                    {
                                        Id = stage.Id,
                                        Name = stage.Name,
                                        StartDateTime = stage.StartDateTime,
                                        EndDateTime = stage.EndDateTime,
                                        StageGroupId = stage.StageGroupId,
                                        StatusText = statusText
                                    });
                                }
                            }
                        }
                        else
                        {
                            var currentStageGroup = stageGroups.LastOrDefault();
                            if (currentStageGroup != null)
                            {
                                var stages =
                                    currentStageGroup.Stages
                                    .OrderBy(s => s.EndDateTime);


                                foreach (var stage in stages)
                                {
                                    var statusText = "";
                                    if (stage.StartDateTime > DateTime.Now)
                                    {
                                        statusText = notStartedText;
                                    }
                                    if (stage.StartDateTime <= DateTime.Now && stage.EndDateTime >= DateTime.Now)
                                    {
                                        statusText = activeText;
                                    }
                                    if (stage.EndDateTime < DateTime.Now)
                                    {
                                        if (stage.Answers.Count > 0)
                                        {
                                            statusText = completedText;
                                        }
                                        else
                                        {
                                            statusText = expiredText;
                                        }
                                    }

                                    if (stage.IsPaused)
                                    {
                                        statusText = pausedText;
                                    }
                                    if (stage.IsStopped)
                                    {
                                        statusText = stoppedText;
                                    }
                                    result.Add(new IpsStage
                                    {
                                        Id = stage.Id,
                                        Name = stage.Name,
                                        StartDateTime = stage.StartDateTime,
                                        EndDateTime = stage.EndDateTime,
                                        StageGroupId = stage.StageGroupId,
                                        StatusText = statusText
                                    });
                                }
                            }
                        }
                    }
                }
            }
            else if ((ProfileTypeEnum)profileType == ProfileTypeEnum.Knowledge)
            {
                var stagesQuery = _ipsDataContext.Profiles
                .Include(s => s.StageGroups)
                .Where(p => p.Id == profileId)
                .SelectMany(p => p.StageGroups)
                .Include(s => s.Stages)
                .Where(sg => sg.StartDate <= DateTime.Today)
                .SelectMany(sg => sg.Stages)
                .Include(p => p.SurveyResults).ToList();

                if (participantId.HasValue)
                {
                    stagesQuery = stagesQuery.Where(s => s.SurveyResults.Any(sr => sr.ParticipantId == participantId)).ToList();
                }
                else
                {
                    stagesQuery = stagesQuery.Where(s => s.SurveyResults.Any()).ToList();
                }
                var stages = stagesQuery.Select(s => new { s.Id, s.Name, s.EndDateTime, s.StageGroupId, s.StartDateTime })
                    .ToList();

                if (stages != null)
                {
                    foreach (var stage in stages)
                    {
                        result.Add(new IpsStage()
                        {
                            Id = stage.Id,
                            EndDateTime = stage.EndDateTime,
                            Name = stage.Name,
                            StageGroupId = stage.StageGroupId,
                            StartDateTime = stage.StartDateTime,
                            StatusText = (stage.EndDateTime < DateTime.Now ? completedText : activeText)
                        });
                    }
                }
            }


            return result;
        }

        public List<IpsStage> GetProfileParticipantsSameStages(int profileId, List<int> participantsId)
        {
            List<IpsStage> sameStages = new List<IpsStage>();


            if (participantsId == null || participantsId.Count == 0)
            {
                sameStages = GetProfileStages(profileId, null, null);
            }
            else
            {
                foreach (var participantId in participantsId)
                {
                    var participantStages = GetProfileStages(profileId, participantId, null);

                    sameStages = sameStages.Union(participantStages, new IpsStageComparer()).ToList();
                }
            }

            return sameStages;
        }

        public List<IpsScorecardPeriod> GetProfileEvaluationPeriods(int profileId, int? participantId)
        {
            Profile profile = _ipsDataContext.Profiles
                .Include("StageGroups.Stages.Answers")
                .Include("StageGroups.EvaluationParticipants")
                .Where(p => p.Id == profileId).AsNoTracking().FirstOrDefault();
            bool organizeInQuarters = true;
            List<IpsScorecardPeriod> periods = new List<IpsScorecardPeriod>();
            List<DateTime> stagesEndDates = new List<DateTime>();
            List<Stage> periodStages = new List<Stage>();
            if (profile != null && profile.StageGroups != null && profile.StageGroups.Count > 0)
            {
                List<StageGroup> stageGroups = profile.StageGroups.Where(s => s.StartDate < DateTime.Today).OrderBy(s => s.StartDate).ToList();
                foreach (var stageGroup in stageGroups)
                {
                    List<int> participants = stageGroup.EvaluationParticipants.Where(ep => ep.EvaluateeId == participantId).Select(ep => ep.Id).ToList();
                    List<Stage> stages = stageGroup.Stages.Where(s => s.StartDateTime <= DateTime.Today).OrderBy(s => s.EndDateTime).ToList();
                    foreach (var stage in stages)
                    {
                        if (stage.Answers != null && participantId.HasValue && participantId > 0 ? (stage.Answers.Any(a => a.ParticipantId == participantId || participants.Contains((int)a.ParticipantId))) : stage.Answers.Count > 0)
                        {
                            periodStages.Add(stage);
                            if (periodStages.Count > 1)
                            {
                                if (GetQuarter(periodStages[periodStages.Count - 2].EndDateTime) == GetQuarter(stage.EndDateTime))
                                {
                                    organizeInQuarters = false;
                                }
                            }
                        }
                    }
                }
            }
            if (organizeInQuarters)
            {
                foreach (Stage s in periodStages)
                {
                    periods.Add(new IpsScorecardPeriod(s.EndDateTime.AddDays(1), String.Format("{0}/Q{1}", s.EndDateTime.Year, GetQuarter(s.EndDateTime)), s.Id));
                }
            }
            else
            {
                foreach (Stage s in periodStages)
                {
                    periods.Add(new IpsScorecardPeriod(s.EndDateTime.AddDays(1), String.Format("{0}/{1:D2}", s.EndDateTime.Year, s.EndDateTime.Month), s.Id));
                }
            }
            return periods;
        }

        private static int GetQuarter(DateTime date)
        {
            int nMonth = date.Month;
            if (nMonth <= 3)
                return 1;
            if (nMonth <= 6)
                return 2;
            if (nMonth <= 9)
                return 3;
            return 4;
        }

        /// <summary>
        /// Returns score card by stage and evaluator
        /// </summary>
        /// <param name="stageId"></param>
        /// <param name="evaluatorIds">Evaluator Ids (participant in case of self evaluation)</param>
        /// <returns></returns>
        public List<IpsQuestionInfo> GetParticipantProfileScorecard(int stageId, List<int> evaluatorIds)
        {
            var result = new List<IpsQuestionInfo>();
            for (int i = 0; i < evaluatorIds.Count; i++)
            {
                if (i == 0)
                {
                    result = GetOneParticipantProfileScorecard(stageId, evaluatorIds[0]);
                    foreach (var res in result)
                    {
                        if (res.EvaluatorAnswer != null)
                        {
                            res.EvaluatorAnswers.Add(res.EvaluatorAnswer);
                        }
                    }
                }
                else
                {
                    var tempResult = GetOneParticipantProfileScorecard(stageId, evaluatorIds[i]);
                    for (int j = 0; j < tempResult.Count; j++)
                    {
                        result[j].EvaluatorAnswers.Add(tempResult[j].EvaluatorAnswer);
                    }
                }
            }
            return result;
        }

        private List<IpsQuestionInfo> GetOneParticipantProfileScorecard(int stageId, int evaluatorId)
        {
            List<IpsQuestionInfo> questions = new List<IpsQuestionInfo>();

            StageGroup stageGroup = _ipsDataContext.StageGroups
                .Include("Profiles.Scale.ScaleRanges")
                .Include("Stages")
                .Where(sg => sg.Id == (_ipsDataContext.Stages.Where(s => s.Id == stageId).Select(s => s.StageGroupId)).FirstOrDefault())
                .AsNoTracking()
                .FirstOrDefault();

            EvaluationParticipant evaluator = _ipsDataContext.EvaluationParticipants
               .Include("EvaluationParticipant1")
               .Where(p => p.Id == evaluatorId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null && evaluator != null)
            {
                int participantId = evaluator.EvaluateeId.HasValue ? (int)evaluator.EvaluateeId : evaluatorId; //evaluator or self-evaluation

                Profile profile = stageGroup.Profiles.First();

                User participantUser = evaluator.EvaluationParticipant1 != null ?
                    _ipsDataContext.Users.Where(u => u.Id == evaluator.EvaluationParticipant1.UserId).FirstOrDefault() :
                    _ipsDataContext.Users.Where(u => u.Id == evaluator.UserId).FirstOrDefault();

                List<Stage> stages = stageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                List<int> stageIds = stages.Select(s => s.Id).ToList();
                bool isFirstOrLastStage = stages.First().Id == stageId || stages.Last().Id == stageId;
                bool isFirstStage = stages.First().Id == stageId;
                List<Answer> participantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == stageId && a.ParticipantId == participantId)
                    .AsNoTracking()
                    .ToList();

                if (!isFirstOrLastStage && participantAnswers.Where(a => a.KPIType > 0).Count() == 0)
                {
                    int firstStageId = stages.First().Id;
                    List<Answer> startProfileParticipantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == firstStageId && a.ParticipantId == participantId)
                    .AsNoTracking()
                    .ToList();
                    // update KPI
                    foreach (var a in participantAnswers)
                    {
                        var startAnswer = startProfileParticipantAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                        if (startAnswer != null)
                        {
                            a.KPIType = startAnswer.KPIType;
                        }
                    }
                }

                List<Answer> evaluatorAnswers = participantId == evaluatorId ? new List<Answer>() : _ipsDataContext.Answers
                    .Where(a => a.StageId == stageId && a.ParticipantId == evaluatorId)
                    .AsNoTracking()
                    .ToList();

                if (!isFirstOrLastStage && evaluatorAnswers.Count > 0)
                {
                    int firstStageId = stages.First().Id;
                    List<Answer> startProfileEvaluatorAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == firstStageId && a.ParticipantId == evaluatorId)
                    .AsNoTracking()
                    .ToList();
                    // update KPI
                    foreach (var a in evaluatorAnswers)
                    {
                        var startAnswer = startProfileEvaluatorAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                        if (startAnswer != null)
                        {
                            a.KPIType = startAnswer.KPIType;
                        }
                    }
                }

                List<Answer> previousScores = GetPreviousEvaluationScores(stageId, participantId);

                List<Answer> avgScores = GetEvaluationAggregatedScores(stageId, participantId);

                List<EvaluationAgreement> allAgreements = _ipsDataContext.EvaluationAgreements
                    .Include(item => item.Trainings.Select(training => training.TrainingMaterials))
                    .Include("Stage")
                     .Include("MilestoneAgreementGoals")
                   .Where(a => stageIds.Contains(stageId) && a.ParticipantId == participantId)
                   .AsNoTracking()
                   .ToList();

                List<EvaluationAgreement> agreements = new List<EvaluationAgreement>();
                if (allAgreements.Count > 0)
                {
                    agreements = allAgreements.Where(a => a.StageId == stageId).ToList();
                    if (agreements.Count <= 0)
                    {
                        int currentStageIdIndex = stageIds.IndexOf(stageId);
                        for (var idx = currentStageIdIndex - 1; idx >= 0; idx--)
                        {
                            agreements = allAgreements.Where(a => a.StageId == stageIds[idx]).ToList();
                            if (agreements.Count > 0)
                            {
                                foreach (var a in agreements)
                                {
                                    a.Id = -1;
                                    a.StageId = stageId;
                                }
                                break;
                            }
                        }
                    }
                }

                List<PerformanceGroup> performanceGroups = _ipsDataContext.PerformanceGroups
                    .Where(pg => pg.ProfileId == profile.Id)
                    .OrderBy(pg => pg.SeqNo)
                    .ThenBy(pg => pg.Id)
                    .AsNoTracking()
                    .ToList();

                List<int> pgIds = performanceGroups.Select(pg => pg.Id).ToList();

                List<Link_PerformanceGroupSkills> pgSkills = _ipsDataContext.Link_PerformanceGroupSkills
                    .Include("Skill")
                    .Include("Questions")
                    .Include("Trainings.TrainingMaterials")
                    .Where(pgs => pgIds.Contains(pgs.PerformanceGroupId))
                    .AsNoTracking()
                    .ToList();

                Stage stage = stages.Where(s => s.Id == stageId).First();
                EvaluationParticipant participant = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == participantId).AsNoTracking().FirstOrDefault();

                int i = 1;
                foreach (var pg in performanceGroups)
                {
                    pg.Profile = profile;
                    List<Link_PerformanceGroupSkills> links = pgSkills.Where(pgs => pgs.PerformanceGroupId == pg.Id).ToList();
                    foreach (var pgs in links)
                    {
                        foreach (var q in pgs.Questions)
                        {
                            Answer participantAnswer = participantAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer evaluatorAnswer = evaluatorAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer avgAnswer = avgScores.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer previousAnswer = previousScores.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            EvaluationAgreement agreement = agreements.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            //if(!isFirstStage)
                            //{

                            //    if (agreement != null && agreement.KPIType > 0)
                            //    {
                            //        questions.Add(new IpsQuestionInfo
                            //        {
                            //            QuestionNo = i,
                            //            PerformanceGroup = pg,
                            //            Skill = pgs.Skill,
                            //            Question = q,
                            //            Trainings = pgs.Trainings.ToList(),
                            //            ParticipantAnswer = participantAnswer,
                            //            EvaluatorAnswer = evaluatorAnswer,
                            //            EvaluatorAnswers = new List<Answer>(),
                            //            AvgAnswer = avgAnswer,
                            //            PreviousAnswer = previousAnswer,
                            //            Agreement = agreement,
                            //            Participant = participant,
                            //            Evaluator = evaluator,
                            //            ParticipantUser = participantUser
                            //        });
                            //    }
                            //}
                            //else
                            //{
                            questions.Add(new IpsQuestionInfo
                            {
                                QuestionNo = i,
                                PerformanceGroup = pg,
                                Skill = pgs.Skill,
                                Question = q,
                                Trainings = pgs.Trainings.ToList(),
                                ParticipantAnswer = participantAnswer,
                                EvaluatorAnswer = evaluatorAnswer,
                                EvaluatorAnswers = new List<Answer>(),
                                AvgAnswer = avgAnswer,
                                PreviousAnswer = previousAnswer,
                                Agreement = agreement,
                                Participant = participant,
                                Evaluator = evaluator,
                                ParticipantUser = participantUser
                            });
                            //}

                            i++;
                        }
                    }
                }
            }

            questions = questions.OrderBy(q => q.PerformanceGroup.SeqNo).ThenBy(q => q.PerformanceGroup.Id).ThenBy(q => q.Question.SeqNo).ThenBy(q => q.Question.Id).ToList();

            return questions;
        }




        public List<IpsParticipantInfo> GetParticipantEvaluators(int stageId, int participantId)
        {
            List<IpsParticipantInfo> evaluators = new List<IpsParticipantInfo>();

            var q = from p in _ipsDataContext.EvaluationParticipants
                    join u in _ipsDataContext.Users on p.UserId equals u.Id into evalUser
                    from user in evalUser.DefaultIfEmpty()
                    where (p.Id == participantId)
                    select new
                    {
                        p,
                        user
                    };

            var participantInfo = q.AsNoTracking().FirstOrDefault();
            if (participantInfo != null)
            {
                var pQuery = from p in _ipsDataContext.EvaluationParticipants
                             join u in _ipsDataContext.Users on p.UserId equals u.Id into evalUser
                             from user in evalUser.DefaultIfEmpty()
                             join a in _ipsDataContext.Answers on new { StageId = stageId, ParticipantId = p.Id } equals new { StageId = (int)a.StageId, ParticipantId = (int)a.ParticipantId } into answers
                             where ((participantInfo.p.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && p.EvaluateeId == participantId) || (participantInfo.p.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator && p.EvaluateeId == participantInfo.p.EvaluateeId))
                                && p.IsLocked == false && answers.Count() > 0
                             select new
                             {
                                 p,
                                 user
                             };

                var evalParticipants = pQuery.AsNoTracking().ToList();

                foreach (var ep in evalParticipants)
                {
                    evaluators.Add(new IpsParticipantInfo(ep.p, ep.user));
                }

                if ((participantInfo.p.EvaluationRoleId == (int)EvaluationRoleEnum.Participant) && (bool)participantInfo.p.IsSelfEvaluation)
                {
                    evaluators.Add(new IpsParticipantInfo(participantInfo.p, participantInfo.user));
                }
            }
            return evaluators;
        }

        public List<IpsQuestionInfo> GetParticipantProfileScorecardByEvaluatee(int stageId, int evaluateeId, int? evaluatorId)
        {
            List<IpsQuestionInfo> questions = new List<IpsQuestionInfo>();

            StageGroup stageGroup = _ipsDataContext.StageGroups
                .Include("Profiles")
                .Where(sg => sg.Id == (_ipsDataContext.Stages.Where(s => s.Id == stageId).Select(s => s.StageGroupId)).FirstOrDefault())
                .AsNoTracking()
                .FirstOrDefault();

            EvaluationParticipant evaluator = evaluatorId.HasValue ? _ipsDataContext.EvaluationParticipants.Where(p => p.Id == evaluatorId).AsNoTracking().FirstOrDefault() : null;
            if (stageGroup != null)
            {
                int participantId = evaluateeId;

                Profile profile = stageGroup.Profiles.First();

                List<Stage> stages = stageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                bool isFirstOrLastStage = stages.First().Id == stageId || stages.Last().Id == stageId;

                List<Answer> participantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == stageId && a.ParticipantId == participantId)
                    .AsNoTracking()
                    .ToList();

                if (!isFirstOrLastStage)
                {
                    List<Answer> startProfileParticipantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == stages.First().Id && a.ParticipantId == participantId)
                    .AsNoTracking()
                    .ToList();
                    // update KPI
                    foreach (var a in participantAnswers)
                    {
                        var startAnswer = startProfileParticipantAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                        if (startAnswer != null)
                        {
                            a.KPIType = startAnswer.KPIType;
                        }
                    }
                }

                List<Answer> evaluatorAnswers = (!evaluatorId.HasValue || participantId == evaluatorId) ? new List<Answer>() : _ipsDataContext.Answers
                    .Where(a => a.StageId == stageId && a.ParticipantId == evaluatorId)
                    .AsNoTracking()
                    .ToList();

                if (!isFirstOrLastStage && evaluatorAnswers.Count > 0)
                {
                    List<Answer> startProfileEvaluatorAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == stages.First().Id && a.ParticipantId == evaluatorId)
                    .AsNoTracking()
                    .ToList();
                    // update KPI
                    foreach (var a in evaluatorAnswers)
                    {
                        var startAnswer = startProfileEvaluatorAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                        if (startAnswer != null)
                        {
                            a.KPIType = startAnswer.KPIType;
                        }
                    }
                }

                List<Answer> previousScores = GetPreviousEvaluationScores(stageId, participantId);

                List<Answer> avgScores = GetEvaluationAggregatedScores(stageId, participantId);

                List<EvaluationAgreement> agreements = _ipsDataContext.EvaluationAgreements.Include("Trainings")
                    .Where(a => a.StageId == stageId && a.ParticipantId == participantId)
                    .AsNoTracking()
                    .ToList();

                List<PerformanceGroup> performanceGroups = _ipsDataContext.PerformanceGroups
                    .Where(pg => pg.ProfileId == profile.Id)
                    .OrderBy(pg => pg.SeqNo)
                    .ThenBy(pg => pg.Id)
                    .AsNoTracking()
                    .ToList();

                List<int> pgIds = performanceGroups.Select(pg => pg.Id).ToList();

                List<Link_PerformanceGroupSkills> pgSkills = _ipsDataContext.Link_PerformanceGroupSkills
                    .Include("Skill")
                    .Include("Questions")
                    .Include("Trainings")
                    .Where(pgs => pgIds.Contains(pgs.PerformanceGroupId))
                    .AsNoTracking()
                    .ToList();

                Stage stage = stages.Where(s => s.Id == stageId).First();
                EvaluationParticipant participant = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == participantId).AsNoTracking().FirstOrDefault();
                int i = 1;
                foreach (var pg in performanceGroups)
                {
                    List<Link_PerformanceGroupSkills> links = pgSkills.Where(pgs => pgs.PerformanceGroupId == pg.Id).ToList();
                    foreach (var pgs in links)
                    {

                        foreach (var q in pgs.Questions)
                        {
                            Answer participantAnswer = participantAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer evaluatorAnswer = evaluatorAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer avgAnswer = avgScores.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            Answer previousAnswer = previousScores.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            EvaluationAgreement agreement = agreements.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            questions.Add(new IpsQuestionInfo(i, pg, pgs.Skill, q, pgs.Trainings.ToList(), participantAnswer, evaluatorAnswer, evaluatorAnswers, avgAnswer, previousAnswer, agreement, participant, evaluator));
                            i++;
                        }
                    }
                }
            }

            questions = questions.OrderBy(q => q.PerformanceGroup.SeqNo).ThenBy(q => q.PerformanceGroup.Id).ThenBy(q => q.Question.SeqNo).ThenBy(q => q.Question.Id).ToList();

            return questions;
        }


        public List<IpsQuestionInfo> GetProfileKPITrainings(int profileId, int stageId)
        {
            //List<EvaluationAgreement> evaluationAgreement = new List<EvaluationAgreement>();
            List<IpsQuestionInfo> questions = new List<IpsQuestionInfo>();

            StageGroup stageGroup = _ipsDataContext.StageGroups
                .Include("Profiles.Scale.ScaleRanges")
                .Include("Stages")
                .Where(sg => sg.Id == (_ipsDataContext.Stages.Where(s => s.Id == stageId).Select(s => s.StageGroupId)).FirstOrDefault())
                .AsNoTracking()
                .FirstOrDefault();

            EvaluationParticipant evaluator = _ipsDataContext.EvaluationParticipants
               .Include("EvaluationParticipant1")
               .Where(p => p.StageGroupId == stageGroup.Id).AsNoTracking().FirstOrDefault();
            if (stageGroup != null && evaluator != null)
            {
                //int participantId = evaluator.EvaluateeId.HasValue ? (int)evaluator.EvaluateeId : Convert.ToInt32(evaluateeId == null ? 0 : evaluateeId); //evaluator or self-evaluation

                Profile profile = stageGroup.Profiles.First();

                User participantUser = evaluator.EvaluationParticipant1 != null ?
                    _ipsDataContext.Users.Where(u => u.Id == evaluator.EvaluationParticipant1.UserId).FirstOrDefault() :
                    _ipsDataContext.Users.Where(u => u.Id == evaluator.UserId).FirstOrDefault();

                List<Stage> stages = stageGroup.Stages.Where(x => x.Id == stageId).OrderBy(s => s.StartDateTime).ToList();
                List<int> stageIds = stages.Select(s => s.Id).ToList();
                bool isFirstOrLastStage = stages.First().Id == stageId || stages.Last().Id == stageId;

                List<Answer> participantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == stageId)
                    .AsNoTracking()
                    .ToList();

                if (!isFirstOrLastStage && participantAnswers.Where(a => a.KPIType > 0).Count() == 0)
                {
                    int firstStageId = stages.First().Id;
                    List<Answer> startProfileParticipantAnswers = _ipsDataContext.Answers
                    .Where(a => a.StageId == firstStageId)
                    .AsNoTracking()
                    .ToList();
                    // update KPI
                    foreach (var a in participantAnswers)
                    {
                        var startAnswer = startProfileParticipantAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                        if (startAnswer != null)
                        {
                            a.KPIType = startAnswer.KPIType;
                        }
                    }
                }

                //List<Answer> evaluatorAnswers = participantId == evaluatorId ? new List<Answer>() : _ipsDataContext.Answers
                //    .Where(a => a.StageId == stageId && a.ParticipantId == evaluatorId)
                //    .AsNoTracking()
                //    .ToList();

                //if (!isFirstOrLastStage && evaluatorAnswers.Count > 0)
                //{
                //    int firstStageId = stages.First().Id;
                //    List<Answer> startProfileEvaluatorAnswers = _ipsDataContext.Answers
                //    .Where(a => a.StageId == firstStageId && a.ParticipantId == evaluatorId)
                //    .AsNoTracking()
                //    .ToList();
                //    // update KPI
                //    foreach (var a in evaluatorAnswers)
                //    {
                //        var startAnswer = startProfileEvaluatorAnswers.Where(an => an.QuestionId == a.QuestionId).FirstOrDefault();
                //        if (startAnswer != null)
                //        {
                //            a.KPIType = startAnswer.KPIType;
                //        }
                //    }
                //}


                List<EvaluationAgreement> allAgreements = _ipsDataContext.EvaluationAgreements.Include(item => item.Trainings.Select(training => training.TrainingMaterials))
                   .Where(a => stageIds.Contains(stageId))
                   .AsNoTracking()
                   .ToList();

                List<EvaluationAgreement> agreements = new List<EvaluationAgreement>();
                if (allAgreements.Count > 0)
                {
                    agreements = allAgreements.Where(a => a.StageId == stageId).ToList();
                    if (agreements.Count <= 0)
                    {
                        int currentStageIdIndex = stageIds.IndexOf(stageId);
                        for (var idx = currentStageIdIndex - 1; idx >= 0; idx--)
                        {
                            agreements = allAgreements.Where(a => a.StageId == stageIds[idx]).ToList();
                            if (agreements.Count > 0)
                            {
                                foreach (var a in agreements)
                                {
                                    a.Id = -1;
                                    a.StageId = stageId;
                                }
                                break;
                            }
                        }
                    }
                }

                List<PerformanceGroup> performanceGroups = _ipsDataContext.PerformanceGroups
                    .Where(pg => pg.ProfileId == profile.Id)
                    .OrderBy(pg => pg.SeqNo)
                    .ThenBy(pg => pg.Id)
                    .AsNoTracking()
                    .ToList();

                List<int> pgIds = performanceGroups.Select(pg => pg.Id).ToList();

                List<Link_PerformanceGroupSkills> pgSkills = _ipsDataContext.Link_PerformanceGroupSkills
                    .Include("Skill")
                    .Include("Questions")
                    .Include("Trainings")
                    .Where(pgs => pgIds.Contains(pgs.PerformanceGroupId))
                    .AsNoTracking()
                    .ToList();

                Stage stage = stages.Where(s => s.Id == stageId).First();

                int i = 1;
                foreach (var pg in performanceGroups)
                {
                    pg.Profile = profile;
                    List<Link_PerformanceGroupSkills> links = pgSkills.Where(pgs => pgs.PerformanceGroupId == pg.Id).ToList();
                    foreach (var pgs in links)
                    {
                        foreach (var q in pgs.Questions)
                        {
                            Answer participantAnswer = participantAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            //Answer evaluatorAnswer = evaluatorAnswers.Where(a => a.QuestionId == q.Id).FirstOrDefault();

                            EvaluationAgreement agreement = agreements.Where(a => a.QuestionId == q.Id).FirstOrDefault();
                            questions.Add(new IpsQuestionInfo
                            {
                                QuestionNo = i,
                                PerformanceGroup = pg,
                                Skill = pgs.Skill,
                                Question = q,
                                Trainings = pgs.Trainings.ToList(),
                                ParticipantAnswer = participantAnswer,
                                //EvaluatorAnswer = evaluatorAnswer,
                                EvaluatorAnswers = new List<Answer>(),
                                Agreement = agreement,
                                Evaluator = evaluator,
                                ParticipantUser = participantUser
                            });
                            i++;
                        }
                    }
                }
            }
            //evaluationAgreement = questions.Select(x => x.Agreement).ToList();
            //questions = questions.OrderBy(q => q.PerformanceGroup.SeqNo).ThenBy(q => q.PerformanceGroup.Id).ThenBy(q => q.Question.SeqNo).ThenBy(q => q.Question.Id).ToList();

            return questions;
        }

        public IpsProfileScorecard GetProfileScoreCards(int profileId, bool isBenchmarkRequested, List<int> participantIds, List<int> evaluatorIds, int stageId, TypeOfProfile profileType, DateTime? statusOn, int? stageGroupId)
        {
            bool resetNeeded = false;

            Profile profile = _ipsDataContext.Profiles
                .Include("StageGroups")
                .Include("Scale.ScaleRanges")
                .Include("StageGroups.Stages.EvaluationAgreements")
                .Include("StageGroups.Stages.Answers")
                .Include("StageGroups.Stages.MilestoneAgreementGoals")
                .Include("PerformanceGroups.Link_PerformanceGroupSkills.Questions")
                .Include("PerformanceGroups.Link_PerformanceGroupSkills.Skill")
                .Include("PerformanceGroups.ScorecardPerspective")
                .Where(p => p.Id == profileId).AsNoTracking().FirstOrDefault();

            if (profile != null && profile.StageGroups != null && profile.StageGroups.Any())
            {
                StageGroup stageGroup = profile.StageGroups.FirstOrDefault(s => s.StartDate <= statusOn && s.EndDate >= statusOn);
                if (stageGroupId.HasValue)
                {
                    stageGroup = profile.StageGroups.FirstOrDefault(s => s.Id == stageGroupId.Value);
                }
                else
                {
                    stageGroup = profile.StageGroups.FirstOrDefault();
                }
                if (stageGroup != null)
                {
                    List<Stage> pastStages = stageGroup.Stages.Where(s => s.StartDateTime <= statusOn).OrderBy(s => s.EndDateTime).ToList();
                    if (stageId > 0)
                    {
                        pastStages = pastStages.Where(_ => _.Id == stageId).ToList();
                    }
                    List<Stage> stages = pastStages.Where(s => s.Answers != null && s.Answers.Count > 0).ToList();
                    if (!stages.Any())
                    {
                        resetNeeded = true;
                        stages.Add(stageGroup.Stages.First());
                    }
                    if (stages.Count > 0)
                    {
                        Stage currentStage = stages.Last();
                        Stage previousStage = null;
                        Stage firstStage = stages.First();
                        if (stages.Count > 1)
                        {
                            previousStage = stages[stages.Count - 2];
                        }

                        if (isBenchmarkRequested)
                        {
                            List<int> participantsIds = new List<int>();
                            foreach (var userId in participantIds)
                            {
                                if (userId == -1)
                                {
                                    if (participantIds.Count == 1)
                                    {
                                        isBenchmarkRequested = false;
                                    }
                                }
                                else
                                {
                                    participantsIds.Add(userId);
                                }
                            }
                            participantIds = participantsIds;
                        }

                        IpsProfileScorecard ipsProfileScorecard = CalculateProfileScorecard(profile, currentStage, participantIds, null, profileType);
                        ipsProfileScorecard.ParticipantsId = participantIds;
                        ipsProfileScorecard.Scale = profile.Scale;
                        ipsProfileScorecard.Scale.MeasureUnit = null;
                        ipsProfileScorecard.Scale.PerformanceGroups = null;
                        ipsProfileScorecard.Scale.Profiles = null;
                        ipsProfileScorecard.Scale.ScaleCategory = null;
                        ipsProfileScorecard.Scale.Questions = null;
                        ipsProfileScorecard.Scale.ProfileType1 = null;
                        ipsProfileScorecard.EvaluatorsProfileScorecards = new List<IpsProfileScorecard>();

                        foreach (var evaluatorId in evaluatorIds)
                        {
                            var sourceIds = new List<int> { evaluatorId };
                            var evaluatorScorecard = CalculateProfileScorecard(profile, currentStage, sourceIds, participantIds, profileType, true);
                            evaluatorScorecard.ParticipantsId = sourceIds;
                            ipsProfileScorecard.EvaluatorsProfileScorecards.Add(evaluatorScorecard);
                        }

                        IpsProfileScorecard ipsProfileScorecardPrevious = null;
                        if (previousStage != null)
                        {
                            ipsProfileScorecardPrevious = CalculateProfileScorecard(profile, previousStage, participantIds, null, TypeOfProfile.None);
                            SetTrends(ipsProfileScorecard, ipsProfileScorecardPrevious);
                        }
                        if (firstStage != currentStage)
                        {
                            IpsProfileScorecard ipsProfileScorecardFirst = null;
                            if (firstStage == previousStage)
                                ipsProfileScorecardFirst = ipsProfileScorecardPrevious;
                            else
                                ipsProfileScorecardFirst = CalculateProfileScorecard(profile, firstStage, participantIds, null, TypeOfProfile.None);
                            SetBaseline(ipsProfileScorecard, ipsProfileScorecardFirst);

                        }
                        if (profileType == TypeOfProfile.Undefined)
                        {
                            ResetScorecard(ipsProfileScorecard);
                        }
                        if (isBenchmarkRequested && !participantIds.Any() && !evaluatorIds.Any())
                        {
                            SetScorecardToBenchmark(ipsProfileScorecard);
                        }
                        if (!isBenchmarkRequested && (participantIds.Count == 1 && participantIds.First() == -1))
                        {
                            SetScorecardToBenchmark(ipsProfileScorecard);
                        }
                        if (!isBenchmarkRequested && !participantIds.Any() && !evaluatorIds.Any())
                        {
                            ResetScorecard(ipsProfileScorecard);
                        }
                        if (stageId == 0 || resetNeeded)
                        {
                            ResetScorecard(ipsProfileScorecard);
                        }
                        return ipsProfileScorecard;
                    }
                }
            }
            return null;
        }

        public IPSKTScorecard GetKTScorecardData(int profileId, List<int> participantsIds, int stageId, bool isStartStage, int evolutionStageId)
        {
            IPSKTScorecard scorecard = new IPSKTScorecard();
            scorecard.SkillResults = new List<SkillResult>();

            var profileScore = _ipsDataContext.Profiles
                .Include(p => p.KTMedalRule)
                .Where(p => p.Id == profileId)
                .Select(p => new { p.PassScore, p.KTMedalRule }).FirstOrDefault();
            if (profileScore.PassScore.HasValue)
            {
                scorecard.PassScore = profileScore.PassScore;
            }
            else
            {
                scorecard.MedalRule = new IpsKtMedalRules()
                {
                    BronzeMedalMinScore = profileScore.KTMedalRule.BronzeStart,
                    SilverMedalMinScore = profileScore.KTMedalRule.BronzeEnd,
                    GoldMedalMinScore = profileScore.KTMedalRule.SilverEnd
                };
            }

            SurveyService _surveyService = new SurveyService();
            StagesService _stagesService = new StagesService();
            List<SkillResult> benchmarkResult = null;
            foreach (var participantId in participantsIds)
            {
                if (participantId != -1)
                {
                    List<SurveyAnswer> participantAnswers;
                    if (evolutionStageId > 0)
                    {
                        participantAnswers = _surveyService.GetKtStageEvolutionSurveyAnswers(evolutionStageId, participantId);
                    }

                    else if (isStartStage)
                    {
                        participantAnswers = _surveyService.GetStartStageResult(stageId, participantId);
                    }

                    else
                    {
                        var stageEvolutionId = _stagesService.GetLastStageEvolutionId(stageId, participantId);
                        if (stageEvolutionId == null)
                        {
                            participantAnswers = _surveyService.GetStartStageResult(stageId, participantId);
                        }
                        else
                        {
                            participantAnswers = _surveyService.GetFinalStageResult(stageEvolutionId.Value, participantId);
                        }
                    }
                    foreach (var answer in participantAnswers)
                    {
                        var pgSkill = _ipsDataContext.Questions
                            .Include(q => q.Link_PerformanceGroupSkills)
                            .Include(q => q.Link_PerformanceGroupSkills.Select(pgs => pgs.PerformanceGroup))
                            .Where(q => q.Id == answer.QuestionId)
                            .SelectMany(q => q.Link_PerformanceGroupSkills)
                            .Include(pgs => pgs.Skill)
                            .Include(pgs => pgs.PerformanceGroup.ScorecardPerspective)
                            .FirstOrDefault();
                        if (pgSkill != null)
                        {
                            var result = scorecard.SkillResults.Find(sr => sr.PgId == pgSkill.PerformanceGroup.Id && sr.SkillId == pgSkill.Skill.Id);
                            if (result == null)
                            {
                                result = new SkillResult()
                                {
                                    PgId = pgSkill.PerformanceGroup.Id,
                                    PgName = pgSkill.PerformanceGroup.Name,
                                    SkillId = pgSkill.Skill.Id,
                                    SkillName = pgSkill.Skill.Name,
                                    PerspectiveId = pgSkill.PerformanceGroup.ScorecardPerspectiveId ?? 0,
                                    Action = pgSkill.Action,
                                    CSF = pgSkill.CSF,
                                    Benchmark = pgSkill.Benchmark,
                                    Weight = pgSkill.Weight,
                                    AllQuestionsPoints = 0,
                                    CorrectAnswersCountScore = 0,
                                    PercentScore = 0,
                                    PointsScore = 0,
                                    QuestionId = answer.QuestionId,
                                    QuestionText = answer.Question.QuestionText,
                                };
                                scorecard.SkillResults.Add(result);
                            }
                            if (answer.IsCorrect == true)
                            {
                                result.CorrectAnswersCountScore++;
                                result.PointsScore += answer.Question.Points ?? 0;
                            }
                            result.AllQuestionsPoints += answer.Question.Points ?? 0;
                        }
                    }
                }
                else
                {
                    benchmarkResult = GetKTBenchmarkResult(profileId, stageId);
                }
            }


            foreach (var skillResult in scorecard.SkillResults)
            {
                skillResult.PercentScore = skillResult.PointsScore * 100.0 / (skillResult.AllQuestionsPoints == 0 ? 1 : skillResult.AllQuestionsPoints);
            }


            if (benchmarkResult != null)
            {
                foreach (var benchmarkRes in benchmarkResult)
                {
                    var existedResult = scorecard.SkillResults.Find(sr => sr.PgId == benchmarkRes.PgId && sr.SkillId == benchmarkRes.SkillId);
                    if (existedResult != null)
                    {
                        existedResult.CorrectAnswersCountScore += benchmarkRes.CorrectAnswersCountScore;
                        existedResult.PointsScore += benchmarkRes.PointsScore;
                        existedResult.AllQuestionsPoints += benchmarkRes.AllQuestionsPoints;
                        existedResult.PercentScore = (existedResult.PercentScore + (double)(existedResult.Benchmark ?? 0)) / 2;
                    }
                    else
                    {
                        scorecard.SkillResults.Add(benchmarkRes);
                    }
                }
            }
            foreach (var skillResult in scorecard.SkillResults)
            {
                skillResult.PointsScore = (int)Math.Ceiling((double)skillResult.PointsScore / participantsIds.Count);
                skillResult.AllQuestionsPoints = (int)Math.Ceiling((double)skillResult.AllQuestionsPoints / participantsIds.Count);
            }

            return scorecard;
        }

        private List<SkillResult> GetKTBenchmarkResult(int profileId, int stageId)
        {
            List<SkillResult> result = new List<SkillResult>();

            var linkPgSkillResults = _ipsDataContext.StageGroups
                .Include(sg => sg.Stages)
                .Include(sg => sg.Profiles)
                .Where(sg => sg.Stages.Any(s => s.Id == stageId))
                .SelectMany(sg => sg.Profiles)
                .Include(p => p.PerformanceGroups)
                .Where(p => p.Id == profileId)
                .SelectMany(p => p.PerformanceGroups)
                .Include(pg => pg.Link_PerformanceGroupSkills)
                .SelectMany(pg => pg.Link_PerformanceGroupSkills)
                .Include(pgs => pgs.Questions)
                .Include(pgs => pgs.Skill)
                .Include(pgs => pgs.PerformanceGroup)
                .ToList();


            foreach (var pgSkill in linkPgSkillResults)
            {
                if (pgSkill.Questions.Count == 0)
                {
                    continue;
                }
                SkillResult res = new SkillResult()
                {
                    PgId = pgSkill.PerformanceGroup.Id,
                    PgName = pgSkill.PerformanceGroup.Name,
                    SkillId = pgSkill.Skill.Id,
                    SkillName = pgSkill.Skill.Name,
                    PerspectiveId = pgSkill.PerformanceGroup.ScorecardPerspectiveId ?? 0,
                    Action = pgSkill.Action,
                    CSF = pgSkill.CSF,
                    Benchmark = pgSkill.Benchmark,
                    Weight = pgSkill.Weight,
                    AllQuestionsPoints = 0,
                    CorrectAnswersCountScore = (int)Math.Ceiling(pgSkill.Questions.Count * (pgSkill.Benchmark ?? 0) / 100),
                    PercentScore = 0,
                    PointsScore = 0
                };
                foreach (var question in pgSkill.Questions)
                {
                    res.AllQuestionsPoints += question.Points ?? 0;
                }
                res.PointsScore = (int)Math.Ceiling(res.AllQuestionsPoints * (double)res.Benchmark * 1.0 / 100);
                res.PercentScore = (double)(res.PointsScore * 100.0 / res.AllQuestionsPoints);
                result.Add(res);
            }

            return result;
        }

        public IpsKTStageResult GetKTProfileBenchmarkResult(int profileId, int stageId)
        {

            IpsKTStageResult result = new IpsKTStageResult()
            {
                AllTime = 0,
                CorrectAnswersCount = 0,
                MaxScore = 0,
                PassScore = _ipsDataContext.Profiles.Where(p => p.Id == profileId).Select(p => p.PassScore).FirstOrDefault() ?? 0,
                QuestionsCount = 0,
                Score = 0,
                StageId = stageId,
                StageName = _ipsDataContext.Stages.Where(s => s.Id == stageId).Select(s => s.Name).FirstOrDefault(),
                TimeSpent = 0
            };

            var medalRule = _ipsDataContext.Profiles.Include(path => path.KTMedalRule).Where(p => p.Id == profileId).Select(p => p.KTMedalRule).FirstOrDefault();
            if (medalRule != null)
            {
                result.MedalRule = new IpsKtMedalRules()
                {
                    BronzeMedalMinScore = medalRule.BronzeStart,
                    SilverMedalMinScore = medalRule.BronzeEnd,
                    GoldMedalMinScore = medalRule.SilverEnd
                };
            }

            var linkPgSkillResults = _ipsDataContext.StageGroups
                .Include(sg => sg.Stages)
                .Include(sg => sg.Profiles)
                .Where(sg => sg.Stages.Any(s => s.Id == stageId))
                .SelectMany(sg => sg.Profiles)
                .Include(p => p.PerformanceGroups)
                .Where(p => p.Id == profileId)
                .SelectMany(p => p.PerformanceGroups)
                .Include(pg => pg.Link_PerformanceGroupSkills)
                .SelectMany(pg => pg.Link_PerformanceGroupSkills)
                .Include(pgs => pgs.Questions)
                .ToList();

            foreach (var pgSkill in linkPgSkillResults)
            {
                if (pgSkill.Questions.Count == 0)
                {
                    continue;
                }
                int timeBySkill = 0;
                int scoreBySkill = 0;
                foreach (var question in pgSkill.Questions)
                {
                    result.AllTime += question.TimeForQuestion ?? 0;
                    timeBySkill += question.TimeForQuestion ?? 0;
                    result.MaxScore += question.Points ?? 0;
                    scoreBySkill += question.Points ?? 0;
                }
                result.CorrectAnswersCount += (int)Math.Ceiling(pgSkill.Questions.Count * (double)pgSkill.Benchmark / 100);
                result.QuestionsCount += pgSkill.Questions.Count;
                result.Score += (int)Math.Ceiling(scoreBySkill * (double)pgSkill.Benchmark / 100);
                result.TimeSpent += (int)Math.Ceiling(timeBySkill * (double)pgSkill.Benchmark / 100);
            }
            return result;
        }
        public IpsProfileScorecard GetProfileScoreCards(int profileId, int? participantId, int? evaluatorId, DateTime? statusOn)
        {
            bool isBenchmarkRequested = participantId < 0;

            if (isBenchmarkRequested)
            {
                participantId = null;
            }

            Profile profile = _ipsDataContext.Profiles
                .Include("StageGroups")
                .Include("Scale.ScaleRanges")
                .Include("StageGroups.Stages.EvaluationAgreements")
                .Include("StageGroups.Stages.Answers")
                .Include("StageGroups.Stages.MilestoneAgreementGoals")
                .Include("PerformanceGroups.Link_PerformanceGroupSkills.Questions")
                .Include("PerformanceGroups.Link_PerformanceGroupSkills.Skill")
                .Include("PerformanceGroups.ScorecardPerspective")
                .Where(p => p.Id == profileId).AsNoTracking().FirstOrDefault();

            if (profile != null && profile.StageGroups != null && profile.StageGroups.Count > 0)
            {
                StageGroup stageGroup = profile.StageGroups.Where(s => s.StartDate <= statusOn && s.EndDate >= statusOn).FirstOrDefault();
                if (stageGroup != null)
                {
                    List<Stage> pastStages = stageGroup.Stages.Where(s => s.StartDateTime <= statusOn).OrderBy(s => s.EndDateTime).ToList();
                    List<Stage> stages = new List<Stage>();
                    foreach (var s in pastStages)
                    {
                        if (s.Answers != null && s.Answers.Count > 0)
                            stages.Add(s);
                    }
                    if (stages.Count > 0)
                    {
                        Stage currentStage = stages.Last();
                        Stage previousStage = null;
                        Stage firstStage = stages.First();
                        if (stages.Count > 1)
                        {
                            previousStage = stages[stages.Count - 2];
                        }
                        IpsProfileScorecard ipsProfileScorecard = CalculateProfileScorecard(profile, currentStage, participantId);
                        ipsProfileScorecard.Scale = profile.Scale;
                        ipsProfileScorecard.Scale.MeasureUnit = null;
                        ipsProfileScorecard.Scale.PerformanceGroups = null;
                        ipsProfileScorecard.Scale.Profiles = null;
                        ipsProfileScorecard.Scale.ScaleCategory = null;
                        ipsProfileScorecard.Scale.Questions = null;
                        ipsProfileScorecard.Scale.ProfileType1 = null;
                        IpsProfileScorecard ipsProfileScorecardPrevious = null;
                        if (previousStage != null)
                        {
                            ipsProfileScorecardPrevious = CalculateProfileScorecard(profile, previousStage, participantId);
                            SetTrends(ipsProfileScorecard, ipsProfileScorecardPrevious);
                        }
                        if (firstStage != currentStage)
                        {
                            IpsProfileScorecard ipsProfileScorecardFirst = null;
                            if (firstStage == previousStage)
                                ipsProfileScorecardFirst = ipsProfileScorecardPrevious;
                            else
                                ipsProfileScorecardFirst = CalculateProfileScorecard(profile, firstStage, participantId);
                            SetBaseline(ipsProfileScorecard, ipsProfileScorecardFirst);

                        }
                        if (isBenchmarkRequested)
                        {
                            SetScorecardToBenchmark(ipsProfileScorecard);
                        }
                        return ipsProfileScorecard;

                    }
                }
            }
            return null;
        }

        public IpsKTStageResult GetKTProfileStageResult(List<IpsParticipantSurveyResult> participantsResults, int profileId)
        {
            IpsKTStageResult stageResult = new IpsKTStageResult();
            List<IpsKTStageResult> partisipantsStageResult = new List<IpsKTStageResult>();


            foreach (var participantResult in participantsResults)
            {
                IpsKTStageResult stage = new IpsKTStageResult();

                var queryForTimeSpent = _ipsDataContext.SurveyResults
                        .Where(sr => sr.ParticipantId == participantResult.ParticipantId);
                if (participantResult.StageId.HasValue)
                {
                    queryForTimeSpent = queryForTimeSpent
                        .Where(sr => (sr.StageId == participantResult.StageId));
                }
                else
                {
                    queryForTimeSpent = queryForTimeSpent
                        .Where(sr => (sr.StageEvolutionId == participantResult.StageEvolutionId));
                }
                stage.TimeSpent = queryForTimeSpent.Select(sr => sr.TimeSpent).FirstOrDefault();

                stage.QuestionsCount = participantResult.Answers.Count;
                stage.CorrectAnswersCount = participantResult.Answers.Where(a => a.IsCorrect == true).Count();
                stage.Score = 0;
                stageResult.MaxScore = 0;
                stageResult.AllTime = 0;
                foreach (var answer in participantResult.Answers)
                {
                    var question = _ipsDataContext.Questions.Where(q => q.Id == answer.QuestionId).Select(q => new { q.Points, q.TimeForQuestion }).FirstOrDefault();
                    if (question.Points.HasValue)
                    {
                        stageResult.MaxScore += question.Points.Value;
                        if (answer.IsCorrect == true)
                        {
                            stage.Score += question.Points.Value;
                        }
                    }
                    stageResult.AllTime += question.TimeForQuestion ?? 0;
                }

                partisipantsStageResult.Add(stage);
            }

            // calculate common participants result
            stageResult.CorrectAnswersCount = 0;
            stageResult.Score = 0;

            foreach (var partisipantStageResult in partisipantsStageResult)
            {
                stageResult.CorrectAnswersCount += partisipantStageResult.CorrectAnswersCount;
                stageResult.Score += partisipantStageResult.Score;
                stageResult.TimeSpent += partisipantStageResult.TimeSpent;
            }
            stageResult.QuestionsCount = partisipantsStageResult[0].QuestionsCount;
            stageResult.CorrectAnswersCount = (int)Math.Ceiling(stageResult.CorrectAnswersCount * 1.0 / partisipantsStageResult.Count);
            stageResult.Score = (int)Math.Ceiling(stageResult.Score * 1.0 / partisipantsStageResult.Count);
            stageResult.TimeSpent = (int)Math.Ceiling(stageResult.TimeSpent * 1.0 / partisipantsStageResult.Count);
            if (stageResult.MaxScore == 0)
            {
                stageResult.MaxScore = 100;
            }
            var profile = _ipsDataContext.Profiles
                .Include(path => path.KTMedalRule)
                .Where(p => p.Id == profileId)
                .Select(p => new { p.KTMedalRule, p.PassScore })
                .FirstOrDefault();
            stageResult.PassScore = profile.PassScore ?? 0;
            if (profile.KTMedalRule != null)
            {
                stageResult.MedalRule = new IpsKtMedalRules()
                {
                    BronzeMedalMinScore = profile.KTMedalRule.BronzeStart,
                    SilverMedalMinScore = profile.KTMedalRule.BronzeEnd,
                    GoldMedalMinScore = profile.KTMedalRule.SilverEnd
                };
            }

            return stageResult;
        }


        public List<IpsStageEvolution> GetEvolutionStages(int originalStageId, int participantId)
        {
            List<IpsStageEvolution> result = new List<IpsStageEvolution>();
            if (participantId > 0)
            {

                result =
                    _ipsDataContext.StagesEvolutions
                    .Include(x => x.Stage)
                    .Where(x => x.OriginalStageId == originalStageId && x.ParticipantId == participantId).OrderBy(x => x.StartDate).Select(x => new IpsStageEvolution()
                    {
                        StageEvolutionId = x.Id,
                        Name = x.Name,
                        EndDateTime = x.DueDate,
                        StartDateTime = x.StartDate,
                        StageGroupId = x.Stage.StageGroupId,
                        EvaluationStartDate = x.Stage.EvaluationStartDate,
                        EvaluationEndDate = x.Stage.EvaluationEndDate,
                    }).ToList();
            }
            else
            {
                result =
                    _ipsDataContext.StagesEvolutions
                    .Include(x => x.Stage)
                    .Where(x => x.OriginalStageId == originalStageId).OrderBy(x => x.StartDate).Select(x => new IpsStageEvolution()
                    {
                        StageEvolutionId = x.Id,
                        Name = x.Name,
                        EndDateTime = x.DueDate,
                        StartDateTime = x.StartDate,
                        StageGroupId = x.Stage.StageGroupId,
                        EvaluationStartDate = x.Stage.EvaluationStartDate,
                        EvaluationEndDate = x.Stage.EvaluationEndDate,
                    }).ToList();
            }
            return result;
        }

        private void SetScorecardToBenchmark(IpsProfileScorecard scorecard)
        {
            double avgTotal = 0;

            foreach (IpsPerformanceGroupPI performancegroup in scorecard.PerformanceGroups)
            {
                double pgTotalSum = 0;
                foreach (IpsSkillPI skill in performancegroup.Skills)
                {
                    skill.Score = skill.Benchmark.HasValue ? (double)skill.Benchmark : 0.0;
                    pgTotalSum = pgTotalSum + skill.Score;
                }

                if (performancegroup.Skills.Any())
                {
                    performancegroup.Score = Math.Round(pgTotalSum / performancegroup.Skills.Count(), 1);
                    avgTotal = avgTotal + performancegroup.Score;
                }
            }

            if (scorecard.PerformanceGroups.Any())
            {
                avgTotal = avgTotal / scorecard.PerformanceGroups.Count();
            }


            scorecard.AverageScore = avgTotal;

            scorecard.StrongAreas = null;
            scorecard.WeakAreas = null;
            scorecard.WeakAverageScore = double.NaN;
            scorecard.StrongAverageScore = double.NaN;
            scorecard.ProfileTrend = null;
            scorecard.ProfileWeakTrend = null;
            scorecard.ProfileStrongTrend = null;

        }

        private void ResetScorecard(IpsProfileScorecard scorecard)
        {
            double avgTotal = 0;

            foreach (IpsPerformanceGroupPI performancegroup in scorecard.PerformanceGroups)
            {
                foreach (IpsSkillPI skill in performancegroup.Skills)
                {
                    skill.Score = 0.0;
                    skill.Goal = 0;
                    skill.Benchmark = 0;
                }

                if (performancegroup.Skills.Any())
                {
                    performancegroup.Score = 0;
                    performancegroup.Goal = 0;
                    performancegroup.Benchmark = 0;
                    avgTotal = 0;
                }
            }

            if (scorecard.PerformanceGroups.Any())
            {
                avgTotal = 0;
            }


            scorecard.AverageScore = avgTotal;
            scorecard.EvaluatorsProfileScorecards = null;
            scorecard.StrongAreas = null;
            scorecard.WeakAreas = null;
            scorecard.WeakAverageScore = double.NaN;
            scorecard.StrongAverageScore = double.NaN;
            scorecard.ProfileTrend = null;
            scorecard.ProfileWeakTrend = null;
            scorecard.ProfileStrongTrend = null;
        }

        private void SetTrends(IpsProfileScorecard current, IpsProfileScorecard previous)
        {
            current.ProfileTrend = CalcTrend(current.AverageScore, previous.AverageScore);
            current.ProfileStrongTrend = CalcTrend(current.StrongAverageScore, previous.StrongAverageScore);
            current.ProfileWeakTrend = CalcTrend(current.WeakAverageScore, previous.WeakAverageScore);
            for (int i = 0; i < current.PerformanceGroups.Count(); i++)
            {
                current.PerformanceGroups[i].Trend = CalcTrend(current.PerformanceGroups[i].Score, previous.PerformanceGroups[i].Score);

                for (int j = 0; j < current.PerformanceGroups[i].Skills.Count(); j++)
                {
                    current.PerformanceGroups[i].Skills[j].Trend =
                        CalcTrend(current.PerformanceGroups[i].Skills[j].Score, previous.PerformanceGroups[i].Skills[j].Score);

                    //current.PerformanceGroups[i].Skills[j].Baseline = previous.PerformanceGroups[i].Skills[j].Score;

                    //current.PerformanceGroups[i].Skills[j].Performance = (Math.Round(current.PerformanceGroups[i].Skills[j].Score * 100 / current.Scale.ScaleRanges.OrderBy(s => s.Max).Last().Max)).ToString() + '%';
                    current.PerformanceGroups[i].Skills[j].Progress = (Math.Round(previous.PerformanceGroups[i].Skills[j].Score * 100 / current.PerformanceGroups[i].Skills[j].Score)).ToString() + '%';

                    for (int k = 0; k < current.PerformanceGroups[i].Skills[j].Questions.Count(); k++)
                    {
                        current.PerformanceGroups[i].Skills[j].Questions[k].Trend =
                            CalcTrend(current.PerformanceGroups[i].Skills[j].Questions[k].Score, previous.PerformanceGroups[i].Skills[j].Questions[k].Score);
                    }
                }
            }
        }

        private void SetBaseline(IpsProfileScorecard current, IpsProfileScorecard first)
        {
            for (int i = 0; i < current.PerformanceGroups.Count(); i++)
            {
                for (int j = 0; j < current.PerformanceGroups[i].Skills.Count(); j++)
                {
                    current.PerformanceGroups[i].Skills[j].Baseline = first.PerformanceGroups[i].Skills[j].Score;
                }
            }
        }

        private string CalcTrend(double current, double previous)
        {
            int compare = current.CompareTo(previous);
            if (compare == 0) return BusinessModels.Enums.Trend.Equal.ToString();
            if (compare < 0) return BusinessModels.Enums.Trend.Down.ToString();
            if (compare > 0) return BusinessModels.Enums.Trend.Up.ToString();
            return String.Empty;
        }

        private Answer AgreementToAnswer(EvaluationAgreement agreement)
        {
            Answer a = new Answer();
            a.Id = agreement.Id;
            a.Answer1 = agreement.FinalScore.HasValue ? ConvertToString(Convert.ToDouble(agreement.FinalScore)) : "0";
            a.Comment = agreement.Comment;
            a.KPIType = agreement.KPIType;
            a.ParticipantId = agreement.ParticipantId;
            a.QuestionId = agreement.QuestionId;
            a.StageId = agreement.StageId;
            return a;
        }

        private IEnumerable<Answer> GetAnswersForProfileScorecard(Stage stage, TypeOfProfile profileType, IEnumerable<int> userIds, IEnumerable<int> participantIds, bool isEvaluator = false)
        {
            IEnumerable<Answer> result = new List<Answer>();
            var firstStage = stage.StageGroup.Stages.First();
            switch (profileType)
            {
                case TypeOfProfile.StartProfile:
                    result = firstStage.Answers.Where(_ => _.StageId == stage.Id && _.ParticipantId != null && (userIds.Contains(_.ParticipantId.Value)));
                    break;
                case TypeOfProfile.FinalProfile:
                    result = firstStage.EvaluationAgreements.Where(a => userIds.Contains(a.ParticipantId)).Select(AgreementToAnswer);
                    break;
                case TypeOfProfile.InitialKpi:
                    result = stage.Answers.Where(_ => stage.Id == _.StageId && (_.KPIType == 1 || _.KPIType == 2) && userIds.Contains(_.ParticipantId.Value));
                    break;
                case TypeOfProfile.FinalKpi:
                    result = stage.EvaluationAgreements.Where(_ => (_.KPIType == 1 || _.KPIType == 2) && userIds.Contains(_.ParticipantId) && (_.ShortGoal != null || _.MidGoal != null || _.LongGoal != null || _.FinalGoal != null)).Select(AgreementToAnswer);
                    if (result.Count() == 0)
                    {
                        result = stage.EvaluationAgreements.Where(_ => (_.KPIType == 1 || _.KPIType == 2) && userIds.Contains(_.ParticipantId)).Select(AgreementToAnswer);
                    }
                    break;
                case TypeOfProfile.None:
                    if (stage != firstStage)
                    {
                        var questionKpiIds = firstStage.EvaluationAgreements.Where(_ => _.ShortGoal != null || _.MidGoal != null || _.LongGoal != null || _.FinalGoal != null).Select(_ => _.QuestionId);
                        var evaluatorsId = _ipsDataContext.EvaluationParticipants.AsQueryable().Where(p => p.StageGroupId == stage.StageGroupId && p.EvaluateeId != null && userIds.Contains(p.EvaluateeId.Value)).Select(p => p.Id).ToList();

                        result =
                            stage.Answers.Where(_ => _.StageId == stage.Id && questionKpiIds.Contains(_.QuestionId) && _.ParticipantId != null && (userIds.Contains(_.ParticipantId.Value) || evaluatorsId.Contains(_.ParticipantId.Value)));
                    }
                    else
                    {
                        result = stage.Answers.Where(_ => _.StageId == stage.Id && _.ParticipantId != null && (userIds.Contains(_.ParticipantId.Value))).ToList();
                    }
                    break;
                default:
                    result = new List<Answer>();
                    break;
            }
            return result;
        }

        private IpsProfileScorecard CalculateProfileScorecard(Profile profile, Stage stage, IEnumerable<int> usersIds, IEnumerable<int> participantsIds, TypeOfProfile type, bool isEvaluator = false)
        {
            var scorecard = new IpsProfileScorecard
            {
                ProfileName = profile.Name,
                ProfileDescription = profile.Description,
                ProfileId = profile.Id
            };

            IEnumerable<Answer> answers = new List<Answer>();
            if (usersIds != null && usersIds.Any())
            {
                answers = GetAnswersForProfileScorecard(stage, type, usersIds, participantsIds, isEvaluator);
            }

            InternalTotals internalTotals = CalculateTotalScores(answers);
            scorecard.AverageScore = internalTotals.Average;
            scorecard.WeakAverageScore = internalTotals.WeakAverage;
            scorecard.StrongAverageScore = internalTotals.StrongAverage;

            List<IpsPerformanceGroupPI> listPG = new List<IpsPerformanceGroupPI>();
            Dictionary<int, Skill> questionSkill = new Dictionary<int, Skill>();
            int globalSkillIndex = 1;
            //bug fix - right order of perfomance groups JIRA http://yci193.stwserver.net:8080/browse/IPSV-255
            foreach (var pg in profile.PerformanceGroups.OrderBy(_ => _.SeqNo))
            {
                IpsPerformanceGroupPI pgPI = new IpsPerformanceGroupPI();
                pgPI.Name = pg.Name;
                pgPI.Description = pg.Description;
                pgPI.Perspective = pg.ScorecardPerspective != null ? pg.ScorecardPerspective.Name : "Other";
                pgPI.Id = pg.Id;
                pgPI.Progress = string.Empty;
                pgPI.Performance = string.Empty;
                double pgSumOfScores = 0, pgCountOfScores = 0;

                int pgCountOfBenches = 0;
                decimal pgSumOfBenches = 0;

                int pgCountOfGoals = 0;
                decimal pgSumofGoals = 0;

                List<IpsSkillPI> skillPIs = new List<IpsSkillPI>();
                foreach (var skillLink in pg.Link_PerformanceGroupSkills)
                {
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skillLink.Skill.Name;
                    skillPI.Description = skillLink.Skill.Description;
                    skillPI.Id = skillLink.Skill.Id;
                    skillPI.Benchmark = skillLink.Benchmark;
                    skillPI.Weight = skillLink.Weight;
                    skillPI.CSF = skillLink.CSF;
                    skillPI.Action = skillLink.Action;
                    skillPI.Index = globalSkillIndex;

                    if (skillPI.Benchmark.HasValue)
                    {
                        pgCountOfBenches++;
                        pgSumOfBenches = pgSumOfBenches + skillPI.Benchmark.Value;
                    }

                    globalSkillIndex++;
                    double skillSumOfScores = 0, skillCountOfScores = 0;
                    List<IpsQuestionPI> quistionsPI = new List<IpsQuestionPI>();
                    foreach (var q in skillLink.Questions)
                    {
                        IpsQuestionPI qPI = new IpsQuestionPI();
                        qPI.Id = q.Id;
                        qPI.QuestionText = q.QuestionText;
                        double questionSumOfScores = 0, questionCountOfScores = 0;
                        foreach (Answer answer in answers.Where(a => a.QuestionId == q.Id))
                        {
                            pgCountOfScores++;
                            pgSumOfScores = pgSumOfScores + ConvertToDouble(answer.Answer1);
                            skillCountOfScores++;
                            skillSumOfScores = skillSumOfScores + ConvertToDouble(answer.Answer1);
                            questionCountOfScores++;
                            questionSumOfScores = questionSumOfScores + ConvertToDouble(answer.Answer1);
                            if (!string.IsNullOrWhiteSpace(skillPI.Comment) && !string.IsNullOrWhiteSpace(answer.Comment))
                                skillPI.Comment = string.Format("{0}; ", skillPI.Comment);
                            skillPI.Comment = skillPI.Comment + answer.Comment;
                        }
                        qPI.Score = questionCountOfScores > 0 ? Math.Round((double)questionSumOfScores / questionCountOfScores, 1) : 0.0;
                        if (stage != null && usersIds != null && usersIds.Count() == 1)
                        {
                            skillPI.Goal = GetGoal(stage.StageGroup.Stages.FirstOrDefault(), stage.Name, usersIds.FirstOrDefault(), q.Id);
                            if (skillPI.Goal > 0)
                            {
                                pgCountOfGoals++;
                                pgSumofGoals = pgSumofGoals + skillPI.Goal;
                            }
                        }
                        quistionsPI.Add(qPI);
                        skillLink.Skill.Questions = skillLink.Questions;
                        questionSkill.Add(q.Id, skillLink.Skill);
                    }
                    if (quistionsPI.Count > 0)
                    {
                        skillPI.Score = skillCountOfScores > 0 ? Math.Round((double)skillSumOfScores / skillCountOfScores, 1) : 0.0;
                        skillPI.Performance = (Math.Round(Convert.ToDecimal(skillPI.Score * 100) / profile.Scale.ScaleRanges.OrderBy(s => s.Max).Last().Max)).ToString() + '%';
                        skillPI.Baseline = skillPI.Score;
                        IpsQuestionPI[] qPIs = new IpsQuestionPI[quistionsPI.Count];
                        quistionsPI.CopyTo(qPIs);
                        skillPI.Questions = qPIs;
                        skillPIs.Add(skillPI);
                    }
                }
                if (skillPIs.Count > 0)
                {
                    pgPI.Benchmark = pgCountOfBenches > 0 ? Math.Round(pgSumOfBenches / pgCountOfBenches) : 0;
                    pgPI.Goal = pgCountOfGoals > 0 ? Math.Round(pgSumofGoals / pgCountOfGoals) : 0;
                    pgPI.Score = pgCountOfScores > 0 ? Math.Round((double)pgSumOfScores / pgCountOfScores, 1) : 0.0;
                    IpsSkillPI[] skills = new IpsSkillPI[skillPIs.Count];
                    skillPIs.CopyTo(skills);
                    pgPI.Skills = skills;
                    listPG.Add(pgPI);
                }
            }
            IpsPerformanceGroupPI[] groups = new IpsPerformanceGroupPI[listPG.Count];
            listPG.CopyTo(groups);
            scorecard.PerformanceGroups = groups;

            List<IpsSkillPI> weakSkills = new List<IpsSkillPI>();
            foreach (var qid in internalTotals.WeakQuestionIds)
            {
                if (questionSkill.Keys.Contains(qid))
                {
                    Skill skill = questionSkill[qid];
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skill.Name;
                    var description = "";
                    if (skill.Questions.Any())
                    {
                        description = skill.Questions.Aggregate(description, (current, question) => current + (question.QuestionText + " "));
                        skillPI.Description = !string.IsNullOrWhiteSpace(description) ? description : skill.Description;
                    }
                    skillPI.Id = skill.Id;
                    skillPI.Score = internalTotals.WeakQuestionScores[qid];
                    weakSkills.Add(skillPI);
                }
            }
            IpsSkillPI[] weakSkillsPI = new IpsSkillPI[weakSkills.Count];
            weakSkills.CopyTo(weakSkillsPI);
            scorecard.WeakAreas = weakSkillsPI;

            List<IpsSkillPI> strongSkills = new List<IpsSkillPI>();
            foreach (var qid in internalTotals.StrongQuestionIds)
            {
                if (questionSkill.Keys.Contains(qid))
                {
                    Skill skill = questionSkill[qid];
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skill.Name;
                    var description = "";
                    if (skill.Questions.Any())
                    {
                        description = skill.Questions.Aggregate(description, (current, question) => current + (question.QuestionText + " "));
                        skillPI.Description = !string.IsNullOrWhiteSpace(description) ? description : skill.Description;
                    }
                    skillPI.Id = skill.Id;
                    skillPI.Score = internalTotals.StrongQuestionScores[qid];
                    strongSkills.Add(skillPI);
                }
            }
            IpsSkillPI[] strongSkillsPI = new IpsSkillPI[strongSkills.Count];
            strongSkills.CopyTo(strongSkillsPI);
            scorecard.StrongAreas = strongSkillsPI;

            return scorecard;
        }

        //need to be refactored with custom stages implementation - correlation based on NAME is TERRIBLE
        private decimal GetGoal(Stage stageAgreementsContainer, string currentStageName, int participantId, int questionId)
        {
            decimal result = 0;
            EvaluationAgreement sourceAgreement = null;
            if (stageAgreementsContainer.EvaluationAgreements.Any())
            {
                sourceAgreement = stageAgreementsContainer.EvaluationAgreements.FirstOrDefault(_ => _.ParticipantId == participantId && _.QuestionId == questionId);
            }

            if (sourceAgreement != null)
            {
                if (currentStageName == "Start Profile")
                {
                    result = 0;
                }
                if (currentStageName == "Short Goal" && sourceAgreement.ShortGoal.HasValue)
                {
                    result = sourceAgreement.ShortGoal.Value;
                }
                if (currentStageName == "Mid Goal" && sourceAgreement.MidGoal.HasValue)
                {
                    result = sourceAgreement.MidGoal.Value;
                }
                if (currentStageName == "Long Term Goal" && sourceAgreement.LongGoal.HasValue)
                {
                    result = sourceAgreement.LongGoal.Value;
                }
                if (currentStageName == "Final Goal" && sourceAgreement.FinalGoal.HasValue)
                {
                    result = sourceAgreement.FinalGoal.Value;
                }
            }
            return result;
        }

        private IpsProfileScorecard CalculateProfileScorecard(Profile profile, Stage stage, int? participantId)
        {
            IpsProfileScorecard scorecard = new IpsProfileScorecard();
            scorecard.ProfileName = profile.Name;
            scorecard.ProfileDescription = profile.Description;
            scorecard.ProfileId = profile.Id;

            IEnumerable<Answer> answers = null;
            if (participantId.HasValue)
            {
                List<EvaluationAgreement> agreements = stage.EvaluationAgreements.Where(a => a.ParticipantId == participantId).ToList();
                if (agreements.Count > 0)
                {
                    List<Answer> answersList = new List<Answer>();
                    foreach (var ea in agreements)
                    {
                        answersList.Add(AgreementToAnswer(ea));
                    }
                    answers = answersList;
                }
                else
                {
                    List<int> evaluatorsId = _ipsDataContext.EvaluationParticipants.Where(p => p.StageGroupId == stage.StageGroupId && p.EvaluateeId == participantId).Select(p => p.Id).ToList();
                    answers = stage.Answers.Where(a => a.ParticipantId == participantId || evaluatorsId.Contains((int)a.ParticipantId)).ToList();
                }
            }
            else
            {
                List<EvaluationAgreement> agreements = stage.EvaluationAgreements.ToList();
                if (agreements.Count > 0)
                {
                    List<Answer> answersList = new List<Answer>();
                    foreach (var ea in agreements)
                    {
                        answersList.Add(AgreementToAnswer(ea));
                    }
                    answers = answersList;
                }
                else
                {
                    answers = stage.Answers;
                }
            }
            InternalTotals internalTotals = CalculateTotalScores(answers);
            scorecard.AverageScore = internalTotals.Average;
            scorecard.WeakAverageScore = internalTotals.WeakAverage;
            scorecard.StrongAverageScore = internalTotals.StrongAverage;

            List<IpsPerformanceGroupPI> listPG = new List<IpsPerformanceGroupPI>();
            Dictionary<int, Skill> questionSkill = new Dictionary<int, Skill>();
            int globalSkillIndex = 1;
            //bug fix - right order of perfomance groups JIRA http://yci193.stwserver.net:8080/browse/IPSV-255
            foreach (var pg in profile.PerformanceGroups.OrderBy(_ => _.SeqNo))
            {
                IpsPerformanceGroupPI pgPI = new IpsPerformanceGroupPI();
                pgPI.Name = pg.Name;
                pgPI.Description = pg.Description;
                pgPI.Perspective = pg.ScorecardPerspective != null ? pg.ScorecardPerspective.Name : "Other";
                pgPI.Id = pg.Id;
                pgPI.Progress = string.Empty;
                pgPI.Performance = string.Empty;
                double pgSumOfScores = 0, pgCountOfScores = 0;
                List<IpsSkillPI> skillPIs = new List<IpsSkillPI>();
                foreach (var skillLink in pg.Link_PerformanceGroupSkills)
                {
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skillLink.Skill.Name;
                    skillPI.Description = skillLink.Skill.Description;
                    skillPI.Id = skillLink.Skill.Id;
                    skillPI.Benchmark = skillLink.Benchmark;
                    skillPI.Weight = skillLink.Weight;
                    skillPI.CSF = skillLink.CSF;
                    skillPI.Action = skillLink.Action;
                    skillPI.Index = globalSkillIndex;

                    globalSkillIndex++;
                    double skillSumOfScores = 0, skillCountOfScores = 0;
                    List<IpsQuestionPI> quistionsPI = new List<IpsQuestionPI>();
                    foreach (var q in skillLink.Questions)
                    {
                        IpsQuestionPI qPI = new IpsQuestionPI();
                        qPI.Id = q.Id;
                        qPI.QuestionText = q.QuestionText;
                        double questionSumOfScores = 0, questionCountOfScores = 0;
                        foreach (Answer answer in answers.Where(a => a.QuestionId == q.Id))
                        {
                            pgCountOfScores++;
                            pgSumOfScores = pgSumOfScores + ConvertToDouble(answer.Answer1);
                            skillCountOfScores++;
                            skillSumOfScores = skillSumOfScores + ConvertToDouble(answer.Answer1);
                            questionCountOfScores++;
                            questionSumOfScores = questionSumOfScores + ConvertToDouble(answer.Answer1);
                        }
                        qPI.Score = questionCountOfScores > 0 ? Math.Round((double)questionSumOfScores / questionCountOfScores, 1) : 0.0;
                        quistionsPI.Add(qPI);
                        questionSkill.Add(q.Id, skillLink.Skill);
                    }
                    if (quistionsPI.Count > 0)
                    {
                        skillPI.Score = skillCountOfScores > 0 ? Math.Round((double)skillSumOfScores / skillCountOfScores, 1) : 0.0;
                        skillPI.Performance = (Math.Round(Convert.ToDecimal(skillPI.Score * 100) / profile.Scale.ScaleRanges.OrderBy(s => s.Max).Last().Max)).ToString() + '%';
                        skillPI.Baseline = skillPI.Score;
                        IpsQuestionPI[] qPIs = new IpsQuestionPI[quistionsPI.Count];
                        quistionsPI.CopyTo(qPIs);
                        skillPI.Questions = qPIs;
                        skillPIs.Add(skillPI);
                    }
                }
                if (skillPIs.Count > 0)
                {
                    pgPI.Score = pgCountOfScores > 0 ? Math.Round((double)pgSumOfScores / pgCountOfScores, 1) : 0.0;
                    IpsSkillPI[] skills = new IpsSkillPI[skillPIs.Count];
                    skillPIs.CopyTo(skills);
                    pgPI.Skills = skills;
                    listPG.Add(pgPI);
                }
            }
            IpsPerformanceGroupPI[] groups = new IpsPerformanceGroupPI[listPG.Count];
            listPG.CopyTo(groups);
            scorecard.PerformanceGroups = groups;

            List<IpsSkillPI> weakSkills = new List<IpsSkillPI>();
            foreach (var qid in internalTotals.WeakQuestionIds)
            {
                if (questionSkill.Keys.Contains(qid))
                {
                    Skill skill = questionSkill[qid];
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skill.Name;
                    skillPI.Description = skill.Description;
                    skillPI.Id = skill.Id;
                    skillPI.Score = internalTotals.WeakQuestionScores[qid];
                    weakSkills.Add(skillPI);
                }
            }
            IpsSkillPI[] weakSkillsPI = new IpsSkillPI[weakSkills.Count];
            weakSkills.CopyTo(weakSkillsPI);
            scorecard.WeakAreas = weakSkillsPI;

            List<IpsSkillPI> strongSkills = new List<IpsSkillPI>();
            foreach (var qid in internalTotals.StrongQuestionIds)
            {
                if (questionSkill.Keys.Contains(qid))
                {
                    Skill skill = questionSkill[qid];
                    IpsSkillPI skillPI = new IpsSkillPI();
                    skillPI.Name = skill.Name;
                    skillPI.Description = skill.Description;
                    skillPI.Id = skill.Id;
                    skillPI.Score = internalTotals.StrongQuestionScores[qid];
                    strongSkills.Add(skillPI);
                }
            }
            IpsSkillPI[] strongSkillsPI = new IpsSkillPI[strongSkills.Count];
            strongSkills.CopyTo(strongSkillsPI);
            scorecard.StrongAreas = strongSkillsPI;

            return scorecard;
        }


        private InternalTotals CalculateTotalScores(IEnumerable<Answer> answers)
        {
            Dictionary<int, int> weakAreas = new Dictionary<int, int>();
            Dictionary<int, int> strongAreas = new Dictionary<int, int>();
            double sumOfScores = 0;
            foreach (var answer in answers.ToList())
            {
                double score = ConvertToDouble(answer.Answer1);
                if (answer.KPIType != null)
                    if (answer.KPIType == (int)BusinessModels.Enums.KPIType.Weak)
                    {
                        if (weakAreas.ContainsKey(answer.QuestionId))
                            weakAreas[answer.QuestionId] = weakAreas[answer.QuestionId] + 1;
                        else
                            weakAreas.Add(answer.QuestionId, 1);
                    }
                if (answer.KPIType == (int)BusinessModels.Enums.KPIType.Strong)
                {
                    if (strongAreas.ContainsKey(answer.QuestionId))
                        strongAreas[answer.QuestionId] = strongAreas[answer.QuestionId] + 1;
                    else
                        strongAreas.Add(answer.QuestionId, 1);
                }
                sumOfScores = sumOfScores + score;
            }

            List<int> topWeak = weakAreas.OrderByDescending(w => w.Value).Select(w => w.Key).ToList();
            List<int> topStrong = strongAreas.OrderByDescending(w => w.Value).Select(w => w.Key).ToList();
            double avgTotalScore = Math.Round((double)sumOfScores / answers.Count(), 1);
            InternalTotals totals = new InternalTotals();
            totals.Average = avgTotalScore;
            totals.WeakQuestionIds.AddRange(topWeak);
            foreach (var qid in topWeak)
            {
                double scoreSum = 0;
                int scoreCount = 0;
                foreach (Answer answer in answers.Where(a => a.QuestionId == qid))
                {
                    scoreSum = scoreSum + ConvertToDouble(answer.Answer1);
                    scoreCount++;
                }
                totals.WeakQuestionScores.Add(qid, Math.Round((double)scoreSum / scoreCount, 1));
            }
            totals.WeakAverage = Math.Round((double)totals.WeakQuestionScores.Values.Sum() / totals.WeakQuestionScores.Values.Count(), 1);
            if (double.IsNaN(totals.WeakAverage))
            {
                totals.WeakAverage = 0;
            }
            totals.StrongQuestionIds.AddRange(topStrong);
            foreach (var qid in topStrong)
            {
                double scoreSum = 0;
                int scoreCount = 0;
                foreach (Answer answer in answers.Where(a => a.QuestionId == qid))
                {
                    scoreSum = scoreSum + ConvertToDouble(answer.Answer1);
                    scoreCount++;
                }
                totals.StrongQuestionScores.Add(qid, Math.Round((double)scoreSum / scoreCount, 1));
            }
            totals.StrongAverage = Math.Round((double)totals.StrongQuestionScores.Values.Sum() / totals.StrongQuestionScores.Values.Count(), 1);
            if (double.IsNaN(totals.StrongAverage))
            {
                totals.StrongAverage = 0;
            }
            return totals;
        }


        public bool AddPreviousStageRCT(int profileId, int stageId, int participantId, int evaluateeId)
        {
            bool result = false;
            // Get Previousstage KPI and Trainings
            ProfileService _ProfileService = new ProfileService();
            Profile profileInfo = _ProfileService.getFullProfileById(profileId);
            Stage prevStage = null;
            foreach (StageGroup sg in profileInfo.StageGroups)
            {
                if (sg.Stages.Any(x => x.Id == stageId))
                {
                    List<Stage> allStages = sg.Stages.OrderBy(x => x.Id).ToList();
                    for (int i = 0; i < allStages.Count; i++)
                    {

                        Stage stage = allStages[i];
                        if (stage.Id == stageId)
                        {
                            if (i > 0)
                            {
                                prevStage = allStages[i - 1];
                                break;
                            }
                        }
                    }
                }
            }

            List<int> participantIds = new List<int>();
            if (evaluateeId > 0)
            {
                participantIds.Add(evaluateeId);
            }
            else
            {
                participantIds.Add(participantId);
            }
            List<IpsQuestionInfo> previousStageScoreCardData = GetParticipantProfileScorecard(prevStage.Id, participantIds);


            // Set Previousstage KPI and Trainings  for current stage with current stage dates
            Stage currentStage = _ipsDataContext.Stages.Where(x => x.Id == stageId).FirstOrDefault();

            List<EvaluationAgreement> evaluationAgreements = new List<EvaluationAgreement>();

            foreach (IpsQuestionInfo previousStageScoreCard in previousStageScoreCardData)
            {
                if (previousStageScoreCard.Agreement != null)
                {
                    if (previousStageScoreCard.Agreement.StageId == previousStageScoreCard.Agreement.Stage.Id)
                    {
                        EvaluationAgreement aggrement = new EvaluationAgreement();
                        aggrement = previousStageScoreCard.Agreement;
                        aggrement.Id = 0;
                        aggrement.ParticipantId = evaluateeId > 0 ? evaluateeId : participantId;
                        aggrement.QuestionId = previousStageScoreCard.Question.Id;
                        aggrement.StageId = stageId;
                        aggrement.Stage = currentStage;
                        //aggrement.Comment += " (Auto RCT)";
                        List<Training> clonnedTrainings = new List<Training>();
                        foreach (Training aggrementTraining in previousStageScoreCard.Agreement.Trainings)
                        {
                            List<Skill> newSkills = new List<Skill>();
                            if (aggrementTraining.Skills != null)
                            {
                                foreach (Skill skill in aggrementTraining.Skills)
                                {

                                    Skill newSkill = new Skill()
                                    {
                                        Name = skill.Name,
                                        Description = skill.Description,
                                        CreatedBy = _authService.GetCurrentUserId(),
                                        CreatedOn = DateTime.Now
                                    };
                                    if (skill.TrainingDescriptions.Count() > 0)
                                    {
                                        List<TrainingDescription> newTrainingDescriptions = new List<TrainingDescription>();
                                        foreach (TrainingDescription trainingDescription in skill.TrainingDescriptions)
                                        {
                                            TrainingDescription newTrainingDescription = new TrainingDescription()
                                            {
                                                Description = trainingDescription.Description,
                                                DescriptionType = trainingDescription.DescriptionType,
                                            };
                                            newTrainingDescriptions.Add(newTrainingDescription);
                                        }
                                        newSkill.TrainingDescriptions = newTrainingDescriptions;
                                    }
                                    _ipsDataContext.Skills.Add(newSkill);
                                    _ipsDataContext.SaveChanges();
                                    newSkills.Add(newSkill);
                                }
                            }


                            Training training = new Training()
                            {
                                AdditionalInfo = aggrementTraining.AdditionalInfo,
                                Duration = aggrementTraining.Duration,
                                DurationMetricId = aggrementTraining.DurationMetricId,
                                EmailBefore = aggrementTraining.EmailBefore,
                                EndDate = currentStage.EndDateTime,
                                ExerciseMetricId = aggrementTraining.ExerciseMetricId,
                                Frequency = aggrementTraining.Frequency,
                                How = aggrementTraining.How,
                                HowMany = aggrementTraining.HowMany,
                                HowManyActions = aggrementTraining.HowManyActions,
                                HowManySets = aggrementTraining.HowManySets,
                                Id = aggrementTraining.Id,
                                IsActive = aggrementTraining.IsActive,
                                IsNotificationByEmail = aggrementTraining.IsNotificationByEmail,
                                IsNotificationBySMS = aggrementTraining.IsNotificationBySMS,
                                IsTemplate = aggrementTraining.IsTemplate,
                                LevelId = aggrementTraining.LevelId,
                                Name = aggrementTraining.Name,
                                NotificationTemplateId = aggrementTraining.NotificationTemplateId,
                                OrganizationId = aggrementTraining.OrganizationId,
                                SmsBefore = aggrementTraining.SmsBefore,
                                StartDate = currentStage.StartDateTime,
                                TrainingMaterials = aggrementTraining.TrainingMaterials.Select(m => new TrainingMaterial
                                {
                                    Description = m.Description,
                                    Id = m.Id,
                                    Link = m.Link,
                                    MaterialType = m.MaterialType,
                                    Name = m.Name,
                                    ResourceType = m.ResourceType,
                                    Title = m.Title,
                                    TrainingId = m.TrainingId

                                }).ToList(),
                                TypeId = aggrementTraining.TypeId,
                                UserId = aggrementTraining.UserId,
                                What = aggrementTraining.What,
                                Why = aggrementTraining.Why,
                                Skills = newSkills,
                                CreatedOn = DateTime.Now,
                                CreatedBy = _authService.GetCurrentUserId(),
                            };
                            if (!string.IsNullOrEmpty(training.Frequency))
                            {
                                training.DescriptiveFrequency = RecurrenceRuleParser.ParseRRule(training.Frequency, true);
                            }

                            if (currentStage.EvaluationStartDate != null)
                            {
                                training.EndDate = currentStage.EvaluationStartDate;
                            }
                            else if (currentStage.EndDateTime.AddDays(-5) > currentStage.StartDateTime)
                            {
                                training.EndDate = currentStage.EndDateTime.AddDays(-5);
                            }
                            else
                            {
                                training.EndDate = currentStage.EndDateTime;
                            }
                            training.EndDate = currentStage.EndDateTime;

                            training.StartDate = getDefaultStartDateTime(training.StartDate.Value);
                            training.EndDate = getDefaultEndDateTime(training.EndDate.Value);

                            _ipsDataContext.Trainings.Add(training);
                            _ipsDataContext.SaveChanges();
                            clonnedTrainings.Add(training);
                        }
                        aggrement.Trainings = clonnedTrainings;
                        evaluationAgreements.Add(aggrement);
                    }
                }
            }
            if (evaluationAgreements.Count() > 0)
            {
                EvaluationAgreementsService _evaluationAgreementsService = new EvaluationAgreementsService();
                _evaluationAgreementsService.AddEvaluationAgreement(evaluationAgreements.ToArray());
                result = true;
            }
            return result;
        }
        private DateTime getDefaultStartDateTime(DateTime stageStartDateTime)
        {
            DateTime result = stageStartDateTime;
            DateTime currentTIme = DateTime.Now;
            TimeSpan defualtStartTimeSpan = new TimeSpan(8, 0, 0);

            TimeSpan stageStartDateTimeSpam = stageStartDateTime.TimeOfDay;
            if (stageStartDateTimeSpam > defualtStartTimeSpan)
            {
                result = result.AddDays(1);
                result = new DateTime(result.Year, result.Month, result.Day, defualtStartTimeSpan.Hours, defualtStartTimeSpan.Minutes, defualtStartTimeSpan.Seconds);
            }
            else
            {
                result = new DateTime(result.Year, result.Month, result.Day, defualtStartTimeSpan.Hours, defualtStartTimeSpan.Minutes, defualtStartTimeSpan.Seconds);
            }
            return result;
        }
        private DateTime getDefaultEndDateTime(DateTime stageEndDateTime)
        {
            DateTime result = stageEndDateTime;
            DateTime currentTIme = DateTime.Now;
            TimeSpan defualtStartTimeSpan = new TimeSpan(8, 0, 0);
            TimeSpan defualtEndTimeSpan = new TimeSpan(23, 30, 0);
            TimeSpan stageEndDateTimeSpam = stageEndDateTime.TimeOfDay;
            if (stageEndDateTimeSpam > defualtEndTimeSpan)
            {
                result = new DateTime(result.Year, result.Month, result.Day, defualtEndTimeSpan.Hours, defualtEndTimeSpan.Minutes, defualtEndTimeSpan.Seconds);
            }
            else if (stageEndDateTimeSpam < defualtStartTimeSpan)
            {
                result = result.AddDays(-1);
                result = new DateTime(result.Year, result.Month, result.Day, defualtEndTimeSpan.Hours, defualtEndTimeSpan.Minutes, defualtEndTimeSpan.Seconds);
            }
            return result;
        }

        public IpsDevContractInfo GetDevContractDetail(int stageId, int participantId)
        {
            IpsDevContractInfo result = new IpsDevContractInfo();
            string query = "SELECT TOP 1 u.FirstName + ' ' + u.LastName as ParticipantName, o.LogoLink, "
                            + " (SELECT TOP 1 Name FROM Profiles p INNER JOIN Link_ProfileStageGroups lsg on p.Id = lsg.ProfileId and lsg.StageGroupId = s.StageGroupId) as ProfileName, "
                            + " (SELECT TOP 1 FirstName + ' ' + LastName FROM Users WHERE Id in (SELECT UserId FROM EvaluationParticipants "
                            + " WHERE  EvaluateeId = ep.Id and IsScoreManager = 1 and StageGroupId = s.StageGroupId)) AS EvaluatorName, "
                            + " (SELECT TOP 1 FirstName + ' ' + LastName FROM Users u3 "
                            + " INNER JOIN Link_DepartmentUsers du on du.UserId = u3.Id "
                            + " INNER JOIN Departments d on d.Id = du.DepartmentId "
                            + " WHERE u3.Id = d.ManagerId and du.UserId = ep.UserId) AS LeaderName, "
                            + "  u1.FirstName + ' ' + u1.LastName AS TrainerName, u2.FirstName + ' ' + u2.LastName AS SignatureBossName, s.Name AS StageName "
                            + "  FROM EvaluationAgreements ea "
                            + " INNER JOIN EvaluationParticipants ep on ep.Id = ea.ParticipantId "
                            + " INNER JOIN Users u on u.Id = ep.UserId "
                            + " INNER JOIN Organizations o on o.Id = u.OrganizationId "
                            + " INNER JOIN Stages s on s.Id = ea.StageId "
                            + " LEFT JOIN Users u1 on u1.Id = s.TrainerId "
                            + " LEFT JOIN Users u2 on u2.Id = s.ManagerId WHERE ea.StageId = " + stageId + " and ea.ParticipantId = " + participantId;
            result = _ipsDataContext.Database.SqlQuery<IpsDevContractInfo>(query).FirstOrDefault();
            return result;
        }

        public ProspectingGoalResultModel getProsepectingActvitiyPerformanceData(int profileId, int stageId, int participantId)
        {
            ProspectingGoalResultModel result = new ProspectingGoalResultModel();
            Stage selectedStage = _ipsDataContext.Stages.Where(x => x.Id == stageId).FirstOrDefault();
            ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
            prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == profileId && x.ParticipantId == participantId && x.GoalStartDate >= selectedStage.StartDateTime && x.GoalEndDate <= selectedStage.EndDateTime).FirstOrDefault();

            if (prospectingGoal != null)
            {
                List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id && x.ScheduleDate >= selectedStage.StartDateTime && x.ScheduleDate <= selectedStage.EndDateTime).ToList();

                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoal.ProfileId.HasValue)
                {
                    skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                }
                else
                {
                    skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                }
                List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                foreach (IpsSkillDDL skill in skills)
                {
                    int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                    int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).Count();
                    result.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = skillResultCount,
                        Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });
                }
                result.Id = prospectingGoal.Id;
                result.ParticipantId = prospectingGoal.ParticipantId;
                result.ProfileId = prospectingGoal.ProfileId;
                result.GoalStartDate = prospectingGoal.GoalStartDate;
                result.GoalEndDate = prospectingGoal.GoalEndDate;

                //result.Add(new ProspectingGoalInfoModel()
                //{
                //    CallGoal = prospectingGoal.CallGoal,
                //    CallResult = Convert.ToInt32((calledCount * 100) / prospectingGoal.CallGoal),

                //    MeetingGoal = prospectingGoal.MeetingGoal,
                //    MeetingResult = Convert.ToInt32((meetingCount * 100) / prospectingGoal.MeetingGoal),

                //    TalkGoal = prospectingGoal.TalkGoal,
                //    TalkResult = Convert.ToInt32((talkedCount * 100) / prospectingGoal.TalkGoal),
                //    CallCount = calledCount,
                //    TalkCount = talkedCount,
                //    MeetingCount = meetingCount,
                //});
            }
            return result;
        }

        public ProspectingGoalResultModel getTaskProsepectingActvitiyPerformnaceData(int goalId, int activityId, int userId)
        {
            ProspectingGoalResultModel result = new ProspectingGoalResultModel();
            ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
            prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == goalId).FirstOrDefault();

            if (prospectingGoal != null)
            {
                List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoal.ProfileId.HasValue)
                {
                    skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                }
                else
                {
                    skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                }
                List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                foreach (IpsSkillDDL skill in skills)
                {
                    int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                    int skillResultCount = 0;
                    if (activityId > 0)
                    {
                        skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.IsDone == true && x.ProspectingActivityId == activityId).Count();
                    }
                    else
                    {
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == goalId).Select(x => x.Id).ToList();
                        skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();

                    }
                    result.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = skillResultCount,
                        Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });
                }
                result.Id = prospectingGoal.Id;
                result.ParticipantId = prospectingGoal.ParticipantId;
                result.ProfileId = prospectingGoal.ProfileId;
                result.GoalStartDate = prospectingGoal.GoalStartDate;
                result.GoalEndDate = prospectingGoal.GoalEndDate;


            }
            return result;
        }


        public ProspectingGoalResultModel getAllActvitiyPerformnaceData(int prospectingGoalId, int userId)
        {
            ProspectingGoalResultModel result = new ProspectingGoalResultModel();
            ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
            prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingGoalId).FirstOrDefault();

            if (prospectingGoal != null)
            {
                List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoal.ProfileId.HasValue)
                {
                    skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                }
                else
                {
                    skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                }
                List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                foreach (IpsSkillDDL skill in skills)
                {
                    int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                    int skillResultCount = 0;

                    {
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        foreach (int activityId in ProspectingActivityIds)
                        {
                            if (activityId > 0)
                            {
                                skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.IsDone == true && x.ProspectingActivityId == activityId).Count();
                                result.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                                {
                                    ProspectingGoalId = prospectingGoal.Id,
                                    SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                    SkillName = skill.Name,
                                    Goal = skillGoal,
                                    Count = skillResultCount,
                                    Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                    SeqNo = skill.SeqNo,

                                });
                            }
                        }


                    }

                }
                result.Id = prospectingGoal.Id;
                result.ParticipantId = prospectingGoal.ParticipantId;
                result.ProfileId = prospectingGoal.ProfileId;
                result.GoalStartDate = prospectingGoal.GoalStartDate;
                result.GoalEndDate = prospectingGoal.GoalEndDate;


            }
            return result;
        }


        public List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummary()
        {
            List<ProspectingGoalResultSummaryModel> result = new List<ProspectingGoalResultSummaryModel>();
            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            int userId = _authService.GetCurrentUserId();
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();
            List<ProspectingGoalInfoModel> prospectingGoals = _profileService.GetProspectingGoals().Where(x =>
            (x.GoalStartDate <= today && x.GoalEndDate >= today) ||
            (x.GoalStartDate >= today && x.GoalEndDate < endOfDay) ||
            (x.GoalStartDate >= today && x.GoalStartDate < endOfDay)).ToList();



            foreach (ProspectingGoalInfoModel prospectingGoal in prospectingGoals)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                ProspectingGoalResultSummaryModel prospectingGoalResultSummary = new ProspectingGoalResultSummaryModel()
                {
                    prospectingGoalId = prospectingGoal.Id
                };
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();
                if (prospectingGoal != null)
                {
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    foreach (IpsSkillDDL skill in skills)
                    {
                        // Total
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int totalSkillResultCount = 0;
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = totalSkillResultCount,
                            Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                        // Weekly
                        List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                        int weeklySkillResultCount = 0;
                        weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = weeklySkillResultCount,
                            Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Monthly 
                        List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                        int monthlySkillResultCount = 0;
                        monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = monthlySkillResultCount,
                            Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Today
                        List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                        int todaySkillResultCount = 0;
                        todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = todaySkillResultCount,
                            Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                    }

                    // Total
                    totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                    totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TotalResult.Add(totalProspectingGoalResultModel);

                    // Weekly
                    weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                    // Weekly
                    monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                    // Today
                    todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                    todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TodayResult.Add(todayProspectingGoalResultModel);
                    result.Add(prospectingGoalResultSummary);
                }
            }
            return result;
        }


        public List<ProspectingGoalResultSummaryModel> GetProspectingGoalResultSummaryByUserId(int userId)
        {
            List<ProspectingGoalResultSummaryModel> result = new List<ProspectingGoalResultSummaryModel>();
            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();




            List<ProspectingGoalInfoModel> prospectingGoals = _profileService.GetProspectingGoalsByUserId(userId).ToList();


            foreach (ProspectingGoalInfoModel prospectingGoal in prospectingGoals)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                ProspectingGoalResultSummaryModel prospectingGoalResultSummary = new ProspectingGoalResultSummaryModel()
                {
                    prospectingGoalId = prospectingGoal.Id,
                    prospectingGoalName = prospectingGoal.Name,
                };
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();
                if (prospectingGoal != null)
                {
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    foreach (IpsSkillDDL skill in skills)
                    {
                        // Total
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int totalSkillResultCount = 0;
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = totalSkillResultCount,
                            Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                        // Weekly
                        List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                        int weeklySkillResultCount = 0;
                        weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = weeklySkillResultCount,
                            Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Monthly 
                        List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                        int monthlySkillResultCount = 0;
                        monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = monthlySkillResultCount,
                            Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Today
                        List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                        int todaySkillResultCount = 0;
                        todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = todaySkillResultCount,
                            Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                    }

                    // Total
                    totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                    totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TotalResult.Add(totalProspectingGoalResultModel);

                    // Weekly
                    weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                    // Weekly
                    monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                    // Today
                    todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                    todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TodayResult.Add(todayProspectingGoalResultModel);
                    result.Add(prospectingGoalResultSummary);
                }
            }
            return result;
        }
        public List<ProspectingGoalResultSummaryModel> getServiceProspectingGoalResultSummaryByUserId(int userId)
        {
            List<ProspectingGoalResultSummaryModel> result = new List<ProspectingGoalResultSummaryModel>();
            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();




            List<ProspectingGoalInfoModel> prospectingGoals = _profileService.GetServiceProspectingGoalsByUserId(userId).ToList();


            foreach (ProspectingGoalInfoModel prospectingGoal in prospectingGoals)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                ProspectingGoalResultSummaryModel prospectingGoalResultSummary = new ProspectingGoalResultSummaryModel()
                {
                    prospectingGoalId = prospectingGoal.Id,
                    prospectingGoalName = prospectingGoal.Name,
                };
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();
                if (prospectingGoal != null)
                {
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    foreach (IpsSkillDDL skill in skills)
                    {
                        // Total
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int totalSkillResultCount = 0;
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = totalSkillResultCount,
                            Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                        // Weekly
                        List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                        int weeklySkillResultCount = 0;
                        weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = weeklySkillResultCount,
                            Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Monthly 
                        List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                        int monthlySkillResultCount = 0;
                        monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = monthlySkillResultCount,
                            Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Today
                        List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                        int todaySkillResultCount = 0;
                        todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = todaySkillResultCount,
                            Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                    }

                    // Total
                    totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                    totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TotalResult.Add(totalProspectingGoalResultModel);

                    // Weekly
                    weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                    // Weekly
                    monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                    // Today
                    todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                    todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TodayResult.Add(todayProspectingGoalResultModel);
                    result.Add(prospectingGoalResultSummary);
                }
            }
            return result;
        }

        public List<ProspectingGoalResultSummaryModel> GetProjectProspectingGoalResultSummaryByUserId(int userId, int projectId)
        {
            List<ProspectingGoalResultSummaryModel> result = new List<ProspectingGoalResultSummaryModel>();

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();
            List<ProspectingGoalInfoModel> prospectingGoals = _profileService.GetProjectProspectingGoalsByUserId(userId, projectId).ToList();

            Project projectDetail = _ipsDataContext.Projects.Where(x => x.Id == projectId).FirstOrDefault();

            foreach (ProspectingGoalInfoModel prospectingGoal in prospectingGoals)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                ProspectingGoalResultSummaryModel prospectingGoalResultSummary = new ProspectingGoalResultSummaryModel()
                {
                    prospectingGoalId = prospectingGoal.Id,
                    prospectingGoalName = prospectingGoal.Name,
                    projectId = projectId,
                    projectName = projectDetail != null ? projectDetail.Name : "",
                    userId = prospectingGoal.UserId,
                    userName = prospectingGoal.UserName,
                };
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();
                if (prospectingGoal != null)
                {
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    foreach (IpsSkillDDL skill in skills)
                    {
                        // Total
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int totalSkillResultCount = 0;
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = totalSkillResultCount,
                            Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                        // Weekly
                        List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                        int weeklySkillResultCount = 0;
                        weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = weeklySkillResultCount,
                            Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Monthly 
                        List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                        int monthlySkillResultCount = 0;
                        monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = monthlySkillResultCount,
                            Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Today
                        List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                        int todaySkillResultCount = 0;
                        todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = todaySkillResultCount,
                            Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                    }

                    // Total
                    totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                    totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TotalResult.Add(totalProspectingGoalResultModel);

                    // Weekly
                    weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                    // Weekly
                    monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                    // Today
                    todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                    todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TodayResult.Add(todayProspectingGoalResultModel);
                    result.Add(prospectingGoalResultSummary);
                }
            }
            return result;
        }

        public List<ProspectingGoalResultSummaryModel> getProjectServiceProspectingGoalResultSummaryByUserId(int userId, int projectId)
        {
            List<ProspectingGoalResultSummaryModel> result = new List<ProspectingGoalResultSummaryModel>();

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();
            List<ProspectingGoalInfoModel> prospectingGoals = _profileService.GetProjectServiceProspectingGoalsByUserId(userId, projectId).ToList();

            Project projectDetail = _ipsDataContext.Projects.Where(x => x.Id == projectId).FirstOrDefault();

            foreach (ProspectingGoalInfoModel prospectingGoal in prospectingGoals)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                ProspectingGoalResultSummaryModel prospectingGoalResultSummary = new ProspectingGoalResultSummaryModel()
                {
                    prospectingGoalId = prospectingGoal.Id,
                    prospectingGoalName = prospectingGoal.Name,
                    projectId = projectId,
                    projectName = projectDetail != null ? projectDetail.Name : "",
                    userId = prospectingGoal.UserId,
                    userName = prospectingGoal.UserName,
                };
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();
                if (prospectingGoal != null)
                {
                    List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                    prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                    SkillsService _skillService = new SkillsService();
                    List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                    if (prospectingGoal.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                    }

                    foreach (IpsSkillDDL skill in skills)
                    {
                        // Total
                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                        int totalSkillResultCount = 0;
                        List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                        totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = totalSkillResultCount,
                            Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                        // Weekly
                        List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                        int weeklySkillResultCount = 0;
                        weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = weeklySkillResultCount,
                            Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Monthly 
                        List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                        int monthlySkillResultCount = 0;
                        monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = monthlySkillResultCount,
                            Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });


                        // Today
                        List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                        int todaySkillResultCount = 0;
                        todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                        todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                        {
                            ProspectingGoalId = prospectingGoal.Id,
                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                            SkillName = skill.Name,
                            Goal = skillGoal,
                            Count = todaySkillResultCount,
                            Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                            SeqNo = skill.SeqNo,
                        });

                    }

                    // Total
                    totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                    totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TotalResult.Add(totalProspectingGoalResultModel);

                    // Weekly
                    weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                    // Weekly
                    monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                    monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                    // Today
                    todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                    todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                    todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                    todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                    todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                    prospectingGoalResultSummary.TodayResult.Add(todayProspectingGoalResultModel);
                    result.Add(prospectingGoalResultSummary);
                }
            }
            return result;
        }
        public ProspectingGoalResultSummaryModel GetProspectingGoalResultSummaryByGoalId(int goalId)
        {

            ProspectingGoalResultSummaryModel result = new ProspectingGoalResultSummaryModel();
            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            int userId = _authService.GetCurrentUserId();
            // Week
            DayOfWeek day = DateTime.Today.DayOfWeek;
            int days = day - DayOfWeek.Monday;
            DateTime weekStart = DateTime.Today.AddDays(-days);
            DateTime weekEnd = weekStart.AddDays(7);

            // Month
            var monthStartDate = new DateTime(today.Year, today.Month, 1);
            var monthEndDate = monthStartDate.AddMonths(1).AddDays(-1);

            //Total
            ProfileService _profileService = new ProfileService();

            //List<ProspectingGoalInfoModel> prospectingGoals = new List<ProspectingGoalInfoModel>();
            ProspectingGoalInfoModel prospectingGoal = _profileService.GetProspectingGoals().Where(x => x.Id == goalId).FirstOrDefault();

            if (prospectingGoal != null)
            {
                int? prospectingGoalId = prospectingGoal.Id;
                result.prospectingGoalId = prospectingGoalId.Value;
                ProspectingGoalResultModel totalProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel weeklyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel monthlyProspectingGoalResultModel = new ProspectingGoalResultModel();
                ProspectingGoalResultModel todayProspectingGoalResultModel = new ProspectingGoalResultModel();

                List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoal.ProfileId.HasValue)
                {
                    skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                }
                else
                {
                    skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                }

                foreach (IpsSkillDDL skill in skills)
                {
                    // Total
                    int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                    int totalSkillResultCount = 0;
                    List<int> ProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId).Select(x => x.Id).ToList();

                    totalSkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && ProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                    totalProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = totalSkillResultCount,
                        Result = totalSkillResultCount > 0 ? ((totalSkillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });

                    // Weekly
                    List<int> WeeklyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= weekStart && x.ActivityEnd <= weekEnd).Select(x => x.Id).ToList();
                    int weeklySkillResultCount = 0;
                    weeklySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && WeeklyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                    weeklyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = weeklySkillResultCount,
                        Result = weeklySkillResultCount > 0 ? ((weeklySkillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });


                    // Monthly 
                    List<int> monthlyProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= monthStartDate && x.ActivityEnd <= monthEndDate).Select(x => x.Id).ToList();
                    int monthlySkillResultCount = 0;
                    monthlySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && monthlyProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                    monthlyProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = monthlySkillResultCount,
                        Result = monthlySkillResultCount > 0 ? ((monthlySkillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });


                    // Today
                    List<int> todayProspectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == prospectingGoalId && x.ActivityStart >= today && x.ActivityStart <= endOfDay).Select(x => x.Id).ToList();
                    int todaySkillResultCount = 0;
                    todaySkillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && todayProspectingActivityIds.Contains(x.ProspectingActivityId) && x.IsDone == true).Count();
                    todayProspectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                    {
                        ProspectingGoalId = prospectingGoal.Id,
                        SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                        SkillName = skill.Name,
                        Goal = skillGoal,
                        Count = todaySkillResultCount,
                        Result = todaySkillResultCount > 0 ? ((todaySkillResultCount * 100) / skillGoal) : 0,
                        SeqNo = skill.SeqNo,
                    });

                }

                // Total
                totalProspectingGoalResultModel.Id = prospectingGoal.Id;
                totalProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                totalProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                totalProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                totalProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                result.TotalResult.Add(totalProspectingGoalResultModel);

                // Weekly
                weeklyProspectingGoalResultModel.Id = prospectingGoal.Id;
                weeklyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                weeklyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                weeklyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                weeklyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                result.WeeklyResult.Add(weeklyProspectingGoalResultModel);


                // Weekly
                monthlyProspectingGoalResultModel.Id = prospectingGoal.Id;
                monthlyProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                monthlyProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                monthlyProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                monthlyProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                result.MonthlyResult.Add(monthlyProspectingGoalResultModel);


                // Today
                todayProspectingGoalResultModel.Id = prospectingGoal.Id;
                todayProspectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                todayProspectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                todayProspectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                todayProspectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                result.TodayResult.Add(todayProspectingGoalResultModel);
            }

            return result;

        }

        public List<ProsepectingActivityResultModel> getProsepectingActivityResultData(int activityId)
        {
            List<ProsepectingActivityResultModel> result = new List<ProsepectingActivityResultModel>();

            List<ProspectingCustomerResult> customerResults = new List<ProspectingCustomerResult>();
            customerResults = _ipsDataContext.ProspectingCustomerResults.Where(x => x.ProspectingActivityId == activityId).ToList();
            List<int> customerIds = customerResults.Select(x => x.ProspectingCustomerId).ToList();
            List<ProspectingCustomer> customers = new List<ProspectingCustomer>();
            customers = _ipsDataContext.ProspectingCustomers.Include("CustomerSalesData").Where(x => customerIds.Contains(x.Id)).ToList();
            ProspectingActivity prospectingActivity = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.Id == activityId).FirstOrDefault();
            List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
            SkillsService _skillService = new SkillsService();
            skills = _skillService.getSkillsByProspectingGoalId(prospectingActivity.ProspectingGoalActivityInfo.ProspectingGoalId).OrderBy(x => x.SeqNo).ToList(); ;
            if (prospectingActivity != null)
            {
                foreach (ProspectingCustomer customer in customers)
                {
                    ProsepectingActivityResultModel prosepectingActvitiyResultModel = new ProsepectingActivityResultModel()
                    {
                        ActivityEnd = prospectingActivity.ActivityEnd,
                        ActivityStart = prospectingActivity.ActivityStart,
                        ActivityId = prospectingActivity.Id,
                        ActivityName = prospectingActivity.Name,
                    };
                    prosepectingActvitiyResultModel.ProspectingCustomer = customer;
                    prosepectingActvitiyResultModel.ProspectingCustomerResults = customerResults.Where(x => x.ProspectingCustomerId == customer.Id).ToList();
                    prosepectingActvitiyResultModel.Skills = skills;
                    result.Add(prosepectingActvitiyResultModel);
                }
            }
            return result;
        }

        private double ConvertToDouble(string value)
        {
            if (!string.IsNullOrEmpty(value))
            {


                var adjustedValue = value.Replace(',', '.');
                var ci = CultureInfo.InvariantCulture.Clone() as CultureInfo;
                ci.NumberFormat.NumberDecimalSeparator = ".";
                double doubleValue = double.Parse(adjustedValue, ci);
                return doubleValue;
            }
            else
            {
                return 0;
            }
        }

        private string ConvertToString(double value)
        {
            var ci = CultureInfo.InvariantCulture.Clone() as CultureInfo;
            ci.NumberFormat.NumberDecimalSeparator = ".";
            return value.ToString(ci);
        }

        public class InternalTotals
        {
            private Dictionary<int, double> weakQuestionScores = new Dictionary<int, double>();
            private List<int> weakQuestionIds = new List<int>();
            private Dictionary<int, double> strongQuestionScores = new Dictionary<int, double>();
            private List<int> strongQuestionIds = new List<int>();

            public double Average { get; set; }
            public double WeakAverage { get; set; }
            public double StrongAverage { get; set; }

            public Dictionary<int, double> WeakQuestionScores
            {
                get { return weakQuestionScores; }
            }

            public List<int> WeakQuestionIds
            {
                get { return weakQuestionIds; }
            }

            public Dictionary<int, double> StrongQuestionScores
            {
                get { return strongQuestionScores; }
            }

            public List<int> StrongQuestionIds
            {
                get { return strongQuestionIds; }
            }
        }
    }
}
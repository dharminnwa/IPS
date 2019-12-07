using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using log4net;
using IPS.Data.Enums;
using IPS.Business.Utils;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.Enum;
using IPS.BusinessModels.TrainingModels;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.UserModel;
using IPS.BusinessModels.ProjectModel;
//using IPS.BusinessModels.Entities;

namespace IPS.Business
{

    public class TrainingDiaryService : BaseService, IPS.Business.ITrainingDiaryService
    {

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);


        public IpsOwnTrainingsCounts GetOwnTrainingCounts(int userId)
        {
            IpsOwnTrainingsCounts result = new IpsOwnTrainingsCounts();
            int ActiveTrainings = 0;
            int UpComingTrainings = 0;
            int CompletedTrainings = 0;
            DateTime today = DateTime.Now;
            ActiveTrainings = _ipsDataContext.Trainings
                .Where(x => x.StartDate < today && x.EndDate > today && x.UserId == userId).Count();
            UpComingTrainings = _ipsDataContext.Trainings
                .Where(x => x.StartDate > today && x.UserId == userId).Count();
            CompletedTrainings = _ipsDataContext.Trainings
                .Where(x => x.EndDate < today && x.UserId == userId).Count();
            result.ActiveTrainingsCount = ActiveTrainings;
            result.UpComingTrainingsCount = UpComingTrainings;
            result.CompletedTrainingsCount = CompletedTrainings;
            return result;


        }

        public List<IpsTrainingModel> GetOwnTraining(int userId, int statusId)
        {
            DateTime today = DateTime.Now;
            if (statusId == (int)OwnTrainingStatusEnum.Active)
            {
                return _ipsDataContext.Trainings
                        .Where(t => t.StartDate < today && t.EndDate > today && t.UserId == userId)
                        .Select(x => new IpsTrainingModel()
                        {
                            AdditionalInfo = x.AdditionalInfo,
                            Duration = x.Duration,
                            DurationMetricId = x.DurationMetricId,
                            EmailBefore = x.EmailBefore,
                            EndDate = x.EndDate,
                            ExerciseMetricId = x.ExerciseMetricId,
                            Frequency = x.Frequency,
                            How = x.How,
                            HowMany = x.HowMany,
                            HowManyActions = x.HowManyActions,
                            HowManySets = x.HowManySets,
                            Id = x.Id,
                            IsActive = x.IsActive,
                            IsNotificationByEmail = x.IsNotificationByEmail,
                            IsNotificationBySMS = x.IsNotificationBySMS,
                            IsTemplate = x.IsTemplate,
                            LevelId = x.LevelId,
                            Name = x.Name,
                            NotificationTemplateId = x.NotificationTemplateId,
                            OrganizationId = x.OrganizationId,
                            SmsBefore = x.SmsBefore,
                            StartDate = x.StartDate,
                            TrainingFeedbacks = x.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                            {
                                FeedbackDateTime = f.FeedbackDateTime,
                                Id = f.Id,
                                Rating = f.Rating,
                                TaskId = f.TaskId,
                                TimeSpentMinutes = f.TimeSpentMinutes,
                                TrainingId = f.TrainingId,
                                WhatNextDescription = f.WhatNextDescription,
                                WorkedNotWell = f.WorkedNotWell,
                                WorkedWell = f.WorkedWell
                            }).ToList(),
                            TrainingMaterials = x.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                            Skills = x.Skills.Select(s => new IpsSkillDDL
                            {
                                Id = s.Id,
                                Name = s.Name
                            }).ToList(),
                            Link_PerformanceGroupSkills = x.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                            {
                                PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                {
                                    Description = l.PerformanceGroup.Description,
                                    Id = l.PerformanceGroup.Id,
                                    Name = l.PerformanceGroup.Name,
                                }
                            }).ToList(),
                            TypeId = x.TypeId,
                            UserId = x.UserId,
                            What = x.What,
                            Why = x.Why
                        })
                    .ToList();
            }
            else if (statusId == (int)OwnTrainingStatusEnum.UpComing)
            {
                return _ipsDataContext.Trainings
                .Where(x => x.StartDate > today && x.UserId == userId)
                 .Select(x => new IpsTrainingModel()
                 {
                     AdditionalInfo = x.AdditionalInfo,
                     Duration = x.Duration,
                     DurationMetricId = x.DurationMetricId,
                     EmailBefore = x.EmailBefore,
                     EndDate = x.EndDate,
                     ExerciseMetricId = x.ExerciseMetricId,
                     Frequency = x.Frequency,
                     How = x.How,
                     HowMany = x.HowMany,
                     HowManyActions = x.HowManyActions,
                     HowManySets = x.HowManySets,
                     Id = x.Id,
                     IsActive = x.IsActive,
                     IsNotificationByEmail = x.IsNotificationByEmail,
                     IsNotificationBySMS = x.IsNotificationBySMS,
                     IsTemplate = x.IsTemplate,
                     LevelId = x.LevelId,
                     Name = x.Name,
                     NotificationTemplateId = x.NotificationTemplateId,
                     OrganizationId = x.OrganizationId,
                     SmsBefore = x.SmsBefore,
                     StartDate = x.StartDate,
                     TrainingFeedbacks = x.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                     {
                         FeedbackDateTime = f.FeedbackDateTime,
                         Id = f.Id,
                         Rating = f.Rating,
                         TaskId = f.TaskId,
                         TimeSpentMinutes = f.TimeSpentMinutes,
                         TrainingId = f.TrainingId,
                         WhatNextDescription = f.WhatNextDescription,
                         WorkedNotWell = f.WorkedNotWell,
                         WorkedWell = f.WorkedWell
                     }).ToList(),
                     TrainingMaterials = x.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                     Skills = x.Skills.Select(s => new IpsSkillDDL
                     {
                         Id = s.Id,
                         Name = s.Name
                     }).ToList(),
                     Link_PerformanceGroupSkills = x.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                     {
                         PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                         {
                             Description = l.PerformanceGroup.Description,
                             Id = l.PerformanceGroup.Id,
                             Name = l.PerformanceGroup.Name,
                         }
                     }).ToList(),
                     TypeId = x.TypeId,
                     UserId = x.UserId,
                     What = x.What,
                     Why = x.Why
                 })
                .ToList();
            }
            else if (statusId == (int)OwnTrainingStatusEnum.Completed)
            {
                return _ipsDataContext.Trainings
                .Where(x => x.EndDate < today && x.UserId == userId)
                  .Select(x => new IpsTrainingModel()
                  {
                      AdditionalInfo = x.AdditionalInfo,
                      Duration = x.Duration,
                      DurationMetricId = x.DurationMetricId,
                      EmailBefore = x.EmailBefore,
                      EndDate = x.EndDate,
                      ExerciseMetricId = x.ExerciseMetricId,
                      Frequency = x.Frequency,
                      How = x.How,
                      HowMany = x.HowMany,
                      HowManyActions = x.HowManyActions,
                      HowManySets = x.HowManySets,
                      Id = x.Id,
                      IsActive = x.IsActive,
                      IsNotificationByEmail = x.IsNotificationByEmail,
                      IsNotificationBySMS = x.IsNotificationBySMS,
                      IsTemplate = x.IsTemplate,
                      LevelId = x.LevelId,
                      Name = x.Name,
                      NotificationTemplateId = x.NotificationTemplateId,
                      OrganizationId = x.OrganizationId,
                      SmsBefore = x.SmsBefore,
                      StartDate = x.StartDate,
                      TrainingFeedbacks = x.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                      {
                          FeedbackDateTime = f.FeedbackDateTime,
                          Id = f.Id,
                          Rating = f.Rating,
                          TaskId = f.TaskId,
                          TimeSpentMinutes = f.TimeSpentMinutes,
                          TrainingId = f.TrainingId,
                          WhatNextDescription = f.WhatNextDescription,
                          WorkedNotWell = f.WorkedNotWell,
                          WorkedWell = f.WorkedWell
                      }).ToList(),
                      TrainingMaterials = x.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                      Skills = x.Skills.Select(s => new IpsSkillDDL
                      {
                          Id = s.Id,
                          Name = s.Name
                      }).ToList(),
                      Link_PerformanceGroupSkills = x.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                      {
                          PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                          {
                              Description = l.PerformanceGroup.Description,
                              Id = l.PerformanceGroup.Id,
                              Name = l.PerformanceGroup.Name,
                          }
                      }).ToList(),
                      TypeId = x.TypeId,
                      UserId = x.UserId,
                      What = x.What,
                      Why = x.Why
                  })
                .ToList();
            }
            else
            {
                return null;
            }
        }

        /// <summary>
        /// Gets lists of active (requires evaluation and KPI setting) profiles executed in the past
        /// </summary>
        /// <param name="userId">Defines userId of user who has execute evaluation</param>
        /// <returns></returns>
        public List<IpsTrainingDiary> GetUserActiveProfiles(int userId)
        {
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsTrainingDiary> trainingDiary = new List<IpsTrainingDiary>();
            PerformanceService performanceService = new PerformanceService();
            List<IpsEvaluationParticipantProfileStages> selfParticipants = _ipsDataContext.EvaluationParticipants
                .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.IsSelfEvaluation == true)
                 //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                 .Select(x => new IpsEvaluationParticipantProfileStages()
                 {
                     EvaluateeId = x.EvaluateeId,
                     EvaluationRoleId = x.EvaluationRoleId,
                     Id = x.Id,
                     IsLocked = x.IsLocked,
                     IsScoreManager = x.IsScoreManager,
                     IsSelfEvaluation = x.IsSelfEvaluation,
                     StageGroup = new IpsStageGroupModel()
                     {
                         Id = x.StageGroup.Id,
                         DaysSpan = x.StageGroup.DaysSpan,
                         Description = x.StageGroup.Description,
                         EndDate = x.StageGroup.EndDate,
                         HoursSpan = x.StageGroup.HoursSpan,
                         MinutesSpan = x.StageGroup.MinutesSpan,
                         MonthsSpan = x.StageGroup.MonthsSpan,
                         ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                         Name = x.StageGroup.Name,
                         ParentParticipantId = x.StageGroup.ParentParticipantId,
                         ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                         Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                         {
                             Id = p.Id,
                             Name = p.Name,
                             ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                             IsActive = p.IsActive,
                             Project = p.Project != null ? new IpsProjectModel()
                             {
                                 Id = p.Project.Id,
                                 ExpectedEndDate = p.Project.ExpectedEndDate,
                                 ExpectedStartDate = p.Project.ExpectedStartDate,
                                 IsActive = p.Project.IsActive,
                                 MissionStatement = p.Project.MissionStatement,
                                 Name = p.Project.Name,
                                 Summary = p.Project.Summary,
                                 VisionStatement = p.Project.VisionStatement,
                             } : null,

                         }).ToList(),
                         Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                         {
                             EndDateTime = s.EndDateTime,
                             Id = s.Id,
                             Name = s.Name,
                             StageGroupId = s.StageGroupId,
                             StartDateTime = s.StartDateTime

                         }).ToList(),
                         StartDate = x.StageGroup.StartDate,
                         WeeksSpan = x.StageGroup.WeeksSpan

                     },
                     EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                     {
                         EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                         EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                         Id = x.EvaluationParticipant1.Id,
                         Invited = x.EvaluationParticipant1.Invited,
                         IsLocked = x.EvaluationParticipant1.IsLocked,
                         IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                         IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                         StageGroupId = x.EvaluationParticipant1.StageGroupId,
                         UserId = x.EvaluationParticipant1.UserId,
                     } : null,

                 })
               .ToList();

            foreach (var evaluator in selfParticipants)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,

                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant != null)
                            {
                                participantId = evaluator.EvaluationParticipant.Id;
                                participantUserId = evaluator.EvaluationParticipant.UserId;
                            }
                        }
                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;

                        //if(participantId  > 0)
                        //{
                        //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //}
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        {
                            trainingDiary.Add(TrainingDiary);
                        }
                        else if (profileInfo.Project != null)
                        {
                            if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }
            ProjectService projectService = new ProjectService();
            List<IpsEvaluationParticipantProfileStages> partcipantsProfile = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && ep.UserId == userId && ep.IsScoreManager == true && ep.EvaluateeId > 0)
                //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                .Select(x => new IpsEvaluationParticipantProfileStages()
                {
                    EvaluateeId = x.EvaluateeId,
                    EvaluationRoleId = x.EvaluationRoleId,
                    Id = x.Id,
                    IsLocked = x.IsLocked,
                    IsScoreManager = x.IsScoreManager,
                    IsSelfEvaluation = x.IsSelfEvaluation,
                    StageGroup = new IpsStageGroupModel()
                    {
                        Id = x.StageGroup.Id,
                        DaysSpan = x.StageGroup.DaysSpan,
                        Description = x.StageGroup.Description,
                        EndDate = x.StageGroup.EndDate,
                        HoursSpan = x.StageGroup.HoursSpan,
                        MinutesSpan = x.StageGroup.MinutesSpan,
                        MonthsSpan = x.StageGroup.MonthsSpan,
                        ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                        Name = x.StageGroup.Name,
                        ParentParticipantId = x.StageGroup.ParentParticipantId,
                        ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                        Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                        {
                            Id = p.Id,
                            Name = p.Name,
                            ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                            IsActive = p.IsActive,
                            Project = p.Project != null ? new IpsProjectModel()
                            {
                                Id = p.Project.Id,
                                ExpectedEndDate = p.Project.ExpectedEndDate,
                                ExpectedStartDate = p.Project.ExpectedStartDate,
                                IsActive = p.Project.IsActive,
                                MissionStatement = p.Project.MissionStatement,
                                Name = p.Project.Name,
                                Summary = p.Project.Summary,
                                VisionStatement = p.Project.VisionStatement,
                            } : null,
                        }).ToList(),
                        Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                        {
                            EndDateTime = s.EndDateTime,
                            Id = s.Id,
                            Name = s.Name,
                            StageGroupId = s.StageGroupId,
                            StartDateTime = s.StartDateTime
                        }).ToList(),
                        StartDate = x.StageGroup.StartDate,
                        WeeksSpan = x.StageGroup.WeeksSpan

                    },
                    EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                    {
                        EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                        EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                        Id = x.EvaluationParticipant1.Id,
                        Invited = x.EvaluationParticipant1.Invited,
                        IsLocked = x.EvaluationParticipant1.IsLocked,
                        IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                        IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                        StageGroupId = x.EvaluationParticipant1.StageGroupId,
                        UserId = x.EvaluationParticipant1.UserId,
                    } : null,
                })
              .ToList();


            foreach (var evaluator in partcipantsProfile)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };
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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        List<User> participantList = new List<User>();
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant != null)
                            {
                                participantId = evaluator.EvaluationParticipant.Id;
                                participantUserId = evaluator.EvaluationParticipant.UserId;
                                User participantUser = _ipsDataContext.Users.Where(x => x.Id == participantUserId).FirstOrDefault();
                                participantList.Add(participantUser);
                            }
                        }
                        TrainingDiary.Profile.Participants = participantList;
                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;

                        //if(participantId  > 0)
                        //{
                        //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //}
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        {
                            trainingDiary.Add(TrainingDiary);
                        }
                        else if (profileInfo.Project != null)
                        {
                            if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }


            //   
            List<int?> partcipantWithEvaluatorIds = _ipsDataContext.EvaluationParticipants
                .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.IsSelfEvaluation == false && ep.EvaluateeId == null).Select(x => (int?)x.Id).ToList();
            List<IpsEvaluationParticipantProfileStages> partcipantWithEvaluatorProfile = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && ep.IsSelfEvaluation == false && partcipantWithEvaluatorIds.Contains(ep.EvaluateeId))
                //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                .Select(x => new IpsEvaluationParticipantProfileStages()
                {

                    EvaluateeId = x.EvaluateeId,
                    EvaluationRoleId = x.EvaluationRoleId,
                    Id = x.Id,
                    UserId = x.UserId,
                    IsLocked = x.IsLocked,
                    IsScoreManager = x.IsScoreManager,
                    IsSelfEvaluation = x.IsSelfEvaluation,
                    StageGroup = new IpsStageGroupModel()
                    {
                        Id = x.StageGroup.Id,
                        DaysSpan = x.StageGroup.DaysSpan,
                        Description = x.StageGroup.Description,
                        EndDate = x.StageGroup.EndDate,
                        HoursSpan = x.StageGroup.HoursSpan,
                        MinutesSpan = x.StageGroup.MinutesSpan,
                        MonthsSpan = x.StageGroup.MonthsSpan,
                        ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                        Name = x.StageGroup.Name,
                        ParentParticipantId = x.StageGroup.ParentParticipantId,
                        ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                        Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                        {
                            Id = p.Id,
                            Name = p.Name,
                            ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                            IsActive = p.IsActive,
                            Project = p.Project != null ? new IpsProjectModel()
                            {
                                Id = p.Project.Id,
                                ExpectedEndDate = p.Project.ExpectedEndDate,
                                ExpectedStartDate = p.Project.ExpectedStartDate,
                                IsActive = p.Project.IsActive,
                                MissionStatement = p.Project.MissionStatement,
                                Name = p.Project.Name,
                                Summary = p.Project.Summary,
                                VisionStatement = p.Project.VisionStatement,
                            } : null,
                        }).ToList(),
                        Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                        {
                            EndDateTime = s.EndDateTime,
                            Id = s.Id,
                            Name = s.Name,
                            StageGroupId = s.StageGroupId,
                            StartDateTime = s.StartDateTime
                        }).ToList(),
                        StartDate = x.StageGroup.StartDate,
                        WeeksSpan = x.StageGroup.WeeksSpan

                    },
                    EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                    {
                        EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                        EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                        Id = x.EvaluationParticipant1.Id,
                        Invited = x.EvaluationParticipant1.Invited,
                        IsLocked = x.EvaluationParticipant1.IsLocked,
                        IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                        IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                        StageGroupId = x.EvaluationParticipant1.StageGroupId,
                        UserId = x.EvaluationParticipant1.UserId,
                    } : null,
                })
              .ToList();

            foreach (var evaluator in partcipantWithEvaluatorProfile)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        int participantId = evaluator.Id;
                        int participantUserId = evaluator.EvaluationParticipant.UserId;

                        if (evaluator.UserId > 0)
                        {
                            TrainingDiary.Profile.Evaluators = _ipsDataContext.Users.Where(x => x.Id == evaluator.UserId).ToList();
                        }

                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;

                        //if(participantId  > 0)
                        //{
                        //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //}
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        {
                            trainingDiary.Add(TrainingDiary);
                        }
                        else if (profileInfo.Project != null)
                        {
                            if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }

            // Project Manager

            //// Project Manager
            IpsUserProjects projects = projectService.GetUserProjects();
            foreach (IpsUserProjectListModel project in projects.ActiveProjects)
            {
                if (project.Link_ProjectUsers.Any(x => x.UserId == userId && x.RoleId == 1))
                {
                    foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers.Where(x => x.RoleId == 4).ToList())
                    {

                        List<IpsEvaluationParticipantProfileStages> projectSelfParticipants = _ipsDataContext.EvaluationParticipants
                   .Where(ep => ep.IsLocked == false && (ep.UserId == projectUser.UserId) && ep.IsSelfEvaluation == true)
                    //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                    .Select(x => new IpsEvaluationParticipantProfileStages()
                    {
                        EvaluateeId = x.EvaluateeId,
                        EvaluationRoleId = x.EvaluationRoleId,
                        Id = x.Id,
                        IsLocked = x.IsLocked,
                        IsScoreManager = x.IsScoreManager,
                        IsSelfEvaluation = x.IsSelfEvaluation,
                        StageGroup = new IpsStageGroupModel()
                        {
                            Id = x.StageGroup.Id,
                            DaysSpan = x.StageGroup.DaysSpan,
                            Description = x.StageGroup.Description,
                            EndDate = x.StageGroup.EndDate,
                            HoursSpan = x.StageGroup.HoursSpan,
                            MinutesSpan = x.StageGroup.MinutesSpan,
                            MonthsSpan = x.StageGroup.MonthsSpan,
                            ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                            Name = x.StageGroup.Name,
                            ParentParticipantId = x.StageGroup.ParentParticipantId,
                            ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                            Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                            {
                                Id = p.Id,
                                Name = p.Name,
                                ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                                IsActive = p.IsActive,
                                Project = p.Project != null ? new IpsProjectModel()
                                {
                                    Id = p.Project.Id,
                                    ExpectedEndDate = p.Project.ExpectedEndDate,
                                    ExpectedStartDate = p.Project.ExpectedStartDate,
                                    IsActive = p.Project.IsActive,
                                    MissionStatement = p.Project.MissionStatement,
                                    Name = p.Project.Name,
                                    Summary = p.Project.Summary,
                                    VisionStatement = p.Project.VisionStatement,
                                } : null,

                            }).ToList(),
                            Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                            {
                                EndDateTime = s.EndDateTime,
                                Id = s.Id,
                                Name = s.Name,
                                StageGroupId = s.StageGroupId,
                                StartDateTime = s.StartDateTime

                            }).ToList(),
                            StartDate = x.StageGroup.StartDate,
                            WeeksSpan = x.StageGroup.WeeksSpan

                        },
                        EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                        {
                            EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                            EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                            Id = x.EvaluationParticipant1.Id,
                            Invited = x.EvaluationParticipant1.Invited,
                            IsLocked = x.EvaluationParticipant1.IsLocked,
                            IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                            IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                            StageGroupId = x.EvaluationParticipant1.StageGroupId,
                            UserId = x.EvaluationParticipant1.UserId,
                        } : null,

                    })
                  .ToList();

                        foreach (var evaluator in projectSelfParticipants)
                        {

                            IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                            IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                            if (profileInfo != null && profileInfo.IsActive)
                            {
                                IpsProfile profile = new IpsProfile
                                {
                                    Id = profileInfo.Id,
                                    Name = profileInfo.Name,
                                    ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                                    Project = profileInfo.Project != null ? new IpsProjectModel()
                                    {
                                        Id = profileInfo.Project.Id,
                                        ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                                        ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                                        IsActive = profileInfo.Project.IsActive,
                                        MissionStatement = profileInfo.Project.MissionStatement,
                                        Name = profileInfo.Project.Name,
                                        Summary = profileInfo.Project.Summary,
                                        VisionStatement = profileInfo.Project.VisionStatement,
                                    } : null,

                                };

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
                                {
                                    continue;
                                }
                                else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                                {
                                    continue;
                                }
                                else
                                {
                                    TrainingDiary.Profile = profile;
                                    int participantId = evaluator.Id;
                                    int participantUserId = 0;
                                    if (evaluator.IsSelfEvaluation == true)
                                    {
                                        participantId = evaluator.Id;
                                        participantUserId = evaluator.UserId;
                                    }
                                    else
                                    {
                                        if (evaluator.EvaluationParticipant != null)
                                        {
                                            participantId = evaluator.EvaluationParticipant.Id;
                                            participantUserId = evaluator.EvaluationParticipant.UserId;
                                        }
                                    }
                                    TrainingDiary.Profile.EvalutorId = participantId;
                                    TrainingDiary.Profile.ParticipantUserId = participantUserId;
                                    TrainingDiary.Profile.IsManagerProfile = true;
                                    //if(participantId  > 0)
                                    //{
                                    //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                                    //}
                                    List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                                    if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                                    {
                                        if (!trainingDiary.Any(x => x.Profile.EvalutorId == TrainingDiary.Profile.EvalutorId && x.Profile.ParticipantUserId == TrainingDiary.Profile.ParticipantUserId))
                                        {
                                            trainingDiary.Add(TrainingDiary);
                                        }
                                    }

                                    else if (profileInfo.Project != null)
                                    {
                                        if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                                        {
                                            if (!trainingDiary.Any(x => x.Profile.EvalutorId == TrainingDiary.Profile.EvalutorId && x.Profile.ParticipantUserId == TrainingDiary.Profile.ParticipantUserId))
                                            {
                                                trainingDiary.Add(TrainingDiary);
                                            }
                                        }
                                    }


                                }
                            }
                        }

                        List<IpsEvaluationParticipantProfileStages> projectPartcipantsProfile = _ipsDataContext.EvaluationParticipants
                          .Where(ep => ep.IsLocked == false && ep.UserId == projectUser.UserId && ep.IsScoreManager == true && ep.EvaluateeId > 0)
                           //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                           .Select(x => new IpsEvaluationParticipantProfileStages()
                           {
                               EvaluateeId = x.EvaluateeId,
                               EvaluationRoleId = x.EvaluationRoleId,
                               Id = x.Id,
                               IsLocked = x.IsLocked,
                               IsScoreManager = x.IsScoreManager,
                               IsSelfEvaluation = x.IsSelfEvaluation,
                               StageGroup = new IpsStageGroupModel()
                               {
                                   Id = x.StageGroup.Id,
                                   DaysSpan = x.StageGroup.DaysSpan,
                                   Description = x.StageGroup.Description,
                                   EndDate = x.StageGroup.EndDate,
                                   HoursSpan = x.StageGroup.HoursSpan,
                                   MinutesSpan = x.StageGroup.MinutesSpan,
                                   MonthsSpan = x.StageGroup.MonthsSpan,
                                   ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                                   Name = x.StageGroup.Name,
                                   ParentParticipantId = x.StageGroup.ParentParticipantId,
                                   ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                                   Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                                   {
                                       Id = p.Id,
                                       Name = p.Name,
                                       ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                                       IsActive = p.IsActive,
                                       Project = p.Project != null ? new IpsProjectModel()
                                       {
                                           Id = p.Project.Id,
                                           ExpectedEndDate = p.Project.ExpectedEndDate,
                                           ExpectedStartDate = p.Project.ExpectedStartDate,
                                           IsActive = p.Project.IsActive,
                                           MissionStatement = p.Project.MissionStatement,
                                           Name = p.Project.Name,
                                           Summary = p.Project.Summary,
                                           VisionStatement = p.Project.VisionStatement,
                                       } : null,
                                   }).ToList(),
                                   Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                                   {
                                       EndDateTime = s.EndDateTime,
                                       Id = s.Id,
                                       Name = s.Name,
                                       StageGroupId = s.StageGroupId,
                                       StartDateTime = s.StartDateTime
                                   }).ToList(),
                                   StartDate = x.StageGroup.StartDate,
                                   WeeksSpan = x.StageGroup.WeeksSpan

                               },
                               EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                               {
                                   EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                                   EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                                   Id = x.EvaluationParticipant1.Id,
                                   Invited = x.EvaluationParticipant1.Invited,
                                   IsLocked = x.EvaluationParticipant1.IsLocked,
                                   IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                                   IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                                   StageGroupId = x.EvaluationParticipant1.StageGroupId,
                                   UserId = x.EvaluationParticipant1.UserId,
                               } : null,
                           })
                         .ToList();

                        foreach (var evaluator in projectPartcipantsProfile)
                        {
                            IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();
                            IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                            if (profileInfo != null && profileInfo.IsActive)
                            {
                                IpsProfile profile = new IpsProfile
                                {
                                    Id = profileInfo.Id,
                                    Name = profileInfo.Name,
                                    ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                                    Project = profileInfo.Project != null ? new IpsProjectModel()
                                    {
                                        Id = profileInfo.Project.Id,
                                        ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                                        ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                                        IsActive = profileInfo.Project.IsActive,
                                        MissionStatement = profileInfo.Project.MissionStatement,
                                        Name = profileInfo.Project.Name,
                                        Summary = profileInfo.Project.Summary,
                                        VisionStatement = profileInfo.Project.VisionStatement,
                                    } : null,
                                };
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
                                {
                                    continue;
                                }
                                else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                                {
                                    continue;
                                }
                                else
                                {
                                    TrainingDiary.Profile = profile;
                                    List<User> participantList = new List<User>();
                                    int participantId = evaluator.Id;
                                    int participantUserId = 0;
                                    if (evaluator.IsSelfEvaluation == true)
                                    {
                                        participantId = evaluator.Id;
                                        participantUserId = evaluator.UserId;
                                    }
                                    else
                                    {
                                        if (evaluator.EvaluationParticipant != null)
                                        {
                                            participantId = evaluator.EvaluationParticipant.Id;
                                            participantUserId = evaluator.EvaluationParticipant.UserId;
                                            User participantUser = _ipsDataContext.Users.Where(x => x.Id == participantUserId).FirstOrDefault();
                                            participantList.Add(participantUser);
                                        }
                                    }
                                    TrainingDiary.Profile.Participants = participantList;
                                    TrainingDiary.Profile.EvalutorId = participantId;
                                    TrainingDiary.Profile.ParticipantUserId = participantUserId;
                                    TrainingDiary.Profile.IsManagerProfile = true;
                                    //if(participantId  > 0)
                                    //{
                                    //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                                    //}
                                    List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                                    if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                                    {
                                        if (!trainingDiary.Any(x => x.Profile.EvalutorId == TrainingDiary.Profile.EvalutorId && x.Profile.ParticipantUserId == TrainingDiary.Profile.ParticipantUserId))
                                        {
                                            trainingDiary.Add(TrainingDiary);
                                        }
                                    }
                                    else if (profileInfo.Project != null)
                                    {
                                        if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                                        {
                                            if (!trainingDiary.Any(x => x.Profile.EvalutorId == TrainingDiary.Profile.EvalutorId && x.Profile.ParticipantUserId == TrainingDiary.Profile.ParticipantUserId))
                                            {
                                                trainingDiary.Add(TrainingDiary);
                                            }
                                        }
                                    }

                                }
                            }
                        }
                        //    List<int?> projectPartcipantWithEvaluatorIds = _ipsDataContext.EvaluationParticipants
                        //.Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.IsSelfEvaluation == false && ep.EvaluateeId == null).Select(x => (int?)x.Id).ToList();
                        //    List<IpsEvaluationParticipantProfileStages> projectPartcipantWithEvaluatorProfile = _ipsDataContext.EvaluationParticipants
                        //       .Where(ep => ep.IsLocked == false && ep.IsSelfEvaluation == false && projectPartcipantWithEvaluatorIds.Contains(ep.EvaluateeId))
                        //        //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                        //        .Select(x => new IpsEvaluationParticipantProfileStages()
                        //        {

                        //            EvaluateeId = x.EvaluateeId,
                        //            EvaluationRoleId = x.EvaluationRoleId,
                        //            Id = x.Id,
                        //            UserId = x.UserId,
                        //            IsLocked = x.IsLocked,
                        //            IsScoreManager = x.IsScoreManager,
                        //            IsSelfEvaluation = x.IsSelfEvaluation,
                        //            StageGroup = new IpsStageGroupModel()
                        //            {
                        //                Id = x.StageGroup.Id,
                        //                DaysSpan = x.StageGroup.DaysSpan,
                        //                Description = x.StageGroup.Description,
                        //                EndDate = x.StageGroup.EndDate,
                        //                HoursSpan = x.StageGroup.HoursSpan,
                        //                MinutesSpan = x.StageGroup.MinutesSpan,
                        //                MonthsSpan = x.StageGroup.MonthsSpan,
                        //                ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                        //                Name = x.StageGroup.Name,
                        //                ParentParticipantId = x.StageGroup.ParentParticipantId,
                        //                ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                        //                Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                        //                {
                        //                    Id = p.Id,
                        //                    Name = p.Name,
                        //                    ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                        //                    IsActive = p.IsActive,
                        //                    Project = p.Project != null ? new IpsProjectModel()
                        //                    {
                        //                        Id = p.Project.Id,
                        //                        ExpectedEndDate = p.Project.ExpectedEndDate,
                        //                        ExpectedStartDate = p.Project.ExpectedStartDate,
                        //                        IsActive = p.Project.IsActive,
                        //                        MissionStatement = p.Project.MissionStatement,
                        //                        Name = p.Project.Name,
                        //                        Summary = p.Project.Summary,
                        //                        VisionStatement = p.Project.VisionStatement,
                        //                    } : null,
                        //                }).ToList(),
                        //                Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                        //                {
                        //                    EndDateTime = s.EndDateTime,
                        //                    Id = s.Id,
                        //                    Name = s.Name,
                        //                    StageGroupId = s.StageGroupId,
                        //                    StartDateTime = s.StartDateTime
                        //                }).ToList(),
                        //                StartDate = x.StageGroup.StartDate,
                        //                WeeksSpan = x.StageGroup.WeeksSpan
                        //            },
                        //            EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                        //            {
                        //                EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                        //                EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                        //                Id = x.EvaluationParticipant1.Id,
                        //                Invited = x.EvaluationParticipant1.Invited,
                        //                IsLocked = x.EvaluationParticipant1.IsLocked,
                        //                IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                        //                IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                        //                StageGroupId = x.EvaluationParticipant1.StageGroupId,
                        //                UserId = x.EvaluationParticipant1.UserId,
                        //            } : null,
                        //        })
                        //      .ToList();

                        //    foreach (var evaluator in projectPartcipantWithEvaluatorProfile)
                        //    {
                        //        IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();
                        //        IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                        //        if (profileInfo != null && profileInfo.IsActive)
                        //        {
                        //            IpsProfile profile = new IpsProfile
                        //            {
                        //                Id = profileInfo.Id,
                        //                Name = profileInfo.Name,
                        //                ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        //                Project = profileInfo.Project != null ? new IpsProjectModel()
                        //                {
                        //                    Id = profileInfo.Project.Id,
                        //                    ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                        //                    ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                        //                    IsActive = profileInfo.Project.IsActive,
                        //                    MissionStatement = profileInfo.Project.MissionStatement,
                        //                    Name = profileInfo.Project.Name,
                        //                    Summary = profileInfo.Project.Summary,
                        //                    VisionStatement = profileInfo.Project.VisionStatement,
                        //                } : null,
                        //            };
                        //            if (profile != null)
                        //            {
                        //                if (profile.Project != null)
                        //                {
                        //                    if (!profile.Project.IsActive)
                        //                    {
                        //                        profile = null;
                        //                    }
                        //                }
                        //            }
                        //            if (profile == null)
                        //            {
                        //                continue;
                        //            }
                        //            else
                        //            {
                        //                TrainingDiary.Profile = profile;
                        //                int participantId = evaluator.Id;
                        //                int participantUserId = evaluator.EvaluationParticipant.UserId;
                        //                if (evaluator.UserId > 0)
                        //                {
                        //                    TrainingDiary.Profile.Evaluators = _ipsDataContext.Users.Where(x => x.Id == evaluator.UserId).ToList();
                        //                }
                        //                TrainingDiary.Profile.EvalutorId = participantId;
                        //                TrainingDiary.Profile.ParticipantUserId = participantUserId;
                        //                TrainingDiary.Profile.IsManagerProfile = true;
                        //                //if(participantId  > 0)
                        //                //{
                        //                //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //                //}
                        //                List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        //                if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        //                {
                        //                    if (!trainingDiary.Any(x => x.Profile.EvalutorId == TrainingDiary.Profile.EvalutorId && x.Profile.ParticipantUserId == TrainingDiary.Profile.ParticipantUserId))
                        //                    {
                        //                        trainingDiary.Add(TrainingDiary);
                        //                    }
                        //                }
                        //            }
                        //        }
                        //    }
                    }
                }
            }
            return trainingDiary;
        }


        public List<IpsTrainingDiary> GetUserActiveProfilesForToday(int userId)
        {
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsTrainingDiary> trainingDiary = new List<IpsTrainingDiary>();

            List<IpsEvaluationParticipantProfileStages> selfParticipants = _ipsDataContext.EvaluationParticipants
                .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.IsSelfEvaluation == true)
                 //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                 .Select(x => new IpsEvaluationParticipantProfileStages()
                 {
                     EvaluateeId = x.EvaluateeId,
                     EvaluationRoleId = x.EvaluationRoleId,
                     Id = x.Id,
                     IsLocked = x.IsLocked,
                     IsScoreManager = x.IsScoreManager,
                     IsSelfEvaluation = x.IsSelfEvaluation,
                     StageGroup = new IpsStageGroupModel()
                     {
                         Id = x.StageGroup.Id,
                         DaysSpan = x.StageGroup.DaysSpan,
                         Description = x.StageGroup.Description,
                         EndDate = x.StageGroup.EndDate,
                         HoursSpan = x.StageGroup.HoursSpan,
                         MinutesSpan = x.StageGroup.MinutesSpan,
                         MonthsSpan = x.StageGroup.MonthsSpan,
                         ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                         Name = x.StageGroup.Name,
                         ParentParticipantId = x.StageGroup.ParentParticipantId,
                         ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                         Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                         {
                             Id = p.Id,
                             Name = p.Name,
                             ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                             IsActive = p.IsActive,
                             Project = p.Project != null ? new IpsProjectModel()
                             {
                                 Id = p.Project.Id,
                                 ExpectedEndDate = p.Project.ExpectedEndDate,
                                 ExpectedStartDate = p.Project.ExpectedStartDate,
                                 IsActive = p.Project.IsActive,
                                 MissionStatement = p.Project.MissionStatement,
                                 Name = p.Project.Name,
                                 Summary = p.Project.Summary,
                                 VisionStatement = p.Project.VisionStatement,
                             } : null,

                         }).ToList(),
                         Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                         {
                             EndDateTime = s.EndDateTime,
                             Id = s.Id,
                             Name = s.Name,
                             StageGroupId = s.StageGroupId,
                             StartDateTime = s.StartDateTime

                         }).ToList(),
                         StartDate = x.StageGroup.StartDate,
                         WeeksSpan = x.StageGroup.WeeksSpan

                     },
                     EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                     {
                         EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                         EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                         Id = x.EvaluationParticipant1.Id,
                         Invited = x.EvaluationParticipant1.Invited,
                         IsLocked = x.EvaluationParticipant1.IsLocked,
                         IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                         IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                         StageGroupId = x.EvaluationParticipant1.StageGroupId,
                         UserId = x.EvaluationParticipant1.UserId,
                     } : null,

                 })
               .ToList();

            foreach (var evaluator in selfParticipants)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,

                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant != null)
                            {
                                participantId = evaluator.EvaluationParticipant.Id;
                                participantUserId = evaluator.EvaluationParticipant.UserId;
                            }
                        }
                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;

                        //if(participantId  > 0)
                        //{
                        //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //}
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (stages.Any(x => x.StartDateTime <= todayDate && x.EndDateTime >= todayDate))
                        {
                            trainingDiary.Add(TrainingDiary);
                        }
                        else if (profileInfo.Project != null)
                        {
                            if (profileInfo.Project.ExpectedStartDate <= todayDate && profileInfo.Project.ExpectedEndDate >= todayDate)
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }

            //   
            List<int?> partcipantWithEvaluatorIds = _ipsDataContext.EvaluationParticipants
                .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.IsSelfEvaluation == false && ep.EvaluateeId == null).Select(x => (int?)x.Id).ToList();
            List<IpsEvaluationParticipantProfileStages> partcipantWithEvaluatorProfile = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && ep.IsSelfEvaluation == false && partcipantWithEvaluatorIds.Contains(ep.EvaluateeId))
                //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                .Select(x => new IpsEvaluationParticipantProfileStages()
                {

                    EvaluateeId = x.EvaluateeId,
                    EvaluationRoleId = x.EvaluationRoleId,
                    Id = x.Id,
                    UserId = x.UserId,
                    IsLocked = x.IsLocked,
                    IsScoreManager = x.IsScoreManager,
                    IsSelfEvaluation = x.IsSelfEvaluation,
                    StageGroup = new IpsStageGroupModel()
                    {
                        Id = x.StageGroup.Id,
                        DaysSpan = x.StageGroup.DaysSpan,
                        Description = x.StageGroup.Description,
                        EndDate = x.StageGroup.EndDate,
                        HoursSpan = x.StageGroup.HoursSpan,
                        MinutesSpan = x.StageGroup.MinutesSpan,
                        MonthsSpan = x.StageGroup.MonthsSpan,
                        ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                        Name = x.StageGroup.Name,
                        ParentParticipantId = x.StageGroup.ParentParticipantId,
                        ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                        Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                        {
                            Id = p.Id,
                            Name = p.Name,
                            ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                            IsActive = p.IsActive,
                            Project = p.Project != null ? new IpsProjectModel()
                            {
                                Id = p.Project.Id,
                                ExpectedEndDate = p.Project.ExpectedEndDate,
                                ExpectedStartDate = p.Project.ExpectedStartDate,
                                IsActive = p.Project.IsActive,
                                MissionStatement = p.Project.MissionStatement,
                                Name = p.Project.Name,
                                Summary = p.Project.Summary,
                                VisionStatement = p.Project.VisionStatement,
                            } : null,
                        }).ToList(),
                        Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                        {
                            EndDateTime = s.EndDateTime,
                            Id = s.Id,
                            Name = s.Name,
                            StageGroupId = s.StageGroupId,
                            StartDateTime = s.StartDateTime
                        }).ToList(),
                        StartDate = x.StageGroup.StartDate,
                        WeeksSpan = x.StageGroup.WeeksSpan

                    },
                    EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                    {
                        EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                        EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                        Id = x.EvaluationParticipant1.Id,
                        Invited = x.EvaluationParticipant1.Invited,
                        IsLocked = x.EvaluationParticipant1.IsLocked,
                        IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                        IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                        StageGroupId = x.EvaluationParticipant1.StageGroupId,
                        UserId = x.EvaluationParticipant1.UserId,
                    } : null,
                })
              .ToList();

            foreach (var evaluator in partcipantWithEvaluatorProfile)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        int participantId = evaluator.Id;
                        int participantUserId = evaluator.EvaluationParticipant.UserId;

                        if (evaluator.UserId > 0)
                        {
                            TrainingDiary.Profile.Evaluators = _ipsDataContext.Users.Where(x => x.Id == evaluator.UserId).ToList();
                        }

                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;

                        //if(participantId  > 0)
                        //{
                        //    User User = _ipsDataContext.Users.Where(x=>x.Id == participantId)
                        //}
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        {
                            trainingDiary.Add(TrainingDiary);
                        }
                        else if (profileInfo.Project != null)
                        {
                            if (profileInfo.Project.ExpectedStartDate < todayDate && profileInfo.Project.ExpectedEndDate > todayDate)
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }

            return trainingDiary;
        }
        public List<IpsTrainingModel> GetUserProfileStageTrainingsForToday(int userId, int profileId)
        {
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsTrainingModel> profileTrainings = new List<IpsTrainingModel>();

            List<IpsEvaluationParticipantProfileStagesAnswer> participants = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               .Select(x => new IpsEvaluationParticipantProfileStagesAnswer()
               {
                   EvaluateeId = x.EvaluateeId,
                   EvaluationRoleId = x.EvaluationRoleId,
                   Id = x.Id,
                   IsLocked = x.IsLocked,
                   IsScoreManager = x.IsScoreManager,
                   IsSelfEvaluation = x.IsSelfEvaluation,
                   StageGroup = new IpsStageGroupModel()
                   {
                       Id = x.StageGroup.Id,
                       DaysSpan = x.StageGroup.DaysSpan,
                       Description = x.StageGroup.Description,
                       EndDate = x.StageGroup.EndDate,
                       HoursSpan = x.StageGroup.HoursSpan,
                       MinutesSpan = x.StageGroup.MinutesSpan,
                       MonthsSpan = x.StageGroup.MonthsSpan,
                       ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                       Name = x.StageGroup.Name,
                       ParentParticipantId = x.StageGroup.ParentParticipantId,
                       ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                       Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                       {
                           Id = p.Id,
                           Name = p.Name,
                           ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                           IsActive = p.IsActive,
                           Project = p.Project != null ? new IpsProjectModel()
                           {
                               Id = p.Project.Id,
                               ExpectedEndDate = p.Project.ExpectedEndDate,
                               ExpectedStartDate = p.Project.ExpectedStartDate,
                               IsActive = p.Project.IsActive,
                               MissionStatement = p.Project.MissionStatement,
                               Name = p.Project.Name,
                               Summary = p.Project.Summary,
                               VisionStatement = p.Project.VisionStatement,
                           } : null,
                       }).ToList(),
                       Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                       {
                           EndDateTime = s.EndDateTime,
                           Id = s.Id,
                           Name = s.Name,
                           StageGroupId = s.StageGroupId,
                           StartDateTime = s.StartDateTime,
                           IsPaused = s.IsPaused,
                           IsStopped = s.IsStopped

                       }).ToList(),
                       StartDate = x.StageGroup.StartDate,
                       WeeksSpan = x.StageGroup.WeeksSpan
                   },
                   Answers = x.Answers.Select(a => new IpsAnswersModel()
                   {
                       Answer1 = a.Answer1,
                       Comment = a.Comment,
                       Id = a.Id,
                       IsCorrect = a.IsCorrect,
                       KPIType = a.KPIType,
                       ParticipantId = a.ParticipantId,
                       QuestionId = a.QuestionId,
                       StageId = a.StageId

                   }).ToList(),
                   EvaluationParticipant1 = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                   {
                       EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                       EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                       Id = x.EvaluationParticipant1.Id,
                       Invited = x.EvaluationParticipant1.Invited,
                       IsLocked = x.EvaluationParticipant1.IsLocked,
                       IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                       IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                       StageGroupId = x.EvaluationParticipant1.StageGroupId,
                       UserId = x.EvaluationParticipant1.UserId,
                   } : null,
                   StageGroupId = x.StageGroupId,
                   UserId = x.UserId,
               })
               .ToList();

            foreach (IpsEvaluationParticipantProfileStagesAnswer evaluator in participants)
            {
                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive && profileInfo.Id == profileId)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        profile.EvalutorRoleId = evaluator.EvaluationRoleId;
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.Where(x => x.StartDateTime <= todayDate && x.EndDateTime > todayDate && x.IsPaused != true && x.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();

                        List<int> stageIds = stages.Select(s => s.Id).ToList();
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant1 != null)
                            {
                                participantId = evaluator.EvaluationParticipant1.Id;
                                participantUserId = evaluator.EvaluationParticipant1.UserId;
                            }
                        }

                        IpsUserModel user = evaluator.EvaluationParticipant1 != null ? _ipsDataContext.Users.Select(u => new IpsUserModel()
                        {
                            Id = u.Id,
                            Email = u.WorkEmail,
                            FirstName = u.FirstName,
                            ImageUrl = u.ImagePath,
                            IsActive = u.IsActive,
                            LastName = u.LastName,
                            OrganizationName = u.Organization.Name,
                        }).FirstOrDefault(u => u.Id == evaluator.EvaluationParticipant1.UserId) : null;
                        if (user == null)
                        {
                            user = _ipsDataContext.Users.Select(u => new IpsUserModel()
                            {
                                Id = u.Id,
                                Email = u.WorkEmail,
                                FirstName = u.FirstName,
                                ImageUrl = u.ImagePath,
                                IsActive = u.IsActive,
                                LastName = u.LastName,
                                OrganizationName = u.Organization.Name,
                            }).FirstOrDefault(u => u.Id == evaluator.UserId);
                        }

                        for (var i = 0; i < stages.Count; i++)
                        {
                            IpsStageModel stage = stages[i];

                            if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                            {
                                var stagesEvolution = _ipsDataContext.StagesEvolutions.Where(x => x.OriginalStageId == stage.Id && x.ParticipantId == evaluator.Id && x.StartDate <= todayDate && x.DueDate > todayDate).OrderBy(x => x.StartDate).ToList();
                                SurveyService _surveyService = new SurveyService();
                                for (int j = 0; j < stagesEvolution.Count; j++)
                                {
                                    var stageEvo = stagesEvolution[j];
                                    List<IpsEvaluationAgreementItem> IpsEvaluationAgreementItems = GetKtFinalKPIEvaluationAgreementItems(profile.Id, stage.Id, null, participantId);
                                    int agreementIndex = 0;
                                    foreach (IpsEvaluationAgreementItem evaluationAgreement in IpsEvaluationAgreementItems)
                                    {
                                        List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                .Select(t => new IpsTrainingModel()
                                                {
                                                    AdditionalInfo = t.AdditionalInfo,
                                                    Duration = t.Duration,
                                                    DurationMetricId = t.DurationMetricId,
                                                    EmailBefore = t.EmailBefore,
                                                    EndDate = t.EndDate,
                                                    ExerciseMetricId = t.ExerciseMetricId,
                                                    Frequency = t.Frequency,
                                                    How = t.How,
                                                    HowMany = t.HowMany,
                                                    HowManyActions = t.HowManyActions,
                                                    HowManySets = t.HowManySets,
                                                    Id = t.Id,
                                                    IsActive = t.IsActive,
                                                    IsNotificationByEmail = t.IsNotificationByEmail,
                                                    IsNotificationBySMS = t.IsNotificationBySMS,
                                                    IsTemplate = t.IsTemplate,
                                                    LevelId = t.LevelId,
                                                    Name = t.Name,
                                                    NotificationTemplateId = t.NotificationTemplateId,
                                                    OrganizationId = t.OrganizationId,
                                                    SmsBefore = t.SmsBefore,
                                                    StartDate = t.StartDate,
                                                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                    {
                                                        FeedbackDateTime = f.FeedbackDateTime,
                                                        Id = f.Id,
                                                        Rating = f.Rating,
                                                        TaskId = f.TaskId,
                                                        TimeSpentMinutes = f.TimeSpentMinutes,
                                                        TrainingId = f.TrainingId,
                                                        WhatNextDescription = f.WhatNextDescription,
                                                        WorkedNotWell = f.WorkedNotWell,
                                                        WorkedWell = f.WorkedWell
                                                    }).ToList(),
                                                    TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                    Skills = t.Skills.Select(s => new IpsSkillDDL
                                                    {
                                                        Id = s.Id,
                                                        Name = s.Name
                                                    }).ToList(),
                                                    Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                    {
                                                        PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                        {
                                                            Description = l.PerformanceGroup.Description,
                                                            Id = l.PerformanceGroup.Id,
                                                            Name = l.PerformanceGroup.Name,
                                                        }
                                                    }).ToList(),
                                                    TypeId = t.TypeId,
                                                    UserId = t.UserId,
                                                    What = t.What,
                                                    Why = t.Why
                                                }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                traingDetail.StageId = stage.Id;
                                                traingDetail.StageName = stage.Name;
                                                traingDetail.ProfileId = profile.Id;
                                                traingDetail.ProfileName = profile.Name;
                                                traingDetail.User = user;
                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        if (evaluationAgreement.InDevContract)
                                        {
                                            profileTrainings.AddRange(trainings);
                                        }

                                        agreementIndex++;
                                    }
                                }
                            }
                            else
                            {

                                List<IpsEvaluationAgreement> evalutionAgreements = _ipsDataContext.EvaluationAgreements
                                    .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.ParticipantId == participantId).OrderBy(c => c.KPIType)
                                    .Select(x => new IpsEvaluationAgreement()
                                    {
                                        Comment = x.Comment,
                                        EvaluationParticipant = x.EvaluationParticipant != null ? new IpsEvaluationParticipant()
                                        {
                                            EvaluateeId = x.EvaluationParticipant.EvaluateeId,
                                            EvaluationRoleId = x.EvaluationParticipant.EvaluationRoleId,
                                            Id = x.EvaluationParticipant.Id,
                                            IsLocked = x.EvaluationParticipant.IsLocked,
                                            IsScoreManager = x.EvaluationParticipant.IsScoreManager,
                                            IsSelfEvaluation = x.EvaluationParticipant.IsSelfEvaluation,
                                        } : null,
                                        FinalGoal = x.FinalGoal,
                                        FinalScore = x.FinalScore,
                                        Id = x.Id,
                                        KPIType = x.KPIType,
                                        LongGoal = x.LongGoal,
                                        MidGoal = x.MidGoal,
                                        ParticipantId = x.ParticipantId,
                                        Question = x.Question != null ? new IpsQuestionModel()
                                        {
                                            AnswerTypeId = x.Question.AnswerTypeId,
                                            Description = x.Question.Description,
                                            Id = x.Question.Id,
                                            IndustryId = x.Question.IndustryId,
                                            IsActive = x.Question.IsActive,
                                            IsTemplate = x.Question.IsTemplate,
                                            OrganizationId = x.Question.OrganizationId,
                                            ParentQuestionId = x.Question.ParentQuestionId,
                                            Points = x.Question.Points,
                                            ProfileTypeId = x.Question.ProfileTypeId,
                                            QuestionSettings = x.Question.QuestionSettings,
                                            QuestionText = x.Question.QuestionText,
                                            ScaleId = x.Question.ScaleId,
                                            SeqNo = x.Question.SeqNo,

                                            StructureLevelId = x.Question.StructureLevelId,
                                            TimeForQuestion = x.Question.TimeForQuestion,

                                        } : null,
                                        QuestionId = x.QuestionId,
                                        ShortGoal = x.ShortGoal,
                                        Stage = x.Stage != null ? new IpsStageModel()
                                        {
                                            EndDateTime = x.Stage.EndDateTime,
                                            Id = x.Stage.Id,
                                            Name = x.Stage.Name,
                                            StageGroupId = x.Stage.StageGroupId,
                                            StartDateTime = x.Stage.StartDateTime,
                                        } : null,
                                        StageId = x.StageId,
                                        Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                                        {
                                            AdditionalInfo = t.AdditionalInfo,
                                            Duration = t.Duration,
                                            DurationMetricId = t.DurationMetricId,
                                            EmailBefore = t.EmailBefore,
                                            EndDate = t.EndDate,
                                            ExerciseMetricId = t.ExerciseMetricId,
                                            Frequency = t.Frequency,
                                            How = t.How,
                                            HowMany = t.HowMany,
                                            HowManyActions = t.HowManyActions,
                                            HowManySets = t.HowManySets,
                                            Id = t.Id,
                                            IsActive = t.IsActive,
                                            IsNotificationByEmail = t.IsNotificationByEmail,
                                            IsNotificationBySMS = t.IsNotificationBySMS,
                                            IsTemplate = t.IsTemplate,
                                            LevelId = t.LevelId,
                                            Name = t.Name,
                                            NotificationTemplateId = t.NotificationTemplateId,
                                            OrganizationId = t.OrganizationId,
                                            SmsBefore = t.SmsBefore,
                                            StartDate = t.StartDate,
                                            TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                            {
                                                FeedbackDateTime = f.FeedbackDateTime,
                                                Id = f.Id,
                                                Rating = f.Rating,
                                                TaskId = f.TaskId,
                                                TimeSpentMinutes = f.TimeSpentMinutes,
                                                TrainingId = f.TrainingId,
                                                WhatNextDescription = f.WhatNextDescription,
                                                WorkedNotWell = f.WorkedNotWell,
                                                WorkedWell = f.WorkedWell,
                                                IsRecurrences = f.IsRecurrences,
                                                RecurrencesEndTime = f.RecurrencesEndTime,
                                                RecurrencesRule = f.RecurrencesRule,
                                                RecurrencesStartTime = f.RecurrencesStartTime,
                                                IsParticipantPaused = f.IsParticipantPaused,
                                                ParticipantPausedAt = f.ParticipantPausedAt,
                                                EvaluatorId = f.EvaluatorId,
                                                EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                            }).ToList(),
                                            TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                            Skills = t.Skills.Select(s => new IpsSkillDDL
                                            {
                                                Id = s.Id,
                                                Name = s.Name
                                            }).ToList(),
                                            Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                            {
                                                PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                {
                                                    Description = l.PerformanceGroup.Description,
                                                    Id = l.PerformanceGroup.Id,
                                                    Name = l.PerformanceGroup.Name,
                                                }
                                            }).ToList(),
                                            TypeId = t.TypeId,
                                            UserId = t.UserId,
                                            What = t.What,
                                            Why = t.Why
                                        }).ToList(),
                                    }).ToList();


                                if (evalutionAgreements.Count() > 0)
                                {
                                    int agreementIndex = 0;
                                    foreach (IpsEvaluationAgreement evaluationAgreement in evalutionAgreements)
                                    {

                                        if (evaluationAgreement.Question.Skills == null)
                                        {
                                            evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Skills).ToList()
                                                .Select(s => new IpsSkillDDL()
                                                {
                                                    Id = s.Id,
                                                    Name = s.Name,
                                                }).ToList();
                                            if (!(evaluationAgreement.Question.Skills.Count > 0))
                                            {

                                                evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Link_PerformanceGroupSkills).ToList()
                                              .Select(s => new IpsSkillDDL()
                                              {
                                                  Id = s.Skill != null ? s.Skill.Id : s.SkillId,
                                                  Name = s.Skill != null ? s.Skill.Name : _ipsDataContext.Skills.Where(x => x.Id == s.SkillId).Select(sk => sk.Name).FirstOrDefault(),
                                              }).ToList();
                                            }

                                        }
                                        List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                 .Select(t => new IpsTrainingModel()
                                                 {
                                                     AdditionalInfo = t.AdditionalInfo,
                                                     Duration = t.Duration,
                                                     DurationMetricId = t.DurationMetricId,
                                                     EmailBefore = t.EmailBefore,
                                                     EndDate = t.EndDate,
                                                     ExerciseMetricId = t.ExerciseMetricId,
                                                     Frequency = t.Frequency,
                                                     How = t.How,
                                                     HowMany = t.HowMany,
                                                     HowManyActions = t.HowManyActions,
                                                     HowManySets = t.HowManySets,
                                                     Id = t.Id,
                                                     IsActive = t.IsActive,
                                                     IsNotificationByEmail = t.IsNotificationByEmail,
                                                     IsNotificationBySMS = t.IsNotificationBySMS,
                                                     IsTemplate = t.IsTemplate,
                                                     LevelId = t.LevelId,
                                                     Name = t.Name,
                                                     NotificationTemplateId = t.NotificationTemplateId,
                                                     OrganizationId = t.OrganizationId,
                                                     SmsBefore = t.SmsBefore,
                                                     StartDate = t.StartDate,
                                                     TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                     {
                                                         FeedbackDateTime = f.FeedbackDateTime,
                                                         Id = f.Id,
                                                         Rating = f.Rating,
                                                         TaskId = f.TaskId,
                                                         TimeSpentMinutes = f.TimeSpentMinutes,
                                                         TrainingId = f.TrainingId,
                                                         WhatNextDescription = f.WhatNextDescription,
                                                         WorkedNotWell = f.WorkedNotWell,
                                                         WorkedWell = f.WorkedWell,
                                                         IsRecurrences = f.IsRecurrences,
                                                         RecurrencesEndTime = f.RecurrencesEndTime,
                                                         RecurrencesRule = f.RecurrencesRule,
                                                         RecurrencesStartTime = f.RecurrencesStartTime,
                                                         IsParticipantPaused = f.IsParticipantPaused,
                                                         ParticipantPausedAt = f.ParticipantPausedAt,
                                                         EvaluatorId = f.EvaluatorId,
                                                         EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                         IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                     }).ToList(),
                                                     TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                     Skills = t.Skills.Select(s => new IpsSkillDDL
                                                     {
                                                         Id = s.Id,
                                                         Name = s.Name
                                                     }).ToList(),
                                                     Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                     {
                                                         PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                         {
                                                             Description = l.PerformanceGroup.Description,
                                                             Id = l.PerformanceGroup.Id,
                                                             Name = l.PerformanceGroup.Name,
                                                         }
                                                     }).ToList(),
                                                     TypeId = t.TypeId,
                                                     UserId = t.UserId,
                                                     What = t.What,
                                                     Why = t.Why
                                                 }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                traingDetail.StageId = stage.Id;
                                                traingDetail.StageName = stage.Name;
                                                traingDetail.ProfileId = profile.Id;
                                                traingDetail.ProfileName = profile.Name;
                                                traingDetail.User = user;
                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        evaluationAgreement.Trainings = trainings.OrderBy(x => x.Name).ToList();
                                        profileTrainings.AddRange(trainings);
                                        agreementIndex++;
                                    }
                                }

                            }

                        }

                    }
                }
            }

            return profileTrainings;
        }

        public List<IpsTrainingDiary> GetUserProfileStageTrainings(int userId, int profileId)
        {
            //get profiles to be executed
            List<IpsTrainingDiary> trainingDiary = new List<IpsTrainingDiary>();

            List<IpsEvaluationParticipantProfileStagesAnswer> participants = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && (ep.UserId == userId) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               .Select(x => new IpsEvaluationParticipantProfileStagesAnswer()
               {
                   EvaluateeId = x.EvaluateeId,
                   EvaluationRoleId = x.EvaluationRoleId,
                   Id = x.Id,
                   IsLocked = x.IsLocked,
                   IsScoreManager = x.IsScoreManager,
                   IsSelfEvaluation = x.IsSelfEvaluation,
                   StageGroup = new IpsStageGroupModel()
                   {
                       Id = x.StageGroup.Id,
                       DaysSpan = x.StageGroup.DaysSpan,
                       Description = x.StageGroup.Description,
                       EndDate = x.StageGroup.EndDate,
                       HoursSpan = x.StageGroup.HoursSpan,
                       MinutesSpan = x.StageGroup.MinutesSpan,
                       MonthsSpan = x.StageGroup.MonthsSpan,
                       ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                       Name = x.StageGroup.Name,
                       ParentParticipantId = x.StageGroup.ParentParticipantId,
                       ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                       Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                       {
                           Id = p.Id,
                           Name = p.Name,
                           ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                           IsActive = p.IsActive,
                           Project = p.Project != null ? new IpsProjectModel()
                           {
                               Id = p.Project.Id,
                               ExpectedEndDate = p.Project.ExpectedEndDate,
                               ExpectedStartDate = p.Project.ExpectedStartDate,
                               IsActive = p.Project.IsActive,
                               MissionStatement = p.Project.MissionStatement,
                               Name = p.Project.Name,
                               Summary = p.Project.Summary,
                               VisionStatement = p.Project.VisionStatement,
                           } : null,
                       }).ToList(),
                       Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                       {
                           EndDateTime = s.EndDateTime,
                           Id = s.Id,
                           Name = s.Name,
                           StageGroupId = s.StageGroupId,
                           StartDateTime = s.StartDateTime
                       }).ToList(),
                       StartDate = x.StageGroup.StartDate,
                       WeeksSpan = x.StageGroup.WeeksSpan
                   },
                   Answers = x.Answers.Select(a => new IpsAnswersModel()
                   {
                       Answer1 = a.Answer1,
                       Comment = a.Comment,
                       Id = a.Id,
                       IsCorrect = a.IsCorrect,
                       KPIType = a.KPIType,
                       ParticipantId = a.ParticipantId,
                       QuestionId = a.QuestionId,
                       StageId = a.StageId

                   }).ToList(),
                   EvaluationParticipant1 = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                   {
                       EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                       EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                       Id = x.EvaluationParticipant1.Id,
                       Invited = x.EvaluationParticipant1.Invited,
                       IsLocked = x.EvaluationParticipant1.IsLocked,
                       IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                       IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                       StageGroupId = x.EvaluationParticipant1.StageGroupId,
                       UserId = x.EvaluationParticipant1.UserId,
                   } : null,
                   StageGroupId = x.StageGroupId,
                   UserId = x.UserId,
               })
               .ToList();

            foreach (IpsEvaluationParticipantProfileStagesAnswer evaluator in participants)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive && profileInfo.Id == profileId)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else
                    {
                        profile.EvalutorRoleId = evaluator.EvaluationRoleId;
                        TrainingDiary.Profile = profile;

                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();

                        List<int> stageIds = stages.Select(s => s.Id).ToList();
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant1 != null)
                            {
                                participantId = evaluator.EvaluationParticipant1.Id;
                                participantUserId = evaluator.EvaluationParticipant1.UserId;
                            }
                        }
                        TrainingDiary.Profile.EvalutorId = participantId;
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;
                        IpsUserModel user = evaluator.EvaluationParticipant1 != null ? _ipsDataContext.Users.Select(u => new IpsUserModel()
                        {
                            Id = u.Id,
                            Email = u.WorkEmail,
                            FirstName = u.FirstName,
                            ImageUrl = u.ImagePath,
                            IsActive = u.IsActive,
                            LastName = u.LastName,
                            OrganizationName = u.Organization.Name,
                        }).FirstOrDefault(u => u.Id == evaluator.EvaluationParticipant1.UserId) : null;
                        if (user == null)
                        {
                            user = _ipsDataContext.Users.Select(u => new IpsUserModel()
                            {
                                Id = u.Id,
                                Email = u.WorkEmail,
                                FirstName = u.FirstName,
                                ImageUrl = u.ImagePath,
                                IsActive = u.IsActive,
                                LastName = u.LastName,
                                OrganizationName = u.Organization.Name,
                            }).FirstOrDefault(u => u.Id == evaluator.UserId);
                        }

                        for (var i = 0; i < stages.Count; i++)
                        {
                            if (i == 0)
                            {
                                TrainingDiary.IpsTrainingDiaryStages = new List<IpsTrainingDiaryStage>();
                            }

                            IpsStageModel stage = stages[i];

                            if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                            {
                                var stagesEvolution =
                                    _ipsDataContext.StagesEvolutions
                                    .Where(
                                        x => x.OriginalStageId == stage.Id && x.ParticipantId == evaluator.Id).OrderBy(x => x.StartDate).ToList();
                                SurveyService _surveyService = new SurveyService();

                                for (int j = 0; j < stagesEvolution.Count; j++)
                                {
                                    IpsTrainingDiaryStage ipsTrainingDiaryStage = new IpsTrainingDiaryStage();

                                    ipsTrainingDiaryStage.EvaluationAgreement = new List<IpsEvaluationAgreement>();

                                    var stageEvo = stagesEvolution[j];

                                    ipsTrainingDiaryStage.Name = stageEvo.Name;
                                    ipsTrainingDiaryStage.Id = (int)stageEvo.Id;
                                    ipsTrainingDiaryStage.StartDate = stageEvo.StartDate;
                                    ipsTrainingDiaryStage.EndDate = stageEvo.DueDate;

                                    List<IpsEvaluationAgreementItem> IpsEvaluationAgreementItems = GetKtFinalKPIEvaluationAgreementItems(profile.Id, stage.Id, null, participantId);
                                    int agreementIndex = 0;

                                    foreach (IpsEvaluationAgreementItem evaluationAgreement in IpsEvaluationAgreementItems)
                                    {
                                        ipsTrainingDiaryStage.IsKPISet = true;
                                        List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();
                                        if (!string.IsNullOrEmpty(evaluationAgreement.Comment))
                                        {
                                            if (evaluationAgreement.InDevContract)
                                            {
                                                //evaluationAgreement.Question.Skills

                                                IpsTrainingModel traingDetail = new IpsTrainingModel();
                                                traingDetail.Id = agreementIndex * (-1);
                                                traingDetail.Name = "Free Text";
                                                traingDetail.AdditionalInfo = evaluationAgreement.Comment;
                                                traingDetail.StartDate = stage.StartDateTime;
                                                traingDetail.EndDate = stage.EndDateTime;

                                                if (evaluationAgreement.Skills != null)
                                                {
                                                    if (evaluationAgreement.Skills.Count() > 0)
                                                    {
                                                        traingDetail.SkillId = evaluationAgreement.Skills.FirstOrDefault().Id;
                                                        traingDetail.Skills = evaluationAgreement.Skills;
                                                        traingDetail.Name = evaluationAgreement.Skills.FirstOrDefault().Name;
                                                    }
                                                }
                                                traingDetail.User = user;

                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                .Select(t => new IpsTrainingModel()
                                                {
                                                    AdditionalInfo = t.AdditionalInfo,
                                                    Duration = t.Duration,
                                                    DurationMetricId = t.DurationMetricId,
                                                    EmailBefore = t.EmailBefore,
                                                    EndDate = t.EndDate,
                                                    ExerciseMetricId = t.ExerciseMetricId,
                                                    Frequency = t.Frequency,
                                                    How = t.How,
                                                    HowMany = t.HowMany,
                                                    HowManyActions = t.HowManyActions,
                                                    HowManySets = t.HowManySets,
                                                    Id = t.Id,
                                                    IsActive = t.IsActive,
                                                    IsNotificationByEmail = t.IsNotificationByEmail,
                                                    IsNotificationBySMS = t.IsNotificationBySMS,
                                                    IsTemplate = t.IsTemplate,
                                                    LevelId = t.LevelId,
                                                    Name = t.Name,
                                                    NotificationTemplateId = t.NotificationTemplateId,
                                                    OrganizationId = t.OrganizationId,
                                                    SmsBefore = t.SmsBefore,
                                                    StartDate = t.StartDate,
                                                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                    {
                                                        FeedbackDateTime = f.FeedbackDateTime,
                                                        Id = f.Id,
                                                        Rating = f.Rating,
                                                        TaskId = f.TaskId,
                                                        TimeSpentMinutes = f.TimeSpentMinutes,
                                                        TrainingId = f.TrainingId,
                                                        WhatNextDescription = f.WhatNextDescription,
                                                        WorkedNotWell = f.WorkedNotWell,
                                                        WorkedWell = f.WorkedWell,
                                                        StartedAt = f.StartedAt,
                                                    }).ToList(),
                                                    IPSTrainingNotes = t.TrainingNotes.Select(f => new IPSTrainingNote
                                                    {
                                                        Id = f.Id,
                                                        TrainingId = f.TrainingId,
                                                        Goal = f.Goal,
                                                        OtherInfo = f.OtherInfo,
                                                        MeasureInfo = f.MeasureInfo,
                                                        ProceedInfo = f.ProceedInfo,
                                                    }).ToList(),
                                                    TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                    Skills = t.Skills.Select(s => new IpsSkillDDL
                                                    {
                                                        Id = s.Id,
                                                        Name = s.Name
                                                    }).ToList(),
                                                    Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                    {
                                                        PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                        {
                                                            Description = l.PerformanceGroup.Description,
                                                            Id = l.PerformanceGroup.Id,
                                                            Name = l.PerformanceGroup.Name,
                                                        }
                                                    }).ToList(),
                                                    TypeId = t.TypeId,
                                                    UserId = t.UserId,
                                                    What = t.What,
                                                    Why = t.Why
                                                }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                if (!(traingDetail.Skills.Count > 0))
                                                {
                                                    traingDetail.SkillId = evaluationAgreement.Skills.FirstOrDefault().Id;
                                                    traingDetail.Skills = evaluationAgreement.Skills;
                                                    traingDetail.Name = evaluationAgreement.Skills.FirstOrDefault().Name;
                                                    //traingDetail.Skills = evaluationAgreement.Question.Skills.Select(s => new IpsSkillDDL()
                                                    //{
                                                    //    Id = s.Id,
                                                    //    Name = s.Name,
                                                    //}).ToList();
                                                }
                                                traingDetail.User = user;
                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        if (evaluationAgreement.InDevContract)
                                        {
                                            IpsEvaluationAgreement agreement = new IpsEvaluationAgreement();
                                            agreement.Comment = evaluationAgreement.Comment;
                                            agreement.Question = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.QuestionId).Select(q => new IpsQuestionModel()
                                            {
                                                AnswerTypeId = q.AnswerTypeId,
                                                Description = q.Description,
                                                Id = q.Id,
                                                IndustryId = q.IndustryId,
                                                IsActive = q.IsActive,
                                                IsTemplate = q.IsTemplate,
                                                OrganizationId = q.OrganizationId,
                                                ParentQuestionId = q.ParentQuestionId,
                                                Points = q.Points,
                                                ProfileTypeId = q.ProfileTypeId,
                                                QuestionSettings = q.QuestionSettings,
                                                QuestionText = q.QuestionText,
                                                ScaleId = q.ScaleId,
                                                SeqNo = q.SeqNo,

                                                StructureLevelId = q.StructureLevelId,
                                                TimeForQuestion = q.TimeForQuestion,
                                                //Skills = q.Skills != null ? (q.Skills.Select(s => new IpsSkillDDL()
                                                //{
                                                //    Id = s.Id,
                                                //    Name = s.Name,
                                                //}).ToList()) : (q.Link_PerformanceGroupSkills.Select(s => new IpsSkillDDL()
                                                //{
                                                //    Id = s.Skill.Id,
                                                //    Name = s.Skill.Name,
                                                //}).ToList()),

                                            }).FirstOrDefault();
                                            agreement.Stage = stage;
                                            agreement.KPIType = evaluationAgreement.IsCorrect ? 2 : 1;
                                            agreement.Trainings = trainings.OrderBy(x => x.Name).ToList();
                                            if (agreement.Question.Skills == null)
                                            {
                                                agreement.Question.Skills = evaluationAgreement.Skills;
                                            }
                                            ipsTrainingDiaryStage.EvaluationAgreement.Add(agreement);
                                        }

                                        agreementIndex++;
                                    }

                                    if (ipsTrainingDiaryStage.EvaluationAgreement.Count() > 0)
                                    {
                                        ipsTrainingDiaryStage.EvaluationAgreement = ipsTrainingDiaryStage.EvaluationAgreement.OrderBy(x => x.KPIType).ToList();

                                        List<IpsEvaluationAgreement> evalutionAgreements = ipsTrainingDiaryStage.EvaluationAgreement.ToList();
                                        ipsTrainingDiaryStage.EvaluationAgreement.Clear();
                                        agreementIndex = 0;
                                        foreach (IpsEvaluationAgreement evaluationAgreement in evalutionAgreements)
                                        {
                                            List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();
                                            if (!string.IsNullOrEmpty(evaluationAgreement.Comment))
                                            {
                                                if (evaluationAgreement.KPIType > 0)
                                                {
                                                    //evaluationAgreement.Question.Skills

                                                    IpsTrainingModel traingDetail = new IpsTrainingModel();
                                                    traingDetail.Id = agreementIndex * (-1);
                                                    //traingDetail.Name = "Free Text";
                                                    traingDetail.AdditionalInfo = evaluationAgreement.Comment;
                                                    traingDetail.StartDate = stage.StartDateTime;
                                                    traingDetail.EndDate = stage.EndDateTime;
                                                    traingDetail.Skills = evaluationAgreement.Question.Skills;
                                                    traingDetail.SkillId = evaluationAgreement.Question.Skills.FirstOrDefault().Id;
                                                    traingDetail.Name = evaluationAgreement.Question.Skills.FirstOrDefault().Name;
                                                    traingDetail.User = user;
                                                    trainings.Add(traingDetail);
                                                }
                                            }
                                            foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                            {
                                                IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                    .Where(ep => ep.Id == traingItem.Id)
                                                    .Select(t => new IpsTrainingModel()
                                                    {
                                                        AdditionalInfo = t.AdditionalInfo,
                                                        Duration = t.Duration,
                                                        DurationMetricId = t.DurationMetricId,
                                                        EmailBefore = t.EmailBefore,
                                                        EndDate = t.EndDate,
                                                        ExerciseMetricId = t.ExerciseMetricId,
                                                        Frequency = t.Frequency,
                                                        How = t.How,
                                                        HowMany = t.HowMany,
                                                        HowManyActions = t.HowManyActions,
                                                        HowManySets = t.HowManySets,
                                                        Id = t.Id,
                                                        IsActive = t.IsActive,
                                                        IsNotificationByEmail = t.IsNotificationByEmail,
                                                        IsNotificationBySMS = t.IsNotificationBySMS,
                                                        IsTemplate = t.IsTemplate,
                                                        LevelId = t.LevelId,
                                                        Name = t.Name,
                                                        NotificationTemplateId = t.NotificationTemplateId,
                                                        OrganizationId = t.OrganizationId,
                                                        SmsBefore = t.SmsBefore,
                                                        StartDate = t.StartDate,
                                                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                        {
                                                            FeedbackDateTime = f.FeedbackDateTime,
                                                            Id = f.Id,
                                                            Rating = f.Rating,
                                                            TaskId = f.TaskId,
                                                            TimeSpentMinutes = f.TimeSpentMinutes,
                                                            TrainingId = f.TrainingId,
                                                            WhatNextDescription = f.WhatNextDescription,
                                                            WorkedNotWell = f.WorkedNotWell,
                                                            WorkedWell = f.WorkedWell,
                                                            StartedAt = f.StartedAt,
                                                        }).ToList(),
                                                        IPSTrainingNotes = t.TrainingNotes.Select(f => new IPSTrainingNote
                                                        {
                                                            Id = f.Id,
                                                            TrainingId = f.TrainingId,
                                                            Goal = f.Goal,
                                                            OtherInfo = f.OtherInfo,
                                                            MeasureInfo = f.MeasureInfo,
                                                            ProceedInfo = f.ProceedInfo,
                                                        }).ToList(),
                                                        TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                        Skills = t.Skills.Select(s => new IpsSkillDDL
                                                        {
                                                            Id = s.Id,
                                                            Name = s.Name
                                                        }).ToList(),
                                                        Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                        {
                                                            PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                            {
                                                                Description = l.PerformanceGroup.Description,
                                                                Id = l.PerformanceGroup.Id,
                                                                Name = l.PerformanceGroup.Name,
                                                            }
                                                        }).ToList(),
                                                        TypeId = t.TypeId,
                                                        UserId = t.UserId,
                                                        What = t.What,
                                                        Why = t.Why
                                                    }).FirstOrDefault();
                                                if (traingDetail != null)
                                                {
                                                    if (!(traingDetail.Skills.Count > 0))
                                                    {
                                                        if (evaluationAgreement.Question.Skills.FirstOrDefault() != null)
                                                        {
                                                            traingDetail.Skills = evaluationAgreement.Question.Skills.Select(s => new IpsSkillDDL()
                                                            {
                                                                Id = s.Id,
                                                                Name = s.Name,
                                                            }).ToList();
                                                            traingDetail.SkillId = evaluationAgreement.Question.Skills.FirstOrDefault().Id;
                                                        }
                                                    }
                                                    traingDetail.User = user;
                                                    trainings.Add(traingDetail);
                                                }
                                            }
                                            evaluationAgreement.Trainings = trainings.OrderBy(x => x.Name).ToList();
                                            ipsTrainingDiaryStage.EvaluationAgreement.Add(evaluationAgreement);
                                            agreementIndex++;
                                        }
                                        List<IpsEvaluationAgreement> weakagreements = ipsTrainingDiaryStage.EvaluationAgreement.Where(x => x.KPIType == 1).ToList();
                                        weakagreements = weakagreements.OrderBy(x => x.Question.Skills.FirstOrDefault().Name).ToList();

                                        List<IpsEvaluationAgreement> strongagreements = ipsTrainingDiaryStage.EvaluationAgreement.Where(x => x.KPIType == 2).ToList();
                                        strongagreements = strongagreements.OrderBy(x => x.Question.Skills.FirstOrDefault().Name).ToList();

                                        ipsTrainingDiaryStage.EvaluationAgreement = weakagreements.Concat<IpsEvaluationAgreement>(strongagreements).ToList();

                                    }

                                    TrainingDiary.IpsTrainingDiaryStages.Add(ipsTrainingDiaryStage);

                                    //NeedToEvaluateTextQuestions(evaluator, stage.Id, stageModel.StageEvolutionId, profile.ProfileTypeId);
                                }
                            }
                            else
                            {
                                IpsTrainingDiaryStage ipsTrainingDiaryStage = new IpsTrainingDiaryStage();
                                ipsTrainingDiaryStage.Name = stage.Name;
                                ipsTrainingDiaryStage.Id = stage.Id;
                                ipsTrainingDiaryStage.StartDate = stage.StartDateTime;
                                ipsTrainingDiaryStage.EndDate = stage.EndDateTime;
                                ipsTrainingDiaryStage.EvaluationAgreement = _ipsDataContext.EvaluationAgreements
                                    .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.ParticipantId == participantId).OrderBy(c => c.KPIType)
                                    .Select(x => new IpsEvaluationAgreement()
                                    {
                                        Comment = x.Comment,
                                        EvaluationParticipant = x.EvaluationParticipant != null ? new IpsEvaluationParticipant()
                                        {
                                            EvaluateeId = x.EvaluationParticipant.EvaluateeId,
                                            EvaluationRoleId = x.EvaluationParticipant.EvaluationRoleId,
                                            Id = x.EvaluationParticipant.Id,
                                            IsLocked = x.EvaluationParticipant.IsLocked,
                                            IsScoreManager = x.EvaluationParticipant.IsScoreManager,
                                            IsSelfEvaluation = x.EvaluationParticipant.IsSelfEvaluation,
                                        } : null,
                                        FinalGoal = x.FinalGoal,
                                        FinalScore = x.FinalScore,
                                        Id = x.Id,
                                        KPIType = x.KPIType,
                                        LongGoal = x.LongGoal,
                                        MidGoal = x.MidGoal,
                                        ParticipantId = x.ParticipantId,
                                        Question = x.Question != null ? new IpsQuestionModel()
                                        {
                                            AnswerTypeId = x.Question.AnswerTypeId,
                                            Description = x.Question.Description,
                                            Id = x.Question.Id,
                                            IndustryId = x.Question.IndustryId,
                                            IsActive = x.Question.IsActive,
                                            IsTemplate = x.Question.IsTemplate,
                                            OrganizationId = x.Question.OrganizationId,
                                            ParentQuestionId = x.Question.ParentQuestionId,
                                            Points = x.Question.Points,
                                            ProfileTypeId = x.Question.ProfileTypeId,
                                            QuestionSettings = x.Question.QuestionSettings,
                                            QuestionText = x.Question.QuestionText,
                                            ScaleId = x.Question.ScaleId,
                                            SeqNo = x.Question.SeqNo,

                                            StructureLevelId = x.Question.StructureLevelId,
                                            TimeForQuestion = x.Question.TimeForQuestion,

                                        } : null,
                                        QuestionId = x.QuestionId,
                                        ShortGoal = x.ShortGoal,
                                        Stage = x.Stage != null ? new IpsStageModel()
                                        {
                                            EndDateTime = x.Stage.EndDateTime,
                                            Id = x.Stage.Id,
                                            Name = x.Stage.Name,
                                            StageGroupId = x.Stage.StageGroupId,
                                            StartDateTime = x.Stage.StartDateTime,
                                        } : null,
                                        StageId = x.StageId,
                                        Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                                        {
                                            AdditionalInfo = t.AdditionalInfo,
                                            Duration = t.Duration,
                                            DurationMetricId = t.DurationMetricId,
                                            EmailBefore = t.EmailBefore,
                                            EndDate = t.EndDate,
                                            ExerciseMetricId = t.ExerciseMetricId,
                                            Frequency = t.Frequency,
                                            How = t.How,
                                            HowMany = t.HowMany,
                                            HowManyActions = t.HowManyActions,
                                            HowManySets = t.HowManySets,
                                            Id = t.Id,
                                            IsActive = t.IsActive,
                                            IsNotificationByEmail = t.IsNotificationByEmail,
                                            IsNotificationBySMS = t.IsNotificationBySMS,
                                            IsTemplate = t.IsTemplate,
                                            LevelId = t.LevelId,
                                            Name = t.Name,
                                            NotificationTemplateId = t.NotificationTemplateId,
                                            OrganizationId = t.OrganizationId,
                                            SmsBefore = t.SmsBefore,
                                            StartDate = t.StartDate,
                                            TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                            {
                                                FeedbackDateTime = f.FeedbackDateTime,
                                                Id = f.Id,
                                                Rating = f.Rating,
                                                TaskId = f.TaskId,
                                                TimeSpentMinutes = f.TimeSpentMinutes,
                                                TrainingId = f.TrainingId,
                                                WhatNextDescription = f.WhatNextDescription,
                                                WorkedNotWell = f.WorkedNotWell,
                                                WorkedWell = f.WorkedWell,
                                                IsRecurrences = f.IsRecurrences,
                                                RecurrencesEndTime = f.RecurrencesEndTime,
                                                RecurrencesRule = f.RecurrencesRule,
                                                RecurrencesStartTime = f.RecurrencesStartTime,
                                                IsParticipantPaused = f.IsParticipantPaused,
                                                ParticipantPausedAt = f.ParticipantPausedAt,
                                                EvaluatorId = f.EvaluatorId,
                                                EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                StartedAt = f.StartedAt,
                                            }).ToList(),
                                            IPSTrainingNotes = t.TrainingNotes.Select(f => new IPSTrainingNote
                                            {
                                                Id = f.Id,
                                                TrainingId = f.TrainingId,
                                                Goal = f.Goal,
                                                OtherInfo = f.OtherInfo,
                                                MeasureInfo = f.MeasureInfo,
                                                ProceedInfo = f.ProceedInfo,
                                            }).ToList(),
                                            TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                            Skills = t.Skills.Select(s => new IpsSkillDDL
                                            {
                                                Id = s.Id,
                                                Name = s.Name
                                            }).ToList(),
                                            Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                            {
                                                PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                {
                                                    Description = l.PerformanceGroup.Description,
                                                    Id = l.PerformanceGroup.Id,
                                                    Name = l.PerformanceGroup.Name,
                                                }
                                            }).ToList(),
                                            TypeId = t.TypeId,
                                            UserId = t.UserId,
                                            What = t.What,
                                            Why = t.Why
                                        }).ToList(),
                                        MilestoneAgreementGoals = x.MilestoneAgreementGoals.Select(g => new IpsMilestoneAgreementGoal()
                                        {
                                            EvaluationAgreementId = g.EvaluationAgreementId,
                                            Goal = g.Goal,
                                            Id = g.Id,
                                            ParticipantId = g.ParticipantId,
                                            StageId = g.StageId
                                        }).ToList()
                                    }).ToList();

                                ipsTrainingDiaryStage.IsKPISet = evaluator.Answers.Any(a => stageIds.Contains((int)a.StageId) && a.KPIType > 0);
                                ipsTrainingDiaryStage.IsSelfEvaluation = evaluator.IsSelfEvaluation.HasValue ? evaluator.IsSelfEvaluation.Value : false;
                                if (ipsTrainingDiaryStage.EvaluationAgreement.Count() > 0)
                                {
                                    ipsTrainingDiaryStage.IsKPISet = true;

                                    List<IpsEvaluationAgreement> evalutionAgreements = ipsTrainingDiaryStage.EvaluationAgreement.ToList();
                                    ipsTrainingDiaryStage.EvaluationAgreement.Clear();
                                    int agreementIndex = 0;
                                    foreach (IpsEvaluationAgreement evaluationAgreement in evalutionAgreements)
                                    {

                                        if (evaluationAgreement.Question.Skills == null)
                                        {
                                            evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Skills).ToList()
                                                .Select(s => new IpsSkillDDL()
                                                {
                                                    Id = s.Id,
                                                    Name = s.Name,
                                                }).ToList();
                                            if (!(evaluationAgreement.Question.Skills.Count > 0))
                                            {
                                                evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Link_PerformanceGroupSkills).ToList()
                                              .Select(s => new IpsSkillDDL()
                                              {
                                                  Id = s.Skill != null ? s.Skill.Id : s.SkillId,
                                                  Name = s.Skill != null ? s.Skill.Name : _ipsDataContext.Skills.Where(x => x.Id == s.SkillId).Select(sk => sk.Name).FirstOrDefault(),
                                              }).ToList();
                                            }

                                        }
                                        List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();
                                        if (!string.IsNullOrEmpty(evaluationAgreement.Comment))
                                        {
                                            if (evaluationAgreement.KPIType > 0)
                                            {
                                                //evaluationAgreement.Question.Skills

                                                IpsTrainingModel traingDetail = new IpsTrainingModel();
                                                traingDetail.Id = agreementIndex * (-1);
                                                //traingDetail.Name = "Free Text";
                                                traingDetail.Name = evaluationAgreement.Question.Skills.FirstOrDefault().Name;
                                                traingDetail.SkillId = evaluationAgreement.Question.Skills.FirstOrDefault().Id;
                                                traingDetail.AdditionalInfo = evaluationAgreement.Comment;
                                                traingDetail.StartDate = stage.StartDateTime;
                                                traingDetail.EndDate = stage.EndDateTime;
                                                traingDetail.Skills = evaluationAgreement.Question.Skills.Select(s => new IpsSkillDDL()
                                                {
                                                    Id = s.Id,
                                                    Name = s.Name,
                                                }).ToList();
                                                traingDetail.User = user;
                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                 .Select(t => new IpsTrainingModel()
                                                 {
                                                     AdditionalInfo = t.AdditionalInfo,
                                                     Duration = t.Duration,
                                                     DurationMetricId = t.DurationMetricId,
                                                     EmailBefore = t.EmailBefore,
                                                     EndDate = t.EndDate,
                                                     ExerciseMetricId = t.ExerciseMetricId,
                                                     Frequency = t.Frequency,
                                                     How = t.How,
                                                     HowMany = t.HowMany,
                                                     HowManyActions = t.HowManyActions,
                                                     HowManySets = t.HowManySets,
                                                     Id = t.Id,
                                                     IsActive = t.IsActive,
                                                     IsNotificationByEmail = t.IsNotificationByEmail,
                                                     IsNotificationBySMS = t.IsNotificationBySMS,
                                                     IsTemplate = t.IsTemplate,
                                                     LevelId = t.LevelId,
                                                     Name = t.Name,
                                                     NotificationTemplateId = t.NotificationTemplateId,
                                                     OrganizationId = t.OrganizationId,
                                                     SmsBefore = t.SmsBefore,
                                                     StartDate = t.StartDate,
                                                     TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                     {
                                                         FeedbackDateTime = f.FeedbackDateTime,
                                                         Id = f.Id,
                                                         Rating = f.Rating,
                                                         TaskId = f.TaskId,
                                                         TimeSpentMinutes = f.TimeSpentMinutes,
                                                         TrainingId = f.TrainingId,
                                                         WhatNextDescription = f.WhatNextDescription,
                                                         WorkedNotWell = f.WorkedNotWell,
                                                         WorkedWell = f.WorkedWell,
                                                         IsRecurrences = f.IsRecurrences,
                                                         RecurrencesEndTime = f.RecurrencesEndTime,
                                                         RecurrencesRule = f.RecurrencesRule,
                                                         RecurrencesStartTime = f.RecurrencesStartTime,
                                                         IsParticipantPaused = f.IsParticipantPaused,
                                                         ParticipantPausedAt = f.ParticipantPausedAt,
                                                         EvaluatorId = f.EvaluatorId,
                                                         EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                         IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                         StartedAt = f.StartedAt,
                                                     }).ToList(),
                                                     IPSTrainingNotes = t.TrainingNotes.Select(f => new IPSTrainingNote
                                                     {
                                                         Id = f.Id,
                                                         TrainingId = f.TrainingId,
                                                         Goal = f.Goal,
                                                         OtherInfo = f.OtherInfo,
                                                         MeasureInfo = f.MeasureInfo,
                                                         ProceedInfo = f.ProceedInfo,
                                                     }).ToList(),
                                                     TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                     Skills = t.Skills.Select(s => new IpsSkillDDL
                                                     {
                                                         Id = s.Id,
                                                         Name = s.Name
                                                     }).ToList(),
                                                     Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                     {
                                                         PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                         {
                                                             Description = l.PerformanceGroup.Description,
                                                             Id = l.PerformanceGroup.Id,
                                                             Name = l.PerformanceGroup.Name,
                                                         }
                                                     }).ToList(),
                                                     TypeId = t.TypeId,
                                                     UserId = t.UserId,
                                                     What = t.What,
                                                     Why = t.Why
                                                 }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                if (!(traingDetail.Skills.Count > 0))
                                                {
                                                    if (evaluationAgreement.Question.Skills.FirstOrDefault() != null)
                                                    {
                                                        traingDetail.Skills = evaluationAgreement.Question.Skills.Select(s => new IpsSkillDDL()
                                                        {
                                                            Id = s.Id,
                                                            Name = s.Name,
                                                        }).ToList();
                                                        traingDetail.SkillId = evaluationAgreement.Question.Skills.FirstOrDefault().Id;
                                                    }
                                                }
                                                traingDetail.User = user;
                                                trainings.Add(traingDetail);
                                            }
                                        }
                                        evaluationAgreement.Trainings = trainings.OrderBy(x => x.Name).ToList();


                                        ipsTrainingDiaryStage.EvaluationAgreement.Add(evaluationAgreement);
                                        agreementIndex++;
                                    }
                                    List<IpsEvaluationAgreement> weakagreements = ipsTrainingDiaryStage.EvaluationAgreement.Where(x => x.KPIType == 1).ToList();

                                    weakagreements = weakagreements.OrderBy(x => x.Question.Skills.FirstOrDefault().Name).ToList();

                                    List<IpsEvaluationAgreement> strongagreements = ipsTrainingDiaryStage.EvaluationAgreement.Where(x => x.KPIType == 2).ToList();
                                    strongagreements = strongagreements.OrderBy(x => x.Question.Skills.FirstOrDefault().Name).ToList();

                                    ipsTrainingDiaryStage.EvaluationAgreement = weakagreements.Concat<IpsEvaluationAgreement>(strongagreements).ToList();
                                }

                                TrainingDiary.IpsTrainingDiaryStages.Add(ipsTrainingDiaryStage);
                            }

                        }
                        if (TrainingDiary.IpsTrainingDiaryStages.Count() > 0)
                        {
                            trainingDiary.Add(TrainingDiary);
                        }

                    }
                }
            }

            return trainingDiary;
        }
        public List<IpsTrainingModel> GetUserTrainingsForTimeCalculation(int userId)
        {
            List<IpsTrainingModel> ProfileTrainings = new List<IpsTrainingModel>();
            //get profiles to be executed

            List<IpsEvaluationParticipantProfileStagesAnswer> participants = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && (ep.UserId == userId))
               //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               .Select(x => new IpsEvaluationParticipantProfileStagesAnswer()
               {
                   EvaluateeId = x.EvaluateeId,
                   EvaluationRoleId = x.EvaluationRoleId,
                   Id = x.Id,
                   IsLocked = x.IsLocked,
                   IsScoreManager = x.IsScoreManager,
                   IsSelfEvaluation = x.IsSelfEvaluation,
                   StageGroup = new IpsStageGroupModel()
                   {
                       Id = x.StageGroup.Id,
                       DaysSpan = x.StageGroup.DaysSpan,
                       Description = x.StageGroup.Description,
                       EndDate = x.StageGroup.EndDate,
                       HoursSpan = x.StageGroup.HoursSpan,
                       MinutesSpan = x.StageGroup.MinutesSpan,
                       MonthsSpan = x.StageGroup.MonthsSpan,
                       ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                       Name = x.StageGroup.Name,
                       ParentParticipantId = x.StageGroup.ParentParticipantId,
                       ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                       Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                       {
                           Id = p.Id,
                           Name = p.Name,
                           ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                           IsActive = p.IsActive,
                           Project = p.Project != null ? new IpsProjectModel()
                           {
                               Id = p.Project.Id,
                               ExpectedEndDate = p.Project.ExpectedEndDate,
                               ExpectedStartDate = p.Project.ExpectedStartDate,
                               IsActive = p.Project.IsActive,
                               MissionStatement = p.Project.MissionStatement,
                               Name = p.Project.Name,
                               Summary = p.Project.Summary,
                               VisionStatement = p.Project.VisionStatement,
                           } : null,
                       }).ToList(),
                       Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                       {
                           EndDateTime = s.EndDateTime,
                           Id = s.Id,
                           Name = s.Name,
                           StageGroupId = s.StageGroupId,
                           StartDateTime = s.StartDateTime
                       }).ToList(),
                       StartDate = x.StageGroup.StartDate,
                       WeeksSpan = x.StageGroup.WeeksSpan
                   },
                   Answers = x.Answers.Select(a => new IpsAnswersModel()
                   {
                       Answer1 = a.Answer1,
                       Comment = a.Comment,
                       Id = a.Id,
                       IsCorrect = a.IsCorrect,
                       KPIType = a.KPIType,
                       ParticipantId = a.ParticipantId,
                       QuestionId = a.QuestionId,
                       StageId = a.StageId

                   }).ToList(),
                   EvaluationParticipant1 = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                   {
                       EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                       EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                       Id = x.EvaluationParticipant1.Id,
                       Invited = x.EvaluationParticipant1.Invited,
                       IsLocked = x.EvaluationParticipant1.IsLocked,
                       IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                       IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                       StageGroupId = x.EvaluationParticipant1.StageGroupId,
                       UserId = x.EvaluationParticipant1.UserId,
                   } : null,
                   StageGroupId = x.StageGroupId,
                   UserId = x.UserId,
               })
               .ToList();

            foreach (IpsEvaluationParticipantProfileStagesAnswer evaluator in participants)
            {


                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else
                    {
                        profile.EvalutorRoleId = evaluator.EvaluationRoleId;

                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();

                        List<int> stageIds = stages.Select(s => s.Id).ToList();
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant1 != null)
                            {
                                participantId = evaluator.EvaluationParticipant1.Id;
                                participantUserId = evaluator.EvaluationParticipant1.UserId;
                            }
                        }


                        for (var i = 0; i < stages.Count; i++)
                        {


                            IpsStageModel stage = stages[i];

                            if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                            {


                                List<IpsEvaluationAgreementItem> IpsEvaluationAgreementItems = GetKtFinalKPIEvaluationAgreementItems(profile.Id, stage.Id, null, participantId);
                                int agreementIndex = 0;

                                foreach (IpsEvaluationAgreementItem evaluationAgreement in IpsEvaluationAgreementItems)
                                {
                                    if (evaluationAgreement.InDevContract)
                                    {
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                .Select(t => new IpsTrainingModel()
                                                {
                                                    Duration = t.Duration,
                                                    DurationMetricId = t.DurationMetricId,
                                                    EndDate = t.EndDate,
                                                    Frequency = t.Frequency,
                                                    Id = t.Id,
                                                    IsActive = t.IsActive,
                                                    Name = t.Name,
                                                    StartDate = t.StartDate,
                                                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                    {
                                                        FeedbackDateTime = f.FeedbackDateTime,
                                                        Id = f.Id,
                                                        Rating = f.Rating,
                                                        TaskId = f.TaskId,
                                                        TimeSpentMinutes = f.TimeSpentMinutes,
                                                        TrainingId = f.TrainingId,
                                                        WhatNextDescription = f.WhatNextDescription,
                                                        WorkedNotWell = f.WorkedNotWell,
                                                        WorkedWell = f.WorkedWell,
                                                        StartedAt = f.StartedAt,
                                                    }).ToList(),
                                                    TypeId = t.TypeId,
                                                    UserId = t.UserId,
                                                }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                traingDetail.isProfileTraining = true;
                                                ProfileTrainings.Add(traingDetail);
                                            }
                                        }
                                    }
                                    agreementIndex++;
                                }
                                //NeedToEvaluateTextQuestions(evaluator, stage.Id, stageModel.StageEvolutionId, profile.ProfileTypeId);
                            }
                            else
                            {

                                List<IpsEvaluationAgreement> stageEvaluationAgreement = _ipsDataContext.EvaluationAgreements
                                    .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.ParticipantId == participantId).OrderBy(c => c.KPIType)
                                    .Select(x => new IpsEvaluationAgreement()
                                    {
                                        Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                                        {
                                            Duration = t.Duration,
                                            DurationMetricId = t.DurationMetricId,
                                            EndDate = t.EndDate,
                                            Frequency = t.Frequency,
                                            Id = t.Id,
                                            IsActive = t.IsActive,
                                            Name = t.Name,
                                            StartDate = t.StartDate,
                                            TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                            {
                                                FeedbackDateTime = f.FeedbackDateTime,
                                                Id = f.Id,
                                                Rating = f.Rating,
                                                TaskId = f.TaskId,
                                                TimeSpentMinutes = f.TimeSpentMinutes,
                                                TrainingId = f.TrainingId,
                                                WhatNextDescription = f.WhatNextDescription,
                                                WorkedNotWell = f.WorkedNotWell,
                                                WorkedWell = f.WorkedWell,
                                                IsRecurrences = f.IsRecurrences,
                                                RecurrencesEndTime = f.RecurrencesEndTime,
                                                RecurrencesRule = f.RecurrencesRule,
                                                RecurrencesStartTime = f.RecurrencesStartTime,
                                                IsParticipantPaused = f.IsParticipantPaused,
                                                ParticipantPausedAt = f.ParticipantPausedAt,
                                                EvaluatorId = f.EvaluatorId,
                                                EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                StartedAt = f.StartedAt,
                                            }).ToList(),
                                            UserId = t.UserId,

                                        }).ToList(),
                                    }).ToList();


                                if (stageEvaluationAgreement.Count() > 0)
                                {
                                    int agreementIndex = 0;
                                    foreach (IpsEvaluationAgreement evaluationAgreement in stageEvaluationAgreement)
                                    {
                                        foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                        {
                                            IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                .Where(ep => ep.Id == traingItem.Id)
                                                 .Select(t => new IpsTrainingModel()
                                                 {
                                                     Duration = t.Duration,
                                                     DurationMetricId = t.DurationMetricId,
                                                     EndDate = t.EndDate,
                                                     Frequency = t.Frequency,
                                                     Id = t.Id,
                                                     IsActive = t.IsActive,
                                                     Name = t.Name,
                                                     StartDate = t.StartDate,
                                                     TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                     {
                                                         FeedbackDateTime = f.FeedbackDateTime,
                                                         Id = f.Id,
                                                         Rating = f.Rating,
                                                         TaskId = f.TaskId,
                                                         TimeSpentMinutes = f.TimeSpentMinutes,
                                                         TrainingId = f.TrainingId,
                                                         WhatNextDescription = f.WhatNextDescription,
                                                         WorkedNotWell = f.WorkedNotWell,
                                                         WorkedWell = f.WorkedWell,
                                                         IsRecurrences = f.IsRecurrences,
                                                         RecurrencesEndTime = f.RecurrencesEndTime,
                                                         RecurrencesRule = f.RecurrencesRule,
                                                         RecurrencesStartTime = f.RecurrencesStartTime,
                                                         IsParticipantPaused = f.IsParticipantPaused,
                                                         ParticipantPausedAt = f.ParticipantPausedAt,
                                                         EvaluatorId = f.EvaluatorId,
                                                         EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                         IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                         StartedAt = f.StartedAt,
                                                     }).ToList(),
                                                     UserId = t.UserId,
                                                     EvalutorRoleId = profile.EvalutorRoleId
                                                 }).FirstOrDefault();
                                            if (traingDetail != null)
                                            {
                                                traingDetail.isProfileTraining = true;
                                                ProfileTrainings.Add(traingDetail);
                                            }
                                        }
                                        agreementIndex++;
                                    }

                                }
                            }

                        }

                    }
                }
            }

            List<IpsTrainingModel> OwnTraining = _ipsDataContext.Trainings
                          .Where(t => t.UserId == userId)
                          .Select(t => new IpsTrainingModel()
                          {
                              Duration = t.Duration,
                              DurationMetricId = t.DurationMetricId,
                              EndDate = t.EndDate,
                              Frequency = t.Frequency,
                              Id = t.Id,
                              IsActive = t.IsActive,
                              Name = t.Name,
                              StartDate = t.StartDate,
                              TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                              {
                                  FeedbackDateTime = f.FeedbackDateTime,
                                  Id = f.Id,
                                  Rating = f.Rating,
                                  TaskId = f.TaskId,
                                  TimeSpentMinutes = f.TimeSpentMinutes,
                                  TrainingId = f.TrainingId,
                                  WhatNextDescription = f.WhatNextDescription,
                                  WorkedNotWell = f.WorkedNotWell,
                                  WorkedWell = f.WorkedWell,
                                  IsRecurrences = f.IsRecurrences,
                                  RecurrencesEndTime = f.RecurrencesEndTime,
                                  RecurrencesRule = f.RecurrencesRule,
                                  RecurrencesStartTime = f.RecurrencesStartTime,
                                  IsParticipantPaused = f.IsParticipantPaused,
                                  ParticipantPausedAt = f.ParticipantPausedAt,
                                  EvaluatorId = f.EvaluatorId,
                                  EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                  IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                  StartedAt = f.StartedAt,
                              }).ToList(),
                              UserId = t.UserId,
                          })
                      .ToList();
            List<IpsTrainingModel> AllTrainings = new List<IpsTrainingModel>();
            AllTrainings.AddRange(OwnTraining);
            AllTrainings.AddRange(ProfileTrainings);
            return AllTrainings;
        }


        public List<IpsTrainingModel> GetUserPersonalTrainingsForToday(int userId)
        {
            DateTime startDateToday = DateTime.Now;
            DateTime endDateToday = DateTime.Today.AddDays(1);

            List<IpsTrainingModel> OwnTraining = _ipsDataContext.Trainings
                          .Where(t => t.UserId == userId && ((t.StartDate <= startDateToday && t.EndDate >= startDateToday) || (t.StartDate >= startDateToday && t.StartDate < endDateToday)))
                          .Select(t => new IpsTrainingModel()
                          {
                              Duration = t.Duration,
                              DurationMetricId = t.DurationMetricId,
                              EndDate = t.EndDate,
                              Frequency = t.Frequency,
                              Id = t.Id,
                              IsActive = t.IsActive,
                              Name = t.Name,
                              StartDate = t.StartDate,
                              TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                              {
                                  FeedbackDateTime = f.FeedbackDateTime,
                                  Id = f.Id,
                                  Rating = f.Rating,
                                  TaskId = f.TaskId,
                                  TimeSpentMinutes = f.TimeSpentMinutes,
                                  TrainingId = f.TrainingId,
                                  WhatNextDescription = f.WhatNextDescription,
                                  WorkedNotWell = f.WorkedNotWell,
                                  WorkedWell = f.WorkedWell,
                                  IsRecurrences = f.IsRecurrences,
                                  RecurrencesEndTime = f.RecurrencesEndTime,
                                  RecurrencesRule = f.RecurrencesRule,
                                  RecurrencesStartTime = f.RecurrencesStartTime,
                                  IsParticipantPaused = f.IsParticipantPaused,
                                  ParticipantPausedAt = f.ParticipantPausedAt,
                                  EvaluatorId = f.EvaluatorId,
                                  EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                  IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                  StartedAt = f.StartedAt,
                              }).ToList(),
                              UserId = t.UserId,
                          })
                      .ToList();
            List<IpsTrainingModel> AllTrainings = new List<IpsTrainingModel>();
            AllTrainings.AddRange(OwnTraining);
            return AllTrainings;
        }
        public List<IpsTrainingModel> GetUserProfileTrainingsForToday(int userId)
        {
            //get profiles to be executed
            List<IpsTrainingModel> results = new List<IpsTrainingModel>();
            List<IpsTrainingDiary> fullProfileTrainingDiary = GetUserActiveProfilesForToday(userId);
            foreach (IpsTrainingDiary td in fullProfileTrainingDiary)
            {
                List<IpsTrainingModel> profileTrainings = GetUserProfileStageTrainingsForToday(userId, td.Profile.Id);
                results.AddRange(profileTrainings);
            }
            return results;
        }


        public List<IpsProjectTrainingModel> GetProjectTrainings(int projectId)
        {
            DateTime todayDate = DateTime.Now;
            List<IpsProjectTrainingModel> allTrainings = new List<IpsProjectTrainingModel>();


            List<IpsEvaluationParticipantProfileStagesAnswer> participants = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false && ep.StageGroup.Profiles.Any(p => p.ProjectId == projectId))
               //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false) && ep.StageGroup.Profiles.Any(p => p.Id == profileId))
               .Select(x => new IpsEvaluationParticipantProfileStagesAnswer()
               {
                   EvaluateeId = x.EvaluateeId,
                   EvaluationRoleId = x.EvaluationRoleId,
                   Id = x.Id,
                   IsLocked = x.IsLocked,
                   IsScoreManager = x.IsScoreManager,
                   IsSelfEvaluation = x.IsSelfEvaluation,
                   StageGroup = new IpsStageGroupModel()
                   {
                       Id = x.StageGroup.Id,
                       DaysSpan = x.StageGroup.DaysSpan,
                       Description = x.StageGroup.Description,
                       EndDate = x.StageGroup.EndDate,
                       HoursSpan = x.StageGroup.HoursSpan,
                       MinutesSpan = x.StageGroup.MinutesSpan,
                       MonthsSpan = x.StageGroup.MonthsSpan,
                       ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                       Name = x.StageGroup.Name,
                       ParentParticipantId = x.StageGroup.ParentParticipantId,
                       ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                       Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                       {
                           Id = p.Id,
                           Name = p.Name,
                           ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                           IsActive = p.IsActive,
                           Project = p.Project != null ? new IpsProjectModel()
                           {
                               Id = p.Project.Id,
                               ExpectedEndDate = p.Project.ExpectedEndDate,
                               ExpectedStartDate = p.Project.ExpectedStartDate,
                               IsActive = p.Project.IsActive,
                               MissionStatement = p.Project.MissionStatement,
                               Name = p.Project.Name,
                               Summary = p.Project.Summary,
                               VisionStatement = p.Project.VisionStatement,
                           } : null,
                       }).ToList(),
                       Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                       {
                           EndDateTime = s.EndDateTime,
                           Id = s.Id,
                           Name = s.Name,
                           StageGroupId = s.StageGroupId,
                           StartDateTime = s.StartDateTime
                       }).ToList(),
                       StartDate = x.StageGroup.StartDate,
                       WeeksSpan = x.StageGroup.WeeksSpan
                   },
                   Answers = x.Answers.Select(a => new IpsAnswersModel()
                   {
                       Answer1 = a.Answer1,
                       Comment = a.Comment,
                       Id = a.Id,
                       IsCorrect = a.IsCorrect,
                       KPIType = a.KPIType,
                       ParticipantId = a.ParticipantId,
                       QuestionId = a.QuestionId,
                       StageId = a.StageId
                   }).ToList(),
                   EvaluationParticipant1 = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                   {
                       EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                       EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                       Id = x.EvaluationParticipant1.Id,
                       Invited = x.EvaluationParticipant1.Invited,
                       IsLocked = x.EvaluationParticipant1.IsLocked,
                       IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                       IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                       StageGroupId = x.EvaluationParticipant1.StageGroupId,
                       UserId = x.EvaluationParticipant1.UserId,
                   } : null,
                   StageGroupId = x.StageGroupId,
                   UserId = x.UserId,
               })
               .ToList();

            foreach (IpsEvaluationParticipantProfileStagesAnswer evaluator in participants)
            {
                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive && profileInfo.Project.Id == projectId)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else
                    {
                        if (!evaluator.IsScoreManager)
                        {
                            profile.EvalutorRoleId = evaluator.EvaluationRoleId;

                            List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();

                            List<int> stageIds = stages.Select(s => s.Id).ToList();
                            int participantId = evaluator.Id;
                            int participantUserId = 0;
                            if (evaluator.IsSelfEvaluation == true)
                            {
                                participantId = evaluator.Id;
                                participantUserId = evaluator.UserId;
                            }
                            else
                            {
                                if (evaluator.EvaluationParticipant1 != null)
                                {
                                    participantId = evaluator.EvaluationParticipant1.Id;
                                    participantUserId = evaluator.EvaluationParticipant1.UserId;
                                }
                            }

                            IpsUserModel user = evaluator.EvaluationParticipant1 != null ? _ipsDataContext.Users.Select(u => new IpsUserModel()
                            {
                                Id = u.Id,
                                Email = u.WorkEmail,
                                FirstName = u.FirstName,
                                ImageUrl = u.ImagePath,
                                IsActive = u.IsActive,
                                LastName = u.LastName,
                                OrganizationName = u.Organization.Name,
                            }).FirstOrDefault(u => u.Id == evaluator.EvaluationParticipant1.UserId) : null;
                            if (user == null)
                            {
                                user = _ipsDataContext.Users.Select(u => new IpsUserModel()
                                {
                                    Id = u.Id,
                                    Email = u.WorkEmail,
                                    FirstName = u.FirstName,
                                    ImageUrl = u.ImagePath,
                                    IsActive = u.IsActive,
                                    LastName = u.LastName,
                                    OrganizationName = u.Organization.Name,
                                }).FirstOrDefault(u => u.Id == evaluator.UserId);
                            }

                            for (var i = 0; i < stages.Count; i++)
                            {
                                IpsStageModel stage = stages[i];

                                if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                                {
                                    var stagesEvolution =
                                        _ipsDataContext.StagesEvolutions
                                        .Where(
                                            x => x.OriginalStageId == stage.Id && x.ParticipantId == evaluator.Id).OrderBy(x => x.StartDate).ToList();
                                    SurveyService _surveyService = new SurveyService();

                                    for (int j = 0; j < stagesEvolution.Count; j++)
                                    {

                                        List<IpsEvaluationAgreement> ipsEvaluationAgreements = new List<IpsEvaluationAgreement>();

                                        var stageEvo = stagesEvolution[j];


                                        List<IpsEvaluationAgreementItem> IpsEvaluationAgreementItems = GetKtFinalKPIEvaluationAgreementItems(profile.Id, stage.Id, null, participantId);
                                        int agreementIndex = 0;

                                        foreach (IpsEvaluationAgreementItem evaluationAgreement in IpsEvaluationAgreementItems)
                                        {

                                            List<IpsTrainingModel> trainings = new List<IpsTrainingModel>();

                                            foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                            {
                                                IpsTrainingModel traingDetail = _ipsDataContext.Trainings
                                                    .Where(ep => ep.Id == traingItem.Id)
                                                    .Select(t => new IpsTrainingModel()
                                                    {
                                                        AdditionalInfo = t.AdditionalInfo,
                                                        Duration = t.Duration,
                                                        DurationMetricId = t.DurationMetricId,
                                                        EmailBefore = t.EmailBefore,
                                                        EndDate = t.EndDate,
                                                        ExerciseMetricId = t.ExerciseMetricId,
                                                        Frequency = t.Frequency,
                                                        How = t.How,
                                                        HowMany = t.HowMany,
                                                        HowManyActions = t.HowManyActions,
                                                        HowManySets = t.HowManySets,
                                                        Id = t.Id,
                                                        IsActive = t.IsActive,
                                                        IsNotificationByEmail = t.IsNotificationByEmail,
                                                        IsNotificationBySMS = t.IsNotificationBySMS,
                                                        IsTemplate = t.IsTemplate,
                                                        LevelId = t.LevelId,
                                                        Name = t.Name,
                                                        NotificationTemplateId = t.NotificationTemplateId,
                                                        OrganizationId = t.OrganizationId,
                                                        SmsBefore = t.SmsBefore,
                                                        StartDate = t.StartDate,
                                                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                        {
                                                            FeedbackDateTime = f.FeedbackDateTime,
                                                            Id = f.Id,
                                                            Rating = f.Rating,
                                                            TaskId = f.TaskId,
                                                            TimeSpentMinutes = f.TimeSpentMinutes,
                                                            TrainingId = f.TrainingId,
                                                            WhatNextDescription = f.WhatNextDescription,
                                                            WorkedNotWell = f.WorkedNotWell,
                                                            WorkedWell = f.WorkedWell,
                                                            StartedAt = f.StartedAt,
                                                        }).ToList(),
                                                        TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                        Skills = t.Skills.Select(s => new IpsSkillDDL
                                                        {
                                                            Id = s.Id,
                                                            Name = s.Name
                                                        }).ToList(),
                                                        Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                        {
                                                            PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                            {
                                                                Description = l.PerformanceGroup.Description,
                                                                Id = l.PerformanceGroup.Id,
                                                                Name = l.PerformanceGroup.Name,
                                                            }
                                                        }).ToList(),
                                                        TypeId = t.TypeId,
                                                        UserId = t.UserId,
                                                        What = t.What,
                                                        Why = t.Why
                                                    }).FirstOrDefault();
                                                if (traingDetail != null)
                                                {
                                                    traingDetail.User = user;
                                                    trainings.Add(traingDetail);
                                                }
                                            }
                                            if (evaluationAgreement.InDevContract)
                                            {


                                                IpsEvaluationAgreement agreement = new IpsEvaluationAgreement();
                                                agreement.Comment = evaluationAgreement.Comment;
                                                agreement.Question = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.QuestionId).Select(q => new IpsQuestionModel()
                                                {
                                                    AnswerTypeId = q.AnswerTypeId,
                                                    Description = q.Description,
                                                    Id = q.Id,
                                                    IndustryId = q.IndustryId,
                                                    IsActive = q.IsActive,
                                                    IsTemplate = q.IsTemplate,
                                                    OrganizationId = q.OrganizationId,
                                                    ParentQuestionId = q.ParentQuestionId,
                                                    Points = q.Points,
                                                    ProfileTypeId = q.ProfileTypeId,
                                                    QuestionSettings = q.QuestionSettings,
                                                    QuestionText = q.QuestionText,
                                                    ScaleId = q.ScaleId,
                                                    SeqNo = q.SeqNo,

                                                    StructureLevelId = q.StructureLevelId,
                                                    TimeForQuestion = q.TimeForQuestion,
                                                    //Skills = q.Skills != null ? (q.Skills.Select(s => new IpsSkillDDL()
                                                    //{
                                                    //    Id = s.Id,
                                                    //    Name = s.Name,
                                                    //}).ToList()) : (q.Link_PerformanceGroupSkills.Select(s => new IpsSkillDDL()
                                                    //{
                                                    //    Id = s.Skill.Id,
                                                    //    Name = s.Skill.Name,
                                                    //}).ToList()),

                                                }).FirstOrDefault();
                                                agreement.Stage = stage;
                                                agreement.KPIType = evaluationAgreement.IsCorrect ? 2 : 1;
                                                agreement.Trainings = trainings.OrderBy(x => x.Name).ToList();
                                                if (agreement.Question.Skills == null)
                                                {
                                                    agreement.Question.Skills = evaluationAgreement.Skills;
                                                }
                                                ipsEvaluationAgreements.Add(agreement);
                                            }

                                            agreementIndex++;
                                        }

                                        if (ipsEvaluationAgreements.Count() > 0)
                                        {
                                            ipsEvaluationAgreements = ipsEvaluationAgreements.OrderBy(x => x.KPIType).ToList();

                                            List<IpsEvaluationAgreement> evalutionAgreements = ipsEvaluationAgreements.ToList();
                                            ipsEvaluationAgreements.Clear();
                                            agreementIndex = 0;
                                            foreach (IpsEvaluationAgreement evaluationAgreement in evalutionAgreements)
                                            {
                                                List<IpsProjectTrainingModel> trainings = new List<IpsProjectTrainingModel>();

                                                foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                                {
                                                    IpsProjectTrainingModel traingDetail = _ipsDataContext.Trainings
                                                        .Where(ep => ep.Id == traingItem.Id)
                                                        .Select(t => new IpsProjectTrainingModel()
                                                        {
                                                            EndDate = t.EndDate,
                                                            Frequency = t.Frequency,
                                                            How = t.How,
                                                            Id = t.Id,
                                                            Name = t.Name,
                                                            StartDate = t.StartDate,
                                                            TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                            {
                                                                FeedbackDateTime = f.FeedbackDateTime,
                                                                Id = f.Id,
                                                                Rating = f.Rating,
                                                                TaskId = f.TaskId,
                                                                TimeSpentMinutes = f.TimeSpentMinutes,
                                                                TrainingId = f.TrainingId,
                                                                WhatNextDescription = f.WhatNextDescription,
                                                                WorkedNotWell = f.WorkedNotWell,
                                                                WorkedWell = f.WorkedWell,
                                                                StartedAt = f.StartedAt,
                                                            }).ToList(),
                                                            TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                            Skills = t.Skills.Select(s => new IpsSkillDDL
                                                            {
                                                                Id = s.Id,
                                                                Name = s.Name
                                                            }).ToList(),
                                                            Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                            {
                                                                PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                                {
                                                                    Description = l.PerformanceGroup.Description,
                                                                    Id = l.PerformanceGroup.Id,
                                                                    Name = l.PerformanceGroup.Name,
                                                                }
                                                            }).ToList(),
                                                            UserId = t.UserId,
                                                            What = t.What,
                                                            Why = t.Why,
                                                            DurationMetricId = t.DurationMetricId,
                                                            Duration = t.Duration,
                                                        }).FirstOrDefault();
                                                    if (traingDetail != null)
                                                    {
                                                        traingDetail.User = user;
                                                        traingDetail.profile = profile;
                                                        trainings.Add(traingDetail);
                                                    }
                                                }
                                                allTrainings.AddRange(trainings);
                                                agreementIndex++;
                                            }
                                        }
                                    }
                                }
                                else
                                {

                                    List<IpsEvaluationAgreement> aggrements = _ipsDataContext.EvaluationAgreements
                                        .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.ParticipantId == participantId).OrderBy(c => c.KPIType)
                                        .Select(x => new IpsEvaluationAgreement()
                                        {
                                            Comment = x.Comment,
                                            EvaluationParticipant = x.EvaluationParticipant != null ? new IpsEvaluationParticipant()
                                            {
                                                EvaluateeId = x.EvaluationParticipant.EvaluateeId,
                                                EvaluationRoleId = x.EvaluationParticipant.EvaluationRoleId,
                                                Id = x.EvaluationParticipant.Id,
                                                IsLocked = x.EvaluationParticipant.IsLocked,
                                                IsScoreManager = x.EvaluationParticipant.IsScoreManager,
                                                IsSelfEvaluation = x.EvaluationParticipant.IsSelfEvaluation,
                                            } : null,
                                            FinalGoal = x.FinalGoal,
                                            FinalScore = x.FinalScore,
                                            Id = x.Id,
                                            KPIType = x.KPIType,
                                            LongGoal = x.LongGoal,
                                            MidGoal = x.MidGoal,
                                            ParticipantId = x.ParticipantId,
                                            Question = x.Question != null ? new IpsQuestionModel()
                                            {
                                                AnswerTypeId = x.Question.AnswerTypeId,
                                                Description = x.Question.Description,
                                                Id = x.Question.Id,
                                                IndustryId = x.Question.IndustryId,
                                                IsActive = x.Question.IsActive,
                                                IsTemplate = x.Question.IsTemplate,
                                                OrganizationId = x.Question.OrganizationId,
                                                ParentQuestionId = x.Question.ParentQuestionId,
                                                Points = x.Question.Points,
                                                ProfileTypeId = x.Question.ProfileTypeId,
                                                QuestionSettings = x.Question.QuestionSettings,
                                                QuestionText = x.Question.QuestionText,
                                                ScaleId = x.Question.ScaleId,
                                                SeqNo = x.Question.SeqNo,

                                                StructureLevelId = x.Question.StructureLevelId,
                                                TimeForQuestion = x.Question.TimeForQuestion,

                                            } : null,
                                            QuestionId = x.QuestionId,
                                            ShortGoal = x.ShortGoal,
                                            Stage = x.Stage != null ? new IpsStageModel()
                                            {
                                                EndDateTime = x.Stage.EndDateTime,
                                                Id = x.Stage.Id,
                                                Name = x.Stage.Name,
                                                StageGroupId = x.Stage.StageGroupId,
                                                StartDateTime = x.Stage.StartDateTime,
                                            } : null,
                                            StageId = x.StageId,
                                            Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                                            {
                                                AdditionalInfo = t.AdditionalInfo,
                                                Duration = t.Duration,
                                                DurationMetricId = t.DurationMetricId,
                                                EmailBefore = t.EmailBefore,
                                                EndDate = t.EndDate,
                                                ExerciseMetricId = t.ExerciseMetricId,
                                                Frequency = t.Frequency,
                                                How = t.How,
                                                HowMany = t.HowMany,
                                                HowManyActions = t.HowManyActions,
                                                HowManySets = t.HowManySets,
                                                Id = t.Id,
                                                IsActive = t.IsActive,
                                                IsNotificationByEmail = t.IsNotificationByEmail,
                                                IsNotificationBySMS = t.IsNotificationBySMS,
                                                IsTemplate = t.IsTemplate,
                                                LevelId = t.LevelId,
                                                Name = t.Name,
                                                NotificationTemplateId = t.NotificationTemplateId,
                                                OrganizationId = t.OrganizationId,
                                                SmsBefore = t.SmsBefore,
                                                StartDate = t.StartDate,
                                                TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                {
                                                    FeedbackDateTime = f.FeedbackDateTime,
                                                    Id = f.Id,
                                                    Rating = f.Rating,
                                                    TaskId = f.TaskId,
                                                    TimeSpentMinutes = f.TimeSpentMinutes,
                                                    TrainingId = f.TrainingId,
                                                    WhatNextDescription = f.WhatNextDescription,
                                                    WorkedNotWell = f.WorkedNotWell,
                                                    WorkedWell = f.WorkedWell,
                                                    IsRecurrences = f.IsRecurrences,
                                                    RecurrencesEndTime = f.RecurrencesEndTime,
                                                    RecurrencesRule = f.RecurrencesRule,
                                                    RecurrencesStartTime = f.RecurrencesStartTime,
                                                    IsParticipantPaused = f.IsParticipantPaused,
                                                    ParticipantPausedAt = f.ParticipantPausedAt,
                                                    EvaluatorId = f.EvaluatorId,
                                                    EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                    IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                    StartedAt = f.StartedAt,
                                                }).ToList(),
                                                TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                Skills = t.Skills.Select(s => new IpsSkillDDL
                                                {
                                                    Id = s.Id,
                                                    Name = s.Name
                                                }).ToList(),
                                                Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                {
                                                    PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                    {
                                                        Description = l.PerformanceGroup.Description,
                                                        Id = l.PerformanceGroup.Id,
                                                        Name = l.PerformanceGroup.Name,
                                                    }
                                                }).ToList(),
                                                TypeId = t.TypeId,
                                                UserId = t.UserId,
                                                What = t.What,
                                                Why = t.Why
                                            }).ToList(),
                                            MilestoneAgreementGoals = x.MilestoneAgreementGoals.Select(g => new IpsMilestoneAgreementGoal()
                                            {
                                                EvaluationAgreementId = g.EvaluationAgreementId,
                                                Goal = g.Goal,
                                                Id = g.Id,
                                                ParticipantId = g.ParticipantId,
                                                StageId = g.StageId
                                            }).ToList()
                                        }).ToList();

                                    if (aggrements.Count() > 0)
                                    {

                                        List<IpsEvaluationAgreement> evalutionAgreements = aggrements.ToList();
                                        int agreementIndex = 0;
                                        foreach (IpsEvaluationAgreement evaluationAgreement in evalutionAgreements)
                                        {

                                            if (evaluationAgreement.Question.Skills == null)
                                            {
                                                evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Skills).ToList()
                                                    .Select(s => new IpsSkillDDL()
                                                    {
                                                        Id = s.Id,
                                                        Name = s.Name,
                                                    }).ToList();
                                                if (!(evaluationAgreement.Question.Skills.Count > 0))
                                                {

                                                    evaluationAgreement.Question.Skills = _ipsDataContext.Questions.Where(x => x.Id == evaluationAgreement.Question.Id).SelectMany(x => x.Link_PerformanceGroupSkills).ToList()
                                                  .Select(s => new IpsSkillDDL()
                                                  {
                                                      Id = s.Skill != null ? s.Skill.Id : s.SkillId,
                                                      Name = s.Skill != null ? s.Skill.Name : _ipsDataContext.Skills.Where(x => x.Id == s.SkillId).Select(sk => sk.Name).FirstOrDefault(),
                                                  }).ToList();
                                                }

                                            }
                                            List<IpsProjectTrainingModel> trainings = new List<IpsProjectTrainingModel>();
                                            foreach (IpsTrainingModel traingItem in evaluationAgreement.Trainings)
                                            {
                                                IpsProjectTrainingModel traingDetail = _ipsDataContext.Trainings
                                                    .Where(ep => ep.Id == traingItem.Id)
                                                     .Select(t => new IpsProjectTrainingModel()
                                                     {

                                                         EndDate = t.EndDate,

                                                         Frequency = t.Frequency,
                                                         How = t.How,

                                                         Id = t.Id,

                                                         Name = t.Name,

                                                         StartDate = t.StartDate,
                                                         TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                                         {
                                                             FeedbackDateTime = f.FeedbackDateTime,
                                                             Id = f.Id,
                                                             Rating = f.Rating,
                                                             TaskId = f.TaskId,
                                                             TimeSpentMinutes = f.TimeSpentMinutes,
                                                             TrainingId = f.TrainingId,
                                                             WhatNextDescription = f.WhatNextDescription,
                                                             WorkedNotWell = f.WorkedNotWell,
                                                             WorkedWell = f.WorkedWell,
                                                             IsRecurrences = f.IsRecurrences,
                                                             RecurrencesEndTime = f.RecurrencesEndTime,
                                                             RecurrencesRule = f.RecurrencesRule,
                                                             RecurrencesStartTime = f.RecurrencesStartTime,
                                                             IsParticipantPaused = f.IsParticipantPaused,
                                                             ParticipantPausedAt = f.ParticipantPausedAt,
                                                             EvaluatorId = f.EvaluatorId,
                                                             EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                                                             IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                                                             StartedAt = f.StartedAt,
                                                         }).ToList(),
                                                         TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                                         Skills = t.Skills.Select(s => new IpsSkillDDL
                                                         {
                                                             Id = s.Id,
                                                             Name = s.Name
                                                         }).ToList(),
                                                         Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                                         {
                                                             PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                                             {
                                                                 Description = l.PerformanceGroup.Description,
                                                                 Id = l.PerformanceGroup.Id,
                                                                 Name = l.PerformanceGroup.Name,
                                                             }
                                                         }).ToList(),
                                                         UserId = t.UserId,
                                                         What = t.What,
                                                         Why = t.Why,
                                                         DurationMetricId = t.DurationMetricId,
                                                         Duration = t.Duration,
                                                     }).FirstOrDefault();
                                                if (traingDetail != null)
                                                {
                                                    traingDetail.User = user;
                                                    traingDetail.profile = profile;
                                                    trainings.Add(traingDetail);
                                                }
                                            }
                                            allTrainings.AddRange(trainings.OrderBy(x => x.Name).ToList());
                                            agreementIndex++;
                                        }

                                    }


                                }

                            }

                        }
                    }
                }
            }

            return allTrainings;
        }

        public List<IpsTrainingDiary> GetUserPassedProfiles(int userId, DateTime StartDate, DateTime EndDate)
        {
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsTrainingDiary> trainingDiary = new List<IpsTrainingDiary>();

            List<IpsEvaluationParticipantProfileStages> participants = _ipsDataContext.EvaluationParticipants
                .Where(ep => ep.IsLocked == false && ((ep.UserId == userId) || ep.EvaluateeId == userId))
                 //.Where(ep => ep.IsLocked == false && (ep.UserId == userId && ep.IsScoreManager == false))
                 .Select(x => new IpsEvaluationParticipantProfileStages()
                 {
                     EvaluateeId = x.EvaluateeId,
                     EvaluationRoleId = x.EvaluationRoleId,
                     Id = x.Id,
                     IsLocked = x.IsLocked,
                     IsScoreManager = x.IsScoreManager,
                     IsSelfEvaluation = x.IsSelfEvaluation,
                     StageGroup = new IpsStageGroupModel()
                     {
                         Id = x.StageGroup.Id,
                         DaysSpan = x.StageGroup.DaysSpan,
                         Description = x.StageGroup.Description,
                         EndDate = x.StageGroup.EndDate,
                         HoursSpan = x.StageGroup.HoursSpan,
                         MinutesSpan = x.StageGroup.MinutesSpan,
                         MonthsSpan = x.StageGroup.MonthsSpan,
                         ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                         Name = x.StageGroup.Name,
                         ParentParticipantId = x.StageGroup.ParentParticipantId,
                         ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                         Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                         {
                             Id = p.Id,
                             Name = p.Name,
                             ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                             IsActive = p.IsActive,
                             Project = p.Project != null ? new IpsProjectModel()
                             {
                                 Id = p.Project.Id,
                                 ExpectedEndDate = p.Project.ExpectedEndDate,
                                 ExpectedStartDate = p.Project.ExpectedStartDate,
                                 IsActive = p.Project.IsActive,
                                 MissionStatement = p.Project.MissionStatement,
                                 Name = p.Project.Name,
                                 Summary = p.Project.Summary,
                                 VisionStatement = p.Project.VisionStatement,
                             } : null,
                         }).ToList(),
                         Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                         {
                             EndDateTime = s.EndDateTime,
                             Id = s.Id,
                             Name = s.Name,
                             StageGroupId = s.StageGroupId,
                             StartDateTime = s.StartDateTime
                         }).ToList(),
                         StartDate = x.StageGroup.StartDate,
                         WeeksSpan = x.StageGroup.WeeksSpan

                     },
                     EvaluationParticipant = x.EvaluationParticipant1 != null ? new IpsEvaluationParticipant()
                     {
                         EvaluateeId = x.EvaluationParticipant1.EvaluateeId,
                         EvaluationRoleId = x.EvaluationParticipant1.EvaluationRoleId,
                         Id = x.EvaluationParticipant1.Id,
                         Invited = x.EvaluationParticipant1.Invited,
                         IsLocked = x.EvaluationParticipant1.IsLocked,
                         IsScoreManager = x.EvaluationParticipant1.IsScoreManager,
                         IsSelfEvaluation = x.EvaluationParticipant1.IsSelfEvaluation,
                         StageGroupId = x.EvaluationParticipant1.StageGroupId,
                         UserId = x.EvaluationParticipant1.UserId,
                     } : null,
                 })
               .ToList();

            foreach (var evaluator in participants)
            {

                IpsTrainingDiary TrainingDiary = new IpsTrainingDiary();

                IpsProfile profileInfo = evaluator.StageGroup.Profiles.FirstOrDefault();
                if (profileInfo != null && profileInfo.IsActive)
                {
                    IpsProfile profile = new IpsProfile
                    {
                        Id = profileInfo.Id,
                        Name = profileInfo.Name,
                        ProfileTypeId = (ProfileTypeEnum)profileInfo.ProfileTypeId,
                        Project = profileInfo.Project != null ? new IpsProjectModel()
                        {
                            Id = profileInfo.Project.Id,
                            ExpectedEndDate = profileInfo.Project.ExpectedEndDate,
                            ExpectedStartDate = profileInfo.Project.ExpectedStartDate,
                            IsActive = profileInfo.Project.IsActive,
                            MissionStatement = profileInfo.Project.MissionStatement,
                            Name = profileInfo.Project.Name,
                            Summary = profileInfo.Project.Summary,
                            VisionStatement = profileInfo.Project.VisionStatement,
                        } : null,
                    };

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
                    {
                        continue;
                    }
                    else if (profile.ProfileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        continue;
                    }
                    else
                    {
                        TrainingDiary.Profile = profile;
                        int participantId = evaluator.Id;
                        int participantUserId = 0;
                        if (evaluator.IsSelfEvaluation == true)
                        {
                            participantId = evaluator.Id;
                            participantUserId = evaluator.UserId;
                        }
                        else
                        {
                            if (evaluator.EvaluationParticipant != null)
                            {
                                participantId = evaluator.EvaluationParticipant.Id;
                                participantUserId = evaluator.EvaluationParticipant.UserId;
                            }
                        }
                        TrainingDiary.Profile.ParticipantUserId = participantUserId;
                        List<IpsStageModel> stages = evaluator.StageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                        if (!stages.Any(x => x.StartDateTime < todayDate && x.EndDateTime > todayDate))
                        {
                            if (stages.Any(x => x.StartDateTime > StartDate && x.EndDateTime < EndDate))
                            {
                                trainingDiary.Add(TrainingDiary);
                            }
                        }
                    }
                }
            }

            return trainingDiary;
        }

        public TrainingFeedback AddTrainingFeedback(TrainingFeedback trainingFeedback)
        {

            Training training = _ipsDataContext.Trainings.Where(t => t.Id == trainingFeedback.TrainingId).FirstOrDefault();
            if (training != null)
            {
                if (trainingFeedback.IsParticipantPaused)
                {
                    trainingFeedback.ParticipantPausedAt = DateTime.Now;
                    _ipsDataContext.TrainingFeedbacks.Add(trainingFeedback);
                }
                else
                {
                    trainingFeedback.FeedbackDateTime = DateTime.Now;
                    _ipsDataContext.TrainingFeedbacks.Add(trainingFeedback);

                    List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(training.Frequency, (DateTime)training.StartDate, (DateTime)training.EndDate);
                    int index = 1;
                    foreach (DateTime recurrence in recurrencesTask)
                    {
                        if (training.IsNotificationByEmail)
                        {
                            DateTime recurrenceStartTime = recurrence;
                            DateTime recurrenceEndTime = recurrence.AddMinutes(30);
                            if ((index % training.EvaluatorFeedbackRecurrence) == 0)
                            {
                                // Send Notification to Evaluator
                                int evaluatorId = 0;
                                int EvaluationAgreementsId = _ipsDataContext.Trainings.Where(x => x.Id == training.Id).Select(x => x.EvaluationAgreements.FirstOrDefault().Id).FirstOrDefault();
                                EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationAgreements.Where(x => x.Id == EvaluationAgreementsId).Select(x => x.EvaluationParticipant).FirstOrDefault();
                                evaluatorId = (evaluationParticipant.IsSelfEvaluation == true) ? evaluationParticipant.UserId : evaluationParticipant.EvaluateeId.HasValue ? evaluationParticipant.EvaluateeId.Value : 0;
                                TrainingFeedback lastFeedBack = _ipsDataContext.TrainingFeedbacks.Where(x => x.Id == training.Id && x.IsEvaluatorFeedBack == true && x.EvaluatorId == evaluatorId).LastOrDefault();
                                if (recurrenceStartTime > lastFeedBack.RecurrencesStartTime)
                                {
                                    TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                    evaluatorTrainingFeedback.WhatNextDescription = "";
                                    evaluatorTrainingFeedback.WorkedNotWell = "";
                                    evaluatorTrainingFeedback.WorkedWell = "";
                                    evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                    _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                    // Send Email Notifciation
                                }
                            }
                            else if ((index + 1) == recurrencesTask.Count)
                            {
                                int evaluatorId = 0;
                                int EvaluationAgreementsId = _ipsDataContext.Trainings.Where(x => x.Id == training.Id).Select(x => x.EvaluationAgreements.FirstOrDefault().Id).FirstOrDefault();
                                EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationAgreements.Where(x => x.Id == EvaluationAgreementsId).Select(x => x.EvaluationParticipant).FirstOrDefault();
                                evaluatorId = (evaluationParticipant.IsSelfEvaluation == true) ? evaluationParticipant.UserId : evaluationParticipant.EvaluateeId.HasValue ? evaluationParticipant.EvaluateeId.Value : 0;
                                TrainingFeedback lastFeedBack = _ipsDataContext.TrainingFeedbacks.Where(x => x.Id == training.Id && x.IsEvaluatorFeedBack == true && x.EvaluatorId == evaluatorId).LastOrDefault();
                                if (recurrenceStartTime > lastFeedBack.RecurrencesStartTime)
                                {
                                    TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                    evaluatorTrainingFeedback.WhatNextDescription = "";
                                    evaluatorTrainingFeedback.WorkedNotWell = "";
                                    evaluatorTrainingFeedback.WorkedWell = "";
                                    evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                    _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                    // Send Email Notifciation
                                }
                            }
                        }
                        index++;
                    }
                }

                _ipsDataContext.SaveChanges();
            }
            return trainingFeedback;
        }
        public int UpdateTrainingFeedback(TrainingFeedback trainingFeedback)
        {
            int result = 0;
            if (trainingFeedback.Id > 0)
            {
                TrainingFeedback original = _ipsDataContext.TrainingFeedbacks.Where(x => x.Id == trainingFeedback.Id).FirstOrDefault();
                if (original != null)
                {
                    TrainingFeedback newTrainingFeedback = original;
                    newTrainingFeedback.WhatNextDescription = trainingFeedback.WhatNextDescription;
                    newTrainingFeedback.WorkedNotWell = trainingFeedback.WorkedNotWell;
                    newTrainingFeedback.WorkedWell = trainingFeedback.WorkedWell;
                    newTrainingFeedback.Rating = trainingFeedback.Rating;
                    newTrainingFeedback.FeedbackDateTime = DateTime.Now;
                    newTrainingFeedback.TimeSpentMinutes = trainingFeedback.TimeSpentMinutes;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(newTrainingFeedback);
                    result = _ipsDataContext.SaveChanges();
                }
            }
            return result;
        }

        public List<IPSTrainingFeedback> getTrainingFeedbacks(int trainningId)
        {
            return _ipsDataContext.TrainingFeedbacks.Where(x => x.TrainingId == trainningId).Select(f => new IPSTrainingFeedback()
            {
                FeedbackDateTime = f.FeedbackDateTime,
                Id = f.Id,
                Rating = f.Rating,
                TaskId = f.TaskId,
                TimeSpentMinutes = f.TimeSpentMinutes,
                TrainingId = f.TrainingId,
                WhatNextDescription = f.WhatNextDescription,
                WorkedNotWell = f.WorkedNotWell,
                WorkedWell = f.WorkedWell
            }).ToList();
        }

        public IPSTrainingFeedback getTrainingFeedbackById(int trainingFeedbackId)
        {
            return _ipsDataContext.TrainingFeedbacks.Where(x => x.Id == trainingFeedbackId).Select(f => new IPSTrainingFeedback()
            {
                FeedbackDateTime = f.FeedbackDateTime,
                Id = f.Id,
                Rating = f.Rating,
                TaskId = f.TaskId,
                TimeSpentMinutes = f.TimeSpentMinutes,
                TrainingId = f.TrainingId,
                WhatNextDescription = f.WhatNextDescription,
                WorkedNotWell = f.WorkedNotWell,
                WorkedWell = f.WorkedWell
            }).FirstOrDefault();

        }

        public List<IPSTrainingNote> getTrainingNotes(int trainingId)
        {
            return _ipsDataContext.TrainingNotes.Where(x => x.TrainingId == trainingId).Select(f => new IPSTrainingNote()
            {
                Id = f.Id,
                Goal = f.Goal,
                MeasureInfo = f.MeasureInfo,
                TrainingId = f.TrainingId,
                OtherInfo = f.OtherInfo,
                ProceedInfo = f.ProceedInfo,
            }).ToList();
        }

        public List<Training> GetAllPersonalTrainingsForEmail()
        {
            List<Training> result = new List<Training>();
            DateTime now = DateTime.Now;
            DateTime lastDate = now.AddMinutes(5);
            List<Training> trainings = _ipsDataContext.Trainings.Where(x => x.UserId > 0 && x.IsNotificationByEmail == true && x.StartDate > now).ToList();
            foreach (Training training in trainings)
            {
                double remindBefore = (Double)((training.EmailBefore == null) ? -60 : training.EmailBefore);
                if (training.StartDate.HasValue)
                {
                    if (training.StartDate.Value.AddMinutes(remindBefore) > now && training.StartDate.Value.AddMinutes(remindBefore) < lastDate)
                    {
                        training.StartDate = training.StartDate.Value.AddMinutes(remindBefore);
                        result.Add(training);
                    }
                }
            }
            return result;

        }
        public List<Training> GetAllPersonalTrainingRecurrencesForEmail()
        {
            DateTime now = DateTime.Now;
            List<Training> result = new List<Training>();
            List<Training> trainings = _ipsDataContext.Trainings.Where(x => x.UserId > 0 && x.IsNotificationByEmail == true && x.StartDate < now && x.EndDate > now).ToList();
            foreach (Training training in trainings)
            {
                double remindBefore = (Double)((training.EmailBefore == null) ? -60 : training.EmailBefore);
                List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(training.Frequency, (DateTime)training.StartDate, (DateTime)training.EndDate);
                foreach (DateTime recurrence in recurrencesTask)
                {
                    if (recurrence.AddMinutes(remindBefore) > now && recurrence.AddMinutes(remindBefore) < now.AddMinutes(5))
                    {
                        training.StartDate = recurrence.AddMinutes(remindBefore);
                        training.EndDate = recurrence.Date.AddDays(1).AddMinutes(-1);
                        result.Add(training);
                    }
                }
            }
            return result;
        }
        public List<Training> GetAllPersonalTrainingsForSMS()
        {
            List<Training> result = new List<Training>();
            DateTime now = DateTime.Now;
            DateTime lastDate = now.AddMinutes(5);
            List<Training> trainings = _ipsDataContext.Trainings.Where(x => x.UserId > 0 && x.IsNotificationBySMS == true && x.StartDate > now).ToList();
            foreach (Training training in trainings)
            {
                double remindBefore = (Double)((training.SmsBefore == null) ? -60 : training.SmsBefore);
                if (training.StartDate.HasValue)
                {
                    if (training.StartDate.Value.AddMinutes(remindBefore) > now && training.StartDate.Value.AddMinutes(remindBefore) < lastDate)
                    {
                        training.StartDate = training.StartDate.Value.AddMinutes(remindBefore);
                        result.Add(training);
                    }
                }
            }
            return result;

        }
        public List<Training> GetAllPersonalTrainingRecurrencesForSMS()
        {
            DateTime now = DateTime.Now;
            List<Training> result = new List<Training>();
            List<Training> trainings = _ipsDataContext.Trainings.Where(x => x.UserId > 0 && x.IsNotificationBySMS == true && x.StartDate < now && x.EndDate > now).ToList();
            foreach (Training training in trainings)
            {
                double remindBefore = (Double)((training.SmsBefore == null) ? -60 : training.SmsBefore);
                List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(training.Frequency, (DateTime)training.StartDate, (DateTime)training.EndDate);
                foreach (DateTime recurrence in recurrencesTask)
                {
                    if (recurrence.AddMinutes(remindBefore) > now && recurrence.AddMinutes(remindBefore) < now.AddMinutes(5))
                    {
                        training.StartDate = recurrence.AddMinutes(remindBefore);
                        training.EndDate = recurrence.Date.AddDays(1).AddMinutes(-1);
                        result.Add(training);
                    }
                }
            }
            return result;
        }

        public List<IpsTrainingModel> GetAllProfileTrainingsForEmail()
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsEvaluationParticipantProfileStages> participants = _ipsDataContext.EvaluationParticipants
               .Where(ep => ep.IsLocked == false)
               .Select(x => new IpsEvaluationParticipantProfileStages()
               {
                   EvaluateeId = x.EvaluateeId,
                   EvaluationRoleId = x.EvaluationRoleId,
                   Id = x.Id,
                   IsLocked = x.IsLocked,
                   IsScoreManager = x.IsScoreManager,
                   IsSelfEvaluation = x.IsSelfEvaluation,
                   StageGroup = new IpsStageGroupModel()
                   {
                       Id = x.StageGroup.Id,
                       DaysSpan = x.StageGroup.DaysSpan,
                       Description = x.StageGroup.Description,
                       EndDate = x.StageGroup.EndDate,
                       HoursSpan = x.StageGroup.HoursSpan,
                       MinutesSpan = x.StageGroup.MinutesSpan,
                       MonthsSpan = x.StageGroup.MonthsSpan,
                       ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                       Name = x.StageGroup.Name,
                       ParentParticipantId = x.StageGroup.ParentParticipantId,
                       ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                       Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                       {
                           Id = p.Id,
                           Name = p.Name,
                           ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                           Project = p.Project != null ? new IpsProjectModel()
                           {
                               Id = p.Project.Id,
                               ExpectedEndDate = p.Project.ExpectedEndDate,
                               ExpectedStartDate = p.Project.ExpectedStartDate,
                               IsActive = p.Project.IsActive,
                               MissionStatement = p.Project.MissionStatement,
                               Name = p.Project.Name,
                               Summary = p.Project.Summary,
                               VisionStatement = p.Project.VisionStatement,
                           } : null,
                       }).ToList(),
                       Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                       {
                           EndDateTime = s.EndDateTime,
                           Id = s.Id,
                           Name = s.Name,
                           StageGroupId = s.StageGroupId,
                           StartDateTime = s.StartDateTime
                       }).ToList(),
                       StartDate = x.StageGroup.StartDate,
                       WeeksSpan = x.StageGroup.WeeksSpan

                   }
               })
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

                List<IpsStageModel> stages = evaluator.StageGroup.Stages.Where(s => s.IsPaused != true && s.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();

                List<int> stageIds = stages.Where(s => s.StartDateTime < todayDate && s.EndDateTime > todayDate).Select(s => s.Id).ToList();
                for (var i = 0; i < stages.Count; i++)
                {
                    IpsStageModel stage = stages[i];
                    if (stage.StartDateTime < todayDate && stage.EndDateTime > todayDate)
                    {

                        List<IpsEvaluationAgreementParticipantTrainings> allevalutionAgreements = _ipsDataContext.EvaluationAgreements
                            .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.Trainings.Count() > 0).Select(x => new IpsEvaluationAgreementParticipantTrainings()
                            {
                                Id = x.Id,
                                Comment = x.Comment,
                                FinalGoal = x.FinalGoal,
                                FinalScore = x.FinalScore,
                                KPIType = x.KPIType,
                                LongGoal = x.LongGoal,
                                MidGoal = x.MidGoal,
                                ParticipantId = x.ParticipantId,
                                ParticipantUserId = x.EvaluationParticipant.UserId,
                                QuestionId = x.QuestionId,
                                ShortGoal = x.ShortGoal,
                                StageId = x.StageId,

                                Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                                {
                                    AdditionalInfo = t.AdditionalInfo,
                                    Duration = t.Duration,
                                    DurationMetricId = t.DurationMetricId,
                                    EmailBefore = t.EmailBefore,
                                    EndDate = t.EndDate,
                                    ExerciseMetricId = t.ExerciseMetricId,
                                    Frequency = t.Frequency,
                                    How = t.How,
                                    HowMany = t.HowMany,
                                    HowManyActions = t.HowManyActions,
                                    HowManySets = t.HowManySets,
                                    Id = t.Id,
                                    IsActive = t.IsActive,
                                    IsNotificationByEmail = t.IsNotificationByEmail,
                                    IsNotificationBySMS = t.IsNotificationBySMS,
                                    IsTemplate = t.IsTemplate,
                                    LevelId = t.LevelId,
                                    Name = t.Name,
                                    NotificationTemplateId = t.NotificationTemplateId,
                                    OrganizationId = t.OrganizationId,
                                    SmsBefore = t.SmsBefore,
                                    StartDate = t.StartDate,
                                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                    {
                                        FeedbackDateTime = f.FeedbackDateTime,
                                        Id = f.Id,
                                        Rating = f.Rating,
                                        TaskId = f.TaskId,
                                        TimeSpentMinutes = f.TimeSpentMinutes,
                                        TrainingId = f.TrainingId,
                                        WhatNextDescription = f.WhatNextDescription,
                                        WorkedNotWell = f.WorkedNotWell,
                                        WorkedWell = f.WorkedWell,

                                    }).ToList(),
                                    TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                    Skills = t.Skills.Select(s => new IpsSkillDDL
                                    {
                                        Id = s.Id,
                                        Name = s.Name
                                    }).ToList(),
                                    Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                    {
                                        PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                        {
                                            Description = l.PerformanceGroup.Description,
                                            Id = l.PerformanceGroup.Id,
                                            Name = l.PerformanceGroup.Name,
                                        }
                                    }).ToList(),
                                    TypeId = t.TypeId,
                                    UserId = t.UserId,
                                    What = t.What,
                                    Why = t.Why
                                }).ToList()
                            }).ToList();

                        if (allevalutionAgreements.Count() > 0)
                        {
                            foreach (IpsEvaluationAgreementParticipantTrainings evaluationAgreement in allevalutionAgreements)
                            {
                                foreach (IpsTrainingModel trainingItem in evaluationAgreement.Trainings.Where(x => x.IsNotificationByEmail == true))
                                {
                                    if (!string.IsNullOrEmpty(trainingItem.Frequency))
                                    {
                                        double remindBefore = (Double)((trainingItem.EmailBefore == null) ? -60 : trainingItem.EmailBefore);
                                        if (trainingItem.StartDate.HasValue)
                                        {
                                            if (trainingItem.StartDate.Value.AddMinutes(remindBefore) > todayDate && trainingItem.StartDate.Value.AddMinutes(remindBefore) < todayDate.AddMinutes(5))
                                            {
                                                if (trainingItem != null)
                                                {
                                                    trainingItem.UserId = evaluationAgreement.ParticipantUserId;
                                                    trainingItem.StartDate = trainingItem.StartDate.Value.AddMinutes(remindBefore);
                                                    result.Add(trainingItem);
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }
                }

            }
            return result;
        }
        public List<IpsTrainingModel> GetAllProfileTrainingsForSMS()
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsEvaluationParticipantProfileStages> participants = _ipsDataContext.EvaluationParticipants
             .Where(ep => ep.IsLocked == false)
             .Select(x => new IpsEvaluationParticipantProfileStages()
             {
                 EvaluateeId = x.EvaluateeId,
                 EvaluationRoleId = x.EvaluationRoleId,
                 Id = x.Id,
                 IsLocked = x.IsLocked,
                 IsScoreManager = x.IsScoreManager,
                 IsSelfEvaluation = x.IsSelfEvaluation,
                 StageGroup = new IpsStageGroupModel()
                 {
                     Id = x.StageGroup.Id,
                     DaysSpan = x.StageGroup.DaysSpan,
                     Description = x.StageGroup.Description,
                     EndDate = x.StageGroup.EndDate,
                     HoursSpan = x.StageGroup.HoursSpan,
                     MinutesSpan = x.StageGroup.MinutesSpan,
                     MonthsSpan = x.StageGroup.MonthsSpan,
                     ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                     Name = x.StageGroup.Name,
                     ParentParticipantId = x.StageGroup.ParentParticipantId,
                     ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                     Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                     {
                         Id = p.Id,
                         Name = p.Name,
                         ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                         Project = p.Project != null ? new IpsProjectModel()
                         {
                             Id = p.Project.Id,
                             ExpectedEndDate = p.Project.ExpectedEndDate,
                             ExpectedStartDate = p.Project.ExpectedStartDate,
                             IsActive = p.Project.IsActive,
                             MissionStatement = p.Project.MissionStatement,
                             Name = p.Project.Name,
                             Summary = p.Project.Summary,
                             VisionStatement = p.Project.VisionStatement,
                         } : null,
                     }).ToList(),
                     Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                     {
                         EndDateTime = s.EndDateTime,
                         Id = s.Id,
                         Name = s.Name,
                         StageGroupId = s.StageGroupId,
                         StartDateTime = s.StartDateTime
                     }).ToList(),
                     StartDate = x.StageGroup.StartDate,
                     WeeksSpan = x.StageGroup.WeeksSpan

                 }
             })
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

                List<IpsStageModel> stages = evaluator.StageGroup.Stages.Where(s => s.IsPaused != true && s.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();
                List<int> stageIds = stages.Where(s => s.StartDateTime < todayDate && s.EndDateTime > todayDate).Select(s => s.Id).ToList();
                for (var i = 0; i < stages.Count; i++)
                {
                    IpsStageModel stage = stages[i];
                    if (stage.StartDateTime < todayDate && stage.EndDateTime > todayDate)
                    {
                        List<IpsEvaluationAgreementParticipantTrainings> allevalutionAgreements = _ipsDataContext.EvaluationAgreements
                           .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.Trainings.Count() > 0).Select(x => new IpsEvaluationAgreementParticipantTrainings()
                           {
                               Id = x.Id,
                               Comment = x.Comment,
                               FinalGoal = x.FinalGoal,
                               FinalScore = x.FinalScore,
                               KPIType = x.KPIType,
                               LongGoal = x.LongGoal,
                               MidGoal = x.MidGoal,
                               ParticipantId = x.ParticipantId,
                               ParticipantUserId = x.EvaluationParticipant.UserId,
                               QuestionId = x.QuestionId,
                               ShortGoal = x.ShortGoal,
                               StageId = x.StageId,

                               Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                               {
                                   AdditionalInfo = t.AdditionalInfo,
                                   Duration = t.Duration,
                                   DurationMetricId = t.DurationMetricId,
                                   EmailBefore = t.EmailBefore,
                                   EndDate = t.EndDate,
                                   ExerciseMetricId = t.ExerciseMetricId,
                                   Frequency = t.Frequency,
                                   How = t.How,
                                   HowMany = t.HowMany,
                                   HowManyActions = t.HowManyActions,
                                   HowManySets = t.HowManySets,
                                   Id = t.Id,
                                   IsActive = t.IsActive,
                                   IsNotificationByEmail = t.IsNotificationByEmail,
                                   IsNotificationBySMS = t.IsNotificationBySMS,
                                   IsTemplate = t.IsTemplate,
                                   LevelId = t.LevelId,
                                   Name = t.Name,
                                   NotificationTemplateId = t.NotificationTemplateId,
                                   OrganizationId = t.OrganizationId,
                                   SmsBefore = t.SmsBefore,
                                   StartDate = t.StartDate,
                                   TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                   {
                                       FeedbackDateTime = f.FeedbackDateTime,
                                       Id = f.Id,
                                       Rating = f.Rating,
                                       TaskId = f.TaskId,
                                       TimeSpentMinutes = f.TimeSpentMinutes,
                                       TrainingId = f.TrainingId,
                                       WhatNextDescription = f.WhatNextDescription,
                                       WorkedNotWell = f.WorkedNotWell,
                                       WorkedWell = f.WorkedWell
                                   }).ToList(),
                                   TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                   Skills = t.Skills.Select(s => new IpsSkillDDL
                                   {
                                       Id = s.Id,
                                       Name = s.Name
                                   }).ToList(),
                                   Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                   {
                                       PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                       {
                                           Description = l.PerformanceGroup.Description,
                                           Id = l.PerformanceGroup.Id,
                                           Name = l.PerformanceGroup.Name,
                                       }
                                   }).ToList(),
                                   TypeId = t.TypeId,
                                   UserId = t.UserId,
                                   What = t.What,
                                   Why = t.Why
                               }).ToList()
                           }).ToList();

                        if (allevalutionAgreements.Count() > 0)
                        {
                            foreach (IpsEvaluationAgreementParticipantTrainings evaluationAgreement in allevalutionAgreements)
                            {
                                foreach (IpsTrainingModel trainingItem in evaluationAgreement.Trainings.Where(x => x.IsNotificationBySMS == true))
                                {
                                    if (!string.IsNullOrEmpty(trainingItem.Frequency))
                                    {
                                        double remindBefore = (Double)((trainingItem.SmsBefore == null) ? -60 : trainingItem.SmsBefore);
                                        if (trainingItem.StartDate.HasValue)
                                        {
                                            if (trainingItem.StartDate.Value.AddMinutes(remindBefore) > todayDate && trainingItem.StartDate.Value.AddMinutes(remindBefore) < todayDate.AddMinutes(5))
                                            {

                                                if (trainingItem != null)
                                                {
                                                    trainingItem.UserId = evaluationAgreement.ParticipantUserId;
                                                    trainingItem.StartDate = trainingItem.StartDate.Value.AddMinutes(remindBefore);
                                                    result.Add(trainingItem);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }
        public List<IpsTrainingModel> GetAllProfileTrainingRecurrenceForEmail()
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsEvaluationParticipantProfileStages> participants = _ipsDataContext.EvaluationParticipants
              .Where(ep => ep.IsLocked == false)
              .Select(x => new IpsEvaluationParticipantProfileStages()
              {
                  EvaluateeId = x.EvaluateeId,
                  EvaluationRoleId = x.EvaluationRoleId,
                  Id = x.Id,
                  IsLocked = x.IsLocked,
                  IsScoreManager = x.IsScoreManager,
                  IsSelfEvaluation = x.IsSelfEvaluation,
                  StageGroup = new IpsStageGroupModel()
                  {
                      Id = x.StageGroup.Id,
                      DaysSpan = x.StageGroup.DaysSpan,
                      Description = x.StageGroup.Description,
                      EndDate = x.StageGroup.EndDate,
                      HoursSpan = x.StageGroup.HoursSpan,
                      MinutesSpan = x.StageGroup.MinutesSpan,
                      MonthsSpan = x.StageGroup.MonthsSpan,
                      ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                      Name = x.StageGroup.Name,
                      ParentParticipantId = x.StageGroup.ParentParticipantId,
                      ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                      Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                      {
                          Id = p.Id,
                          Name = p.Name,
                          ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                          Project = p.Project != null ? new IpsProjectModel()
                          {
                              Id = p.Project.Id,
                              ExpectedEndDate = p.Project.ExpectedEndDate,
                              ExpectedStartDate = p.Project.ExpectedStartDate,
                              IsActive = p.Project.IsActive,
                              MissionStatement = p.Project.MissionStatement,
                              Name = p.Project.Name,
                              Summary = p.Project.Summary,
                              VisionStatement = p.Project.VisionStatement,
                          } : null,
                      }).ToList(),
                      Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                      {
                          EndDateTime = s.EndDateTime,
                          Id = s.Id,
                          Name = s.Name,
                          StageGroupId = s.StageGroupId,
                          StartDateTime = s.StartDateTime
                      }).ToList(),
                      StartDate = x.StageGroup.StartDate,
                      WeeksSpan = x.StageGroup.WeeksSpan

                  }
              })
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

                List<IpsStageModel> stages = evaluator.StageGroup.Stages.Where(s => s.IsPaused != true && s.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();

                List<int> stageIds = stages.Where(s => s.StartDateTime < todayDate && s.EndDateTime > todayDate).Select(s => s.Id).ToList();
                for (var i = 0; i < stages.Count; i++)
                {
                    IpsStageModel stage = stages[i];
                    if (stage.StartDateTime < todayDate && stage.EndDateTime > todayDate)
                    {

                        List<IpsEvaluationAgreementParticipantTrainings> allevalutionAgreements = _ipsDataContext.EvaluationAgreements
                          .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.Trainings.Count() > 0).Select(x => new IpsEvaluationAgreementParticipantTrainings()
                          {
                              Id = x.Id,
                              Comment = x.Comment,
                              FinalGoal = x.FinalGoal,
                              FinalScore = x.FinalScore,
                              KPIType = x.KPIType,
                              LongGoal = x.LongGoal,
                              MidGoal = x.MidGoal,
                              ParticipantId = x.ParticipantId,
                              ParticipantUserId = x.EvaluationParticipant.UserId,
                              QuestionId = x.QuestionId,
                              ShortGoal = x.ShortGoal,
                              StageId = x.StageId,

                              Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                              {
                                  AdditionalInfo = t.AdditionalInfo,
                                  Duration = t.Duration,
                                  DurationMetricId = t.DurationMetricId,
                                  EmailBefore = t.EmailBefore,
                                  EndDate = t.EndDate,
                                  ExerciseMetricId = t.ExerciseMetricId,
                                  Frequency = t.Frequency,
                                  How = t.How,
                                  HowMany = t.HowMany,
                                  HowManyActions = t.HowManyActions,
                                  HowManySets = t.HowManySets,
                                  Id = t.Id,
                                  IsActive = t.IsActive,
                                  IsNotificationByEmail = t.IsNotificationByEmail,
                                  IsNotificationBySMS = t.IsNotificationBySMS,
                                  IsTemplate = t.IsTemplate,
                                  LevelId = t.LevelId,
                                  Name = t.Name,
                                  NotificationTemplateId = t.NotificationTemplateId,
                                  OrganizationId = t.OrganizationId,
                                  SmsBefore = t.SmsBefore,
                                  StartDate = t.StartDate,
                                  TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                                  {
                                      FeedbackDateTime = f.FeedbackDateTime,
                                      Id = f.Id,
                                      Rating = f.Rating,
                                      TaskId = f.TaskId,
                                      TimeSpentMinutes = f.TimeSpentMinutes,
                                      TrainingId = f.TrainingId,
                                      WhatNextDescription = f.WhatNextDescription,
                                      WorkedNotWell = f.WorkedNotWell,
                                      WorkedWell = f.WorkedWell
                                  }).ToList(),
                                  TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                                  Skills = t.Skills.Select(s => new IpsSkillDDL
                                  {
                                      Id = s.Id,
                                      Name = s.Name
                                  }).ToList(),
                                  Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                                  {
                                      PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                      {
                                          Description = l.PerformanceGroup.Description,
                                          Id = l.PerformanceGroup.Id,
                                          Name = l.PerformanceGroup.Name,
                                      }
                                  }).ToList(),
                                  TypeId = t.TypeId,
                                  UserId = t.UserId,
                                  What = t.What,
                                  Why = t.Why
                              }).ToList()
                          }).ToList();

                        if (allevalutionAgreements.Count() > 0)
                        {
                            foreach (IpsEvaluationAgreementParticipantTrainings evaluationAgreement in allevalutionAgreements)
                            {
                                foreach (IpsTrainingModel trainingItem in evaluationAgreement.Trainings.Where(x => x.IsNotificationByEmail == true))
                                {
                                    if (!string.IsNullOrEmpty(trainingItem.Frequency))
                                    {
                                        if (trainingItem.StartDate.HasValue)
                                        {
                                            if (trainingItem.StartDate.Value < todayDate && trainingItem.EndDate > todayDate)
                                            {
                                                if (trainingItem != null)
                                                {
                                                    double remindBefore = (Double)((trainingItem.EmailBefore == null) ? -60 : trainingItem.EmailBefore);
                                                    List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(trainingItem.Frequency, (DateTime)trainingItem.StartDate, (DateTime)trainingItem.EndDate);
                                                    foreach (DateTime recurrence in recurrencesTask)
                                                    {
                                                        if (recurrence.AddMinutes(remindBefore) > todayDate && recurrence.AddMinutes(remindBefore) < todayDate.AddMinutes(5))
                                                        {
                                                            trainingItem.UserId = evaluationAgreement.ParticipantUserId;
                                                            trainingItem.StartDate = recurrence.AddMinutes(remindBefore);
                                                            trainingItem.EndDate = recurrence.Date.AddDays(1).AddMinutes(-1);
                                                            result.Add(trainingItem);
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                    }

                                }
                            }
                        }
                    }

                }
            }

            return result;
        }
        public List<IpsTrainingModel> GetAllProfileTrainingRecurrenceForSMS()
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            //get profiles to be executed
            DateTime todayDate = DateTime.Now;
            List<IpsEvaluationParticipantProfileStages> participants = _ipsDataContext.EvaluationParticipants
              .Where(ep => ep.IsLocked == false)
              .Select(x => new IpsEvaluationParticipantProfileStages()
              {
                  EvaluateeId = x.EvaluateeId,
                  EvaluationRoleId = x.EvaluationRoleId,
                  Id = x.Id,
                  IsLocked = x.IsLocked,
                  IsScoreManager = x.IsScoreManager,
                  IsSelfEvaluation = x.IsSelfEvaluation,
                  StageGroup = new IpsStageGroupModel()
                  {
                      Id = x.StageGroup.Id,
                      DaysSpan = x.StageGroup.DaysSpan,
                      Description = x.StageGroup.Description,
                      EndDate = x.StageGroup.EndDate,
                      HoursSpan = x.StageGroup.HoursSpan,
                      MinutesSpan = x.StageGroup.MinutesSpan,
                      MonthsSpan = x.StageGroup.MonthsSpan,
                      ActualTimeSpan = x.StageGroup.ActualTimeSpan,
                      Name = x.StageGroup.Name,
                      ParentParticipantId = x.StageGroup.ParentParticipantId,
                      ParentStageGroupId = x.StageGroup.ParentStageGroupId,
                      Profiles = x.StageGroup.Profiles.Select(p => new IpsProfile()
                      {
                          Id = p.Id,
                          Name = p.Name,
                          ProfileTypeId = (ProfileTypeEnum)p.ProfileTypeId,
                          Project = p.Project != null ? new IpsProjectModel()
                          {
                              Id = p.Project.Id,
                              ExpectedEndDate = p.Project.ExpectedEndDate,
                              ExpectedStartDate = p.Project.ExpectedStartDate,
                              IsActive = p.Project.IsActive,
                              MissionStatement = p.Project.MissionStatement,
                              Name = p.Project.Name,
                              Summary = p.Project.Summary,
                              VisionStatement = p.Project.VisionStatement,
                          } : null,
                      }).ToList(),
                      Stages = x.StageGroup.Stages.Select(s => new IpsStageModel()
                      {
                          EndDateTime = s.EndDateTime,
                          Id = s.Id,
                          Name = s.Name,
                          StageGroupId = s.StageGroupId,
                          StartDateTime = s.StartDateTime,
                          IsPaused = s.IsPaused,
                          IsStopped = s.IsStopped,
                      }).ToList(),
                      StartDate = x.StageGroup.StartDate,
                      WeeksSpan = x.StageGroup.WeeksSpan

                  }
              })
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

                List<IpsStageModel> stages = evaluator.StageGroup.Stages.Where(s => s.IsPaused != true && s.IsStopped != true).OrderBy(s => s.StartDateTime).ToList();

                List<int> stageIds = stages.Where(s => s.StartDateTime < todayDate && s.EndDateTime > todayDate).Select(s => s.Id).ToList();
                for (var i = 0; i < stages.Count; i++)
                {
                    IpsStageModel stage = stages[i];
                    if (stage.StartDateTime < todayDate && stage.EndDateTime > todayDate)
                    {
                        List<IpsEvaluationAgreementParticipantTrainings> allevalutionAgreements = _ipsDataContext.EvaluationAgreements
                       .Where(x => x.StageId == stage.Id && x.KPIType > 0 && x.Trainings.Count() > 0).Select(x => new IpsEvaluationAgreementParticipantTrainings()
                       {
                           Id = x.Id,
                           Comment = x.Comment,
                           FinalGoal = x.FinalGoal,
                           FinalScore = x.FinalScore,
                           KPIType = x.KPIType,
                           LongGoal = x.LongGoal,
                           MidGoal = x.MidGoal,
                           ParticipantId = x.ParticipantId,
                           ParticipantUserId = x.EvaluationParticipant.UserId,
                           QuestionId = x.QuestionId,
                           ShortGoal = x.ShortGoal,
                           StageId = x.StageId,

                           Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                           {
                               AdditionalInfo = t.AdditionalInfo,
                               Duration = t.Duration,
                               DurationMetricId = t.DurationMetricId,
                               EmailBefore = t.EmailBefore,
                               EndDate = t.EndDate,
                               ExerciseMetricId = t.ExerciseMetricId,
                               Frequency = t.Frequency,
                               How = t.How,
                               HowMany = t.HowMany,
                               HowManyActions = t.HowManyActions,
                               HowManySets = t.HowManySets,
                               Id = t.Id,
                               IsActive = t.IsActive,
                               IsNotificationByEmail = t.IsNotificationByEmail,
                               IsNotificationBySMS = t.IsNotificationBySMS,
                               IsTemplate = t.IsTemplate,
                               LevelId = t.LevelId,
                               Name = t.Name,
                               NotificationTemplateId = t.NotificationTemplateId,
                               OrganizationId = t.OrganizationId,
                               SmsBefore = t.SmsBefore,
                               StartDate = t.StartDate,
                               TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                               {
                                   FeedbackDateTime = f.FeedbackDateTime,
                                   Id = f.Id,
                                   Rating = f.Rating,
                                   TaskId = f.TaskId,
                                   TimeSpentMinutes = f.TimeSpentMinutes,
                                   TrainingId = f.TrainingId,
                                   WhatNextDescription = f.WhatNextDescription,
                                   WorkedNotWell = f.WorkedNotWell,
                                   WorkedWell = f.WorkedWell
                               }).ToList(),
                               TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                               Skills = t.Skills.Select(s => new IpsSkillDDL
                               {
                                   Id = s.Id,
                                   Name = s.Name
                               }).ToList(),
                               Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                               {
                                   PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                                   {
                                       Description = l.PerformanceGroup.Description,
                                       Id = l.PerformanceGroup.Id,
                                       Name = l.PerformanceGroup.Name,
                                   }
                               }).ToList(),
                               TypeId = t.TypeId,
                               UserId = t.UserId,
                               What = t.What,
                               Why = t.Why
                           }).ToList()
                       }).ToList();

                        if (allevalutionAgreements.Count() > 0)
                        {
                            foreach (IpsEvaluationAgreementParticipantTrainings evaluationAgreement in allevalutionAgreements)
                            {
                                List<Training> trainings = new List<Training>();

                                foreach (IpsTrainingModel trainingItem in evaluationAgreement.Trainings.Where(x => x.IsNotificationBySMS == true))
                                {
                                    if (!string.IsNullOrEmpty(trainingItem.Frequency))
                                    {
                                        if (trainingItem.StartDate.HasValue)
                                        {
                                            if (trainingItem.StartDate.Value < todayDate && trainingItem.EndDate > todayDate)
                                            {
                                                if (trainingItem != null)
                                                {
                                                    double remindBefore = (Double)((trainingItem.SmsBefore == null) ? -60 : trainingItem.SmsBefore);
                                                    List<DateTime> recurrencesTask = RecurrenceRuleParser.GetRecurrenceDateTime(trainingItem.Frequency, (DateTime)trainingItem.StartDate, (DateTime)trainingItem.EndDate);
                                                    foreach (DateTime recurrence in recurrencesTask)
                                                    {
                                                        if (recurrence.AddMinutes(remindBefore) > todayDate && recurrence.AddMinutes(remindBefore) < todayDate.AddMinutes(5))
                                                        {
                                                            trainingItem.UserId = evaluationAgreement.ParticipantUserId;
                                                            trainingItem.StartDate = recurrence.AddMinutes(remindBefore);
                                                            trainingItem.EndDate = recurrence.Date.AddDays(1).AddMinutes(-1);
                                                            result.Add(trainingItem);
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                    }

                                }
                            }
                        }
                    }

                }
            }

            return result;
        }


        public List<IPSParticipants> GetOrganizationParticipants(int organizationId)
        {
            return _ipsDataContext.Users.Where(x => x.OrganizationId == organizationId).Select(x => new IPSParticipants
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                UserKey = x.UserKey
            }).ToList();
        }

        public List<IpsCalenderEvents> getCalanderEventsByUserId(IpsCalenderEventFilterModel ipsCalenderEventFilterModel)
        {
            DateTime now = DateTime.Now;
            List<IpsCalenderEvents> result = new List<IpsCalenderEvents>();

            //List <Data.Task> tasks = _ipsDataContext.Tasks.Where(x => x.AssignedToId == userId && x.StartDate != null).ToList();
            if (ipsCalenderEventFilterModel.StartDate.HasValue && ipsCalenderEventFilterModel.EndDate.HasValue)
            {

                List<IpsCalenderEvents> tasks = _ipsDataContext.Tasks.Where(t => t.AssignedToId == ipsCalenderEventFilterModel.UserId && t.StartDate != null && t.StartDate >= ipsCalenderEventFilterModel.StartDate && t.DueDate <= ipsCalenderEventFilterModel.EndDate).Select(t => new IpsCalenderEvents()
                {
                    Description = t.Description,
                    End = t.DueDate,
                    EventType = 1,
                    Id = t.Id,
                    RecurrenceRule = t.RecurrenceRule,
                    Start = t.StartDate,
                    Title = t.Title,
                    CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                    StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                    PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                    UserId = ipsCalenderEventFilterModel.UserId,
                    TrainingFeedbacks = t.TaskActivities.Select(f => new IPSTrainingFeedback()
                    {
                        FeedbackDateTime = f.ActivityDateTime,
                        Id = f.Id,
                        TaskId = f.TaskId,
                        RecurrencesEndTime = f.RecurrenceEndTime,
                        RecurrencesRule = f.RecurrencesRule,
                        RecurrencesStartTime = f.RecurrenceStartTime,
                    }).ToList(),
                }).ToList();
                if (tasks.Count() > 0)
                {
                    result.AddRange(tasks);
                }

                List<IpsCalenderEvents> trainings = _ipsDataContext.Trainings.Where(t => t.UserId == ipsCalenderEventFilterModel.UserId && t.StartDate != null && t.StartDate >= ipsCalenderEventFilterModel.StartDate && t.EndDate <= ipsCalenderEventFilterModel.EndDate).Select(t => new IpsCalenderEvents()
                {
                    Description = t.AdditionalInfo,
                    End = t.EndDate,
                    EventType = 2,
                    Id = t.Id,
                    RecurrenceRule = t.Frequency,
                    Start = t.StartDate,
                    Title = t.Name,
                    //CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                    //StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                    //PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                    UserId = ipsCalenderEventFilterModel.UserId,
                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback()
                    {
                        FeedbackDateTime = f.FeedbackDateTime,
                        Id = f.Id,
                        Rating = f.Rating,
                        TaskId = f.TaskId,
                        TimeSpentMinutes = f.TimeSpentMinutes,
                        TrainingId = f.TrainingId,
                        WhatNextDescription = f.WhatNextDescription,
                        WorkedNotWell = f.WorkedNotWell,
                        WorkedWell = f.WorkedWell,
                        IsRecurrences = f.IsRecurrences,
                        RecurrencesEndTime = f.RecurrencesEndTime,
                        RecurrencesRule = f.RecurrencesRule,
                        RecurrencesStartTime = f.RecurrencesStartTime,
                        IsParticipantPaused = f.IsParticipantPaused,
                        ParticipantPausedAt = f.ParticipantPausedAt,
                        EvaluatorId = f.EvaluatorId,
                        EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                        IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                    }).ToList(),
                    Duration = t.Duration,
                    DurationMetricId = t.DurationMetricId,
                    Skills = t.Skills.ToList(),
                }).ToList();

                if (trainings.Count() > 0)
                {
                    result.AddRange(trainings);
                }

                List<int> evaluatorFeedBackTrainings = _ipsDataContext.TrainingFeedbacks.Where(x => x.EvaluatorId == ipsCalenderEventFilterModel.UserId && x.IsEvaluatorFeedBack == false && x.TrainingId > 0).Select(t => (int)t.TrainingId).ToList();
                if (evaluatorFeedBackTrainings.Count > 0)
                {
                    List<IpsCalenderEvents> feedbacktrainings = _ipsDataContext.Trainings.Where(t => evaluatorFeedBackTrainings.Contains(t.Id)).Select(t => new IpsCalenderEvents()
                    {
                        Description = t.AdditionalInfo,
                        End = t.EndDate,
                        EventType = 4,
                        Id = t.Id,
                        RecurrenceRule = t.Frequency,
                        Start = t.StartDate,
                        Title = t.Name,
                        //CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                        //StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                        //PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                        UserId = ipsCalenderEventFilterModel.UserId,
                        Skills = t.Skills.ToList(),
                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback()
                        {
                            FeedbackDateTime = f.FeedbackDateTime,
                            Id = f.Id,
                            Rating = f.Rating,
                            TaskId = f.TaskId,
                            TimeSpentMinutes = f.TimeSpentMinutes,
                            TrainingId = f.TrainingId,
                            WhatNextDescription = f.WhatNextDescription,
                            WorkedNotWell = f.WorkedNotWell,
                            WorkedWell = f.WorkedWell,
                            IsRecurrences = f.IsRecurrences,
                            RecurrencesEndTime = f.RecurrencesEndTime,
                            RecurrencesRule = f.RecurrencesRule,
                            RecurrencesStartTime = f.RecurrencesStartTime,
                            IsParticipantPaused = f.IsParticipantPaused,
                            ParticipantPausedAt = f.ParticipantPausedAt,
                            EvaluatorId = f.EvaluatorId,
                            EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                            IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                        }).ToList()
                    }).ToList();

                    if (feedbacktrainings.Count > 0)
                    {
                        result.AddRange(feedbacktrainings);
                    }
                }


            }
            else
            {
                List<IpsCalenderEvents> tasks = _ipsDataContext.Tasks.Where(t => t.AssignedToId == ipsCalenderEventFilterModel.UserId && t.StartDate != null).Select(t => new IpsCalenderEvents()
                {
                    Description = t.Description,
                    End = t.DueDate,
                    EventType = 1,
                    Id = t.Id,
                    RecurrenceRule = t.RecurrenceRule,
                    Start = t.StartDate,
                    Title = t.Title,
                    CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                    StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                    PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                    UserId = ipsCalenderEventFilterModel.UserId,
                    TrainingFeedbacks = t.TaskActivities.Select(f => new IPSTrainingFeedback()
                    {
                        FeedbackDateTime = f.ActivityDateTime,
                        Id = f.Id,
                        TaskId = f.TaskId,
                        RecurrencesEndTime = f.RecurrenceEndTime,
                        RecurrencesRule = f.RecurrencesRule,
                        RecurrencesStartTime = f.RecurrenceStartTime,
                    }).ToList()
                }).ToList();
                if (tasks.Count() > 0)
                {
                    result.AddRange(tasks);
                }

                List<IpsCalenderEvents> trainings = _ipsDataContext.Trainings.Where(t => t.UserId == ipsCalenderEventFilterModel.UserId && t.StartDate != null).Select(t => new IpsCalenderEvents()
                {
                    Description = t.AdditionalInfo,
                    End = t.EndDate,
                    EventType = 2,
                    Id = t.Id,
                    RecurrenceRule = t.Frequency,
                    Start = t.StartDate,
                    Title = t.Name,
                    //CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                    //StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                    //PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                    UserId = ipsCalenderEventFilterModel.UserId,
                    Skills = t.Skills.ToList(),
                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback()
                    {
                        FeedbackDateTime = f.FeedbackDateTime,
                        Id = f.Id,
                        Rating = f.Rating,
                        TaskId = f.TaskId,
                        TimeSpentMinutes = f.TimeSpentMinutes,
                        TrainingId = f.TrainingId,
                        WhatNextDescription = f.WhatNextDescription,
                        WorkedNotWell = f.WorkedNotWell,
                        WorkedWell = f.WorkedWell,
                        IsRecurrences = f.IsRecurrences,
                        RecurrencesEndTime = f.RecurrencesEndTime,
                        RecurrencesRule = f.RecurrencesRule,
                        RecurrencesStartTime = f.RecurrencesStartTime,
                        IsParticipantPaused = f.IsParticipantPaused,
                        ParticipantPausedAt = f.ParticipantPausedAt,
                        EvaluatorId = f.EvaluatorId,
                        EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                        IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                    }).ToList(),
                    Duration = t.Duration,
                    DurationMetricId = t.DurationMetricId
                }).ToList();

                if (trainings.Count() > 0)
                {
                    result.AddRange(trainings);
                }

                List<int> evaluatorFeedBackTrainings = _ipsDataContext.TrainingFeedbacks.Where(x => x.EvaluatorId == ipsCalenderEventFilterModel.UserId && x.IsEvaluatorFeedBack == false && x.TrainingId > 0).Select(t => (int)t.TrainingId).ToList();
                if (evaluatorFeedBackTrainings.Count > 0)
                {
                    List<IpsCalenderEvents> feedbacktrainings = _ipsDataContext.Trainings.Where(t => evaluatorFeedBackTrainings.Contains(t.Id)).Select(t => new IpsCalenderEvents()
                    {
                        Description = t.AdditionalInfo,
                        End = t.EndDate,
                        EventType = 4,
                        Id = t.Id,
                        RecurrenceRule = t.Frequency,
                        Start = t.StartDate,
                        Title = t.Name,
                        //CategoryId = t.CategoryId.HasValue ? t.CategoryId.Value : 0,
                        //StatusId = t.StatusId.HasValue ? t.StatusId.Value : 0,
                        //PriorityId = t.PriorityId.HasValue ? t.PriorityId.Value : 0,
                        UserId = ipsCalenderEventFilterModel.UserId,
                        Skills = t.Skills.ToList(),
                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback()
                        {
                            FeedbackDateTime = f.FeedbackDateTime,
                            Id = f.Id,
                            Rating = f.Rating,
                            TaskId = f.TaskId,
                            TimeSpentMinutes = f.TimeSpentMinutes,
                            TrainingId = f.TrainingId,
                            WhatNextDescription = f.WhatNextDescription,
                            WorkedNotWell = f.WorkedNotWell,
                            WorkedWell = f.WorkedWell,
                            IsRecurrences = f.IsRecurrences,
                            RecurrencesEndTime = f.RecurrencesEndTime,
                            RecurrencesRule = f.RecurrencesRule,
                            RecurrencesStartTime = f.RecurrencesStartTime,
                            IsParticipantPaused = f.IsParticipantPaused,
                            ParticipantPausedAt = f.ParticipantPausedAt,
                            EvaluatorId = f.EvaluatorId,
                            EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                            IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                        }).ToList()
                    }).ToList();

                    if (feedbacktrainings.Count > 0)
                    {
                        result.AddRange(feedbacktrainings);
                    }
                }
            }
            return result;
        }

        public int setEventsByUserId(IpsCalenderEvents ipsCalenderEvent)
        {
            int result = 0;
            if (ipsCalenderEvent != null)
            {
                if (ipsCalenderEvent.EventType == 1)
                {
                    TaskService _taskService = new TaskService();
                    if (ipsCalenderEvent.Id > 0)
                    {
                        Data.Task t = new Data.Task();
                        t = _ipsDataContext.Tasks.Where(x => x.Id == ipsCalenderEvent.Id).FirstOrDefault();
                        if (t.StatusId != ipsCalenderEvent.StatusId)
                        {
                            t.StatusId = ipsCalenderEvent.StatusId;
                            TaskStatusListItem statusItem = _ipsDataContext.TaskStatusListItems.Where(x => x.Id == ipsCalenderEvent.StatusId).FirstOrDefault();
                            if (statusItem != null)
                            {
                                if (statusItem.Name == "Done")
                                {
                                    t.IsCompleted = true;
                                }
                            }
                            _taskService.Update(t);
                            result = t.Id;
                        }
                        else
                        {
                            result = -1;
                        }
                    }
                    else
                    {
                        Data.Task taskEvent = new Data.Task();
                        taskEvent.AssignedToId = ipsCalenderEvent.UserId;
                        taskEvent.CreatedDate = DateTime.Now;
                        taskEvent.Description = ipsCalenderEvent.Description;
                        taskEvent.DueDate = ipsCalenderEvent.End;
                        taskEvent.StartDate = ipsCalenderEvent.Start;
                        taskEvent.Title = ipsCalenderEvent.Title;
                        taskEvent.UserId = ipsCalenderEvent.UserId;
                        taskEvent.CategoryId = ipsCalenderEvent.CategoryId;
                        taskEvent.StatusId = ipsCalenderEvent.StatusId;
                        taskEvent.PriorityId = ipsCalenderEvent.PriorityId;
                        taskEvent.TaskListId = ipsCalenderEvent.TaskListId;
                        taskEvent.CreatedById = _authService.GetCurrentUserId();

                        Data.Task newTaskEvent = _taskService.Add(taskEvent);
                        if (newTaskEvent.Id > 0)
                        {
                            result = newTaskEvent.Id;
                        }

                        // Invite to Participant
                        if (ipsCalenderEvent.ParticipantId > 0)
                        {
                            Data.Task taskToInvite = new Data.Task();
                            taskToInvite.AssignedToId = ipsCalenderEvent.ParticipantId;
                            taskToInvite.CreatedDate = DateTime.Now;
                            taskToInvite.Description = ipsCalenderEvent.Description;
                            taskToInvite.DueDate = ipsCalenderEvent.End;
                            taskToInvite.StartDate = ipsCalenderEvent.Start;
                            taskToInvite.Title = ipsCalenderEvent.Title;
                            taskToInvite.UserId = ipsCalenderEvent.UserId;
                            taskToInvite.CategoryId = ipsCalenderEvent.CategoryId;
                            taskToInvite.StatusId = ipsCalenderEvent.StatusId;
                            taskToInvite.PriorityId = ipsCalenderEvent.PriorityId;
                            taskToInvite.TaskListId = ipsCalenderEvent.TaskListId;
                            taskToInvite.CreatedById = _authService.GetCurrentUserId();

                            Data.Task newTaskToInvite = _taskService.Add(taskToInvite);
                            if (newTaskToInvite.Id > 0)
                            {
                                result = newTaskToInvite.Id;
                            }
                        }
                    }
                    // Create as Task
                }
                else if (ipsCalenderEvent.EventType == 2)
                {
                    // Create as Training
                }
            }
            return result;
        }

        public int SubmitTrainingMaterialRating(TrainingMaterialRating trainingMaterialRating)
        {
            trainingMaterialRating.RatingBy = _authService.GetCurrentUserId();
            trainingMaterialRating.RatingSubmitDate = DateTime.Now;
            TrainingMaterialRating tmRating = _ipsDataContext.TrainingMaterialRatings.Where(x => x.RatingBy == trainingMaterialRating.RatingBy && x.TrainingMaterialId == trainingMaterialRating.TrainingMaterialId).FirstOrDefault();
            if (tmRating != null)
            {
                tmRating.Rating = trainingMaterialRating.Rating;
                _ipsDataContext.Entry(tmRating).State = EntityState.Modified;
            }
            else
            {
                _ipsDataContext.TrainingMaterialRatings.Add(trainingMaterialRating);

            }
            return _ipsDataContext.SaveChanges(); ;
        }

        public IPSUserStatsModel GetUserStats(int userId)
        {
            return _ipsDataContext.Users.Where(u => u.Id == userId).Select(x => new IPSUserStatsModel
            {
                Id = x.Id,
                BirthDate = x.BirthDate,
                City = x.City,
                Country = x.Country,
                Departments = x.Departments1.Select(d => new IPSDepartment { Id = d.Id, Name = d.Name }).ToList(),
                FirstName = x.FirstName,
                ImagePath = x.ImagePath,
                JobPositions = x.JobPositions.Select(j => new IPSJobPosition { Id = j.Id, Name = j.JobPosition1 }).ToList(),
                LastName = x.LastName,
                PrivateEmail = x.PrivateEmail,
                WorkEmail = x.WorkEmail,
                State = x.State
            }).FirstOrDefault();

        }


        public TaskActivity AddTaskActivity(TaskActivity taskActivity)
        {
            bool isTrainingExist = _ipsDataContext.Tasks.Any(t => t.Id == taskActivity.TaskId);
            if (isTrainingExist)
            {
                taskActivity.ActivityDateTime = DateTime.Now;
                _ipsDataContext.TaskActivities.Add(taskActivity);
                if (_ipsDataContext.SaveChanges() > 0)
                {
                    SetTaskInProgress(taskActivity.TaskId);
                }
            }
            return taskActivity;
        }

        public void SetTaskInProgress(int taskId)
        {
            TaskService _taskService = new TaskService();
            TaskStatusListItemsService _itemsService = new TaskStatusListItemsService();
            Data.Task original = _ipsDataContext.Tasks.Find(taskId);
            var user = _authService.getCurrentUser();
            TaskListModel TaskListModel = _taskService.GetTasksListItemByUserKey(user.Id);
            List<TaskStatusListItemModel> statusListItems = _itemsService.GetStatusListItemsByStatusListId(TaskListModel.TaskStatusListId);
            if (original != null)
            {

                TaskStatusListItemModel TaskStatusListItemModel = statusListItems.Where(x => x.Name.Contains("Progress")).FirstOrDefault();
                if (TaskStatusListItemModel != null)
                {
                    Data.Task task = original;
                    task.StatusId = TaskStatusListItemModel.Id;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(task);
                    _ipsDataContext.SaveChanges();
                }
            }
        }

        public List<IpsEvaluationAgreementItem> GetKtFinalKPIEvaluationAgreementItems(int profileId, int? stageId, int? stageEvolutionId, int participantId)
        {
            var result = new List<IpsEvaluationAgreementItem>();


            List<IpsSurveyAnswerModel> surveyList = _ipsDataContext.SurveyAnswers.Select(x => new IpsSurveyAnswerModel()
            {
                Answer = x.Answer,
                Comment = x.Comment,
                InDevContract = x.InDevContract,
                IsCorrect = x.IsCorrect,
                Question = x.Question != null ? new IpsQuestionModel()
                {
                    AnswerTypeId = x.Question.AnswerTypeId,
                    Description = x.Question.Description,
                    Id = x.Question.Id,
                    IndustryId = x.Question.IndustryId,
                    IsActive = x.Question.IsActive,
                    IsTemplate = x.Question.IsTemplate,
                    OrganizationId = x.Question.OrganizationId,
                    ParentQuestionId = x.Question.ParentQuestionId,
                    Points = x.Question.Points,
                    ProfileTypeId = x.Question.ProfileTypeId,
                    QuestionSettings = x.Question.QuestionSettings,
                    QuestionText = x.Question.QuestionText,
                    ScaleId = x.Question.ScaleId,
                    SeqNo = x.Question.SeqNo,

                    StructureLevelId = x.Question.StructureLevelId,
                    TimeForQuestion = x.Question.TimeForQuestion,

                } : null,
                QuestionId = x.QuestionId,
                SurveyResultId = x.SurveyResultId,
                SurveyResult = x.SurveyResult != null ? new IpsSurveyResultModel()
                {
                    Id = x.SurveyResult.Id,
                    ParticipantId = x.SurveyResult.ParticipantId,
                    StageEvolutionId = x.SurveyResult.StageEvolutionId,
                    StageId = x.SurveyResult.StageId,
                } : null,
                Trainings = x.Trainings.Select(t => new IpsTrainingModel()
                {
                    AdditionalInfo = t.AdditionalInfo,
                    Duration = t.Duration,
                    DurationMetricId = t.DurationMetricId,
                    EmailBefore = t.EmailBefore,
                    EndDate = t.EndDate,
                    ExerciseMetricId = t.ExerciseMetricId,
                    Frequency = t.Frequency,
                    How = t.How,
                    HowMany = t.HowMany,
                    HowManyActions = t.HowManyActions,
                    HowManySets = t.HowManySets,
                    Id = t.Id,
                    IsActive = t.IsActive,
                    IsNotificationByEmail = t.IsNotificationByEmail,
                    IsNotificationBySMS = t.IsNotificationBySMS,
                    IsTemplate = t.IsTemplate,
                    LevelId = t.LevelId,
                    Name = t.Name,
                    NotificationTemplateId = t.NotificationTemplateId,
                    OrganizationId = t.OrganizationId,
                    SmsBefore = t.SmsBefore,
                    StartDate = t.StartDate,
                    TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                    {
                        FeedbackDateTime = f.FeedbackDateTime,
                        Id = f.Id,
                        Rating = f.Rating,
                        TaskId = f.TaskId,
                        TimeSpentMinutes = f.TimeSpentMinutes,
                        TrainingId = f.TrainingId,
                        WhatNextDescription = f.WhatNextDescription,
                        WorkedNotWell = f.WorkedNotWell,
                        WorkedWell = f.WorkedWell
                    }).ToList(),
                    TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                    Skills = t.Skills.Select(s => new IpsSkillDDL
                    {
                        Id = s.Id,
                        Name = s.Name
                    }).ToList(),
                    Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                    {
                        PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                        {
                            Description = l.PerformanceGroup.Description,
                            Id = l.PerformanceGroup.Id,
                            Name = l.PerformanceGroup.Name,
                        }
                    }).ToList(),
                    TypeId = t.TypeId,
                    UserId = t.UserId,
                    What = t.What,
                    Why = t.Why
                }).ToList()
            }).ToList();
            List<IpsSurveyAnswerModel> SurveyAnswersList = new List<IpsSurveyAnswerModel>();
            if (stageEvolutionId.HasValue)
            {
                SurveyAnswersList = surveyList.Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId).ToList();
            }
            else
            {
                SurveyAnswersList = surveyList.Where(x => x.SurveyResult.StageId == stageId).ToList();
            }

            foreach (IpsSurveyAnswerModel answer in SurveyAnswersList)
            {
                var item = new IpsEvaluationAgreementItem
                {
                    IsCorrect = answer.IsCorrect ?? false,
                    QuestionId = answer.QuestionId,
                    Comment = answer.Comment,
                    InDevContract = answer.InDevContract == true,
                    Trainings = _ipsDataContext.Questions.Where(x => x.Id == answer.QuestionId).SelectMany(x => x.Link_PerformanceGroupSkills).SelectMany(x => x.Trainings).Select(t => new IpsTrainingModel()
                    {
                        AdditionalInfo = t.AdditionalInfo,
                        Duration = t.Duration,
                        DurationMetricId = t.DurationMetricId,
                        EmailBefore = t.EmailBefore,
                        EndDate = t.EndDate,
                        ExerciseMetricId = t.ExerciseMetricId,
                        Frequency = t.Frequency,
                        How = t.How,
                        HowMany = t.HowMany,
                        HowManyActions = t.HowManyActions,
                        HowManySets = t.HowManySets,
                        Id = t.Id,
                        IsActive = t.IsActive,
                        IsNotificationByEmail = t.IsNotificationByEmail,
                        IsNotificationBySMS = t.IsNotificationBySMS,
                        IsTemplate = t.IsTemplate,
                        LevelId = t.LevelId,
                        Name = t.Name,
                        NotificationTemplateId = t.NotificationTemplateId,
                        OrganizationId = t.OrganizationId,
                        SmsBefore = t.SmsBefore,
                        StartDate = t.StartDate,
                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                        {
                            FeedbackDateTime = f.FeedbackDateTime,
                            Id = f.Id,
                            Rating = f.Rating,
                            TaskId = f.TaskId,
                            TimeSpentMinutes = f.TimeSpentMinutes,
                            TrainingId = f.TrainingId,
                            WhatNextDescription = f.WhatNextDescription,
                            WorkedNotWell = f.WorkedNotWell,
                            WorkedWell = f.WorkedWell
                        }).ToList(),
                        TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                        Skills = t.Skills.Select(s => new IpsSkillDDL
                        {
                            Id = s.Id,
                            Name = s.Name
                        }).ToList(),
                        Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                        {
                            PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                            {
                                Description = l.PerformanceGroup.Description,
                                Id = l.PerformanceGroup.Id,
                                Name = l.PerformanceGroup.Name,
                            }
                        }).ToList(),
                        TypeId = t.TypeId,
                        UserId = t.UserId,
                        What = t.What,
                        Why = t.Why
                    }).ToList()
                };

                if (!(item.Trainings.ToList().Count() > 0))
                {
                    item.Trainings = answer.Trainings.Select(t => new IpsTrainingModel()
                    {
                        AdditionalInfo = t.AdditionalInfo,
                        Duration = t.Duration,
                        DurationMetricId = t.DurationMetricId,
                        EmailBefore = t.EmailBefore,
                        EndDate = t.EndDate,
                        ExerciseMetricId = t.ExerciseMetricId,
                        Frequency = t.Frequency,
                        How = t.How,
                        HowMany = t.HowMany,
                        HowManyActions = t.HowManyActions,
                        HowManySets = t.HowManySets,
                        Id = t.Id,
                        IsActive = t.IsActive,
                        IsNotificationByEmail = t.IsNotificationByEmail,
                        IsNotificationBySMS = t.IsNotificationBySMS,
                        IsTemplate = t.IsTemplate,
                        LevelId = t.LevelId,
                        Name = t.Name,
                        NotificationTemplateId = t.NotificationTemplateId,
                        OrganizationId = t.OrganizationId,
                        SmsBefore = t.SmsBefore,
                        StartDate = t.StartDate,
                        TrainingFeedbacks = t.TrainingFeedbacks.Select(f => new IPSTrainingFeedback
                        {
                            FeedbackDateTime = f.FeedbackDateTime,
                            Id = f.Id,
                            Rating = f.Rating,
                            TaskId = f.TaskId,
                            TimeSpentMinutes = f.TimeSpentMinutes,
                            TrainingId = f.TrainingId,
                            WhatNextDescription = f.WhatNextDescription,
                            WorkedNotWell = f.WorkedNotWell,
                            WorkedWell = f.WorkedWell
                        }).ToList(),
                        TrainingMaterials = t.TrainingMaterials.Select(m => new IPSTrainingMaterial
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
                        Skills = t.Skills.Select(s => new IpsSkillDDL
                        {
                            Id = s.Id,
                            Name = s.Name
                        }).ToList(),
                        Link_PerformanceGroupSkills = t.Link_PerformanceGroupSkills.Select(l => new IPSLink_PerformanceGroupSkillsModel()
                        {
                            PerformanceGroup = new BusinessModels.ProfileModels.IpsPerformanceGroupModel()
                            {
                                Description = l.PerformanceGroup.Description,
                                Id = l.PerformanceGroup.Id,
                                Name = l.PerformanceGroup.Name,
                            }
                        }).ToList(),
                        TypeId = t.TypeId,
                        UserId = t.UserId,
                        What = t.What,
                        Why = t.Why
                    }).ToList();
                }

                item.Points = item.IsCorrect ? answer.Question.Points ?? 0 : 0;


                item.Skills = _ipsDataContext.Questions.Where(x => x.Id == item.QuestionId).SelectMany(x => x.Link_PerformanceGroupSkills).Select(s => new IpsSkillDDL()
                {
                    Id = s.Skill != null ? s.Skill.Id : s.SkillId,
                    Name = s.Skill != null ? s.Skill.Name : _ipsDataContext.Skills.Where(x => x.Id == s.SkillId).Select(sk => sk.Name).FirstOrDefault(),
                }).ToList();

                result.Add(item);
            }
            return result;
        }

        public TrainingMaterial AddTrainingMaterial(TrainingMaterial trainingMaterial)
        {
            trainingMaterial.CreatedOn = DateTime.Now;
            trainingMaterial.CreatedBy = _authService.GetCurrentUserId();
            _ipsDataContext.TrainingMaterials.Add(trainingMaterial);
            _ipsDataContext.SaveChanges();
            return trainingMaterial;
        }

    }
}

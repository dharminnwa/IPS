using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using log4net;
using IPS.BusinessModels.TrainingModels;
using IPS.BusinessModels.SkillModels;
using IPS.Business.Utils;

namespace IPS.Business
{

    public class TrainingService : BaseService, IPS.Business.ITrainingService
    {

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public List<IpsTrainingModel> Get()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Trainings.Select(x => new IpsTrainingModel
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
                }).ToList();


            }
            else
            {
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                TrainingDiaryService tdService = new TrainingDiaryService();
                List<int> userTrainngIds = tdService.GetUserTrainingsForTimeCalculation(realCurrentUser.User.Id).Select(x => x.Id).ToList();

                return _ipsDataContext.Trainings.Where(t => t.OrganizationId != null && t.OrganizationId == realCurrentUser.User.OrganizationId && ((userTrainngIds.Contains(t.Id) || t.IsTemplate == true))).Select(x => new IpsTrainingModel
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
                    TypeId = x.TypeId,
                    UserId = x.UserId,
                    What = x.What,
                    Why = x.Why
                }).ToList();
            }
        }

        public List<IpsTrainingModel> GetTemplates()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Trainings.Where(x => x.IsTemplate == true).Select(x => new IpsTrainingModel
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
                }).ToList();


            }
            else
            {
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                TrainingDiaryService tdService = new TrainingDiaryService();
                List<int> userTrainngIds = tdService.GetUserTrainingsForTimeCalculation(realCurrentUser.User.Id).Select(x => x.Id).ToList();

                return _ipsDataContext.Trainings.Where(t => t.OrganizationId != null && t.OrganizationId == realCurrentUser.User.OrganizationId && userTrainngIds.Contains(t.Id) && t.IsTemplate == true).Select(x => new IpsTrainingModel
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
                    TypeId = x.TypeId,
                    UserId = x.UserId,
                    What = x.What,
                    Why = x.Why
                }).ToList();
            }
        }

        public Training Add(Training training)
        {
            List<Skill> skills = new List<Skill>(training.Skills);
            training.Skills.Clear();
            foreach (TrainingMaterial tm in training.TrainingMaterials)
            {
                tm.CreatedOn = DateTime.Now;
                tm.CreatedBy = _authService.GetCurrentUserId();
            }
            if (!string.IsNullOrEmpty(training.Frequency))
            {
                training.DescriptiveFrequency = RecurrenceRuleParser.ParseRRule(training.Frequency, true);
            }
            training.CreatedOn = DateTime.Now;
            training.CreatedBy = _authService.GetCurrentUserId();
            _ipsDataContext.Trainings.Add(training);
            _ipsDataContext.SaveChanges();

            foreach (Skill skill in skills)
            {
                Skill skillDB = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == skill.Id).FirstOrDefault();
                if (!skillDB.Trainings.Contains(training))
                {
                    skillDB.Trainings.Add(training);
                }
            }

            _ipsDataContext.SaveChanges();

            return training;

        }

        public bool Update(Training training)
        {

            var original = _ipsDataContext.Trainings.Include("Skills").Include("TrainingMaterials").Where(t => t.Id == training.Id).FirstOrDefault();

            if (original != null)
            {
                if (!string.IsNullOrEmpty(training.Frequency))
                {
                    training.DescriptiveFrequency = RecurrenceRuleParser.ParseRRule(training.Frequency, true);
                }
                training.ModifiedBy = _authService.GetCurrentUserId();
                training.ModifiedOn = DateTime.Now;
                _ipsDataContext.Entry(original).CurrentValues.SetValues(training);
                foreach (Skill dBSkill in original.Skills)
                {
                    Skill currentSkill = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == dBSkill.Id).FirstOrDefault();
                    currentSkill.Trainings.Remove(original);
                }

                foreach (Skill dBSkill in training.Skills)
                {
                    Skill skill = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == dBSkill.Id).FirstOrDefault();
                    skill.Trainings.Add(original);

                }

                foreach (TrainingMaterial dBTrainingMaterial in training.TrainingMaterials)
                {
                    TrainingMaterial currentTrainingMaterial = _ipsDataContext.TrainingMaterials.Where(tm => tm.Id == dBTrainingMaterial.Id).FirstOrDefault();
                    if (currentTrainingMaterial != null)
                    {

                        //currentTrainingMaterial = dBTrainingMaterial;
                        //currentTrainingMaterial.TrainingId = training.Id;
                        _ipsDataContext.Entry(currentTrainingMaterial).CurrentValues.SetValues(dBTrainingMaterial);
                    }
                    else
                    {
                        dBTrainingMaterial.TrainingId = training.Id;
                        dBTrainingMaterial.CreatedOn = DateTime.Now;
                        dBTrainingMaterial.CreatedBy = _authService.GetCurrentUserId();
                        _ipsDataContext.TrainingMaterials.Add(dBTrainingMaterial);
                    }

                }

                int[] trainingMaterialsIds = training.TrainingMaterials.Select(i => i.Id).ToArray();

                List<TrainingMaterial> trainingMaterials = _ipsDataContext.TrainingMaterials.Where(tm => tm.TrainingId == training.Id && !trainingMaterialsIds.Contains(tm.Id)).ToList();
                _ipsDataContext.TrainingMaterials.RemoveRange(trainingMaterials);

                _ipsDataContext.SaveChanges();
            }

            return true;

        }

        public void CheckTrainingInUse(int trainingId)
        {
            Training training = _ipsDataContext.Trainings.Include("Skills").Include("Link_PerformanceGroupSkills").Include("EvaluationAgreements").Include("Tasks").Where(t => t.Id == trainingId).FirstOrDefault();
            if (training != null)
            {
                CheckTrainingInUse(training);
            }
        }

        public void CheckPerformanceGroupTrainingInUse(int trainingId)
        {
            Training training = _ipsDataContext.Trainings.Include("EvaluationAgreements").Where(t => t.Id == trainingId).FirstOrDefault();
            if (training != null)
            {
                CheckTrainingInUse(training);
            }
        }
        public void CheckPerformanceGroupTrainingInUse(Training training)
        {
            if (training.EvaluationAgreements.Any())
                throw new Exception("Training is assigned to Development Contracts.");

        }

        public void CheckTrainingInUse(Training training)
        {
            if (training.Link_PerformanceGroupSkills.Any())
                throw new Exception("Training is assigned to Performance Groups.");
            if (training.EvaluationAgreements.Any())
                throw new Exception("Training is assigned to Development Contracts.");
            if (training.Tasks.Any())
                throw new Exception("Training is assigned to User Tasks.");
        }


        public string Delete(IpsTrainingModel training)
        {
            Training original = _ipsDataContext.Trainings.Include("Skills").Include("Link_PerformanceGroupSkills").Include("EvaluationAgreements").Include("Tasks").Where(t => t.Id == training.Id).FirstOrDefault();
            try
            {
                if (original != null)
                {
                    try
                    {
                        CheckTrainingInUse(original);
                    }
                    catch (Exception ex)
                    {
                        return ex.Message;
                    }

                    foreach (Skill skill in original.Skills)
                    {
                        Skill dbSkill = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == skill.Id).FirstOrDefault();
                        dbSkill.Trainings.Remove(original);
                    }

                    List<TrainingMaterial> trainingMaterials = _ipsDataContext.TrainingMaterials.Where(tm => tm.TrainingId == training.Id).ToList();
                    _ipsDataContext.TrainingMaterials.RemoveRange(trainingMaterials);

                    _ipsDataContext.Trainings.Remove(original);
                    _ipsDataContext.SaveChanges();


                }
                return "OK";
            }
            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }

        }


        public string DeletePerformanceGroupTraining(IpsTrainingModel training)
        {
            Training original = _ipsDataContext.Trainings.Include("Skills").Include("Link_PerformanceGroupSkills").Include("EvaluationAgreements").Include("Tasks").Where(t => t.Id == training.Id).FirstOrDefault();
            try
            {
                if (original != null)
                {
                    try
                    {
                        CheckPerformanceGroupTrainingInUse(original);
                    }
                    catch (Exception ex)
                    {
                        return ex.Message;
                    }

                    foreach (Skill skill in original.Skills)
                    {
                        Skill dbSkill = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == skill.Id).FirstOrDefault();
                        dbSkill.Trainings.Remove(original);
                    }
                    foreach (Link_PerformanceGroupSkills pgskill in original.Link_PerformanceGroupSkills)
                    {
                        Link_PerformanceGroupSkills dbpgSkill = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(s => s.Id == pgskill.Id).FirstOrDefault();
                        dbpgSkill.Trainings.Remove(original);
                    }

                    List<TrainingMaterial> trainingMaterials = _ipsDataContext.TrainingMaterials.Where(tm => tm.TrainingId == training.Id).ToList();
                    _ipsDataContext.TrainingMaterials.RemoveRange(trainingMaterials);

                    _ipsDataContext.Trainings.Remove(original);
                    _ipsDataContext.SaveChanges();


                }
                return "OK";
            }
            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }

        }

        public Training CloneTraining(int trainingId)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    string copyName = _ipsDataContext.Trainings
                        .Where(t => t.Id == trainingId)
                        .Select(t => t.Name)
                        .FirstOrDefault() + " clone"; ;
                    if (_ipsDataContext.Trainings.Where(t => t.Name == copyName).Count() > 0)
                    {
                        int i = 1;
                        while (true)
                        {
                            if (_ipsDataContext.Trainings.Where(t => t.Name == copyName + i.ToString()).Count() == 0)
                            {
                                copyName = copyName + i.ToString();
                                break;
                            }
                            i++;
                        }
                    }
                    var newTraining = CreateCopyTraining(trainingId, copyName);
                    dbContextTransaction.Commit();
                    return newTraining;
                }
                catch (Exception ex)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        private Training CreateCopyTraining(int trainingId, string copyName)
        {

            Training trainingDb = _ipsDataContext.Trainings
                .Include("Skills")
                .Include(t => t.TrainingMaterials)
                .Where(t => t.Id == trainingId).FirstOrDefault();

            Training newTraining = new Training();

            newTraining.Id = 0;
            newTraining.Name = copyName;
            newTraining.What = trainingDb.What;
            newTraining.How = trainingDb.How;
            newTraining.Why = trainingDb.Why;
            newTraining.AdditionalInfo = trainingDb.AdditionalInfo;
            newTraining.LevelId = trainingDb.LevelId;
            newTraining.Frequency = trainingDb.Frequency;
            newTraining.Duration = trainingDb.Duration;
            newTraining.DurationMetricId = trainingDb.DurationMetricId;
            newTraining.TypeId = trainingDb.TypeId;
            newTraining.IsTemplate = trainingDb.IsTemplate;
            newTraining.IsActive = trainingDb.IsActive;
            newTraining.OrganizationId = trainingDb.OrganizationId;
            newTraining.StartDate = trainingDb.StartDate;
            newTraining.EndDate = trainingDb.EndDate;

            newTraining.CreatedOn = DateTime.Now;
            newTraining.CreatedBy = _authService.GetCurrentUserId();
            if (!string.IsNullOrEmpty(trainingDb.Frequency))
            {
                newTraining.DescriptiveFrequency = RecurrenceRuleParser.ParseRRule(trainingDb.Frequency, true);
            }
            _ipsDataContext.Trainings.Add(newTraining);
            _ipsDataContext.SaveChanges();

            foreach (var trMatDb in trainingDb.TrainingMaterials)
            {
                var trainingMaterialCopy = new TrainingMaterial();
                trainingMaterialCopy.Description = trMatDb.Description;
                trainingMaterialCopy.Link = trMatDb.Link;
                trainingMaterialCopy.MaterialType = trMatDb.MaterialType;
                trainingMaterialCopy.Name = trMatDb.Name;
                trainingMaterialCopy.ResourceType = trMatDb.ResourceType;
                trainingMaterialCopy.Title = trMatDb.Title;
                trainingMaterialCopy.TrainingId = trMatDb.TrainingId;

                trainingMaterialCopy.CreatedOn = DateTime.Now;
                trainingMaterialCopy.CreatedBy = _authService.GetCurrentUserId();
                newTraining.TrainingMaterials.Add(trainingMaterialCopy);

                _ipsDataContext.SaveChanges();
            }

            foreach (Skill skill in trainingDb.Skills)
            {
                Skill skillDB = _ipsDataContext.Skills.Include("Trainings").Where(s => s.Id == skill.Id).FirstOrDefault();

                skill.Trainings.Add(newTraining);
                _ipsDataContext.SaveChanges();
            }

            return newTraining;
        }

        public bool IsTrainingExist(int trainingId)
        {
            return _ipsDataContext.Trainings.Any(t => t.Id == trainingId);
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
                            newTrainingFeedback.EvaluatorFeedBackTime = DateTime.Now;
                            newTrainingFeedback.IsEvaluatorFeedBack = true;
                            _ipsDataContext.Entry(original).CurrentValues.SetValues(newTrainingFeedback);
                        }
                    }
                    else
                    {
                        trainingFeedback.FeedbackDateTime = DateTime.Now;
                        int PasuedTrainings = _ipsDataContext.TrainingFeedbacks.Where(x => x.TrainingId == trainingFeedback.TrainingId && x.IsParticipantPaused == true).Select(x => x.TimeSpentMinutes.HasValue ? x.TimeSpentMinutes.Value : 0).ToList().Sum();
                        trainingFeedback.TimeSpentMinutes = trainingFeedback.TimeSpentMinutes + PasuedTrainings;
                        _ipsDataContext.TrainingFeedbacks.Add(trainingFeedback);
                        _ipsDataContext.SaveChanges();
                        List<DateTime> recurrencesTraining = RecurrenceRuleParser.GetRecurrenceDateTime(training.Frequency, (DateTime)training.StartDate, (DateTime)training.EndDate);
                        int index = 1;
                        foreach (DateTime recurrence in recurrencesTraining)
                        {
                            if (training.IsNotificationByEmail && training.UserId == null)
                            {
                                DateTime recurrenceStartTime = recurrence;
                                DateTime recurrenceEndTime = recurrence.AddMinutes(30);
                                if ((index % training.EvaluatorFeedbackRecurrence) == 0)
                                {
                                    // Send Notification to Evaluator

                                    int EvaluationAgreementsId = _ipsDataContext.Trainings.Where(x => x.Id == training.Id).Select(x => x.EvaluationAgreements.FirstOrDefault().Id).FirstOrDefault();
                                    if (EvaluationAgreementsId > 0)
                                    {
                                        EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationAgreements.Where(x => x.Id == EvaluationAgreementsId).Select(x => x.EvaluationParticipant).FirstOrDefault();
                                        List<EvaluationParticipant> evaluatorParticipants = _ipsDataContext.EvaluationParticipants.Where(x => x.EvaluateeId == evaluationParticipant.Id).ToList();
                                        foreach (EvaluationParticipant evaluator in evaluatorParticipants)
                                        {
                                            int evaluatorId = 0;
                                            evaluatorId = evaluator.UserId;
                                            if (evaluatorId > 0)
                                            {
                                                TrainingFeedback lastFeedBack = _ipsDataContext.TrainingFeedbacks.Where(x => x.TrainingId == training.Id && x.IsEvaluatorFeedBack == true && x.EvaluatorId == evaluatorId).OrderByDescending(x => x.Id).FirstOrDefault();
                                                if (lastFeedBack != null)
                                                {
                                                    if (recurrenceStartTime > lastFeedBack.RecurrencesStartTime && recurrenceStartTime == trainingFeedback.RecurrencesStartTime)
                                                    {
                                                        TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                                        evaluatorTrainingFeedback.WhatNextDescription = "";
                                                        evaluatorTrainingFeedback.WorkedNotWell = "";
                                                        evaluatorTrainingFeedback.WorkedWell = "";
                                                        evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                                        _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                                        // Send Email Notifciation from here
                                                    }
                                                }
                                                else
                                                {
                                                    if (recurrenceStartTime == trainingFeedback.RecurrencesStartTime)
                                                    {
                                                        TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                                        evaluatorTrainingFeedback.WhatNextDescription = "";
                                                        evaluatorTrainingFeedback.WorkedNotWell = "";
                                                        evaluatorTrainingFeedback.WorkedWell = "";
                                                        evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                                        _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                                        // Send Email Notifciation from here
                                                    }
                                                }
                                            }
                                        }
                                    }

                                }
                                else if ((((index + 1) % training.EvaluatorFeedbackRecurrence) != 0) && (index + 1) == recurrencesTraining.Count)
                                {
                                    int EvaluationAgreementsId = _ipsDataContext.Trainings.Where(x => x.Id == training.Id).Select(x => x.EvaluationAgreements.FirstOrDefault().Id).FirstOrDefault();
                                    if (EvaluationAgreementsId > 0)
                                    {
                                        EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationAgreements.Where(x => x.Id == EvaluationAgreementsId).Select(x => x.EvaluationParticipant).FirstOrDefault();

                                        List<EvaluationParticipant> evaluatorParticipants = _ipsDataContext.EvaluationParticipants.Where(x => x.EvaluateeId == evaluationParticipant.Id).ToList();
                                        foreach (EvaluationParticipant evaluator in evaluatorParticipants)
                                        {
                                            int evaluatorId = 0;
                                            evaluatorId = evaluator.UserId;
                                            if (evaluatorId > 0)
                                            {
                                                TrainingFeedback lastFeedBack = _ipsDataContext.TrainingFeedbacks.Where(x => x.TrainingId == training.Id && x.IsEvaluatorFeedBack == true && x.EvaluatorId == evaluatorId).OrderByDescending(x => x.Id).FirstOrDefault();
                                                if (lastFeedBack != null)
                                                {
                                                    if (recurrenceStartTime > lastFeedBack.RecurrencesStartTime)
                                                    {
                                                        TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                                        evaluatorTrainingFeedback.WhatNextDescription = "";
                                                        evaluatorTrainingFeedback.WorkedNotWell = "";
                                                        evaluatorTrainingFeedback.WorkedWell = "";
                                                        evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                                        _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                                        // Send Email Notifciation
                                                        break;
                                                    }
                                                }
                                                else
                                                {
                                                    TrainingFeedback evaluatorTrainingFeedback = trainingFeedback;
                                                    evaluatorTrainingFeedback.WhatNextDescription = "";
                                                    evaluatorTrainingFeedback.WorkedNotWell = "";
                                                    evaluatorTrainingFeedback.WorkedWell = "";
                                                    evaluatorTrainingFeedback.EvaluatorId = evaluatorId;
                                                    _ipsDataContext.TrainingFeedbacks.Add(evaluatorTrainingFeedback);

                                                    // Send Email Notifciation
                                                    break;
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                            index++;
                        }
                    }
                }

                _ipsDataContext.SaveChanges();
            }
            else if (trainingFeedback.TaskId > 0)
            {
                var original = _ipsDataContext.Tasks.Find(trainingFeedback.TaskId);

                if (original != null)
                {
                    original.TimeSpentMinutes = trainingFeedback.TimeSpentMinutes;

                }
                trainingFeedback.FeedbackDateTime = DateTime.Now;
                _ipsDataContext.TrainingFeedbacks.Add(trainingFeedback);
                _ipsDataContext.SaveChanges();

            }
            return trainingFeedback;
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
                WorkedWell = f.WorkedWell,
                IsRecurrences = f.IsRecurrences,
                RecurrencesEndTime = f.RecurrencesEndTime,
                RecurrencesRule = f.RecurrencesRule,
                RecurrencesStartTime = f.RecurrencesStartTime,
                IsParticipantPaused = f.IsParticipantPaused,
                ParticipantPausedAt = f.ParticipantPausedAt,
                IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                EvaluatorId = f.EvaluatorId,
            }).FirstOrDefault();
        }


        public TrainingNote SaveTrainingNote(TrainingNote trainingNote)
        {
            Training training = _ipsDataContext.Trainings.Where(t => t.Id == trainingNote.TrainingId).FirstOrDefault();
            if (training != null)
            {
                if (trainingNote.Id > 0)
                {
                    TrainingNote original = _ipsDataContext.TrainingNotes.Where(x => x.Id == trainingNote.Id).FirstOrDefault();
                    if (original != null)
                    {
                        trainingNote.CreatedBy = original.CreatedBy;
                        trainingNote.CreatedOn = original.CreatedOn;
                        trainingNote.ModifiedBy = _authService.GetCurrentUserId();
                        trainingNote.ModifiedOn = DateTime.Now;
                        _ipsDataContext.Entry(original).CurrentValues.SetValues(trainingNote);
                    }
                }
                else
                {
                    trainingNote.CreatedBy = _authService.GetCurrentUserId();
                    trainingNote.CreatedOn = DateTime.Now;
                    _ipsDataContext.TrainingNotes.Add(trainingNote);
                }
                _ipsDataContext.SaveChanges();
            }
            return trainingNote;
        }

        public List<IpsTrainingModel> FilterTraining(IpsTrainingFilter ipsTrainingFilter)
        {
            List<int> trainingids = new List<int>();
            List<int> idList = _authService.GetUserOrganizations();

            string query = " Select DISTINCT lpgt.TrainingId from Profiles p "
                           + " JOIN PerformanceGroups pg on pg.profileid = p.id "
                           + " JOIN Link_PerformanceGroupSkills lpgs on lpgs.PerformanceGroupId = pg.id "
                           + " JOIN Link_PerformancGroupTrainings lpgt on lpgt.PerformanceGroupSkillId = lpgs.id"
                           + " JOIN Trainings t on t.id = lpgt.trainingid";

            if (ipsTrainingFilter.JobPositionId > 0)
            {
                query += " JOIN Link_PerformanceGroupTargetAudience lpta on lpta.PerformanceGroupId = pg.id ";
            }
            if (ipsTrainingFilter.TrainingLevelId > 0 || ipsTrainingFilter.TrainingTypeId > 0)
            {
                query += "   ";
            }
            if (ipsTrainingFilter.IndustryId > 0)
            {
                query += " JOIN Industries i on i.Id = p.IndustryId  ";
            }

            query += " WHERE lpgt.TrainingId > 0 ";

            //if(ipsTrainingFilter.SkillId > 0 &)

            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                string organizations = string.Join(",", idList.ToArray());
                query += " and t.OrganizationId in(" + organizations + ")";


            }
            if (ipsTrainingFilter != null)
            {
                if (ipsTrainingFilter.OrganizationId > 0)
                {
                    query += " and ";
                    query += " p.OrganizationId = " + ipsTrainingFilter.OrganizationId;
                }
                if (ipsTrainingFilter.ProfileLevelId > 0)
                {
                    query += " and ";
                    query += " p.LevelId = " + ipsTrainingFilter.ProfileLevelId;
                }

                if (ipsTrainingFilter.PerformanceGroupId > 0)
                {
                    query += " and ";
                    query += " pg.Id = " + ipsTrainingFilter.PerformanceGroupId;
                }

                if (ipsTrainingFilter.SkillId > 0)
                {
                    query += " and ";
                    query += " lpgs.SkillId = " + ipsTrainingFilter.SkillId;
                }


                if (ipsTrainingFilter.JobPositionId > 0)
                {
                    query += " and ";
                    query += " lpta.JobPositionID = " + ipsTrainingFilter.JobPositionId;
                }


                if (ipsTrainingFilter.TrainingLevelId > 0)
                {
                    query += " and ";
                    query += " t.LevelId = " + ipsTrainingFilter.TrainingLevelId;
                }
                if (ipsTrainingFilter.TrainingTypeId > 0)
                {
                    query += " and ";
                    query += " t.TypeId = " + ipsTrainingFilter.TrainingTypeId;
                }
                if (ipsTrainingFilter.IndustryId > 0)
                {
                    if (ipsTrainingFilter.SubIndustryIds.Count > 0)
                    {
                        query += " and ";
                        query += " i.Id in (";
                        int index = 1;
                        foreach (int subId in ipsTrainingFilter.SubIndustryIds)
                        {
                            query += subId;
                            if (index < ipsTrainingFilter.SubIndustryIds.Count())
                            {
                                query += ',';
                            }
                            index++;
                        }
                        query += ")";

                    }
                    else
                    {
                        query += " and ";
                        query += " ( i.Id = " + ipsTrainingFilter.IndustryId;

                        query += " or ";
                        query += " i.ParentId = " + ipsTrainingFilter.IndustryId + " ) ";
                    }
                }

                if (ipsTrainingFilter.IsTemplate)
                {
                    query += " and ";
                    query += " t.IsTemplate = 1 ";
                }
            }
            List<int> userTrainingIds = new List<int>();
            List<int> filteredtrainingIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();
            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                if (ipsTrainingFilter != null)
                {

                    var currentUser = _authService.getCurrentUser();
                    var realCurrentUser = _authService.GetUserById(currentUser.Id);
                    TrainingDiaryService tdService = new TrainingDiaryService();
                    if (ipsTrainingFilter.IsShowActive)
                    {
                        userTrainingIds = tdService.GetUserTrainingsForTimeCalculation(realCurrentUser.User.Id).Where(x => x.IsActive == true).Select(x => x.Id).ToList();
                    }
                    if (ipsTrainingFilter.IsShowInactive)
                    {
                        userTrainingIds = tdService.GetUserTrainingsForTimeCalculation(realCurrentUser.User.Id).Where(x => x.IsActive == false).Select(x => x.Id).ToList();
                    }
                    if (ipsTrainingFilter.IsTemplate)
                    {
                        userTrainingIds = tdService.GetUserTrainingsForTimeCalculation(realCurrentUser.User.Id).Where(x => x.IsTemplate == true).Select(x => x.Id).ToList();
                    }
                }

            }

            return _ipsDataContext.Trainings.Where(x => filteredtrainingIds.Contains(x.Id) || userTrainingIds.Contains(x.Id)).Select(x => new IpsTrainingModel
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
            }).ToList();
        }

        public List<IpsTrainingModel> FilterSkillTraining(IpsTrainingFilter ipsTrainingFilter)
        {
            List<int> trainingids = new List<int>();
            List<int> idList = _authService.GetUserOrganizations();

            string query = " select distinct t.Id from Skills s "
                           + " join Link_SkillTrainings lst on lst.SkillId = s.Id "
                           + " join Trainings t on t.id = lst.TrainingId "
                           + " where t.id > 0 ";

            if (ipsTrainingFilter != null)
            {
                if (ipsTrainingFilter.SkillId > 0)
                {
                    query += " and ";
                    query += " s.id = " + ipsTrainingFilter.SkillId;
                }
                if (ipsTrainingFilter.TrainingLevelId > 0)
                {
                    query += " and ";
                    query += " t.LevelId = " + ipsTrainingFilter.TrainingLevelId;
                }
                if (ipsTrainingFilter.TrainingTypeId > 0)
                {
                    query += " and ";
                    query += " t.TypeId = " + ipsTrainingFilter.TrainingTypeId;
                }

            }
            List<int> filteredtrainingIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();

            return _ipsDataContext.Trainings.Where(x => filteredtrainingIds.Contains(x.Id)).Select(x => new IpsTrainingModel
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
                    TrainingId = m.TrainingId,
                    TrainingMaterialRatings = m.TrainingMaterialRatings.Select(r => new IPSTrainingMaterialRating()
                    {
                        Id = r.Id,
                        Rating = r.Rating,
                        TrainingMaterialId = r.TrainingMaterialId
                    }).ToList(),
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
            }).ToList();
        }



        public List<IpsTrainingModel> GetProjectTrainings(int projectId)
        {
            List<int> trainingids = new List<int>();


            string query = " Select DISTINCT lpgt.TrainingId from Profiles p "
                           + " JOIN PerformanceGroups pg on pg.profileid = p.id "
                           + " JOIN Link_PerformanceGroupSkills lpgs on lpgs.PerformanceGroupId = pg.id "
                           + " JOIN Link_PerformancGroupTrainings lpgt on lpgt.PerformanceGroupSkillId = lpgs.id";

            query += " WHERE lpgt.TrainingId > 0 and p.projectId =  " + projectId;

            List<int> filteredtrainingIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();

            return _ipsDataContext.Trainings.Where(x => filteredtrainingIds.Contains(x.Id)).Select(x => new IpsTrainingModel
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
            }).ToList();
        }

        public IpsTrainingModel GetTrainingDetailById(int trainingId)
        {
            return _ipsDataContext.Trainings.Include("TrainingFeedbacks").Include("TrainingMaterials").Where(t => t.Id == trainingId).Select(x => new IpsTrainingModel
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
                    WorkedWell = f.WorkedWell,
                    IsRecurrences = f.IsRecurrences,
                    RecurrencesEndTime = f.RecurrencesEndTime,
                    RecurrencesRule = f.RecurrencesRule,
                    RecurrencesStartTime = f.RecurrencesStartTime,
                    IsParticipantPaused = f.IsParticipantPaused,
                    ParticipantPausedAt = f.ParticipantPausedAt,
                    IsEvaluatorFeedBack = f.IsEvaluatorFeedBack,
                    EvaluatorFeedBackTime = f.EvaluatorFeedBackTime,
                    EvaluatorId = f.EvaluatorId,
                    StartedAt = f.StartedAt,

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
                TypeId = x.TypeId,
                UserId = x.UserId,
                What = x.What,
                Why = x.Why,
                IPSTrainingNotes = x.TrainingNotes.Select(f => new IPSTrainingNote
                {
                    Id = f.Id,
                    TrainingId = f.TrainingId,
                    Goal = f.Goal,
                    OtherInfo = f.OtherInfo,
                    MeasureInfo = f.MeasureInfo,
                    ProceedInfo = f.ProceedInfo,
                }).ToList(),
            }).FirstOrDefault();
        }


        public List<IpsTrainingModel> getTrainingTemplatesBySkill(int skillId)
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            string[] ignoreWords = new[] { "this", "your", "that", "does", "about", "have" };
            SkillsService _skillsService = new SkillsService();

            Skill skillInfo = _skillsService.GetSkillById(skillId);

            List<string> skillText = new List<string>();
            List<string> skillwords = new List<string>();

            List<string> trainingText = new List<string>();
            List<string> trainingWords = new List<string>();

            if (!string.IsNullOrEmpty(skillInfo.Description))
            {
                List<string> splittedDescription = skillInfo.Description.Split(' ').ToList();
                foreach (string splitText in splittedDescription)
                {
                    if (splitText.Length > 3)
                    {
                        if ((!ignoreWords.Contains(splitText.ToLower())) && (!skillwords.Contains(splitText.ToLower())))
                        {
                            skillwords.Add(splitText.ToLower());
                            skillText.Add("s.description like '%" + splitText + "%'");
                        }
                    }
                }

            }

            if (!string.IsNullOrEmpty(skillInfo.Description))
            {
                List<string> splittedDescription = skillInfo.Description.Split(' ').ToList();
                foreach (string splitText in splittedDescription)
                {
                    if (splitText.Length > 3)
                    {
                        if ((!ignoreWords.Contains(splitText.ToLower())) && (!trainingWords.Contains(splitText.ToLower())))
                        {
                            trainingWords.Add(splitText.ToLower());
                            trainingText.Add("t.why like '%" + splitText + "%'");
                        }
                    }
                }

            }

            string query = "select distinct t.id from trainings t " +
                           " join Link_SkillTrainings lst on t.id = lst.TrainingId " +
                           " join Skills s on s.id = lst.skillid " +
                           " where t.isTemplate = 1 ";

            List<string> condtions = new List<string>();
            if (skillText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += "  ( ";
                condtion += string.Join(" or ", skillText);
                condtion += " ) ";
                condtions.Add(condtion);
            }
            if (trainingText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += "  ( ";
                condtion += string.Join(" or ", trainingText);
                condtion += " ) ";
                condtions.Add(condtion);
            }

            if (condtions.Count() > 0)
            {
                query += " and (" + string.Join(" or ", condtions) + ")";

                List<int> trainingIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();
                result = _ipsDataContext.Trainings.Where(x => trainingIds.Contains(x.Id)).Select(x => new IpsTrainingModel
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
                }).ToList();
            }
            //and(proj.MissionStatement like '%001%')

            return result;
        }

        public void UpdateTrainingFrequencyDecription()
        {

            List<Training> trainings = _ipsDataContext.Trainings.Where(x => x.Frequency != null && x.Frequency.StartsWith("FREQ") == true && x.DescriptiveFrequency == null).ToList();
            foreach (Training oldTraining in trainings)
            {
                Training newtraining = oldTraining;
                if (!string.IsNullOrEmpty(newtraining.Frequency))
                {
                    newtraining.DescriptiveFrequency = RecurrenceRuleParser.ParseRRule(newtraining.Frequency, true);
                }
                _ipsDataContext.Entry(oldTraining).CurrentValues.SetValues(newtraining);
                _ipsDataContext.SaveChanges();
            }
        }

        public bool AddSensorData(List<SensorData> sensorDatas)
        {
            if (sensorDatas.Count() > 0)
            {
                _ipsDataContext.SensorDatas.AddRange(sensorDatas);
                int result = _ipsDataContext.SaveChanges();
                if (result > 0)
                {
                    return true;
                }
            }
            return false;
        }
        public List<SensorData> GetSensorDataByUserId(int userId)
        {
            List<SensorData> result = _ipsDataContext.SensorDatas.Where(x => x.UserId == userId).ToList();
            return result;
        }


        public bool DeleteSensorDataById(int id)
        {
            bool result = false;
            if(id > 0)
            {
                SensorData sensorData = _ipsDataContext.SensorDatas.Where(x => x.Id == id).FirstOrDefault();
                if (sensorData != null)
                {
                    _ipsDataContext.SensorDatas.Remove(sensorData);
                    int count = _ipsDataContext.SaveChanges();
                    if(count > 0)
                    {
                        result = true;
                    }
                }
            }
            return result;
        }
    }
}

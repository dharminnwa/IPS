using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Enums;
using IPS.Data.Enums;
using IPS.BusinessModels.ProfileModels;
using Newtonsoft.Json;
using IPS.BusinessModels.ProjectModel;

namespace IPS.Business
{
    public class StageGroupsService : BaseService, IStageGroupsService
    {
        public IQueryable<StageGroup> GetStageGroups()
        {
            return _ipsDataContext.StageGroups.AsNoTracking().AsQueryable();
        }

        public IQueryable<StageGroup> GetStageGroupById(int id)
        {
            return _ipsDataContext.StageGroups.Where(sg => sg.Id == id).AsQueryable();
        }

        private Stage createDeafultStage(DateTime startDate, StageGroup stageGroup, string name)
        {
            Stage stage = new Stage();
            stage.Name = name;
            stage.StartDateTime = startDate;
            stage.StageGroupId = stageGroup.Id;
            if (stageGroup.ActualTimeSpan.HasValue)
            {
                long newTick = startDate.Ticks + stageGroup.ActualTimeSpan.Value * 10000;
                stage.EndDateTime = new DateTime(newTick);
            }
            else
            {
                stage.EndDateTime = startDate.AddMonths(stageGroup.MonthsSpan).AddDays(stageGroup.DaysSpan + (7 * stageGroup.WeeksSpan)).AddHours(stageGroup.HoursSpan).AddMinutes(stageGroup.MinutesSpan);
            }

            if (name == "Start Stage")
            {
                if (stageGroup.StartStageEndDate.HasValue)
                {
                    stage.EndDateTime = stageGroup.StartStageEndDate.Value;
                }

                stage.EvaluationStartDate = stage.StartDateTime;
                stage.EvaluationEndDate = stage.EndDateTime;
            }
            else
            {
                stage.EvaluationStartDate = stage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 0, 0));
                if (stage.EvaluationStartDate > stage.EndDateTime)
                {
                    stage.EvaluationStartDate = stage.StartDateTime;
                }
                else if (stage.EvaluationStartDate < stage.StartDateTime)
                {
                    stage.EvaluationStartDate = stage.StartDateTime;
                }
                stage.EvaluationEndDate = stage.EndDateTime;
            }
            stage.EvaluationDurationMinutes = 120;
            stage.EmailNotification = false;
            stage.SMSNotification = false;

            DateTime startdatetime = stage.StartDateTime;
            DateTime enddatetime = stage.EndDateTime;
            long TotalDiffrence = enddatetime.Ticks - startdatetime.Ticks;
            long greenAlarmAt = Convert.ToInt64(TotalDiffrence * 0.20);
            long yellowAlarmAt = Convert.ToInt64(TotalDiffrence * 0.60);
            long redAlarmAt = Convert.ToInt64(TotalDiffrence * 0.90);


            stage.GreenAlarmTime = stage.StartDateTime.AddTicks(greenAlarmAt);  //stage.EndDateTime.AddDays(-1);
            stage.YellowAlarmTime = stage.StartDateTime.AddTicks(yellowAlarmAt);
            stage.RedAlarmTime = stage.EndDateTime.AddMinutes(1);
            stage.CreatedOn = DateTime.Now;
            stage.CreatedBy = _authService.GetCurrentUserId();
            return stage;
        }

        public StageGroup AddStageGroup(StageGroup stageGroup)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    List<Profile> profiles = new List<Profile>(stageGroup.Profiles);
                    stageGroup.Profiles.Clear();
                    stageGroup.CreatedOn = DateTime.Now;
                    stageGroup.CreatedBy = _authService.GetCurrentUserId();
                    _ipsDataContext.StageGroups.Add(stageGroup);
                    _ipsDataContext.SaveChanges();

                    IpsProjectModel projectInfo = new IpsProjectModel();
                    ProfileTypeEnum profileType = ProfileTypeEnum.Soft;
                    if (profiles.Count > 0)
                    {
                        var profileId = profiles[0].Id;
                        profileType =
                            (ProfileTypeEnum)_ipsDataContext.Profiles.Where(x => x.Id == profileId)
                                .Select(x => x.ProfileTypeId)
                                .FirstOrDefault();
                        ProjectService projectService = new ProjectService();
                        projectInfo = projectService.GetProjectByProfileId(profileId);
                    }
                    Stage startStage = null;
                    if (stageGroup.StartStageStartDate.HasValue)
                    {
                        startStage = createDeafultStage(stageGroup.StartStageStartDate.GetValueOrDefault(), stageGroup, "Start Stage");

                    }
                    else
                    {
                        startStage = createDeafultStage(stageGroup.StartDate.GetValueOrDefault(), stageGroup, "Start Stage");
                    }
                    stageGroup.Stages = new List<Stage>();

                    if (profileType == ProfileTypeEnum.Soft || profileType == ProfileTypeEnum.Hard)
                    {
                        startStage.EvaluationStartDate = startStage.StartDateTime;
                        startStage.EvaluationEndDate = startStage.EndDateTime;
                        stageGroup.Stages.Add(startStage);
                        if (stageGroup.TotalMilestones > 0)
                        {
                            for (int i = 1; i <= stageGroup.TotalMilestones; i++)
                            {
                                Stage newMilestoneStage = null;
                                if (i == 1 && stageGroup.MilestoneStartDate.HasValue)
                                {
                                    newMilestoneStage = createDeafultStage(stageGroup.MilestoneStartDate.Value, stageGroup, "Prestasjons evaluering " + i);
                                }
                                else
                                {
                                    newMilestoneStage = createDeafultStage(stageGroup.Stages.Last().EndDateTime, stageGroup, "Prestasjons evaluering " + i);
                                }
                                stageGroup.Stages.Add(newMilestoneStage);
                            }
                        }
                        else
                        {
                            Stage shortStage = createDeafultStage(startStage.EndDateTime, stageGroup, "Short Goal");
                            Stage midStage = createDeafultStage(shortStage.EndDateTime, stageGroup, "Mid Goal");
                            Stage longStage = createDeafultStage(midStage.EndDateTime, stageGroup, "Long Term Goal");
                            Stage finalStage = createDeafultStage(longStage.EndDateTime, stageGroup, "Final Goal");



                            shortStage.EvaluationStartDate = shortStage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 0, 0));
                            if (shortStage.EvaluationStartDate > shortStage.EndDateTime)
                            {
                                shortStage.EvaluationStartDate = shortStage.StartDateTime;
                            }
                            shortStage.EvaluationEndDate = shortStage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0)); ;
                            stageGroup.Stages.Add(shortStage);


                            midStage.EvaluationStartDate = midStage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 0, 0));
                            if (midStage.EvaluationStartDate > midStage.EndDateTime)
                            {
                                midStage.EvaluationStartDate = midStage.StartDateTime;
                            }
                            midStage.EvaluationEndDate = midStage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0));

                            stageGroup.Stages.Add(midStage);

                            longStage.EvaluationStartDate = longStage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 0, 0));
                            if (longStage.EvaluationStartDate > longStage.EndDateTime)
                            {
                                longStage.EvaluationStartDate = longStage.StartDateTime;
                            }
                            longStage.EvaluationEndDate = longStage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0)); ;
                            stageGroup.Stages.Add(longStage);

                            finalStage.EvaluationStartDate = finalStage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 0, 0));
                            if (finalStage.EvaluationStartDate > finalStage.EndDateTime)
                            {
                                finalStage.EvaluationStartDate = finalStage.StartDateTime;
                            }
                            finalStage.EvaluationEndDate = finalStage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0));
                            stageGroup.Stages.Add(finalStage);
                            stageGroup.EndDate = finalStage.EndDateTime.AddDays(1);
                        }
                    }
                    else
                    {
                        stageGroup.EndDate = startStage.EndDateTime.AddDays(1);
                        startStage.EvaluationStartDate = startStage.StartDateTime.Date.Add(new TimeSpan(7, 0, 0));
                        startStage.EvaluationEndDate = startStage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0));
                        stageGroup.Stages.Add(startStage);
                    }

                    _ipsDataContext.SaveChanges();

                    foreach (Profile profile in profiles)
                    {
                        Profile profileDB = _ipsDataContext.Profiles.Include("StageGroups").Where(p => p.Id == profile.Id).FirstOrDefault();
                        if (!profileDB.StageGroups.Contains(stageGroup))
                        {
                            //stageGroup.KPIFor = profileDB.LevelId;
                            profileDB.StageGroups.Add(stageGroup);
                        }
                    }

                    _ipsDataContext.SaveChanges();
                    dbContextTransaction.Commit();
                    return stageGroup;

                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public bool UpdateStageGroup(StageGroup stageGroup)
        {

            var original = _ipsDataContext.StageGroups.Include("Profiles").Where(sg => sg.Id == stageGroup.Id).FirstOrDefault();

            if (original != null)
            {

                stageGroup.ModifiedOn = DateTime.Now;
                stageGroup.ModifiedBy = _authService.GetCurrentUserId();


                List<Profile> profiles = new List<Profile>(original.Profiles);
                ProfileTypeEnum profileType = ProfileTypeEnum.Soft;
                if (profiles.Count > 0)
                {
                    var profileId = profiles[0].Id;
                    profileType =
                        (ProfileTypeEnum)_ipsDataContext.Profiles.Where(x => x.Id == profileId)
                            .Select(x => x.ProfileTypeId)
                            .FirstOrDefault();
                }
                if (profileType == ProfileTypeEnum.Soft || profileType == ProfileTypeEnum.Hard)
                {
                    List<Stage> oldStages = _ipsDataContext.Stages.Where(x => x.StageGroupId == stageGroup.Id).ToList();
                    if (oldStages.Count() > 0)
                    {
                        _ipsDataContext.Stages.RemoveRange(oldStages);
                        _ipsDataContext.SaveChanges();
                    }
                    Stage startStage = null;
                    if (stageGroup.StartStageStartDate.HasValue)
                    {
                        startStage = createDeafultStage(stageGroup.StartStageStartDate.GetValueOrDefault(), stageGroup, "Start Stage");
                    }
                    else
                    {
                        startStage = createDeafultStage(stageGroup.StartDate.GetValueOrDefault(), stageGroup, "Start Stage");
                    }
                    _ipsDataContext.Stages.Add(startStage);
                    _ipsDataContext.SaveChanges();
                    stageGroup.Stages = new List<Stage>();
                    stageGroup.Stages.Add(startStage);
                    for (int i = 1; i <= stageGroup.TotalMilestones; i++)
                    {
                        if (startStage != null)
                        {
                            Stage newMilestoneStage = null;
                            if (i == 1 && stageGroup.MilestoneStartDate.HasValue)
                            {
                                newMilestoneStage = createDeafultStage(stageGroup.MilestoneStartDate.Value, stageGroup, "Prestasjons evaluering " + i);
                            }
                            else
                            {
                                newMilestoneStage = createDeafultStage(stageGroup.Stages.Last().EndDateTime, stageGroup, "Prestasjons evaluering " + i);
                            }
                            _ipsDataContext.Stages.Add(newMilestoneStage);
                            _ipsDataContext.SaveChanges();
                            stageGroup.Stages.Add(newMilestoneStage);
                        }

                    }
                }

                _ipsDataContext.Entry(original).CurrentValues.SetValues(stageGroup);
                _ipsDataContext.SaveChanges();


            }

            return true;

        }
        public bool UpdateStageGroupBasicInfo(StageGroup stageGroup)
        {
            StageGroup original = _ipsDataContext.StageGroups.Where(sg => sg.Id == stageGroup.Id).FirstOrDefault();

            if (original != null)
            {
                StageGroup sg = new StageGroup()
                {
                    ActualTimeSpan = original.ActualTimeSpan,
                    CreatedBy = original.CreatedBy,
                    CreatedOn = original.CreatedOn,
                    DaysSpan = original.DaysSpan,
                    HoursSpan = original.HoursSpan,
                    Id = original.Id,
                    MilestoneEndDate = original.MilestoneEndDate,
                    MilestoneStartDate = original.MilestoneStartDate,
                    MinutesSpan = original.MinutesSpan,
                    MonthsSpan = original.MonthsSpan,
                    ParentParticipantId = original.ParentParticipantId,
                    ParentStageGroupId = original.ParentStageGroupId,

                    StartStageEndDate = original.StartStageEndDate,
                    StartStageStartDate = original.StartStageStartDate,
                    TotalMilestones = original.TotalMilestones,
                    WeeksSpan = original.WeeksSpan,
                    Name = stageGroup.Name,
                    Description = stageGroup.Description,
                    StartDate = stageGroup.StartDate,
                    EndDate = stageGroup.EndDate,
                    ModifiedBy = _authService.GetCurrentUserId(),
                    ModifiedOn = DateTime.Now,
                };
                _ipsDataContext.Entry(original).CurrentValues.SetValues(stageGroup);
                _ipsDataContext.SaveChanges();

            }

            return true;
        }
        public bool DeleteStageGroup(StageGroup stageGroup)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    StageGroup original = _ipsDataContext.StageGroups.Include("Profiles").Include("Stages").Include("EvaluationParticipants").Where(sg => sg.Id == stageGroup.Id).FirstOrDefault();

                    if (original != null)
                    {
                        foreach (Profile profile in original.Profiles)
                        {
                            Profile dbProfile = _ipsDataContext.Profiles.Include("StageGroups").Where(p => p.Id == profile.Id).FirstOrDefault();
                            dbProfile.StageGroups.Remove(original);
                        }
                        _ipsDataContext.Stages.RemoveRange(original.Stages);
                        if (original.EvaluationParticipants != null && original.EvaluationParticipants.Count > 0)
                            _ipsDataContext.EvaluationParticipants.RemoveRange(original.EvaluationParticipants);
                        _ipsDataContext.StageGroups.Remove(stageGroup);
                        _ipsDataContext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }

            return true;
        }

        private void AddParticipantsToStageGroup(int stageGroupId, List<IpsStageGroupParticipant> stageGroupsParticipants)
        {
            foreach (IpsStageGroupParticipant stageGroupParticipant in stageGroupsParticipants)
            {
                EvaluationParticipant evaluationParticipant = new EvaluationParticipant
                {
                    Id = -1,
                    StageGroupId = stageGroupId,
                    UserId = stageGroupParticipant.UserId,
                    IsLocked = false,
                    EvaluationRoleId = stageGroupParticipant.EvaluationRoleId
                };
                _ipsDataContext.EvaluationParticipants.Add(evaluationParticipant);
            }

            _ipsDataContext.SaveChanges();
        }

        public bool UpdateParticipantsInStageGroup(int stageGroupId, IpsStageGroupParticipant[] stageGroupsParticipants)
        {
            StageGroup originalStageGroup = _ipsDataContext.StageGroups.Where(pg => pg.Id == stageGroupId).FirstOrDefault();
            List<IpsStageGroupParticipant> stageGroupParticipantToAddList = new List<IpsStageGroupParticipant>();
            int[] stageGroupParticipantToDeleteList;

            if (originalStageGroup != null)
            {
                foreach (IpsStageGroupParticipant stageGroupParticipant in stageGroupsParticipants)
                {
                    EvaluationParticipant evaluationParticipantDB = _ipsDataContext.EvaluationParticipants.Where(ep => ep.StageGroupId == stageGroupId && ep.UserId == stageGroupParticipant.UserId).FirstOrDefault();


                    if (evaluationParticipantDB != null) // existed items should to be updated  
                    {
                        evaluationParticipantDB.IsLocked = stageGroupParticipant.IsLocked;
                        evaluationParticipantDB.EvaluationRoleId = stageGroupParticipant.EvaluationRoleId;

                    }
                    else //new items should to be added
                    {
                        stageGroupParticipantToAddList.Add(stageGroupParticipant);
                    }
                }

                // Items existed in DB but not present in stageGroupsParticipants list should be removed
                int[] UserIds = stageGroupsParticipants.Select(sgp => sgp.UserId).ToArray();
                List<EvaluationParticipant> evaluationParticipantsToDelete = _ipsDataContext.EvaluationParticipants.Where(ep => ep.StageGroupId == stageGroupId && !UserIds.Contains(ep.UserId)).ToList();
                stageGroupParticipantToDeleteList = evaluationParticipantsToDelete.Select(eptd => eptd.Id).ToArray();


                if (stageGroupParticipantToAddList.Count > 0)
                {
                    AddParticipantsToStageGroup(stageGroupId, stageGroupParticipantToAddList);
                }
                if (stageGroupParticipantToDeleteList.Length > 0)
                {
                    RemoveParticipantsFromStageGroup(stageGroupParticipantToDeleteList);
                }


                _ipsDataContext.SaveChanges();
            }

            return true;

        }

        private void RemoveParticipantsFromStageGroup(int[] evaluationParticipantsIds)
        {
            foreach (int id in evaluationParticipantsIds)
            {
                EvaluationParticipant evaluationParticipantDB = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == id).FirstOrDefault();
                if (evaluationParticipantDB != null)
                {
                    _ipsDataContext.EvaluationParticipants.Remove(evaluationParticipantDB);
                }

            }

            _ipsDataContext.SaveChanges();
        }

        public List<IpsEvaluationUser> GetParticipants(int stageGroupId)
        {
            var participants = new List<IpsEvaluationUser>();

            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("EvaluationParticipants").Include("EvaluationParticipants.EvaluationStatuses").Where(sg => sg.Id == stageGroupId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null)
            {
                UserService service = new UserService();
                foreach (var ep in stageGroup.EvaluationParticipants)
                {
                    if (ep.EvaluationRoleId == 2)
                    {
                        var user = new IpsEvaluationUser();
                        user.ParticipantId = ep.Id;
                        user.RoleId = ep.EvaluationRoleId;
                        user.UserId = ep.UserId;
                        user.EvaluateeId = ep.EvaluateeId;
                        user.IsSelfEvaluation = ep.IsSelfEvaluation;
                        user.IsLocked = ep.IsLocked;
                        user.IsScoreManager = ep.IsScoreManager;
                        user.User = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == ep.UserId).AsNoTracking().FirstOrDefault();
                        user.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                        // JIRA Task IPSV-239 http://yci193.stwserver.net:8080/browse/IPSV-239                       
                        user.Password = _authService.TryGetUserPassword(user.User.UserKey, 0, true, false);
                        User userInfo = service.GetById(ep.UserId);
                        if (userInfo != null)
                        {
                            user.FirstName = userInfo.FirstName;
                            user.LastName = userInfo.LastName;
                            user.StageGroupId = stageGroupId;
                            participants.Add(user);
                        }
                    }
                }
            }
            return participants;
        }
        public List<IpsEvaluationUser> GetStageParticipants(int stageGroupId)
        {
            var participants = new List<IpsEvaluationUser>();

            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("EvaluationParticipants").Include("EvaluationParticipants.EvaluationStatuses").Where(sg => sg.Id == stageGroupId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null)
            {
                UserService service = new UserService();
                foreach (var ep in stageGroup.EvaluationParticipants)
                {
                    if (ep.EvaluationRoleId == 2 && ep.IsResultSendOut == false)
                    {
                        var user = new IpsEvaluationUser();
                        user.ParticipantId = ep.Id;
                        user.RoleId = ep.EvaluationRoleId;
                        user.UserId = ep.UserId;
                        user.EvaluateeId = ep.EvaluateeId;
                        user.IsSelfEvaluation = ep.IsSelfEvaluation;
                        user.IsLocked = ep.IsLocked;
                        user.IsScoreManager = ep.IsScoreManager;
                        user.User = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == ep.UserId).AsNoTracking().FirstOrDefault();
                        user.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                        // JIRA Task IPSV-239 http://yci193.stwserver.net:8080/browse/IPSV-239                       
                        User userInfo = service.GetById(ep.UserId);
                        if (userInfo != null)
                        {
                            user.FirstName = userInfo.FirstName;
                            user.LastName = userInfo.LastName;
                            user.StageGroupId = stageGroupId;
                            participants.Add(user);
                        }
                    }
                }
            }
            return participants;
        }

        public List<IpsStageGroupEvaluation> GetStageGroupEvaluation(int stageGroupId)
        {
            List<IpsStageGroupEvaluation> stageGroupEvaluations = new List<IpsStageGroupEvaluation>();

            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("Profiles").Where(sg => sg.Id == stageGroupId).FirstOrDefault();
            if (stageGroup != null)
            {
                UserService service = new UserService();
                List<Stage> stages = _ipsDataContext.Stages.Where(x => x.StageGroupId == stageGroupId).ToList();
                Profile profile = stageGroup.Profiles.FirstOrDefault();
                if (profile != null)
                {

                    foreach (var stage in stages)
                    {

                        IpsStageGroupEvaluation ipsStageGroupEvaluation = new IpsStageGroupEvaluation()
                        {
                            StageId = stage.Id,
                            StageGroupId = stageGroupId,
                        };
                        ipsStageGroupEvaluation.IsKPISet = profile.ProfileTypeId == (int)ProfileTypeEnum.Soft && _ipsDataContext.Answers.Any(t => t.StageId == stage.Id && t.KPIType > 0);
                        ipsStageGroupEvaluation.IsRCTAdded = profile.ProfileTypeId == (int)ProfileTypeEnum.Soft && _ipsDataContext.EvaluationAgreements.Any(a => a.StageId == stage.Id);
                        stageGroupEvaluations.Add(ipsStageGroupEvaluation);
                    }
                }


            }
            return stageGroupEvaluations;
        }


        public List<IpsEvaluationUser> GetEvaluators(int stageGroupId)
        {
            List<IpsEvaluationUser> evaluators = new List<IpsEvaluationUser>();

            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("EvaluationParticipants").Include("EvaluationParticipants.EvaluationStatuses").Where(sg => sg.Id == stageGroupId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null)
            {
                UserService service = new UserService();
                foreach (var ep in stageGroup.EvaluationParticipants)
                {
                    if (ep.EvaluationRoleId == 1)
                    {

                        int evaluateeUserId = -1;
                        if (ep.EvaluateeId != null)
                        {
                            List<EvaluationParticipant> participants = stageGroup.EvaluationParticipants.Where(p => p.Id == ep.EvaluateeId).ToList();
                            evaluateeUserId = stageGroup.EvaluationParticipants.Where(p => p.Id == ep.EvaluateeId).Select(p => p.UserId).FirstOrDefault();
                        }

                        IpsEvaluationUser user = new IpsEvaluationUser();
                        user.ParticipantId = ep.Id;
                        user.RoleId = ep.EvaluationRoleId;
                        user.UserId = ep.UserId;
                        user.EvaluateeId = ep.EvaluateeId;
                        user.IsSelfEvaluation = ep.IsSelfEvaluation;
                        user.IsLocked = ep.IsLocked;
                        user.IsScoreManager = ep.IsScoreManager;
                        user.User = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == ep.UserId).AsNoTracking().FirstOrDefault();
                        user.Evaluatee = _ipsDataContext.Users.Include("JobPositions").Where(u => u.Id == evaluateeUserId).AsNoTracking().FirstOrDefault();
                        user.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == user.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                        User userInfo = service.GetById(ep.UserId);
                        if (userInfo != null)
                        {
                            user.FirstName = userInfo.FirstName;
                            user.LastName = userInfo.LastName;
                            user.Password = _authService.TryGetUserPassword(user.User.UserKey, 0, true, false);
                            evaluators.Add(user);
                        }
                    }
                }
            }

            return evaluators;
        }

        public List<IpsSurveyProgress> GetStatusAndProgress(int stageGroupId, int stageId, ProfileTypeEnum profileTypeId)
        {
            List<IpsSurveyProgress> participants = new List<IpsSurveyProgress>();

            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("EvaluationParticipants").Include("EvaluationParticipants.EvaluationStatuses").Where(sg => sg.Id == stageGroupId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null)
            {
                IEnumerable<EvaluationParticipant> evaluationParticipants = stageGroup.EvaluationParticipants;
                if (profileTypeId == ProfileTypeEnum.Knowledge)
                {
                    evaluationParticipants = evaluationParticipants.Where(x => x.EvaluationRoleId == (int)EvaluationRoleEnum.Participant);
                }
                foreach (var ep in evaluationParticipants)
                {
                    var surveyProgress = GetSurveyProgress(ep, stageId, profileTypeId);
                    if (surveyProgress != null)
                    {
                        participants.Add(surveyProgress);
                    }
                    if (profileTypeId == ProfileTypeEnum.Knowledge)
                    {
                        var stagesEvolutions = _ipsDataContext.StagesEvolutions
                            .Where(x => x.OriginalStageId == stageId
                                        && x.ParticipantId == ep.Id).Select(x => x.Id).ToList();
                        foreach (var stageEvolutionId in stagesEvolutions)
                        {
                            surveyProgress = GetSurveyProgress(ep, stageId, profileTypeId, stageEvolutionId);
                            if (surveyProgress != null)
                            {
                                participants.Add(surveyProgress);
                            }
                        }
                    }
                }
            }
            return participants;

        }

        public IpsSurveyProgress GetSurveyProgress(EvaluationParticipant ep, int stageId, ProfileTypeEnum profileTypeId, int? stageEvolutionId = null)
        {
            IpsSurveyProgress surveyProgress = null;
            User userInfo = _ipsDataContext.Users.Include("JobPositions")
                                .Where(u => u.Id == ep.UserId)
                                .AsNoTracking()
                                .FirstOrDefault();
            if (userInfo != null)
            {
                surveyProgress = new IpsSurveyProgress
                {
                    ParticipantId = ep.Id,
                    RoleId = ep.EvaluationRoleId,
                    UserId = ep.UserId,
                    EvaluateeId = ep.EvaluateeId,
                    IsSelfEvaluation = ep.IsSelfEvaluation,
                    IsLocked = ep.IsLocked,
                    User = userInfo
                };
                surveyProgress.OrganizationName = _ipsDataContext.Organizations.Where(o => o.Id == surveyProgress.User.OrganizationId).AsNoTracking().FirstOrDefault().Name;
                if (stageEvolutionId != null)
                {
                    surveyProgress.EvaluationStatus = ep.EvaluationStatuses.FirstOrDefault(s => s.StageEvolutionId == stageEvolutionId);
                }
                else
                {
                    surveyProgress.EvaluationStatus = ep.EvaluationStatuses.FirstOrDefault(s => s.StageId == stageId);
                }
                surveyProgress.isKPISet = profileTypeId == ProfileTypeEnum.Soft && _ipsDataContext.Answers.Any(t => t.ParticipantId == ep.Id && t.StageId == stageId && t.KPIType > 0);
                surveyProgress.FirstName = userInfo.FirstName;
                surveyProgress.LastName = userInfo.LastName;
                surveyProgress.Status = GetStageStatus(surveyProgress.EvaluationStatus);
            }
            return surveyProgress;
        }

        public StageStatusEnum GetStageStatus(int? stageId, int? stageEvolutionId, int participantId)
        {
            var query = _ipsDataContext.EvaluationStatuses
                .Where(x => x.ParticipantId == participantId);
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.StageId == stageId);
            var evaluationStatus = query.FirstOrDefault();
            return GetStageStatus(evaluationStatus);
        }

        private StageStatusEnum GetStageStatus(EvaluationStatus evaluationStatus)
        {
            var status = StageStatusEnum.NotInvited;
            if (evaluationStatus != null)
            {
                status = evaluationStatus.EndedAt.HasValue
                    ? (evaluationStatus.IsOpen ? StageStatusEnum.CompletedOpen : StageStatusEnum.Completed)
                    : StageStatusEnum.Invited;
            }
            return status;
        }

        public bool RemoveParticipant(int participantId)
        {
            EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(p => p.Id == participantId).FirstOrDefault();
            if (evaluationParticipant != null)
            {
                RemoveParticipantAnswers(participantId);

                List<EvaluationParticipant> evaluators = _ipsDataContext.EvaluationParticipants.Where(p => p.EvaluateeId == participantId).ToList();
                _ipsDataContext.EvaluationParticipants.RemoveRange(evaluators);
                _ipsDataContext.EvaluationParticipants.Remove(evaluationParticipant);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool RemoveAllParticipants(int stageGroupId, int? roleId)
        {
            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("EvaluationParticipants").Where(sg => sg.Id == stageGroupId).FirstOrDefault();
            if (stageGroup != null)
            {
                List<EvaluationParticipant> evaluationParticipants = stageGroup.EvaluationParticipants.ToList();
                foreach (EvaluationParticipant evaluationParticipant in evaluationParticipants)
                {
                    if (!roleId.HasValue)
                    {
                        RemoveParticipantAnswers(evaluationParticipant.Id);

                        if (evaluationParticipant.EvaluationRoleId == 2)
                        {
                            List<EvaluationParticipant> evaluators = _ipsDataContext.EvaluationParticipants.Where(p => p.EvaluateeId == evaluationParticipant.Id).ToList();
                            _ipsDataContext.EvaluationParticipants.RemoveRange(evaluators);
                        }

                        _ipsDataContext.EvaluationParticipants.Remove(evaluationParticipant);
                    }
                    else if (roleId.Value == evaluationParticipant.EvaluationRoleId)
                    {
                        RemoveParticipantAnswers(evaluationParticipant.Id);

                        if (roleId == 2)
                        {
                            List<EvaluationParticipant> evaluators = _ipsDataContext.EvaluationParticipants.Where(p => p.EvaluateeId == evaluationParticipant.Id).ToList();
                            _ipsDataContext.EvaluationParticipants.RemoveRange(evaluators);
                        }

                        _ipsDataContext.EvaluationParticipants.Remove(evaluationParticipant);
                    }
                    _ipsDataContext.SaveChanges();
                }
            }
            return true;
        }

        public bool RemoveParticipantAnswers(int participantId)
        {
            List<Answer> answers = _ipsDataContext.Answers.Where(a => a.ParticipantId == participantId).ToList();
            if (answers.Count > 0)
            {
                _ipsDataContext.Answers.RemoveRange(answers);
                _ipsDataContext.SaveChanges();
            }

            List<EvaluationStatus> evaluationStatuses = _ipsDataContext.EvaluationStatuses.Where(a => a.ParticipantId == participantId).ToList();
            if (evaluationStatuses.Count > 0)
            {
                _ipsDataContext.EvaluationStatuses.RemoveRange(evaluationStatuses);
                _ipsDataContext.SaveChanges();
            }


            return true;
        }

        public bool ReopenParticipantAnswers(int stageId, int participantId)
        {
            EvaluationStatus evaluationStatus = _ipsDataContext.EvaluationStatuses.Where(a => a.ParticipantId == participantId && a.StageId == stageId).FirstOrDefault();
            if (evaluationStatus != null)
            {
                evaluationStatus.IsOpen = true;
                _ipsDataContext.SaveChanges();
            }



            return true;
        }

        public bool selfEvaluationUpdate(int participantId, bool IsSelfEvaluation)
        {
            EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(p => p.Id == participantId).FirstOrDefault();
            if (evaluationParticipant != null)
            {
                evaluationParticipant.IsSelfEvaluation = IsSelfEvaluation;

                if (IsSelfEvaluation)
                {
                    evaluationParticipant.IsScoreManager = true;
                }
                else
                {
                    evaluationParticipant.IsScoreManager = false;
                }

                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool LockUpdate(int participantId, bool isLocked)
        {
            EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(p => p.Id == participantId).FirstOrDefault();
            if (evaluationParticipant != null)
            {
                evaluationParticipant.IsLocked = isLocked;
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool ScoreManagerUpdate(int participantId, bool isScoreManager)
        {
            EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(p => p.Id == participantId).FirstOrDefault();
            if (evaluationParticipant != null)
            {
                evaluationParticipant.IsScoreManager = isScoreManager;
                _ipsDataContext.SaveChanges();
            }

            return true;
        }


        public Profile RestartSoftProfile(int sourceStageGroupId, int participantId, StageGroup newStageGroup)
        {

            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                Profile newProfile = new Profile();
                try
                {
                    StageGroup sourceSG = _ipsDataContext.StageGroups.Include("Stages").Include("Profiles").Where(sg => sg.Id == sourceStageGroupId).AsNoTracking().FirstOrDefault();
                    List<Profile> profiles = sourceSG.Profiles.ToList();
                    List<int> newStageIds = new List<int>();
                    List<int> newParticipantsIds = new List<int>();
                    if (sourceSG != null)
                    {
                        StageGroup stageGroup = new StageGroup();

                        stageGroup.Name = newStageGroup.Name;
                        stageGroup.Description = newStageGroup.Description;
                        stageGroup.StartDate = newStageGroup.StartDate;
                        stageGroup.EndDate = newStageGroup.EndDate;
                        //calculate duration of source Stage group endDate minus StartDate
                        double stageGroupDuration = sourceSG.EndDate.Value.Subtract(sourceSG.StartDate.Value).TotalDays;
                        //stageGroup.EndDate = stageGroup.StartDate.Value.AddDays(stageGroupDuration); //Calculate endDate of new stageGroup according duration

                        stageGroup.ParentStageGroupId = sourceStageGroupId;
                        stageGroup.ParentParticipantId = participantId;
                        stageGroup.MonthsSpan = newStageGroup.MonthsSpan;
                        stageGroup.WeeksSpan = newStageGroup.WeeksSpan;
                        stageGroup.DaysSpan = newStageGroup.DaysSpan;
                        stageGroup.HoursSpan = newStageGroup.HoursSpan;
                        stageGroup.MinutesSpan = newStageGroup.MinutesSpan;
                        stageGroup.TotalMilestones = newStageGroup.TotalMilestones;
                        stageGroup.StartStageStartDate = newStageGroup.StartStageStartDate;
                        stageGroup.StartStageEndDate = newStageGroup.StartStageEndDate;
                        stageGroup.MilestoneStartDate = newStageGroup.MilestoneStartDate;
                        stageGroup.MilestoneEndDate = newStageGroup.MilestoneEndDate;
                        stageGroup.CreatedOn = DateTime.Now;
                        stageGroup.CreatedBy = _authService.GetCurrentUserId();
                        _ipsDataContext.StageGroups.Add(stageGroup);
                        _ipsDataContext.SaveChanges();


                        Profile profileSource = new Profile();

                        foreach (Profile profile in profiles)
                        {
                            profileSource = _ipsDataContext.Profiles.Include("JobPositions").Include("Scale").Include("PerformanceGroups").Where(p => p.Id == profile.Id).FirstOrDefault();


                            newProfile = profile;
                            newProfile.Id = 0;
                            profile.Name = CheckNewPhaseProfile(profile);

                            newProfile.StageGroups = new List<StageGroup>();

                            newProfile.StageGroups.Add(stageGroup);

                            // Clone Profile

                            if (profileSource.ScaleId > 0)
                            {
                                Scale ScaleDB = _ipsDataContext.Scales.Include("ScaleRanges").Where(sc => sc.Id == profileSource.ScaleId).AsNoTracking().FirstOrDefault();
                                Scale newScale = new Scale();

                                newScale.Id = 0;
                                newScale.Name = ScaleDB.Name;
                                newScale.Description = ScaleDB.Description;
                                newScale.ScaleCategoryId = ScaleDB.ScaleCategoryId;
                                newScale.MeasureUnitId = ScaleDB.MeasureUnitId;
                                newScale.IncludeNotRelevant = ScaleDB.IncludeNotRelevant;
                                newScale.IsTemplate = false;
                                newScale.ProfileType = ScaleDB.ProfileType;
                                _ipsDataContext.Scales.Add(newScale);
                                _ipsDataContext.SaveChanges();
                                foreach (ScaleRange sr in ScaleDB.ScaleRanges)
                                {
                                    sr.Id = 0;
                                    sr.ScaleId = newScale.Id;
                                    sr.Scale = null;
                                    _ipsDataContext.ScaleRanges.Add(sr);
                                }
                                _ipsDataContext.SaveChanges();
                                newProfile.ScaleId = newScale.Id;
                            }

                            //newProfile.Name = copyName;
                            newProfile.OrganizationId = profileSource.OrganizationId;
                            newProfile.ProfileTypeId = profileSource.ProfileTypeId;
                            newProfile.IndustryId = profileSource.IndustryId;
                            newProfile.CategoryId = profileSource.CategoryId;
                            newProfile.Description = profileSource.Description;
                            newProfile.MedalRuleId = profileSource.MedalRuleId;
                            newProfile.ScaleSettingsRuleId = profileSource.ScaleSettingsRuleId;
                            newProfile.LevelId = profileSource.LevelId;
                            newProfile.IsActive = profileSource.IsActive;
                            newProfile.KPIWeak = profileSource.KPIWeak;
                            newProfile.KPIStrong = profileSource.KPIStrong;
                            newProfile.QuestionDisplayRuleId = profileSource.QuestionDisplayRuleId;
                            newProfile.IsTemplate = profileSource.IsTemplate;
                            newProfile.PassScore = profileSource.PassScore;


                            _ipsDataContext.Profiles.Add(newProfile);


                            foreach (JobPosition jobPosition in profileSource.JobPositions)
                            {
                                JobPosition jobPositionDB = _ipsDataContext.JobPositions.Where(jp => jp.Id == jobPosition.Id).FirstOrDefault();
                                newProfile.JobPositions.Add(jobPositionDB);
                            }

                            if (profileSource.PerformanceGroups.Count > 0)
                            {
                                List<PerformanceGroup> performanceGroupList = new List<PerformanceGroup>(profileSource.PerformanceGroups);
                                PerformanceGroupsService performanceGroupService = new PerformanceGroupsService();
                                foreach (PerformanceGroup pg in performanceGroupList)
                                {
                                    PerformanceGroup newPerformancegroup = new PerformanceGroup();
                                    newPerformancegroup = performanceGroupService.CreateCopy(_ipsDataContext, pg, pg.Name);
                                    newPerformancegroup.ProfileId = newProfile.Id;
                                    _ipsDataContext.SaveChanges();
                                }
                            }

                            _ipsDataContext.SaveChanges();



                        }



                        _ipsDataContext.SaveChanges();


                        List<Stage> stages = sourceSG.Stages.OrderBy(s => s.StartDateTime).ToList();
                        Stage firstNewStage = new Stage();
                        Stage lastSourceStage = new Stage();
                        double sourceStageDuration;
                        int stagesIndex = 0;
                        DateTime LastEndDateTime = DateTime.Now;
                        foreach (var stage in stages)
                        {
                            bool isFirstStage = stage == stages.First();
                            bool isLastStage = stage == stages.Last();

                            Stage newStage = new Stage();
                            newStage = _ipsDataContext.Stages.Where(st => st.Id == stage.Id).AsNoTracking().FirstOrDefault();

                            newStage.Id = 0;
                            newStage.StageGroup = null;
                            newStage.StageGroupId = stageGroup.Id;
                            if (isFirstStage)
                            {
                                if (newStageGroup.StartStageStartDate.HasValue && newStageGroup.StartStageEndDate.HasValue)
                                {
                                    newStage.StartDateTime = newStageGroup.StartStageStartDate.Value;
                                    newStage.EndDateTime = newStageGroup.StartStageEndDate.Value;
                                }
                                else
                                {
                                    newStage.StartDateTime = newStageGroup.StartDate.Value;
                                    newStage.EndDateTime = newStage.StartDateTime.AddMonths(newStageGroup.MonthsSpan).AddDays((7 * newStageGroup.WeeksSpan)).AddDays(newStageGroup.DaysSpan).AddHours(newStageGroup.HoursSpan).AddMinutes(newStageGroup.MinutesSpan);
                                }
                                LastEndDateTime = newStage.EndDateTime;
                                if ((ProfileTypeEnum)newProfile.ProfileTypeId == ProfileTypeEnum.Soft)
                                {
                                    newStage.EvaluationStartDate = newStage.StartDateTime;
                                    if (newStage.EvaluationStartDate > newStage.EndDateTime)
                                    {
                                        newStage.EvaluationStartDate = newStage.StartDateTime;
                                    }
                                    newStage.EvaluationEndDate = newStage.EndDateTime;
                                }

                                DateTime startdatetime = newStage.StartDateTime;
                                DateTime enddatetime = newStage.EndDateTime;
                                long TotalDiffrence = enddatetime.Ticks - startdatetime.Ticks;
                                long greenAlarmAt = Convert.ToInt64(TotalDiffrence * 0.20);
                                long yellowAlarmAt = Convert.ToInt64(TotalDiffrence * 0.60);
                                long redAlarmAt = Convert.ToInt64(TotalDiffrence * 0.90);


                                newStage.GreenAlarmTime = newStage.StartDateTime.AddTicks(greenAlarmAt);  //stage.EndDateTime.AddDays(-1);
                                newStage.YellowAlarmTime = newStage.StartDateTime.AddTicks(yellowAlarmAt); ;
                                newStage.RedAlarmTime = newStage.EndDateTime.AddMinutes(1);

                                //newStage.GreenAlarmTime = null;
                                //newStage.YellowAlarmTime = null;
                                //newStage.RedAlarmTime = null;
                                firstNewStage = newStage;
                            }
                            else
                            {
                                if (stagesIndex == 1)
                                {
                                    if (newStageGroup.MilestoneStartDate.HasValue)
                                    {
                                        LastEndDateTime = newStageGroup.MilestoneStartDate.Value;
                                    }
                                }
                                sourceStageDuration = stage.EndDateTime.Subtract(stage.StartDateTime).TotalDays;
                                double deltaTime = stage.StartDateTime.Subtract(sourceSG.StartDate.Value).TotalDays;
                                newStage.StartDateTime = LastEndDateTime; //stageGroup.StartDate.Value.AddDays(deltaTime);
                                newStage.EndDateTime = LastEndDateTime.AddMonths(newStageGroup.MonthsSpan).AddDays((7 * newStageGroup.WeeksSpan)).AddDays(newStageGroup.DaysSpan).AddHours(newStageGroup.HoursSpan).AddMinutes(newStageGroup.MinutesSpan);
                                LastEndDateTime = newStage.EndDateTime;
                                if ((ProfileTypeEnum)newProfile.ProfileTypeId == ProfileTypeEnum.Soft)
                                {
                                    newStage.EvaluationStartDate = newStage.EndDateTime.AddDays(-5);

                                    if (newStage.EvaluationStartDate > newStage.EndDateTime)
                                    {
                                        newStage.EvaluationStartDate = newStage.StartDateTime;
                                    }
                                    newStage.EvaluationEndDate = newStage.EndDateTime;

                                    DateTime startdatetime = newStage.EvaluationStartDate.Value;
                                    DateTime enddatetime = newStage.EvaluationEndDate.Value;
                                    long TotalDiffrence = enddatetime.Ticks - startdatetime.Ticks;
                                    long greenAlarmAt = Convert.ToInt64(TotalDiffrence * 0.20);
                                    long yellowAlarmAt = Convert.ToInt64(TotalDiffrence * 0.60);

                                    newStage.GreenAlarmTime = newStage.StartDateTime.AddTicks(greenAlarmAt);  //stage.EndDateTime.AddDays(-1);
                                    newStage.YellowAlarmTime = newStage.StartDateTime.AddTicks(yellowAlarmAt); ;
                                    newStage.RedAlarmTime = newStage.EndDateTime.AddMinutes(1);
                                }
                                else
                                {
                                    DateTime startdatetime = newStage.StartDateTime;
                                    DateTime enddatetime = newStage.EndDateTime;
                                    long TotalDiffrence = enddatetime.Ticks - startdatetime.Ticks;
                                    long greenAlarmAt = Convert.ToInt64(TotalDiffrence * 0.20);
                                    long yellowAlarmAt = Convert.ToInt64(TotalDiffrence * 0.60);
                                    long redAlarmAt = Convert.ToInt64(TotalDiffrence * 0.90);


                                    newStage.GreenAlarmTime = newStage.StartDateTime.AddTicks(greenAlarmAt);  //stage.EndDateTime.AddDays(-1);
                                    newStage.YellowAlarmTime = newStage.StartDateTime.AddTicks(yellowAlarmAt); ;
                                    newStage.RedAlarmTime = newStage.EndDateTime.AddMinutes(1);

                                }

                                //newStage.GreenAlarmTime = newStage.EndDateTime.AddDays(-1);
                                //newStage.YellowAlarmTime = newStage.EndDateTime.AddHours(-3);
                                //newStage.RedAlarmTime = newStage.EndDateTime.AddHours(-1);
                                //newStage.GreenAlarmTime = newStage.GreenAlarmTime.HasValue ? newStage.GreenAlarmTime.Value.AddDays(deltaTime) : newStage.GreenAlarmTime;
                                //newStage.YellowAlarmTime = newStage.YellowAlarmTime.HasValue ? newStage.YellowAlarmTime.Value.AddDays(deltaTime) : newStage.YellowAlarmTime;
                                //newStage.RedAlarmTime = newStage.RedAlarmTime.HasValue ? newStage.RedAlarmTime.Value.AddDays(deltaTime) : newStage.RedAlarmTime;
                            }

                            if (isLastStage)
                            {
                                lastSourceStage = stage;
                                /*_ipsDataContext.EvaluationParticipants;
                                _ipsDataContext.Answers;
                                _ipsDataContext.EvaluationAgreements;
                                //trainings*/
                            }
                            newStage.CreatedBy = _authService.GetCurrentUserId();
                            newStage.CreatedOn = DateTime.Now;
                            _ipsDataContext.Stages.Add(newStage);
                            _ipsDataContext.SaveChanges();
                            newStageIds.Add(newStage.Id);
                            stagesIndex++;
                        }

                        List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants.Where(ep => ep.StageGroupId == sourceSG.Id).ToList();

                        Dictionary<int, int> mapParticapantIds = new Dictionary<int, int>();

                        foreach (EvaluationParticipant evaluationParticipant in participants)
                        {
                            EvaluationParticipant newEvaluationParticipant = new EvaluationParticipant();

                            newEvaluationParticipant.Id = 0;
                            newEvaluationParticipant.StageGroupId = stageGroup.Id;
                            newEvaluationParticipant.UserId = evaluationParticipant.UserId;
                            newEvaluationParticipant.IsLocked = evaluationParticipant.IsLocked;
                            newEvaluationParticipant.EvaluationRoleId = evaluationParticipant.EvaluationRoleId;
                            newEvaluationParticipant.EvaluateeId = evaluationParticipant.EvaluateeId;
                            newEvaluationParticipant.IsSelfEvaluation = evaluationParticipant.IsSelfEvaluation;
                            newEvaluationParticipant.Invited = evaluationParticipant.Invited;
                            newEvaluationParticipant.IsScoreManager = evaluationParticipant.IsScoreManager;

                            _ipsDataContext.EvaluationParticipants.Add(newEvaluationParticipant);
                            _ipsDataContext.SaveChanges();
                            newParticipantsIds.Add(newEvaluationParticipant.Id);
                            mapParticapantIds.Add(evaluationParticipant.Id, newEvaluationParticipant.Id);
                            //ReopenParticipantAnswers(stageGroup.Id, newEvaluationParticipant.Id);

                            //Answers
                            List<Answer> answers = _ipsDataContext.Answers.Where(a => a.ParticipantId == evaluationParticipant.Id && a.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (Answer answer in answers)
                            {
                                Answer newAnswer = new Answer();

                                newAnswer.Id = 0;
                                newAnswer.ParticipantId = newEvaluationParticipant.Id;
                                newAnswer.QuestionId = answer.QuestionId;
                                newAnswer.IsCorrect = answer.IsCorrect;
                                newAnswer.StageId = firstNewStage.Id;
                                newAnswer.Answer1 = answer.Answer1;
                                newAnswer.KPIType = answer.KPIType;
                                newAnswer.Comment = answer.Comment;

                                _ipsDataContext.Answers.Add(newAnswer);
                            }

                            //EvaluationStatuses
                            List<EvaluationStatus> evaluationSatuses = _ipsDataContext.EvaluationStatuses.Where(es => es.ParticipantId == evaluationParticipant.Id && es.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (EvaluationStatus evaluationStatus in evaluationSatuses)
                            {
                                EvaluationStatus newEvaluationStatus = new EvaluationStatus();

                                newEvaluationStatus.StageId = firstNewStage.Id;
                                newEvaluationStatus.ParticipantId = newEvaluationParticipant.Id;
                                newEvaluationStatus.StartedAt = evaluationStatus.StartedAt;
                                newEvaluationStatus.EndedAt = evaluationStatus.EndedAt;
                                newEvaluationStatus.DurationMinutes = evaluationStatus.DurationMinutes;
                                newEvaluationStatus.InvitedAt = evaluationStatus.InvitedAt;
                                newEvaluationStatus.RemindAt = evaluationStatus.RemindAt;

                                _ipsDataContext.EvaluationStatuses.Add(newEvaluationStatus);
                            }

                            List<EvaluationAgreement> evaluationAgreements = _ipsDataContext.EvaluationAgreements.Include("Trainings").Where(ea => ea.ParticipantId == evaluationParticipant.Id && ea.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (EvaluationAgreement evaluationAgreement in evaluationAgreements)
                            {
                                EvaluationAgreement newEvaluationAgreement = new EvaluationAgreement();

                                newEvaluationAgreement.Id = 0;
                                newEvaluationAgreement.StageId = firstNewStage.Id;
                                newEvaluationAgreement.ParticipantId = newEvaluationParticipant.Id;
                                newEvaluationAgreement.QuestionId = evaluationAgreement.QuestionId;
                                newEvaluationAgreement.KPIType = evaluationAgreement.KPIType;
                                newEvaluationAgreement.ShortGoal = evaluationAgreement.ShortGoal;
                                newEvaluationAgreement.Comment = evaluationAgreement.Comment;
                                newEvaluationAgreement.FinalScore = evaluationAgreement.FinalScore;
                                newEvaluationAgreement.MidGoal = evaluationAgreement.MidGoal;
                                newEvaluationAgreement.LongGoal = evaluationAgreement.LongGoal;
                                newEvaluationAgreement.FinalGoal = evaluationAgreement.FinalGoal;

                                foreach (Training training in evaluationAgreement.Trainings)
                                {
                                    Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                    newEvaluationAgreement.Trainings.Add(trainingDB);
                                }
                                _ipsDataContext.EvaluationAgreements.Add(newEvaluationAgreement);
                            }

                            _ipsDataContext.SaveChanges();
                        }



                        foreach (EvaluationParticipant evaluationParticipant in participants)
                        {
                            if (evaluationParticipant.EvaluateeId.HasValue && evaluationParticipant.EvaluateeId > 0)
                            {
                                int evaluationParticipantNeedUpdate = mapParticapantIds[evaluationParticipant.Id];
                                int newevaluateeId = mapParticapantIds[evaluationParticipant.EvaluateeId.Value];
                                EvaluationParticipant evaluationParticipantDB = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == evaluationParticipantNeedUpdate).FirstOrDefault();
                                evaluationParticipantDB.EvaluateeId = newevaluateeId;
                            }
                        }

                        _ipsDataContext.SaveChanges();


                    }
                    dbContextTransaction.Commit();

                    foreach (int StageId in newStageIds)
                    {
                        foreach (int participantID in newParticipantsIds)
                        {
                            ReopenParticipantAnswers(StageId, participantID);
                        }
                    }
                    return newProfile;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }


        private string CheckNewPhaseProfile(Profile profile)
        {
            string result = "";
            if (_ipsDataContext.Profiles.Where(x => x.Name.StartsWith(profile.Name)).Count() > 0)
            {
                Profile lastProfile = _ipsDataContext.Profiles.Where(x => x.Name.StartsWith(profile.Name)).OrderByDescending(x => x.Id).FirstOrDefault();
                if (lastProfile != null)
                {
                    string[] profileNameArray = lastProfile.Name.Split(new string[] { "Phase" }, StringSplitOptions.None);
                    if (profileNameArray.Length > 1)
                    {
                        int index = Convert.ToInt32(profileNameArray[profileNameArray.Length - 1]);
                        result = profileNameArray[0] + " Phase " + (index + 1);

                    }
                    else
                    {
                        result = profile.Name + " Phase 1";
                    }
                }
                else
                {
                    result = profile.Name + " Phase 1";
                }

            }
            else
            {
                result = profile.Name + " Phase 1";
            }
            return result;
        }

        public void RestartProfile(int sourceStageGroupId, StageGroup newStageGroup)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    StageGroup sourceSG = _ipsDataContext.StageGroups.Include("Stages").Include("Profiles").Where(sg => sg.Id == sourceStageGroupId).AsNoTracking().FirstOrDefault();
                    List<Profile> profiles = sourceSG.Profiles.ToList();


                    if (sourceSG != null)
                    {
                        StageGroup stageGroup = new StageGroup();

                        stageGroup.Name = newStageGroup.Name;
                        stageGroup.Description = newStageGroup.Description;
                        stageGroup.StartDate = newStageGroup.StartDate;

                        //calculate duration of source Stage group endDate minus StartDate
                        double stageGroupDuration = sourceSG.EndDate.Value.Subtract(sourceSG.StartDate.Value).TotalDays;
                        stageGroup.EndDate = stageGroup.StartDate.Value.AddDays(stageGroupDuration); //Calculate endDate of new stageGroup according duration
                        stageGroup.MonthsSpan = sourceSG.MonthsSpan;
                        stageGroup.WeeksSpan = sourceSG.WeeksSpan;
                        stageGroup.DaysSpan = sourceSG.DaysSpan;
                        stageGroup.HoursSpan = sourceSG.HoursSpan;
                        stageGroup.MinutesSpan = sourceSG.MinutesSpan;
                        stageGroup.CreatedOn = DateTime.Now;
                        stageGroup.CreatedBy = _authService.GetCurrentUserId();
                        _ipsDataContext.StageGroups.Add(stageGroup);
                        _ipsDataContext.SaveChanges();

                        foreach (Profile profile in profiles)
                        {
                            Profile profileDB = _ipsDataContext.Profiles.Include("StageGroups").Where(p => p.Id == profile.Id).FirstOrDefault();

                            profileDB.StageGroups.Add(stageGroup);

                        }
                        _ipsDataContext.SaveChanges();

                        List<Stage> stages = sourceSG.Stages.OrderBy(s => s.StartDateTime).ToList();
                        Stage firstNewStage = new Stage();
                        Stage lastSourceStage = new Stage();
                        double sourceStageDuration;
                        foreach (var stage in stages)
                        {
                            bool isFirstStage = stage == stages.First();
                            bool isLastStage = stage == stages.Last();

                            Stage newStage = new Stage();
                            newStage = _ipsDataContext.Stages.Where(st => st.Id == stage.Id).AsNoTracking().FirstOrDefault();

                            newStage.Id = 0;
                            newStage.StageGroup = null;
                            newStage.StageGroupId = stageGroup.Id;
                            if (isFirstStage)
                            {
                                newStage.StartDateTime = stageGroup.StartDate.Value;
                                newStage.EndDateTime = newStage.StartDateTime.AddDays(1);
                                newStage.GreenAlarmTime = null;
                                newStage.YellowAlarmTime = null;
                                newStage.RedAlarmTime = null;
                                firstNewStage = newStage;
                            }
                            else
                            {
                                sourceStageDuration = stage.EndDateTime.Subtract(stage.StartDateTime).TotalDays;
                                double deltaTime = stage.StartDateTime.Subtract(sourceSG.StartDate.Value).TotalDays;
                                newStage.StartDateTime = stageGroup.StartDate.Value.AddDays(deltaTime);
                                newStage.EndDateTime = newStage.StartDateTime.AddDays(sourceStageDuration);
                                newStage.GreenAlarmTime = newStage.GreenAlarmTime.HasValue ? newStage.GreenAlarmTime.Value.AddDays(deltaTime) : newStage.GreenAlarmTime;
                                newStage.YellowAlarmTime = newStage.YellowAlarmTime.HasValue ? newStage.YellowAlarmTime.Value.AddDays(deltaTime) : newStage.YellowAlarmTime;
                                newStage.RedAlarmTime = newStage.RedAlarmTime.HasValue ? newStage.RedAlarmTime.Value.AddDays(deltaTime) : newStage.RedAlarmTime;
                            }

                            if (isLastStage)
                            {
                                lastSourceStage = stage;
                                /*_ipsDataContext.EvaluationParticipants;
                                _ipsDataContext.Answers;
                                _ipsDataContext.EvaluationAgreements;
                                //trainings*/
                            }
                            newStage.CreatedBy = _authService.GetCurrentUserId();
                            newStage.CreatedOn = DateTime.Now;
                            _ipsDataContext.Stages.Add(newStage);

                        }
                        _ipsDataContext.SaveChanges();

                        List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants.Where(ep => ep.StageGroupId == sourceSG.Id).ToList();

                        Dictionary<int, int> mapParticapantIds = new Dictionary<int, int>();

                        foreach (EvaluationParticipant evaluationParticipant in participants)
                        {
                            EvaluationParticipant newEvaluationParticipant = new EvaluationParticipant();

                            newEvaluationParticipant.Id = 0;
                            newEvaluationParticipant.StageGroupId = stageGroup.Id;
                            newEvaluationParticipant.UserId = evaluationParticipant.UserId;
                            newEvaluationParticipant.IsLocked = evaluationParticipant.IsLocked;
                            newEvaluationParticipant.EvaluationRoleId = evaluationParticipant.EvaluationRoleId;
                            newEvaluationParticipant.EvaluateeId = evaluationParticipant.EvaluateeId;
                            newEvaluationParticipant.IsSelfEvaluation = evaluationParticipant.IsSelfEvaluation;
                            newEvaluationParticipant.Invited = evaluationParticipant.Invited;
                            newEvaluationParticipant.IsScoreManager = evaluationParticipant.IsScoreManager;

                            _ipsDataContext.EvaluationParticipants.Add(newEvaluationParticipant);
                            _ipsDataContext.SaveChanges();


                            mapParticapantIds.Add(evaluationParticipant.Id, newEvaluationParticipant.Id);
                            //ReopenParticipantAnswers(stageGroup.Id, newEvaluationParticipant.Id);

                            //Answers
                            List<Answer> answers = _ipsDataContext.Answers.Where(a => a.ParticipantId == evaluationParticipant.Id && a.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (Answer answer in answers)
                            {
                                Answer newAnswer = new Answer();

                                newAnswer.Id = 0;
                                newAnswer.ParticipantId = newEvaluationParticipant.Id;
                                newAnswer.QuestionId = answer.QuestionId;
                                newAnswer.IsCorrect = answer.IsCorrect;
                                newAnswer.StageId = firstNewStage.Id;
                                newAnswer.Answer1 = answer.Answer1;
                                newAnswer.KPIType = answer.KPIType;
                                newAnswer.Comment = answer.Comment;

                                _ipsDataContext.Answers.Add(newAnswer);
                            }

                            //EvaluationStatuses
                            List<EvaluationStatus> evaluationSatuses = _ipsDataContext.EvaluationStatuses.Where(es => es.ParticipantId == evaluationParticipant.Id && es.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (EvaluationStatus evaluationStatus in evaluationSatuses)
                            {
                                EvaluationStatus newEvaluationStatus = new EvaluationStatus();

                                newEvaluationStatus.StageId = firstNewStage.Id;
                                newEvaluationStatus.ParticipantId = newEvaluationParticipant.Id;
                                newEvaluationStatus.StartedAt = evaluationStatus.StartedAt;
                                newEvaluationStatus.EndedAt = evaluationStatus.EndedAt;
                                newEvaluationStatus.DurationMinutes = evaluationStatus.DurationMinutes;
                                newEvaluationStatus.InvitedAt = evaluationStatus.InvitedAt;
                                newEvaluationStatus.RemindAt = evaluationStatus.RemindAt;

                                _ipsDataContext.EvaluationStatuses.Add(newEvaluationStatus);
                            }
                            // Pending to Test
                            List<EvaluationAgreement> evaluationAgreements = _ipsDataContext.EvaluationAgreements.Include("MilestoneAgreementGoals").Include("Trainings").Where(ea => ea.ParticipantId == evaluationParticipant.Id && ea.StageId == lastSourceStage.Id).AsNoTracking().ToList();
                            foreach (EvaluationAgreement evaluationAgreement in evaluationAgreements)
                            {
                                EvaluationAgreement newEvaluationAgreement = new EvaluationAgreement();

                                newEvaluationAgreement.Id = 0;
                                newEvaluationAgreement.StageId = firstNewStage.Id;
                                newEvaluationAgreement.ParticipantId = newEvaluationParticipant.Id;
                                newEvaluationAgreement.QuestionId = evaluationAgreement.QuestionId;
                                newEvaluationAgreement.KPIType = evaluationAgreement.KPIType;
                                newEvaluationAgreement.ShortGoal = evaluationAgreement.ShortGoal;
                                newEvaluationAgreement.Comment = evaluationAgreement.Comment;
                                newEvaluationAgreement.FinalScore = evaluationAgreement.FinalScore;
                                newEvaluationAgreement.MidGoal = evaluationAgreement.MidGoal;
                                newEvaluationAgreement.LongGoal = evaluationAgreement.LongGoal;
                                newEvaluationAgreement.FinalGoal = evaluationAgreement.FinalGoal;

                                foreach (Training training in evaluationAgreement.Trainings)
                                {
                                    Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                    newEvaluationAgreement.Trainings.Add(trainingDB);
                                }
                                // Pending to Test
                                foreach (MilestoneAgreementGoal milestoneAgreementGoal in evaluationAgreement.MilestoneAgreementGoals)
                                {
                                    MilestoneAgreementGoal newMilestoneAgreementGoal = new MilestoneAgreementGoal()
                                    {
                                        CreatedBy = _authService.GetCurrentUserId(),
                                        CreatedOn = DateTime.Now,
                                        Goal = milestoneAgreementGoal.Goal,
                                        StageId = firstNewStage.Id,
                                        ParticipantId = newEvaluationParticipant.Id,
                                    };
                                    newEvaluationAgreement.MilestoneAgreementGoals.Add(newMilestoneAgreementGoal);
                                }
                                _ipsDataContext.EvaluationAgreements.Add(newEvaluationAgreement);
                            }

                            _ipsDataContext.SaveChanges();
                        }

                        foreach (EvaluationParticipant evaluationParticipant in participants)
                        {
                            if (evaluationParticipant.EvaluateeId.HasValue && evaluationParticipant.EvaluateeId > 0)
                            {
                                int evaluationParticipantNeedUpdate = mapParticapantIds[evaluationParticipant.Id];
                                int newevaluateeId = mapParticapantIds[evaluationParticipant.EvaluateeId.Value];
                                EvaluationParticipant evaluationParticipantDB = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == evaluationParticipantNeedUpdate).FirstOrDefault();
                                evaluationParticipantDB.EvaluateeId = newevaluateeId;
                            }
                        }

                        _ipsDataContext.SaveChanges();


                    }
                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public bool IsStageGroupInUse(int stageGroupId)
        {
            var stageGroup = _ipsDataContext.StageGroups
                .Include("Stages")
                .Include(s => s.Profiles)
                .Where(sg => sg.Id == stageGroupId)
                .Select(sg => new
                {
                    ProfileTypeId = sg.Profiles.Select(p => p.ProfileTypeId).FirstOrDefault(),
                    StageIds = sg.Stages.Select(s => s.Id)
                })
                .AsNoTracking()
                .FirstOrDefault();

            bool answersExist = false;

            if (stageGroup != null)
            {
                switch ((ProfileTypeEnum)stageGroup.ProfileTypeId)
                {
                    case ProfileTypeEnum.Soft:
                        answersExist = _ipsDataContext.Answers.Any(a => stageGroup.StageIds.Contains((int)a.StageId));
                        break;
                    case ProfileTypeEnum.Knowledge:
                        answersExist = _ipsDataContext.SurveyResults.Any(sr => stageGroup.StageIds.Contains((int)sr.StageId));
                        break;
                }
            }

            return answersExist;
        }

        public IpsStageStatusInfo[] GetStagesStatus(int stageGroupId)
        {
            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("Stages").Where(sg => sg.Id == stageGroupId).AsNoTracking().FirstOrDefault();
            if (stageGroup != null)
            {
                List<Stage> stages = stageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();
                IpsStageStatusInfo[] status = new IpsStageStatusInfo[stages.Count];
                for (int i = 0; i < stages.Count; i++)
                {
                    status[i] = new IpsStageStatusInfo();
                    var stageId = stages[i].Id;
                    status[i].StageId = stageId;
                    status[i].IsInUse = _ipsDataContext.Answers.Any(a => (int)a.StageId == stageId);
                    status[i].IsLocked = status[i].IsInUse && stages[i].EndDateTime < DateTime.Now;
                    if (i > 0 && !status[i].IsInUse)
                    {
                        status[i - 1].IsLocked = false; // until users submit answers we keep previous stage partly open
                    }
                }
                return status;
            }
            return new IpsStageStatusInfo[0];
        }

        /// <summary>
        /// Returns all stage group stages by stage id
        /// </summary>
        /// <param name="stageId"></param>
        /// <returns></returns>
        public List<Stage> GetAllStageGroupStages(int stageId)
        {
            List<IpsQuestionInfo> questions = new List<IpsQuestionInfo>();
            List<Stage> stages = new List<Stage>();
            StageGroup stageGroup = _ipsDataContext.StageGroups
                .Include("Profiles.Scale.ScaleRanges")
                .Include("Stages")
                .Where(sg => sg.Id == (_ipsDataContext.Stages.Where(s => s.Id == stageId).Select(s => s.StageGroupId)).FirstOrDefault())
                .AsNoTracking()
                .FirstOrDefault();

            if (stageGroup != null)
                stages = stageGroup.Stages.OrderBy(s => s.StartDateTime).ToList();

            return stages;
        }


        public List<Stage> GetAllStagesByStageGroupId(int stageGroupId)
        {
            List<Stage> stages = new List<Stage>();
            stages = _ipsDataContext.Stages
                .Where(sg => sg.StageGroupId == stageGroupId).ToList();

            return stages;
        }

        public IpsRecurrentTrainingModel AddRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel)
        {
            if (ipsRecurrentTrainingModel.StageGroupId > 0)
            {
                string data = JsonConvert.SerializeObject(ipsRecurrentTrainingModel);
                UserRecurrentNotificationSetting userRecurrentNotificationSetting = JsonConvert.DeserializeObject<UserRecurrentNotificationSetting>(data);
                userRecurrentNotificationSetting.CreatedAt = DateTime.Now;
                userRecurrentNotificationSetting.CreatedBy = _authService.GetCurrentUserId();
                _ipsDataContext.UserRecurrentNotificationSettings.Add(userRecurrentNotificationSetting);
                int result = _ipsDataContext.SaveChanges();
                if (result > 0)
                {
                    ipsRecurrentTrainingModel.Id = userRecurrentNotificationSetting.Id;
                }
            }
            return ipsRecurrentTrainingModel;
        }

        public int UpdateRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel)
        {
            int result = 0;
            if (ipsRecurrentTrainingModel.Id > 0)
            {
                UserRecurrentNotificationSetting old = _ipsDataContext.UserRecurrentNotificationSettings.Where(x => x.Id == ipsRecurrentTrainingModel.Id).FirstOrDefault();
                if (old != null)
                {
                    string data = JsonConvert.SerializeObject(ipsRecurrentTrainingModel);
                    UserRecurrentNotificationSetting userRecurrentNotificationSetting = JsonConvert.DeserializeObject<UserRecurrentNotificationSetting>(data);
                    userRecurrentNotificationSetting.ModifiedAt = DateTime.Now;
                    userRecurrentNotificationSetting.ModifiedBy = _authService.GetCurrentUserId();
                    _ipsDataContext.Entry(old).CurrentValues.SetValues(userRecurrentNotificationSetting);
                    result = _ipsDataContext.SaveChanges();
                }
            }
            return result;
        }

    }
}


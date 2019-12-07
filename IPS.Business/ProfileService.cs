using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.SalesActivityModels;
using IPS.Data.Enums;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.Enum;

namespace IPS.Business
{

    public class ProfileService : BaseService, IProfileService
    {
        public IQueryable<Profile> Get()
        {
            IQueryable<Profile> profiles;
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                profiles = _ipsDataContext.Profiles.AsNoTracking().AsQueryable();
            }
            else
            {
                PerformanceService _performanceService = new PerformanceService();
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                IpsUserProfiles userProfiles = _performanceService.GetUserProfiles(realCurrentUser.User.Id);
                List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                if (expiredStageGroupIds.Count() > 0)
                {
                    foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
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
                List<int> activeProfileIds = userProfiles.ActiveProfiles.Select(x => x.Profile.Id).Distinct().ToList();
                List<int> completedProfileIds = userProfiles.CompletedProfiles.Select(x => x.Profile.Id).Distinct().ToList();
                List<int> historyProfileIds = userProfiles.History.Select(x => x.Profile.Id).Distinct().ToList();

                List<int> ids = activeProfileIds.Union(completedProfileIds).Union(historyProfileIds).Distinct().ToList();
                //profiles = _ipsDataContext.Profiles.Where(p => p.OrganizationId != null && idList.Contains((int)p.OrganizationId) && ((activeProfileIds.Contains(p.Id) || completedProfileIds.Contains(p.Id) || historyProfileIds.Contains(p.Id)) || (p.IsTemplate == true))).AsQueryable();
                profiles = _ipsDataContext.Profiles.Where(p => p.OrganizationId != null && idList.Contains((int)p.OrganizationId) && ((ids.Contains(p.Id)) || (p.IsTemplate == true))).AsQueryable();
            }

            return profiles;
        }
        public IQueryable<Profile> GetUserProfileWithTemplates()
        {
            IQueryable<Profile> profiles;
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                profiles = _ipsDataContext.Profiles.AsNoTracking().AsQueryable();
            }
            else
            {
                profiles = _ipsDataContext.Profiles.Where(p => p.OrganizationId != null && idList.Contains((int)p.OrganizationId) && p.IsTemplate == true).AsQueryable();
            }



            return profiles;
        }


        public IQueryable<Profile> GetById(int id)
        {
            return _ipsDataContext.Profiles.Where(p => p.Id == id).AsQueryable();
        }

        public List<IpsProjectProfileModel> GetProjectProfiles(int projectId)
        {
            return _ipsDataContext.Profiles.
                Select(x => new IpsProjectProfileModel()
                {
                    CreatedBy = x.CreatedBy,
                    CreatedByUser = _ipsDataContext.Users.Where(u => u.Id == x.CreatedBy).FirstOrDefault(),
                    CreatedOn = x.CreatedOn,
                    Description = x.Description,
                    Id = x.Id,
                    IndustryId = x.IndustryId,
                    IsActive = x.IsActive,
                    KPIStrong = x.KPIStrong,
                    KPIWeak = x.KPIWeak,
                    ModifiedBy = x.ModifiedBy,
                    ModifiedByUser = _ipsDataContext.Users.Where(u => u.Id == x.ModifiedBy).FirstOrDefault(),
                    ModifiedOn = x.ModifiedOn,
                    Name = x.Name,
                    ProfileType = _ipsDataContext.ProfileTypes.Where(pt => pt.Id == x.ProfileTypeId).FirstOrDefault(),
                    ProfileTypeId = x.ProfileTypeId,
                    Project = _ipsDataContext.Projects.Where(pt => pt.Id == x.ProjectId).FirstOrDefault(),
                    ProjectId = x.ProjectId,
                    MeasureUnitId = x.Scale != null ? (int?)x.Scale.MeasureUnitId : null,
                    MeasureUnit = x.Scale != null ? _ipsDataContext.MeasureUnits.Where(mu => mu.Id == x.Scale.MeasureUnitId).FirstOrDefault() : null,
                }).Where(p => p.ProjectId == projectId).ToList();
            //Include("JobPositions").Include("User").Include("User1").Include("Scale").Where(p => p.ProjectId == projectId).ToList();
        }

        public Profile Add(Profile profile)
        {
            Add(_ipsDataContext, profile);
            _ipsDataContext.SaveChanges();

            return profile;
        }

        public void Add(IPSData dataContext, Profile profile)
        {
            if (profile.Scale != null)
            {
                profile.Scale.ProfileType1 = null;
                profile.Scale.ScaleCategory = null;
                profile.Scale.MeasureUnit = null;
            }
            profile.Industry = null;

            List<JobPosition> jobPositions = new List<JobPosition>();
            foreach (JobPosition jp in profile.JobPositions)
            {
                JobPosition jobPosition = _ipsDataContext.JobPositions.Where(j => j.Id == jp.Id).FirstOrDefault();
                jobPositions.Add(jobPosition);
            }

            profile.JobPositions = jobPositions;
            profile.CreatedOn = DateTime.Now;
            profile.CreatedBy = _authService.GetCurrentUserId();
            dataContext.Profiles.Add(profile);
        }

        public Profile AddProfile(Profile profile)
        {
            foreach (StageGroup sg in profile.StageGroups)
            {
                //foreach (EvaluationParticipant ep in sg.EvaluationParticipants)
                //{
                //    ep.Id = 0;
                //}
                sg.EvaluationParticipants = null;
            }
            foreach (PerformanceGroup pg in profile.PerformanceGroups)
            {
                pg.Id = 0;
                foreach (Link_PerformanceGroupSkills pgskill in pg.Link_PerformanceGroupSkills)
                {
                    pgskill.Id = 0;
                    Skill newSKill = new Skill()
                    {
                        Name = pgskill.Skill.Name,
                        Description = pgskill.Skill.Description,
                        Questions = pgskill.Questions,
                    };


                }
            }
            profile.CreatedOn = DateTime.Now;
            profile.CreatedBy = _authService.GetCurrentUserId();
            _ipsDataContext.Profiles.Add(profile);
            _ipsDataContext.SaveChanges();
            return profile;
        }

        public Profile CloneProfile(Profile profile, string namePattern, int? projectId)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    string copyName = namePattern;
                    if (_ipsDataContext.Profiles.Where(p => p.Name == copyName).Count() > 0)
                    {
                        int i = 1;
                        while (true)
                        {
                            if (_ipsDataContext.Profiles.Where(p => p.Name == copyName + i.ToString()).Count() == 0)
                            {
                                copyName = copyName + i.ToString();
                                break;
                            }
                            i++;
                        }
                    }
                    var newProfile = CreateCopy(_ipsDataContext, profile, copyName, projectId);
                    dbContextTransaction.Commit();
                    return newProfile;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public Profile CreateCopy(Profile profile, string copyName)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    var newProfile = CreateCopy(_ipsDataContext, profile, copyName, null);
                    dbContextTransaction.Commit();
                    return newProfile;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }

        }

        public Profile CreateCopy(IPSData dataContext, Profile profile, string copyName, int? projectId)
        {


            Profile profileSource = dataContext.Profiles.Include("JobPositions").Include("Scale").Include("PerformanceGroups").Where(p => p.Id == profile.Id).FirstOrDefault();

            Profile newProfile = new Profile();

            if (profileSource.ScaleId > 0)
            {
                Scale ScaleDB = dataContext.Scales.Include("ScaleRanges").Where(sc => sc.Id == profileSource.ScaleId).AsNoTracking().FirstOrDefault();
                Scale newScale = new Scale();

                newScale.Id = 0;
                newScale.Name = ScaleDB.Name;
                newScale.Description = ScaleDB.Description;
                newScale.ScaleCategoryId = ScaleDB.ScaleCategoryId;
                newScale.MeasureUnitId = ScaleDB.MeasureUnitId;
                newScale.IncludeNotRelevant = ScaleDB.IncludeNotRelevant;
                newScale.IsTemplate = false;
                newScale.ProfileType = ScaleDB.ProfileType;
                dataContext.Scales.Add(newScale);
                dataContext.SaveChanges();
                foreach (ScaleRange sr in ScaleDB.ScaleRanges)
                {
                    sr.Id = 0;
                    sr.ScaleId = newScale.Id;
                    sr.Scale = null;
                    dataContext.ScaleRanges.Add(sr);
                }
                dataContext.SaveChanges();
                newProfile.ScaleId = newScale.Id;
            }
            newProfile.ProjectId = projectId;
            newProfile.Name = copyName;
            newProfile.OrganizationId = _authService.GetCurrentUserOrgId();
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

            newProfile.CreatedOn = DateTime.Now;
            newProfile.CreatedBy = _authService.GetCurrentUserId();
            dataContext.Profiles.Add(newProfile);

            foreach (JobPosition jobPosition in profileSource.JobPositions)
            {
                JobPosition jobPositionDB = dataContext.JobPositions.Where(jp => jp.Id == jobPosition.Id).FirstOrDefault();
                newProfile.JobPositions.Add(jobPositionDB);
            }

            if (profileSource.PerformanceGroups.Count > 0)
            {
                List<PerformanceGroup> performanceGroupList = new List<PerformanceGroup>(profileSource.PerformanceGroups);
                PerformanceGroupsService performanceGroupService = new PerformanceGroupsService();
                foreach (PerformanceGroup pg in performanceGroupList)
                {
                    PerformanceGroup newPerformancegroup = new PerformanceGroup();
                    pg.OrganizationId = newProfile.OrganizationId;
                    newPerformancegroup = performanceGroupService.CreateCopy(dataContext, pg, pg.Name);
                    newPerformancegroup.ProfileId = newProfile.Id;
                    dataContext.SaveChanges();
                }
            }

            dataContext.SaveChanges();
            return newProfile;

        }


        public void AddPerformanceGroupToProfileFromTemplate(int profileId, PerformanceGroup[] performanceGroups)
        {
            Profile profileDB = _ipsDataContext.Profiles.FirstOrDefault(p => p.Id == profileId);
            PerformanceGroupsService performanceGroupService = new PerformanceGroupsService();
            foreach (PerformanceGroup pg in performanceGroups)
            {
                pg.ProfileId = profileDB.Id;
                pg.IsTemplate = false;
                performanceGroupService.CreateCopy(pg, pg.Name);
            }
        }


        public void Update(Profile profile)
        {

            if (profile.Scale != null)
            {
                profile.Scale.ProfileType1 = null;
                profile.Scale.ScaleCategory = null;
                profile.Scale.MeasureUnit = null;
            }


            var original = _ipsDataContext.Profiles.Include("Scale").Include("JobPositions").Include("Link_ProfileTags").Where(p => p.Id == profile.Id).SingleOrDefault();

            if (original != null)
            {
                profile.ModifiedOn = DateTime.Now;
                profile.ModifiedBy = _authService.GetCurrentUserId();
                _ipsDataContext.Entry(original).CurrentValues.SetValues(profile);

                Scale scaleOriginal = _ipsDataContext.Scales.Include("ScaleRanges").Where(sc => sc.Id == original.ScaleId).FirstOrDefault();
                if (scaleOriginal != null)
                {
                    profile.Scale.IsTemplate = false;
                    _ipsDataContext.Entry(scaleOriginal).CurrentValues.SetValues(profile.Scale);
                    _ipsDataContext.ScaleRanges.RemoveRange(scaleOriginal.ScaleRanges);
                    foreach (ScaleRange scaleRange in profile.Scale.ScaleRanges)
                    {
                        scaleRange.ScaleId = profile.ScaleId.Value;
                        _ipsDataContext.ScaleRanges.Add(scaleRange);
                    }
                }

                original.JobPositions.Clear();
                foreach (JobPosition jp in profile.JobPositions)
                {
                    JobPosition jobPosition = _ipsDataContext.JobPositions.Where(j => j.Id == jp.Id).FirstOrDefault();
                    original.JobPositions.Add(jobPosition);
                }

                original.Link_ProfileTags.Clear();
                foreach (Link_ProfileTags t in profile.Link_ProfileTags)
                {
                    Tag tag = _ipsDataContext.Tags.Where(x => x.Id == t.TagId).FirstOrDefault();
                    Link_ProfileTags profileTag = new Link_ProfileTags()
                    {
                        ProfileId = profile.Id,
                        TagId = tag.Id,
                    };
                    original.Link_ProfileTags.Add(profileTag);
                }

                _ipsDataContext.SaveChanges();
            }
        }

        public void Delete(Profile profile)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    bool isStages = false;
                    bool isAnswers = false;

                    Profile profileDB = _ipsDataContext.Profiles.Include("PerformanceGroups").Where(p => p.Id == profile.Id).FirstOrDefault();

                    List<StageGroup> stageGroups = _ipsDataContext.Profiles.Include("StageGroups").Where(p => p.Id == profileDB.Id).FirstOrDefault().StageGroups.ToList();


                    List<Stage> stages = new List<Stage>();
                    foreach (StageGroup stageGroup in stageGroups)
                    {
                        stages = _ipsDataContext.Stages.Where(st => (st.StageGroupId == stageGroup.Id) && ((st.EndDateTime < DateTime.Today) || (st.StartDateTime < DateTime.Today && st.EndDateTime > DateTime.Today))).ToList();
                        if (stages.Count > 0)
                        {
                            isStages = true;
                            break;
                        }
                    }

                    foreach (PerformanceGroup performanceGroup in profileDB.PerformanceGroups)
                    {
                        List<Link_PerformanceGroupSkills> links = _ipsDataContext.Link_PerformanceGroupSkills.Include("Questions").Where(l => l.PerformanceGroupId == performanceGroup.Id).ToList();

                        foreach (Link_PerformanceGroupSkills link in links)
                        {
                            int[] questionIds = link.Questions.Select(q => q.Id).ToArray();
                            List<Answer> answers = _ipsDataContext.Answers.Where(a => questionIds.Contains(a.QuestionId)).ToList();
                            if (answers.Count > 0)
                            {
                                isAnswers = true;
                                break;
                            }

                        }
                        if (isAnswers)
                        {
                            break;  //there are answers
                        }
                    }


                    if (!isAnswers && !isStages)
                    {
                        Scale scale = _ipsDataContext.Scales.Include("ScaleRanges").Where(p => p.Id == profile.ScaleId).FirstOrDefault();
                        if (scale != null)
                        {
                            _ipsDataContext.ScaleRanges.RemoveRange(scale.ScaleRanges);
                            _ipsDataContext.Scales.Remove(scale);
                        }

                        List<JobPosition> jobPositions = _ipsDataContext.Profiles.Include("JobPositions").Where(p => p.Id == profile.Id).FirstOrDefault().JobPositions.ToList();
                        jobPositions.Clear();

                        _ipsDataContext.Profiles.Remove(profile);
                        _ipsDataContext.SaveChanges();
                        dbContextTransaction.Commit();
                    }
                    else
                    {
                        throw new DbUpdateConcurrencyException("Profile has answers or active/past stages");
                    }

                }
                catch (DbUpdateConcurrencyException ex)
                {
                    throw new DbUpdateConcurrencyException(ex.Message);
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();

                    throw;
                }
            }
        }

        public bool IsProfileInUseByQuestion(int questionId)
        {
            Profile profile = _ipsDataContext.Profiles
                .Include(x => x.PerformanceGroups.Select(p => p.Link_PerformanceGroupSkills.Select(s => s.Questions)))
                .Include(x => x.StageGroups.Select(s => s.Stages))
                .Where(p => p.PerformanceGroups.Any(x => x.Link_PerformanceGroupSkills.Any(s => s.Questions.Any(q => q.Id == questionId))))
                .AsNoTracking()
                .FirstOrDefault();

            return IsProfileInUse(profile);
        }

        public bool IsProfileInUse(int profileId)
        {
            Profile profile = _ipsDataContext.Profiles
                .Include("PerformanceGroups")
                .Include("StageGroups.Stages")
                .Where(p => p.Id == profileId)
                .AsNoTracking()
                .FirstOrDefault();

            return IsProfileInUse(profile);
        }

        public bool IsProfileInUse(Profile profile)
        {
            if (profile != null)
            {
                List<StageGroup> stageGroups = profile.StageGroups.ToList();

                List<Stage> stages = new List<Stage>();
                foreach (StageGroup stageGroup in stageGroups)
                {
                    stages = stageGroup.Stages.Where(st => ((st.EndDateTime < DateTime.Today) || (st.StartDateTime < DateTime.Today && st.EndDateTime > DateTime.Today))).ToList();
                    if (stages.Count > 0)
                    {
                        //Active Stages Exist;
                        return true;
                    }
                    int[] stageIds = stageGroup.Stages.Select(s => s.Id).ToArray();

                    bool answersExist = _ipsDataContext.Answers.Any(a => stageIds.Contains((int)a.StageId));
                    if (answersExist)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public bool IsProfilePhasesFinished(Profile profile)
        {
            List<IPSPhasesStatus> result = new List<IPSPhasesStatus>();
            if (profile != null)
            {
                List<StageGroup> stageGroups = profile.StageGroups.ToList();

                List<Stage> stages = new List<Stage>();
                // check for profile phase 1.2
                bool isProfilePhaseOneComplete = false;
                if (profile.PerformanceGroups.Count() > 0)
                {
                    isProfilePhaseOneComplete = true;
                    result.Add(new IPSPhasesStatus()
                    {
                        IsComplete = true,
                        PhaseName = "Profile Step 1.2"
                    });
                }

                // check for profile phase 2
                bool isProfilePhaseTwoComplete = false;
                if (isProfilePhaseOneComplete)
                {
                    foreach (PerformanceGroup pg in profile.PerformanceGroups)
                    {
                        if (pg.Link_PerformanceGroupSkills.Count() > 0)
                        {
                            foreach (Link_PerformanceGroupSkills performanceGroupSkills in pg.Link_PerformanceGroupSkills)
                            {
                                if (performanceGroupSkills.Skill.Questions.Count() > 0)
                                {
                                    isProfilePhaseTwoComplete = true;
                                }
                                else
                                {
                                    isProfilePhaseTwoComplete = false;
                                    break;

                                }
                            }
                            if (!isProfilePhaseTwoComplete)
                            {
                                break;
                            }


                        }

                    }
                    if (isProfilePhaseTwoComplete)
                    {
                        result.Add(new IPSPhasesStatus()
                        {
                            IsComplete = true,
                            PhaseName = "Profile Step 1.2"
                        });
                    }
                }

                bool isProfilePhaseThreeComplete = false;
                foreach (StageGroup stageGroup in stageGroups)
                {
                    //stages = stageGroup.Stages.Where(st => ((st.EndDateTime < DateTime.Today) || (st.StartDateTime < DateTime.Today && st.EndDateTime > DateTime.Today))).ToList();
                    if (stageGroup.Stages.Count > 0)
                    {
                        if (stageGroup.EvaluationParticipants.Count() > 0)
                        {
                            isProfilePhaseThreeComplete = true;
                        }
                    }

                }

                if (isProfilePhaseOneComplete && isProfilePhaseTwoComplete && isProfilePhaseThreeComplete)
                {
                    return true;
                }

            }
            return false;
        }

        public List<IPSDropDown> GetProfileStageGroupsByProfileId(int profileId)
        {
            List<IPSDropDown> stageGroups = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId)
                .SelectMany(p => p.StageGroups).Select(x => new IPSDropDown()
                {
                    Id = x.Id,
                    Name = x.Name,
                })
                .ToList();
            return stageGroups;
        }

        public List<Profile> getProfileTemplates(int projectId, int profileTypeId)
        {
            string[] ignoreWords = new[] { "this", "your", "that", "does", "about", "have" };
            ProjectService _projectService = new ProjectService();

            IpsProjectModel projectinfo = _projectService.GetProjectById(projectId);
            List<string> goalText = new List<string>();
            List<string> strategyText = new List<string>();
            List<string> missionText = new List<string>();
            List<string> visionText = new List<string>();
            List<string> profileDescritionText = new List<string>();

            List<string> goals = new List<string>();
            List<string> strategies = new List<string>();
            List<string> missionwords = new List<string>();
            List<string> visionwords = new List<string>();
            List<string> profileDescritionwords = new List<string>();
            foreach (IpsProjectGoalModel goal in projectinfo.ProjectGoals)
            {
                if (!string.IsNullOrEmpty(goal.Goal))
                {
                    List<string> splittedGoal = goal.Goal.Split(' ').ToList();
                    foreach (string splitText in splittedGoal)
                    {
                        if (splitText.Length > 3)
                        {
                            if ((!ignoreWords.Contains(splitText.ToLower())) && (!goals.Contains(splitText.ToLower())))
                            {
                                goals.Add(splitText.ToLower());
                                profileDescritionwords.Add(splitText);
                                goalText.Add("pgoal.Goal like '%" + splitText + "%'");

                            }
                        }
                    }
                }
                if (!string.IsNullOrEmpty(goal.Strategy))
                {
                    List<string> splittedStrategy = goal.Strategy.Split(' ').ToList();
                    foreach (string splitText in splittedStrategy)
                    {
                        if (splitText.Length > 3)
                        {
                            if ((!ignoreWords.Contains(splitText.ToLower())) && (!strategies.Contains(splitText.ToLower())))
                            {
                                strategies.Add(splitText.ToLower());
                                profileDescritionwords.Add(splitText);
                                strategyText.Add("pgoal.Strategy like '%" + splitText + "%'");

                                //strategyText.Add("pgoal.Strategy like '%" + splitText + "%'");
                            }
                        }
                    }
                }



            }

            if (!string.IsNullOrEmpty(projectinfo.MissionStatement))
            {
                List<string> splittedMission = projectinfo.MissionStatement.Split(' ').ToList();
                foreach (string splitText in splittedMission)
                {
                    if (splitText.Length > 3)
                    {
                        if ((!ignoreWords.Contains(splitText.ToLower())) && (!missionwords.Contains(splitText.ToLower())))
                        {
                            missionwords.Add(splitText.ToLower());
                            profileDescritionwords.Add(splitText);
                            missionText.Add("proj.MissionStatement like '%" + splitText + "%'");



                            //strategyText.Add("pgoal.Strategy like '%" + splitText + "%'");
                        }
                    }
                }
            }

            if (!string.IsNullOrEmpty(projectinfo.VisionStatement))
            {
                List<string> splittedVision = projectinfo.VisionStatement.Split(' ').ToList();
                foreach (string splitText in splittedVision)
                {
                    if (splitText.Length > 3)
                    {
                        if ((!ignoreWords.Contains(splitText.ToLower())) && (!visionwords.Contains(splitText.ToLower())))
                        {
                            visionwords.Add(splitText.ToLower());
                            profileDescritionwords.Add(splitText);
                            visionText.Add("proj.VisionStatement like '%" + splitText + "%'");

                            //strategyText.Add("pgoal.Strategy like '%" + splitText + "%'");
                        }
                    }
                }
            }

            List<Profile> result = new List<Profile>();
            string query = "select distinct p.id from Profiles p " +
                        " left join Projects proj on p.projectid = proj.id " +
                        " right join ProjectGoals pgoal on pgoal.projectid = proj.id where p.istemplate = 1 and p.profileTypeId = " + profileTypeId;

            List<string> condtions = new List<string>();
            if (goalText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += "  ( ";
                condtion += string.Join(" or ", goalText);
                condtion += " ) ";
                condtions.Add(condtion);
            }
            if (strategyText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += " ( ";
                condtion += string.Join(" or ", strategyText);
                condtion += " ) ";
                condtions.Add(condtion);

            }

            if (missionText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += " ( ";
                condtion += string.Join(" or ", missionText);
                condtion += " ) ";
                condtions.Add(condtion);

            }

            if (visionText.Count > 0)
            {
                string condtion = string.Empty;
                condtion += "( ";
                condtion += string.Join(" or ", visionText);
                condtion += " ) ";
                condtions.Add(condtion);

            }




            if (condtions.Count() > 0)
            {
                query += "and (" + string.Join(" or ", condtions) + ")";
            }
            //and(proj.MissionStatement like '%001%')
            List<int> profileIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();

            //Searchinto trainings why what how
            string findTrainingQuery = "select distinct p.Id from profiles p " +
                                    " join PerformanceGroups pg on pg.profileId = p.id " +
                                    " join  Link_PerformanceGroupSkills lps on pg.id = lps.performancegroupid " +
                                    " join Link_PerformancGroupTrainings lpt on lps.Id = lpt.PerformanceGroupSkillId " +
                                    " join trainings t on t.Id = lpt.trainingid " +
                                    " where p.IsTemplate = 1 and p.profileTypeId = " + profileTypeId;
            List<string> profileCondtions = new List<string>();
            if (profileDescritionwords.Count > 0)
            {
                foreach (string profileWord in profileDescritionwords)
                {
                    profileDescritionText.Add("p.description like '%" + profileWord + "%'");
                    profileDescritionText.Add("t.why like '%" + profileWord + "%'");
                    profileDescritionText.Add("t.what like '%" + profileWord + "%'");
                    profileDescritionText.Add("t.how like '%" + profileWord + "%'");

                }

                string condtion = string.Empty;
                condtion += "( ";
                condtion += string.Join(" or ", profileDescritionText);
                condtion += " ) ";
                profileCondtions.Add(condtion);

            }
            List<int> profileSearchIds = new List<int>();
            if (profileCondtions.Count() > 0)
            {
                findTrainingQuery += "and (" + string.Join(" or ", profileCondtions) + ")";
                profileSearchIds = _ipsDataContext.Database.SqlQuery<int>(findTrainingQuery).ToList();
            }
            result = _ipsDataContext.Profiles.Where(x => profileIds.Contains(x.Id) || profileSearchIds.Contains(x.Id)).ToList();
            return result;
        }

        public Profile getTemplateProfileById(int id)
        {
            Profile profileSource = _ipsDataContext.Profiles.Include("JobPositions").Include("Link_ProfileTags").Include("Scale").Include("PerformanceGroups").Where(p => p.Id == id).FirstOrDefault();

            Profile newProfile = new Profile();

            if (profileSource.ScaleId > 0)
            {
                newProfile.ScaleId = profileSource.ScaleId;
            }

            newProfile.Name = profileSource.Name;
            newProfile.OrganizationId = _authService.GetCurrentUserOrgId();
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



            if (profileSource.PerformanceGroups.Count > 0)
            {
                List<PerformanceGroup> performanceGroupList = new List<PerformanceGroup>(profileSource.PerformanceGroups);
                PerformanceGroupsService performanceGroupService = new PerformanceGroupsService();
                int pgIndex = 0;
                foreach (PerformanceGroup pg in performanceGroupList)
                {

                    List<Link_PerformanceGroupSkills> links = _ipsDataContext.Link_PerformanceGroupSkills.Include("Skill").Include("Trainings.TrainingMaterials").Include("Questions.PossibleAnswer").Where(l => l.PerformanceGroupId == pg.Id).ToList();
                    pg.OrganizationId = newProfile.OrganizationId;
                    pg.Id = pgIndex - 1; ;
                    pg.ProfileId = 0;
                    int lpgskillIndex = 0;
                    foreach (Link_PerformanceGroupSkills link_PerformanceGroupSkill in links)
                    {
                        link_PerformanceGroupSkill.Id = lpgskillIndex - 1;
                        link_PerformanceGroupSkill.PerformanceGroupId = pg.Id;
                        link_PerformanceGroupSkill.SkillId = link_PerformanceGroupSkill.Id;
                        if (link_PerformanceGroupSkill.Skill != null)
                        {
                            link_PerformanceGroupSkill.Skill.Id = link_PerformanceGroupSkill.Id;

                            int skillTrainingIndex = 0;
                            foreach (Training training in link_PerformanceGroupSkill.Skill.Trainings)
                            {

                                training.Id = skillTrainingIndex - 1;
                                int trainingMaterialIndex = 0;
                                foreach (TrainingMaterial TrainingMaterial in training.TrainingMaterials)
                                {

                                    TrainingMaterial.Id = trainingMaterialIndex - 1;
                                    trainingMaterialIndex--;
                                }
                                skillTrainingIndex--;
                            }
                        }
                        int skillQuestionIndex = 0;
                        foreach (Question question in link_PerformanceGroupSkill.Questions)
                        {
                            question.Id = skillQuestionIndex - 1;
                            skillQuestionIndex--;

                        }
                        lpgskillIndex--;
                    }
                    newProfile.PerformanceGroups.Add(pg);
                    pgIndex--;
                }
            }

            return newProfile;

        }

        public Profile getFullProfileById(int id)
        {
            Profile profileSource = _ipsDataContext.Profiles.Include("JobPositions").Include("Link_ProfileTags").Include("Scale").Include("PerformanceGroups").Include("StageGroups.UserRecurrentNotificationSettings").Where(p => p.Id == id).FirstOrDefault();
            Profile newProfile = new Profile();
            if (profileSource != null)
            {
                newProfile.Id = profileSource.Id;
                if (profileSource.ScaleId > 0)
                {
                    newProfile.ScaleId = profileSource.ScaleId;
                }
                newProfile.Name = profileSource.Name;
                newProfile.OrganizationId = _authService.GetCurrentUserOrgId();
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
                newProfile.ProjectId = profileSource.ProjectId;
                if (profileSource.Link_ProfileTags.Count > 0)
                {
                    foreach (Link_ProfileTags profileTag in profileSource.Link_ProfileTags)
                    {
                        newProfile.Link_ProfileTags.Add(profileTag);
                    }
                }
                if (profileSource.JobPositions.Count > 0)
                {
                    foreach (JobPosition jobPosition in profileSource.JobPositions)
                    {
                        newProfile.JobPositions.Add(jobPosition);
                    }
                }
                if (profileSource.PerformanceGroups.Count > 0)
                {
                    List<PerformanceGroup> performanceGroupList = new List<PerformanceGroup>(profileSource.PerformanceGroups);
                    PerformanceGroupsService performanceGroupService = new PerformanceGroupsService();
                    foreach (PerformanceGroup pg in performanceGroupList)
                    {
                        List<Link_PerformanceGroupSkills> links = _ipsDataContext.Link_PerformanceGroupSkills.Include("Skill").Include("Trainings.TrainingMaterials").Include("Questions.PossibleAnswer").Where(l => l.PerformanceGroupId == pg.Id).ToList();
                        pg.Link_PerformanceGroupSkills = links;
                        newProfile.PerformanceGroups.Add(pg);
                    }
                }
                if (profileSource.StageGroups.Count > 0)
                {
                    List<StageGroup> stageGroupList = new List<StageGroup>(profileSource.StageGroups);
                    StageGroupsService stageGroupsService = new StageGroupsService();
                    foreach (StageGroup sg in stageGroupList)
                    {
                        List<Stage> stages = _ipsDataContext.Stages.Where(l => l.StageGroupId == sg.Id).ToList();
                        foreach (Stage stage in stages)
                        {
                            sg.Stages.Add(stage);
                        }
                        if (!(sg.UserRecurrentNotificationSettings.Count() > 0))
                        {
                            foreach (Stage stage in stages)
                            {
                                UserRecurrentNotificationSetting newUserRecurrentNotificationSettings = new UserRecurrentNotificationSetting();
                                newUserRecurrentNotificationSettings.StageGroupId = sg.Id;
                                newUserRecurrentNotificationSettings.StageId = stage.Id;
                                sg.UserRecurrentNotificationSettings.Add(newUserRecurrentNotificationSettings);
                            }
                        }
                        else if (sg.Stages.Count() != sg.UserRecurrentNotificationSettings.Count())
                        {
                            foreach (Stage stage in stages)
                            {
                                if (!sg.UserRecurrentNotificationSettings.Where(x => x.StageId == stage.Id).Any())
                                {
                                    UserRecurrentNotificationSetting newUserRecurrentNotificationSettings = new UserRecurrentNotificationSetting();
                                    newUserRecurrentNotificationSettings.StageGroupId = sg.Id;
                                    newUserRecurrentNotificationSettings.StageId = stage.Id;
                                    sg.UserRecurrentNotificationSettings.Add(newUserRecurrentNotificationSettings);
                                }
                            }
                        }
                        newProfile.StageGroups.Add(sg);
                    }
                }
            }
            return newProfile;
        }

        public bool ChangeProfileStatus(int profileId)
        {
            bool result = false;
            Profile original = _ipsDataContext.Profiles.Where(p => p.Id == profileId).SingleOrDefault();

            if (original != null)
            {
                Profile newProfile = original;
                newProfile.ModifiedOn = DateTime.Now;
                newProfile.ModifiedBy = _authService.GetCurrentUserId();
                newProfile.IsActive = !original.IsActive;
                _ipsDataContext.Entry(original).CurrentValues.SetValues(newProfile);
                int updated = _ipsDataContext.SaveChanges();
                if (updated > 0)
                {
                    result = true;
                }

            }

            return result;
        }

        public ProspectingGoalInfo AddProspectingGoal(ProspectingGoalInfo prospectingGoalInfo)
        {
            prospectingGoalInfo.CreatedBy = _authService.GetCurrentUserId();
            prospectingGoalInfo.CreatedOn = DateTime.Now;
            if (prospectingGoalInfo.TaskId.HasValue)
            {


                Task originalTask = _ipsDataContext.Tasks.Where(x => x.Id == prospectingGoalInfo.TaskId).FirstOrDefault();
                TaskStatusList taskStatusList = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(x => x.Id == originalTask.TaskListId).FirstOrDefault();
                if (taskStatusList != null)
                {
                    TaskStatusListItem statusListItem = taskStatusList.TaskStatusListItems.Where(x => x.TaskStatusListId == originalTask.TaskListId && x.Name.Contains("In Progress")).FirstOrDefault();
                    if (statusListItem != null)
                    {
                        Task updateTask = originalTask;
                        updateTask.StatusId = statusListItem.Id;
                        _ipsDataContext.Entry(originalTask).CurrentValues.SetValues(updateTask);
                    }
                }

            }
            if (prospectingGoalInfo.ProspectingSkillGoals.Count() > 0)
            {
                foreach (ProspectingSkillGoal prospectingSkillGoal in prospectingGoalInfo.ProspectingSkillGoals)
                {
                    if (prospectingSkillGoal.SkillId == 0 && prospectingSkillGoal.Skill != null)
                    {
                        Skill skill = new Skill()
                        {
                            Id = 0,
                            Name = prospectingSkillGoal.Skill.Name,
                            SeqNo = prospectingSkillGoal.Skill.SeqNo,
                            IsActive = true,
                            CreatedBy = _authService.GetCurrentUserId(),
                            CreatedOn = DateTime.Now,
                            Description = prospectingSkillGoal.Skill.Name,
                            OrganizationId = _authService.GetCurrentUserOrgId(),
                        };
                        _ipsDataContext.Skills.Add(skill);
                        _ipsDataContext.SaveChanges();
                        prospectingSkillGoal.Skill = skill;
                        prospectingSkillGoal.SkillId = skill.Id;
                    }
                    else
                    {
                        prospectingSkillGoal.Skill = null;
                    }
                }
            }
            if (prospectingGoalInfo.ProspectingGoalScale != null)
            {
                if (prospectingGoalInfo.ProspectingGoalScale.Id == 0)
                {
                    prospectingGoalInfo.ProspectingGoalScale.MeasureUnit = null;
                    if (prospectingGoalInfo.ProspectingGoalScale.ProspectingGoalScaleRanges.Count() > 0)
                    {
                        if (prospectingGoalInfo.ProspectingGoalScale.ScaleCategoryId > 0)
                        {
                            prospectingGoalInfo.ProspectingGoalScale.ScaleCategory = null;
                        }
                        if (prospectingGoalInfo.ProspectingGoalScale.MeasureUnitId > 0)
                        {
                            prospectingGoalInfo.ProspectingGoalScale.MeasureUnit = null;
                        }
                        _ipsDataContext.ProspectingGoalScales.Add(prospectingGoalInfo.ProspectingGoalScale);
                        _ipsDataContext.SaveChanges();
                        prospectingGoalInfo.ProspectingGoalScaleId = prospectingGoalInfo.ProspectingGoalScale.Id;
                    }
                }
                else
                {
                    prospectingGoalInfo.ProspectingGoalScale = null;
                }
            }
            _ipsDataContext.ProspectingGoalInfoes.Add(prospectingGoalInfo);
            _ipsDataContext.SaveChanges();
            return prospectingGoalInfo;
        }
        public ProspectingGoalInfo UpadateProspectingGoal(ProspectingGoalInfo prospectingGoal)
        {
            ProspectingGoalInfo original = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingGoal.Id).FirstOrDefault();
            if (original != null)
            {
                if (original.CreatedBy == _authService.GetCurrentUserId())
                {

                    prospectingGoal.CreatedBy = original.CreatedBy;
                    prospectingGoal.CreatedOn = original.CreatedOn;
                    prospectingGoal.ModifiedBy = _authService.GetCurrentUserId();
                    prospectingGoal.ModifiedOn = DateTime.Now;
                    if (!(prospectingGoal.UserId > 0))
                    {
                        prospectingGoal.UserId = null;
                    }
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingGoal);
                    _ipsDataContext.SaveChanges();

                    foreach (ProspectingSkillGoal skillGoal in prospectingGoal.ProspectingSkillGoals)
                    {
                        if (skillGoal.Skill != null)
                        {
                            // Update Skill
                            Skill oldSkill = _ipsDataContext.Skills.Where(x => x.Id == skillGoal.Skill.Id).FirstOrDefault();
                            if (oldSkill != null)
                            {
                                if (oldSkill.Name != skillGoal.Skill.Name)
                                {
                                    Skill updatedSkill = new Skill()
                                    {
                                        Id = oldSkill.Id,
                                        Name = skillGoal.Skill.Name,
                                        Description = oldSkill.Description,
                                        IsActive = oldSkill.IsActive,
                                        OrganizationId = oldSkill.OrganizationId,
                                        SeqNo = oldSkill.SeqNo,
                                        CreatedBy = oldSkill.CreatedBy,
                                        CreatedOn = oldSkill.CreatedOn,
                                        ModifiedBy = _authService.GetCurrentUserId(),
                                        ModifiedOn = DateTime.Now,
                                    };
                                    _ipsDataContext.Entry(oldSkill).CurrentValues.SetValues(updatedSkill);
                                    _ipsDataContext.SaveChanges();
                                }
                            }
                        }

                        ProspectingSkillGoal oldSkillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.Id == skillGoal.Id).FirstOrDefault();
                        if (oldSkillGoal != null)
                        {
                            _ipsDataContext.Entry(oldSkillGoal).CurrentValues.SetValues(skillGoal);
                            _ipsDataContext.SaveChanges();
                        }
                    }

                    if (prospectingGoal.ProspectingGoalScale != null)
                    {
                        ProspectingGoalScale oldProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Where(x => x.Id == prospectingGoal.ProspectingGoalScaleId).FirstOrDefault();
                        if (oldProspectingGoalScale != null)
                        {
                            _ipsDataContext.Entry(oldProspectingGoalScale).CurrentValues.SetValues(prospectingGoal.ProspectingGoalScale);
                            _ipsDataContext.SaveChanges();

                            foreach (ProspectingGoalScaleRanx prospectingGoalScaleRange in prospectingGoal.ProspectingGoalScale.ProspectingGoalScaleRanges)
                            {
                                ProspectingGoalScaleRanx oldProspectingGoalScaleRange = _ipsDataContext.ProspectingGoalScaleRanges.Where(x => x.Id == prospectingGoalScaleRange.Id).FirstOrDefault();
                                if (oldProspectingGoalScaleRange != null)
                                {
                                    _ipsDataContext.Entry(oldProspectingGoalScaleRange).CurrentValues.SetValues(prospectingGoalScaleRange);
                                    _ipsDataContext.SaveChanges();
                                }
                                else
                                {
                                    if (prospectingGoal.ProspectingGoalScaleId.HasValue)
                                    {
                                        prospectingGoalScaleRange.ProspectingGoalScaleId = prospectingGoal.ProspectingGoalScaleId.Value;
                                        _ipsDataContext.ProspectingGoalScaleRanges.Add(prospectingGoalScaleRange);
                                        _ipsDataContext.SaveChanges();
                                    }


                                }
                            }
                        }
                    }
                }
            }
            return prospectingGoal;
        }
        public List<ProspectingGoalInfoModel> GetProspectingGoals()
        {
            List<ProspectingGoalInfoModel> result = new List<ProspectingGoalInfoModel>();
            int userId = _authService.GetCurrentUserId();
            List<ProspectingGoalInfoModel> profileProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("Profile").Where(x => x.EvaluationParticipant.UserId == userId && x.ProfileId > 0).Select(x => new ProspectingGoalInfoModel()
            {
                Name = x.Name,
                GoalStartDate = x.GoalStartDate,
                GoalEndDate = x.GoalEndDate,
                Id = x.Id,
                ParticipantId = x.ParticipantId,
                ProfileId = x.ProfileId,
                ProfileName = x.Profile.Name,
                ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),

            }).ToList();
            result.AddRange(profileProspectingGoals);
            List<ProspectingGoalInfoModel> taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.TaskId > 0).Select(x => new ProspectingGoalInfoModel()
            {
                Name = x.Name,
                GoalStartDate = x.GoalStartDate,
                GoalEndDate = x.GoalEndDate,
                Id = x.Id,
                UserId = x.UserId,
                ProfileName = "",
                ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                TaskId = x.TaskId,
                ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                RecurrenceRule = x.RecurrenceRule,
            }).ToList();
            foreach (ProspectingGoalInfoModel prospectingGoalInfo in taskProspectingGoals)
            {
                if (prospectingGoalInfo.ProspectingGoalScaleId.HasValue)
                {
                    prospectingGoalInfo.ProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Include("ProspectingGoalScaleRanges").Where(x => x.Id == prospectingGoalInfo.ProspectingGoalScaleId).FirstOrDefault();
                }
            }
            result.AddRange(taskProspectingGoals);

            return result;
        }
        public List<ProspectingGoalInfoModel> GetProspectingGoalsByUserId(int userId)
        {
            List<ProspectingGoalInfoModel> result = new List<ProspectingGoalInfoModel>();
            List<ProspectingGoalInfoModel> profileProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("Profile").Where(x => x.EvaluationParticipant.UserId == userId && x.ProfileId > 0).Select(x => new ProspectingGoalInfoModel()
            {
                Name = x.Name,
                GoalStartDate = x.GoalStartDate,
                GoalEndDate = x.GoalEndDate,
                Id = x.Id,
                ParticipantId = x.ParticipantId,
                ProfileId = x.ProfileId,
                ProfileName = x.Profile.Name,
                ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),

            }).ToList();
            result.AddRange(profileProspectingGoals);
            List<ProspectingGoalInfoModel> taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId).Select(x => new ProspectingGoalInfoModel()
            {
                Name = x.Name,
                GoalStartDate = x.GoalStartDate,
                GoalEndDate = x.GoalEndDate,
                Id = x.Id,
                UserId = x.UserId,
                ProfileName = "",
                ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                TaskId = x.TaskId,
                ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                RecurrenceRule = x.RecurrenceRule,
            }).ToList();
            foreach (ProspectingGoalInfoModel prospectingGoalInfo in taskProspectingGoals)
            {
                if (prospectingGoalInfo.ProspectingGoalScaleId.HasValue)
                {
                    prospectingGoalInfo.ProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Include("ProspectingGoalScaleRanges").Where(x => x.Id == prospectingGoalInfo.ProspectingGoalScaleId).FirstOrDefault();
                }
            }
            result.AddRange(taskProspectingGoals);

            return result;
        }
        public List<ProspectingGoalInfoModel> GetServiceProspectingGoalsByUserId(int userId)
        {
            List<ProspectingGoalInfoModel> result = new List<ProspectingGoalInfoModel>();
            List<int> serviceProspectingTaskIds = _ipsDataContext.Tasks.Where(x => x.TaskCategoryListItem.Name.ToLower() == "service prospecting" && x.AssignedToId == userId).Select(x => x.Id).ToList();
            List<ProspectingGoalInfoModel> taskServiceProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.TaskId > 0 && serviceProspectingTaskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0)).Select(x => new ProspectingGoalInfoModel()
            {
                Name = x.Name,
                GoalStartDate = x.GoalStartDate,
                GoalEndDate = x.GoalEndDate,
                Id = x.Id,
                UserId = x.UserId,
                ProfileName = "",
                ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                TaskId = x.TaskId,
                ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                RecurrenceRule = x.RecurrenceRule,
            }).ToList();
            foreach (ProspectingGoalInfoModel prospectingGoalInfo in taskServiceProspectingGoals)
            {
                if (prospectingGoalInfo.ProspectingGoalScaleId.HasValue)
                {
                    prospectingGoalInfo.ProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Include("ProspectingGoalScaleRanges").Where(x => x.Id == prospectingGoalInfo.ProspectingGoalScaleId).FirstOrDefault();
                }
            }
            result.AddRange(taskServiceProspectingGoals);

            return result;
        }

        public List<ProspectingGoalInfoModel> GetProjectProspectingGoalsByUserId(int userId, int projectId)
        {
            List<ProspectingGoalInfoModel> result = new List<ProspectingGoalInfoModel>();

            List<ProspectingGoalInfoModel> taskProspectingGoals = new List<ProspectingGoalInfoModel>();
            if (userId > 0)
            {
                if (projectId > 0)
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.TaskId > 0 && x.Task.ProjectId == projectId && x.ProspectingType == (int)ProspectingTypeEnum.Sales).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
                else
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.ProspectingType == (int)ProspectingTypeEnum.Sales).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
            }
            else
            {
                if (projectId > 0)
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.TaskId > 0 && x.Task.ProjectId == projectId && x.ProspectingType == (int)ProspectingTypeEnum.Sales).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
                else
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.ProspectingType == (int)ProspectingTypeEnum.Sales).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
            }

            foreach (ProspectingGoalInfoModel prospectingGoalInfo in taskProspectingGoals)
            {
                if (prospectingGoalInfo.ProspectingGoalScaleId.HasValue)
                {
                    prospectingGoalInfo.ProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Include("ProspectingGoalScaleRanges").Where(x => x.Id == prospectingGoalInfo.ProspectingGoalScaleId).FirstOrDefault();
                }
            }
            result.AddRange(taskProspectingGoals);

            return result;
        }
        public List<ProspectingGoalInfoModel> GetProjectServiceProspectingGoalsByUserId(int userId, int projectId)
        {
            List<ProspectingGoalInfoModel> result = new List<ProspectingGoalInfoModel>();

            List<ProspectingGoalInfoModel> taskProspectingGoals = new List<ProspectingGoalInfoModel>();
            if (userId > 0)
            {
                if (projectId > 0)
                {
                    List<int> serviceProspectingTaskIds = _ipsDataContext.Tasks.Where(x => x.TaskCategoryListItem.Name.ToLower() == "service prospecting").Where(x => x.ProjectId > 0 && x.ProjectId == projectId).Select(x => x.Id).ToList();

                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.TaskId > 0 && serviceProspectingTaskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0) && x.ProspectingType == (int)ProspectingTypeEnum.Service).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
                else
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.UserId == userId && x.TaskId > 0 && (x.Task.ProjectId == null || x.Task.ProjectId == 0) && x.ProspectingType == (int)ProspectingTypeEnum.Service).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
            }
            else
            {
                if (projectId > 0)
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.TaskId > 0 && x.Task.ProjectId == projectId && x.ProspectingType == (int)ProspectingTypeEnum.Service).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
                else
                {
                    taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Include("ProspectingGoalScale").Include("ProspectingGoalScale.ProspectingGoalScaleRanges").Where(x => x.TaskId > 0 && (x.Task.ProjectId == null || x.Task.ProjectId == 0) && x.ProspectingType == (int)ProspectingTypeEnum.Service).Select(x => new ProspectingGoalInfoModel()
                    {
                        Name = x.Name,
                        GoalStartDate = x.GoalStartDate,
                        GoalEndDate = x.GoalEndDate,
                        Id = x.Id,
                        UserId = x.UserId,
                        UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                        ProfileName = "",
                        ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                        TaskId = x.TaskId,
                        ProspectingGoalScaleId = x.ProspectingGoalScaleId,
                        RecurrenceRule = x.RecurrenceRule,
                        ProspectingType = x.ProspectingType,
                    }).ToList();
                }
            }

            foreach (ProspectingGoalInfoModel prospectingGoalInfo in taskProspectingGoals)
            {
                if (prospectingGoalInfo.ProspectingGoalScaleId.HasValue)
                {
                    prospectingGoalInfo.ProspectingGoalScale = _ipsDataContext.ProspectingGoalScales.Include("ProspectingGoalScaleRanges").Where(x => x.Id == prospectingGoalInfo.ProspectingGoalScaleId).FirstOrDefault();
                }
            }
            result.AddRange(taskProspectingGoals);

            return result;
        }

        public ProspectingCustomer AddProspectingCustomer(ProspectingCustomer prospectingCustomer)
        {
            prospectingCustomer.CreatedBy = _authService.GetCurrentUserId();
            prospectingCustomer.CreatedOn = DateTime.Now;
            if (string.IsNullOrEmpty(prospectingCustomer.Detail))
            {
                prospectingCustomer.Detail = string.Empty;
            }
            _ipsDataContext.ProspectingCustomers.Add(prospectingCustomer);
            prospectingCustomer.CustomerSalesData = _ipsDataContext.CustomerSalesDatas.Where(x => x.Id == prospectingCustomer.CustomerSaleDataId).FirstOrDefault();
            _ipsDataContext.SaveChanges();
            return prospectingCustomer;
        }
        public ProspectingCustomer UpadateProspectingCustomer(ProspectingCustomer prospectingCustomer)
        {
            ProspectingCustomer original = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == prospectingCustomer.Id).FirstOrDefault();
            if (original != null)
            {
                if (original.CreatedBy == _authService.GetCurrentUserId())
                {
                    ProspectingCustomer newprospectingCustomer = prospectingCustomer;
                    newprospectingCustomer.CreatedBy = original.CreatedBy;
                    newprospectingCustomer.CreatedOn = original.CreatedOn;
                    newprospectingCustomer.ModifiedBy = _authService.GetCurrentUserId();
                    newprospectingCustomer.ModifiedOn = DateTime.Now;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(newprospectingCustomer);
                    _ipsDataContext.SaveChanges();
                }
            }
            return prospectingCustomer;
        }
        public List<ProspectingCustomerModel> GetProspectingCustomers()
        {
            List<ProspectingCustomerModel> result = new List<ProspectingCustomerModel>();
            int userId = _authService.GetCurrentUserId();
            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoals();
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
            result = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo").Include("CustomerSalesData").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalId != null ? x.ProspectingGoalId.Value : 0)).Select(x => new ProspectingCustomerModel()
            {
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData,

            }).ToList();
            return result;
        }
        public List<ProspectingCustomerModel> GetProspectingCustomersByUserId(int userId)
        {
            List<ProspectingCustomerModel> result = new List<ProspectingCustomerModel>();
            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
            result = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo").Include("CustomerSalesData").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalId != null ? x.ProspectingGoalId.Value : 0)).Select(x => new ProspectingCustomerModel()
            {
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData,

            }).ToList();
            return result;
        }
        public List<ProspectingCustomerModel> GetProspectingCustomersByUserIds(List<int> userIds)
        {
            List<ProspectingCustomerModel> result = new List<ProspectingCustomerModel>();
            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
                List<ProspectingCustomerModel> prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo").Include("CustomerSalesData").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalId != null ? x.ProspectingGoalId.Value : 0)).Select(x => new ProspectingCustomerModel()
                {
                    Detail = x.Detail,
                    Id = x.Id,
                    Name = x.Name,
                    Phone = x.Phone,
                    GoalName = x.ProspectingGoalInfo.Name,
                    ProspectingGoalId = x.ProspectingGoalId,
                    ScheduleDate = x.ScheduleDate,
                    CustomerSaleDataId = x.CustomerSaleDataId,
                    CustomerSalesData = x.CustomerSalesData,

                }).ToList();
                result.AddRange(prospectingCustomers);
            }
            return result;
        }

        public List<ProspectingCustomerModel> GetServiceProspectingCustomersByUserId(int userId)
        {
            List<ProspectingCustomerModel> result = new List<ProspectingCustomerModel>();
            List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
            result = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo").Include("CustomerSalesData").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalId != null ? x.ProspectingGoalId.Value : 0)).Select(x => new ProspectingCustomerModel()
            {
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData,

            }).ToList();
            return result;
        }
        public List<ProspectingCustomerModel> GetServiceProspectingCustomersByUserIds(List<int> userIds)
        {
            List<ProspectingCustomerModel> result = new List<ProspectingCustomerModel>();
            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
                List<ProspectingCustomerModel> prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo").Include("CustomerSalesData").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalId != null ? x.ProspectingGoalId.Value : 0)).Select(x => new ProspectingCustomerModel()
                {
                    Detail = x.Detail,
                    Id = x.Id,
                    Name = x.Name,
                    Phone = x.Phone,
                    GoalName = x.ProspectingGoalInfo.Name,
                    ProspectingGoalId = x.ProspectingGoalId,
                    ScheduleDate = x.ScheduleDate,
                    CustomerSaleDataId = x.CustomerSaleDataId,
                    CustomerSalesData = x.CustomerSalesData,
                }).ToList();
                result.AddRange(prospectingCustomers);
            }
            return result;
        }

        public List<ScaleRange> getScaleRanges(int profileId)
        {
            List<ScaleRange> result = new List<ScaleRange>();
            int? scaleId = _ipsDataContext.Profiles.Include("Scale.ScaleRanges").Where(x => x.Id == profileId).Select(x => x.ScaleId).FirstOrDefault();
            if (scaleId.HasValue)
            {
                result = _ipsDataContext.ScaleRanges.Where(x => x.ScaleId == scaleId).ToList();
            }
            return result;
        }

        public ProspectingGoalActivityInfo AddProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo)
        {
            prospectingGoalActivityInfo.CreatedBy = _authService.GetCurrentUserId();
            prospectingGoalActivityInfo.CreatedOn = DateTime.Now;
            foreach (ProspectingActivity activity in prospectingGoalActivityInfo.ProspectingActivities)
            {
                activity.CreatedBy = _authService.GetCurrentUserId();
                activity.CreatedOn = DateTime.Now;
            }
            _ipsDataContext.ProspectingGoalActivityInfoes.Add(prospectingGoalActivityInfo);
            _ipsDataContext.SaveChanges();
            return prospectingGoalActivityInfo;
        }

        public ProspectingGoalActivityInfo UpdateProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo)
        {
            ProspectingGoalActivityInfo original = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingActivities").Where(x => x.Id == prospectingGoalActivityInfo.Id).FirstOrDefault();
            if (original != null)
            {
                List<int> activityIds = original.ProspectingActivities.Select(x => x.Id).ToList();
                bool isActvityResultExist = _ipsDataContext.ProspectingCustomerResults.Any(x => activityIds.Contains(x.ProspectingActivityId));
                if (!isActvityResultExist)
                {
                    _ipsDataContext.ProspectingActivities.RemoveRange(original.ProspectingActivities);
                    List<ProspectingActivity> activities = prospectingGoalActivityInfo.ProspectingActivities.ToList();
                    prospectingGoalActivityInfo.ProspectingActivities = null;
                    ProspectingGoalActivityInfo newProspectingGoalActivityInfo = prospectingGoalActivityInfo;
                    newProspectingGoalActivityInfo.CreatedBy = original.CreatedBy;
                    newProspectingGoalActivityInfo.CreatedOn = original.CreatedOn;
                    newProspectingGoalActivityInfo.ModifiedBy = _authService.GetCurrentUserId();
                    newProspectingGoalActivityInfo.ModifiedOn = DateTime.Now;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(newProspectingGoalActivityInfo);
                    foreach (ProspectingActivity activity in activities)
                    {
                        activity.ProspectingGoalActivityId = prospectingGoalActivityInfo.Id;
                        _ipsDataContext.ProspectingActivities.Add(activity);
                    }
                    _ipsDataContext.SaveChanges();


                    _ipsDataContext.ProspectingGoalActivityInfoes.Add(prospectingGoalActivityInfo);
                    _ipsDataContext.SaveChanges();
                }
            }
            return prospectingGoalActivityInfo;
        }

        public bool DeleteProspectingActivity(int activityId)
        {
            bool result = false;
            bool isActvityResultExist = _ipsDataContext.ProspectingCustomerResults.Any(x => x.ProspectingActivityId == activityId);
            if (!isActvityResultExist)
            {
                ProspectingActivity prospectingActivity = _ipsDataContext.ProspectingActivities.Where(x => x.Id == activityId).FirstOrDefault();
                if (prospectingActivity != null)
                {
                    _ipsDataContext.ProspectingActivities.Remove(prospectingActivity);
                    int resultCount = _ipsDataContext.SaveChanges();
                    if (resultCount > 0)
                    {
                        result = true;
                    }
                }
            }
            return result;
        }

        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoes()
        {
            List<ProspectingGoalActivityInfoModel> result = new List<ProspectingGoalActivityInfoModel>();
            int userId = _authService.GetCurrentUserId();

            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoals();
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            result = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingGoalInfo")
                .Include("ProspectingGoalInfo.Profile").Include("ProspectingActivities")
                .Where(x => prospectingGoalIds.Contains(x.ProspectingGoalInfo.Id))
                .Select(x => new ProspectingGoalActivityInfoModel()
                {
                    ActivityEndTime = x.ActivityEndTime,
                    ActivityStartTime = x.ActivityStartTime,
                    ActivityTime = x.ActivityTime,
                    BreakTime = x.BreakTime,
                    ProfileId = x.ProfileId,
                    Id = x.Id,
                    ProspectingActivities = x.ProspectingActivities.ToList(),
                    GoalName = x.ProspectingGoalInfo.Name,
                    ProspectingGoalId = x.ProspectingGoalId,
                    TotalActivities = x.TotalActivities,
                    UserId = x.UserId,
                    ProspectingGoalInfo = x.ProspectingGoalInfo,
                    ActivityCalculationType = x.ActivityCalculationType,
                    Frequency = x.Frequency
                }).ToList();

            foreach (ProspectingGoalActivityInfoModel prospectingGoalActivityInfoModel in result)
            {
                List<int> prospectingActivityIds = prospectingGoalActivityInfoModel.ProspectingActivities.Select(x => x.Id).ToList();
                prospectingGoalActivityInfoModel.ProspectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => prospectingActivityIds.Contains(x.Id)).ToList();
            }
            return result;
        }




        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserId(int userId)
        {
            List<ProspectingGoalActivityInfoModel> result = new List<ProspectingGoalActivityInfoModel>();

            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            result = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingGoalInfo")
                .Include("ProspectingGoalInfo.Profile").Include("ProspectingActivities")
                .Where(x => prospectingGoalIds.Contains(x.ProspectingGoalInfo.Id))
                .Select(x => new ProspectingGoalActivityInfoModel()
                {
                    ActivityEndTime = x.ActivityEndTime,
                    ActivityStartTime = x.ActivityStartTime,
                    ActivityTime = x.ActivityTime,
                    BreakTime = x.BreakTime,
                    ProfileId = x.ProfileId,
                    Id = x.Id,
                    ProspectingActivities = x.ProspectingActivities.ToList(),
                    GoalName = x.ProspectingGoalInfo.Name,
                    ProspectingGoalId = x.ProspectingGoalId,
                    TotalActivities = x.TotalActivities,
                    UserId = x.UserId,
                    ProspectingGoalInfo = x.ProspectingGoalInfo,
                    ActivityCalculationType = x.ActivityCalculationType,
                    Frequency = x.Frequency
                }).ToList();

            foreach (ProspectingGoalActivityInfoModel prospectingGoalActivityInfoModel in result)
            {
                List<int> prospectingActivityIds = prospectingGoalActivityInfoModel.ProspectingActivities.Select(x => x.Id).ToList();
                prospectingGoalActivityInfoModel.ProspectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => prospectingActivityIds.Contains(x.Id)).ToList();
            }
            return result;
        }
        public List<ProspectingGoalActivityInfoModel> GetServiceProspectingGoalActivityInfoesByUserId(int userId)
        {
            List<ProspectingGoalActivityInfoModel> result = new List<ProspectingGoalActivityInfoModel>();

            List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            result = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingGoalInfo")
                .Include("ProspectingGoalInfo.Profile").Include("ProspectingActivities")
                .Where(x => prospectingGoalIds.Contains(x.ProspectingGoalInfo.Id))
                .Select(x => new ProspectingGoalActivityInfoModel()
                {
                    ActivityEndTime = x.ActivityEndTime,
                    ActivityStartTime = x.ActivityStartTime,
                    ActivityTime = x.ActivityTime,
                    BreakTime = x.BreakTime,
                    ProfileId = x.ProfileId,
                    Id = x.Id,
                    ProspectingActivities = x.ProspectingActivities.ToList(),
                    GoalName = x.ProspectingGoalInfo.Name,
                    ProspectingGoalId = x.ProspectingGoalId,
                    TotalActivities = x.TotalActivities,
                    UserId = x.UserId,
                    ProspectingGoalInfo = x.ProspectingGoalInfo,
                    ActivityCalculationType = x.ActivityCalculationType,
                    Frequency = x.Frequency
                }).ToList();

            foreach (ProspectingGoalActivityInfoModel prospectingGoalActivityInfoModel in result)
            {
                List<int> prospectingActivityIds = prospectingGoalActivityInfoModel.ProspectingActivities.Select(x => x.Id).ToList();
                prospectingGoalActivityInfoModel.ProspectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => prospectingActivityIds.Contains(x.Id)).ToList();
            }
            return result;
        }

        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserIds(List<int> userIds)
        {
            List<ProspectingGoalActivityInfoModel> result = new List<ProspectingGoalActivityInfoModel>();

            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

                List<ProspectingGoalActivityInfoModel> prospectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingGoalInfo")
                    .Include("ProspectingGoalInfo.Profile").Include("ProspectingActivities")
                    .Where(x => prospectingGoalIds.Contains(x.ProspectingGoalInfo.Id))
                    .Select(x => new ProspectingGoalActivityInfoModel()
                    {
                        ActivityEndTime = x.ActivityEndTime,
                        ActivityStartTime = x.ActivityStartTime,
                        ActivityTime = x.ActivityTime,
                        BreakTime = x.BreakTime,
                        ProfileId = x.ProfileId,
                        Id = x.Id,
                        ProspectingActivities = x.ProspectingActivities.ToList(),
                        GoalName = x.ProspectingGoalInfo.Name,
                        ProspectingGoalId = x.ProspectingGoalId,
                        TotalActivities = x.TotalActivities,
                        UserId = x.UserId,
                        ProspectingGoalInfo = x.ProspectingGoalInfo,
                        ActivityCalculationType = x.ActivityCalculationType,
                        Frequency = x.Frequency

                    }).ToList();
                foreach (ProspectingGoalActivityInfoModel prospectingGoalActivityInfoModel in result)
                {
                    List<int> prospectingActivityIds = prospectingGoalActivityInfoModel.ProspectingActivities.Select(x => x.Id).ToList();
                    prospectingGoalActivityInfoModel.ProspectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => prospectingActivityIds.Contains(x.Id)).ToList();
                }
                result.AddRange(prospectingGoalActivityInfoes);
            }

            return result;
        }
        public List<ProspectingGoalActivityInfoModel> GetServiceProspectingGoalActivityInfoesByUserIds(List<int> userIds)
        {
            List<ProspectingGoalActivityInfoModel> result = new List<ProspectingGoalActivityInfoModel>();

            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

                List<ProspectingGoalActivityInfoModel> prospectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Include("ProspectingGoalInfo")
                    .Include("ProspectingGoalInfo.Profile").Include("ProspectingActivities")
                    .Where(x => prospectingGoalIds.Contains(x.ProspectingGoalInfo.Id))
                    .Select(x => new ProspectingGoalActivityInfoModel()
                    {
                        ActivityEndTime = x.ActivityEndTime,
                        ActivityStartTime = x.ActivityStartTime,
                        ActivityTime = x.ActivityTime,
                        BreakTime = x.BreakTime,
                        ProfileId = x.ProfileId,
                        Id = x.Id,
                        ProspectingActivities = x.ProspectingActivities.ToList(),
                        GoalName = x.ProspectingGoalInfo.Name,
                        ProspectingGoalId = x.ProspectingGoalId,
                        TotalActivities = x.TotalActivities,
                        UserId = x.UserId,
                        ProspectingGoalInfo = x.ProspectingGoalInfo,
                        ActivityCalculationType = x.ActivityCalculationType,
                        Frequency = x.Frequency

                    }).ToList();
                foreach (ProspectingGoalActivityInfoModel prospectingGoalActivityInfoModel in result)
                {
                    List<int> prospectingActivityIds = prospectingGoalActivityInfoModel.ProspectingActivities.Select(x => x.Id).ToList();
                    prospectingGoalActivityInfoModel.ProspectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => prospectingActivityIds.Contains(x.Id)).ToList();
                }
                result.AddRange(prospectingGoalActivityInfoes);
            }

            return result;
        }

        public List<ProspectingCustomerResult> getCustomerActivityResult(int activityId, int customerId)
        {
            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            if (customerId > 0)
            {
                result = _ipsDataContext.ProspectingCustomerResults
                    .Include("ProspectingCustomer")
                    .Where(x => x.ProspectingCustomerId == customerId && x.ProspectingActivityId == activityId)
                    .GroupBy(x => x.SkillId).Select(g => g.OrderByDescending(item => item.CreatedOn).FirstOrDefault())
                    .ToList();

                foreach (ProspectingCustomerResult customerRsult in result)
                {
                    customerRsult.Skill = _ipsDataContext.Skills.Where(x => x.Id == customerRsult.SkillId).FirstOrDefault();
                    customerRsult.ProspectingCustomerSalesAgreedDatas = _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Where(x => x.ProspectingCustomerResultId == customerRsult.Id).ToList();
                    customerRsult.ProspectingSchedules = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == customerRsult.Id).OrderByDescending(x => x.CreatedOn).ToList();
                }
            }
            return result;
        }

        public List<ProspectingCustomerSalesAgreedData> GetCustomerSalesAgreedDatas(int activityId, int customerId)
        {
            List<ProspectingCustomerSalesAgreedData> result = new List<ProspectingCustomerSalesAgreedData>();
            result = _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Where(x => x.ProspectingActivityId == activityId && x.ProspectingCustomerId == customerId).ToList();
            return result;
        }

        public ProspectingCustomerResult saveCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult)
        {
            ProspectingCustomerResult result = new ProspectingCustomerResult();
            if (prospectingCustomerResult.Id > 0)
            {
                ProspectingCustomerResult original = _ipsDataContext.ProspectingCustomerResults.Where(x => x.Id == prospectingCustomerResult.Id).FirstOrDefault();
                if (original != null)
                {
                    prospectingCustomerResult.CreatedBy = original.CreatedBy;
                    prospectingCustomerResult.CreatedOn = original.CreatedOn;
                    prospectingCustomerResult.ModifiedBy = _authService.GetCurrentUserId();
                    prospectingCustomerResult.ModifiedOn = DateTime.Now;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingCustomerResult);
                    _ipsDataContext.SaveChanges();

                    original.ProspectingSchedules = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingActivityId == prospectingCustomerResult.ProspectingActivityId && x.ProspectingCustomerId == prospectingCustomerResult.ProspectingCustomerId).ToList();
                    if (original.ProspectingSchedules.Count() > 0)
                    {
                        foreach (ProspectingSchedule schedule in original.ProspectingSchedules)
                        {
                            if (schedule != null)
                            {
                                if (prospectingCustomerResult.ProspectingSchedules.Count() > 0)
                                {
                                    ProspectingSchedule updatedSchedule = prospectingCustomerResult.ProspectingSchedules.FirstOrDefault();
                                    ProspectingSchedule newSchedule = schedule;
                                    newSchedule.Agenda = updatedSchedule.Agenda;
                                    newSchedule.ScheduleDate = updatedSchedule.ScheduleDate;
                                    newSchedule.ModiffiedBy = _authService.GetCurrentUserId();
                                    newSchedule.ModifiedOn = DateTime.Now;
                                    _ipsDataContext.Entry(schedule).CurrentValues.SetValues(newSchedule);
                                    _ipsDataContext.SaveChanges();
                                    if (schedule.TaskId.HasValue)
                                    {
                                        Task originalTask = _ipsDataContext.Tasks.Where(x => x.Id == schedule.TaskId).FirstOrDefault();
                                        if (!originalTask.IsCompleted)
                                        {
                                            Task newTask = originalTask;
                                            newTask.StartDate = updatedSchedule.ScheduleDate;
                                            newTask.DueDate = updatedSchedule.ScheduleDate.AddHours(1);
                                            newTask.Description = updatedSchedule.Agenda;
                                            _ipsDataContext.Entry(originalTask).CurrentValues.SetValues(newTask);
                                            _ipsDataContext.SaveChanges();
                                        }
                                    }
                                }
                            }
                        }
                    }
                    else
                    {
                        foreach (ProspectingSchedule schedule in prospectingCustomerResult.ProspectingSchedules)
                        {
                            if (schedule != null)
                            {
                                schedule.CreatedBy = _authService.GetCurrentUserId();
                                schedule.CreatedOn = DateTime.Now;
                                Task task = AddNewTask(prospectingCustomerResult.ProspectingCustomerId, schedule);
                                if (task.Id > 0)
                                {
                                    schedule.TaskId = task.Id;
                                }
                            }
                        }
                    }

                    if (prospectingCustomerResult.IsSales)
                    {
                        original.ProspectingCustomerSalesAgreedDatas = _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Where(x => x.ProspectingActivityId == prospectingCustomerResult.ProspectingActivityId && x.ProspectingCustomerId == prospectingCustomerResult.ProspectingCustomerId).ToList();
                        List<ProspectingCustomerSalesAgreedData> originalSalesAgreedDatas = original.ProspectingCustomerSalesAgreedDatas.ToList();
                        if (original.ProspectingCustomerSalesAgreedDatas.Count() > 0)
                        {
                            _ipsDataContext.ProspectingCustomerSalesAgreedDatas.RemoveRange(original.ProspectingCustomerSalesAgreedDatas);
                            foreach (ProspectingCustomerSalesAgreedData prospectingCustomerSalesAgreedData in prospectingCustomerResult.ProspectingCustomerSalesAgreedDatas)
                            {
                                if (prospectingCustomerSalesAgreedData != null)
                                {
                                    if (prospectingCustomerResult.ProspectingSchedules.Count() > 0)
                                    {
                                        ProspectingCustomerSalesAgreedData newProspectingCustomerSalesAgreedData = prospectingCustomerSalesAgreedData;
                                        newProspectingCustomerSalesAgreedData.ModifiedOn = DateTime.Now;
                                        newProspectingCustomerSalesAgreedData.ModifiedBy = _authService.GetCurrentUserId();
                                        newProspectingCustomerSalesAgreedData.ProspectingCustomerResultId = prospectingCustomerResult.Id;
                                        if (originalSalesAgreedDatas.Any(x => x.Id == newProspectingCustomerSalesAgreedData.Id))
                                        {
                                            var originalSalesAgreedData = originalSalesAgreedDatas.Where(x => x.Id == newProspectingCustomerSalesAgreedData.Id).FirstOrDefault();
                                            if (originalSalesAgreedData != null)
                                            {
                                                newProspectingCustomerSalesAgreedData.CreatedOn = originalSalesAgreedData.CreatedOn;
                                                newProspectingCustomerSalesAgreedData.CreatedBy = originalSalesAgreedData.CreatedBy;
                                                newProspectingCustomerSalesAgreedData.Id = 0;
                                            }
                                        }
                                        else
                                        {
                                            newProspectingCustomerSalesAgreedData.CreatedOn = DateTime.Now;
                                            newProspectingCustomerSalesAgreedData.CreatedBy = _authService.GetCurrentUserId();
                                            newProspectingCustomerSalesAgreedData.Id = 0;
                                        }
                                        _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Add(newProspectingCustomerSalesAgreedData);
                                        _ipsDataContext.SaveChanges();

                                    }

                                }
                            }
                        }
                        else
                        {
                            foreach (ProspectingCustomerSalesAgreedData prospectingCustomerSalesAgreedData in prospectingCustomerResult.ProspectingCustomerSalesAgreedDatas)
                            {
                                if (prospectingCustomerSalesAgreedData != null)
                                {
                                    if (prospectingCustomerResult.ProspectingSchedules.Count() > 0)
                                    {

                                        ProspectingCustomerSalesAgreedData newProspectingCustomerSalesAgreedData = prospectingCustomerSalesAgreedData;

                                        newProspectingCustomerSalesAgreedData.CreatedOn = DateTime.Now;
                                        newProspectingCustomerSalesAgreedData.CreatedBy = _authService.GetCurrentUserId();
                                        newProspectingCustomerSalesAgreedData.Id = 0;
                                        _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Add(newProspectingCustomerSalesAgreedData);
                                        _ipsDataContext.SaveChanges();

                                    }

                                }
                            }
                        }
                    }

                    result = _ipsDataContext.ProspectingCustomerResults
                    .Include("ProspectingActivity")
                    .Include("ProspectingActivity.ProspectingGoalActivityInfo")
                    .Include("ProspectingCustomer").Where(x => x.Id == prospectingCustomerResult.Id)
                    .FirstOrDefault();
                }
            }
            else
            {

                List<ProspectingCustomerResult> oldProspectingCustomerResults = getCustomerActivityResult(prospectingCustomerResult.ProspectingActivityId, prospectingCustomerResult.ProspectingCustomerId);
                List<int> closedCustomerResult = oldProspectingCustomerResults.Where(x => x.IsMeeting == true || x.IsNoMeeting == true || x.IsSales == true).Select(x => x.ProspectingCustomerId).ToList();
                List<ProspectingCustomerResult> followUpResult = oldProspectingCustomerResults.Where(x => x.IsFollowUp == true).ToList();
                if (!followUpResult.Any(x => closedCustomerResult.IndexOf(x.ProspectingCustomerId) > 0))
                {
                    ProspectingCustomerResult lastFollowUpResult = followUpResult.OrderByDescending(x => x.CreatedOn).FirstOrDefault();
                    if (lastFollowUpResult != null)
                    {
                        ProspectingSchedule lastFollowUpSchedule = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == lastFollowUpResult.Id).FirstOrDefault();
                        if (lastFollowUpSchedule != null)
                        {
                            if (lastFollowUpSchedule.TaskId.HasValue)
                            {
                                TaskService taskService = new TaskService();
                                taskService.IsCompleted(lastFollowUpSchedule.TaskId.Value, true);
                            }
                        }
                    }
                }
                prospectingCustomerResult.CreatedBy = _authService.GetCurrentUserId();
                prospectingCustomerResult.CreatedOn = DateTime.Now;
                foreach (ProspectingSchedule schedule in prospectingCustomerResult.ProspectingSchedules)
                {
                    if (schedule != null)
                    {
                        schedule.CreatedBy = _authService.GetCurrentUserId();
                        schedule.CreatedOn = DateTime.Now;
                        Task task = AddNewTask(prospectingCustomerResult.ProspectingCustomerId, schedule);
                        if (task.Id > 0)
                        {
                            schedule.TaskId = task.Id;
                        }
                    }
                }
                if (prospectingCustomerResult.IsSales)
                {
                    foreach (ProspectingCustomerSalesAgreedData salesAgreeddata in prospectingCustomerResult.ProspectingCustomerSalesAgreedDatas)
                    {
                        salesAgreeddata.CreatedOn = DateTime.Now;
                        salesAgreeddata.CreatedBy = _authService.GetCurrentUserId();
                        salesAgreeddata.Id = 0;
                    }
                }
                _ipsDataContext.ProspectingCustomerResults.Add(prospectingCustomerResult);
                _ipsDataContext.SaveChanges();
                if (prospectingCustomerResult.IsSales)
                {
                    NotificationService _notificationService = new NotificationService();
                    _notificationService.SendSalesAgreedItemsEmailNotification(prospectingCustomerResult);
                }


                result = _ipsDataContext.ProspectingCustomerResults
              .Include("ProspectingActivity")
              .Include("ProspectingActivity.ProspectingGoalActivityInfo")
              .Include("ProspectingCustomer").Where(x => x.Id == prospectingCustomerResult.Id)
              .FirstOrDefault();
            }
            return result;
        }


        public List<int> uncheckCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult)
        {

            List<int> removedResultIds = new List<int>();
            ProspectingCustomer prospectingCustomer = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == prospectingCustomerResult.ProspectingCustomerId).FirstOrDefault();
            if (prospectingCustomer != null)
            {
                SkillsService _skillService = new SkillsService();
                ProspectingGoalInfo prospectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingCustomer.ProspectingGoalId).FirstOrDefault();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoalInfo != null)
                {
                    if (prospectingGoalInfo.ProfileId.HasValue)
                    {
                        skills = _skillService.getSkillsByProfileId(prospectingGoalInfo.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                    }
                    else
                    {
                        skills = _skillService.getSkillsByProspectingGoalId(prospectingGoalInfo.Id).OrderBy(x => x.SeqNo).ToList();
                    }
                }
                int currentSKillSeqNo = 0;
                foreach (IpsSkillDDL ipsSkill in skills)
                {
                    if (ipsSkill.Id == prospectingCustomerResult.SkillId)
                    {
                        currentSKillSeqNo = ipsSkill.SeqNo != null ? ipsSkill.SeqNo.Value : 0;
                        List<ProspectingSchedule> schedules = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == prospectingCustomerResult.Id).ToList();
                        List<int> taskIds = schedules.Select(x => x.TaskId.HasValue ? x.TaskId.Value : 0).ToList();
                        if (taskIds.Count() > 0)
                        {
                            List<Task> tasks = _ipsDataContext.Tasks.Where(x => taskIds.Contains(x.Id)).ToList();
                            _ipsDataContext.Tasks.RemoveRange(tasks);
                        }
                        if (schedules.Count() > 0)
                        {
                            _ipsDataContext.ProspectingSchedules.RemoveRange(schedules);
                        }
                        List<ProspectingCustomerSalesAgreedData> salesAgreedDatas = _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Where(x => x.ProspectingCustomerResultId == prospectingCustomerResult.Id).ToList();
                        if (salesAgreedDatas.Count() > 0)
                        {
                            _ipsDataContext.ProspectingCustomerSalesAgreedDatas.RemoveRange(salesAgreedDatas);
                        }
                        ProspectingCustomerResult prospectingCustomerResultForRemove = _ipsDataContext.ProspectingCustomerResults.Where(x => x.Id == prospectingCustomerResult.Id).FirstOrDefault();
                        if (prospectingCustomerResultForRemove != null)
                        {
                            _ipsDataContext.ProspectingCustomerResults.Remove(prospectingCustomerResultForRemove);
                            _ipsDataContext.SaveChanges();
                            removedResultIds.Add(prospectingCustomerResult.Id);
                        }
                    }
                    if (currentSKillSeqNo != 0)
                    {
                        if (ipsSkill.SeqNo > currentSKillSeqNo)
                        {
                            ProspectingCustomerResult newProspectingCustomerResult = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == ipsSkill.Id && x.ProspectingCustomerId == prospectingCustomer.Id).FirstOrDefault();
                            if (newProspectingCustomerResult != null)
                            {
                                currentSKillSeqNo = ipsSkill.SeqNo != null ? ipsSkill.SeqNo.Value : 0;
                                List<ProspectingSchedule> schedules = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == newProspectingCustomerResult.Id).ToList();
                                List<int> taskIds = schedules.Select(x => x.TaskId.HasValue ? x.TaskId.Value : 0).ToList();
                                if (taskIds.Count() > 0)
                                {
                                    List<Task> tasks = _ipsDataContext.Tasks.Where(x => taskIds.Contains(x.Id)).ToList();
                                    _ipsDataContext.Tasks.RemoveRange(tasks);
                                }
                                if (schedules.Count() > 0)
                                {
                                    _ipsDataContext.ProspectingSchedules.RemoveRange(schedules);
                                }

                                List<ProspectingCustomerSalesAgreedData> salesAgreedDatas = _ipsDataContext.ProspectingCustomerSalesAgreedDatas.Where(x => x.ProspectingCustomerResultId == newProspectingCustomerResult.Id).ToList();
                                if (salesAgreedDatas.Count() > 0)
                                {
                                    _ipsDataContext.ProspectingCustomerSalesAgreedDatas.RemoveRange(salesAgreedDatas);
                                }

                                _ipsDataContext.ProspectingCustomerResults.Remove(newProspectingCustomerResult);
                                _ipsDataContext.SaveChanges();
                                removedResultIds.Add(newProspectingCustomerResult.Id);
                            }
                        }
                    }
                }
            }
            return removedResultIds;
        }

        public ProspectingActivity updateProspectingActivity(ProspectingActivity prospectingActivity)
        {
            if (prospectingActivity.Id > 0)
            {
                ProspectingActivity original = _ipsDataContext.ProspectingActivities.Where(x => x.Id == prospectingActivity.Id).FirstOrDefault();
                if (original != null)
                {
                    prospectingActivity.ModifiedBy = _authService.GetCurrentUserId();
                    prospectingActivity.ModifiedOn = DateTime.Now;
                    if (prospectingActivity.StartTime != null)
                    {
                        prospectingActivity.CreatedBy = original.CreatedBy;
                        prospectingActivity.CreatedOn = original.CreatedOn;
                        prospectingActivity.ProspectingGoalActivityId = original.ProspectingGoalActivityId;
                        _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingActivity);
                        _ipsDataContext.SaveChanges();
                    }
                    else
                    {
                        _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingActivity);
                        _ipsDataContext.SaveChanges();
                    }
                }
            }
            return prospectingActivity;
        }
        public ProspectingActivity saveProspectingActivity(ProspectingActivity prospectingActivity)
        {
            if (prospectingActivity.ProspectingGoalActivityId > 0)
            {
                prospectingActivity.CreatedBy = _authService.GetCurrentUserId();
                prospectingActivity.CreatedOn = DateTime.Now;
                _ipsDataContext.ProspectingActivities.Add(prospectingActivity);
                _ipsDataContext.SaveChanges();
            }
            return prospectingActivity;
        }

        public bool restartProspectingActivity(int prospectingActivityId)
        {
            bool result = false;

            if (prospectingActivityId > 0)
            {
                ProspectingActivity original = _ipsDataContext.ProspectingActivities.Where(x => x.Id == prospectingActivityId).FirstOrDefault();
                if (original.StopTime != null)
                {
                    ProspectingActivity prospectingActivity = original;
                    prospectingActivity.StopTime = null;
                    prospectingActivity.ModifiedBy = _authService.GetCurrentUserId();
                    prospectingActivity.ModifiedOn = DateTime.Now;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingActivity);
                    int resultCount = _ipsDataContext.SaveChanges();
                    if (resultCount > 0)
                    {
                        result = true;
                    }
                }
            }
            return result;
        }

        //public bool deleteProspectingActivity(int prospectingActivityId)
        //{
        //    bool result = false;

        //    if (prospectingActivityId > 0)
        //    {
        //        ProspectingActivity original = _ipsDataContext.ProspectingActivities.Include("ProspectingCustomerResults").Where(x => x.Id == prospectingActivityId).FirstOrDefault();
        //        if (original != null)
        //        {
        //            if (!(original.ProspectingCustomerResults.Count() > 0))
        //            {
        //                _ipsDataContext.ProspectingActivities.Remove(original);
        //                int resultCount = _ipsDataContext.SaveChanges();
        //                if (resultCount > 0)
        //                {
        //                    result = true;
        //                }
        //            }
        //        }
        //    }
        //    return result;
        //}

        public ProspectingActivityLog saveActivityLog(ProspectingActivityLog prospectingActivityLog)
        {
            if (!(prospectingActivityLog.Id > 0))
            {
                prospectingActivityLog.CreatedBy = _authService.GetCurrentUserId();
                prospectingActivityLog.CreatedOn = DateTime.Now;
                _ipsDataContext.ProspectingActivityLogs.Add(prospectingActivityLog);
                _ipsDataContext.SaveChanges();
            }
            return prospectingActivityLog;
        }

        public List<ProspectingCustomerResult> getProspectingCustomerResults()
        {

            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoals();
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            int userId = _authService.GetCurrentUserId();
            result = _ipsDataContext.ProspectingCustomerResults
                .Include("ProspectingActivity")
                .Include("ProspectingActivity.ProspectingGoalActivityInfo")
                .Include("ProspectingCustomer").Where(x => prospectingGoalIds.Contains(x.ProspectingCustomer.ProspectingGoalId.Value))
                .ToList();
            return result;
        }

        public List<ProspectingCustomerResult> getProspectingCustomerResultsByUserId(int userId)
        {

            List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            result = _ipsDataContext.ProspectingCustomerResults
                .Include("ProspectingActivity")
                //.Include("ProspectingActivity.ProspectingGoalActivityInfo")
                .Include("ProspectingCustomer").Where(x => prospectingGoalIds.Contains(x.ProspectingCustomer.ProspectingGoalId.Value))
                .ToList();
            return result;
        }

        public List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserId(int userId)
        {
            List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
            List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();

            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            result = _ipsDataContext.ProspectingCustomerResults
                .Include("ProspectingActivity")
                //.Include("ProspectingActivity.ProspectingGoalActivityInfo")
                .Include("ProspectingCustomer").Where(x => prospectingGoalIds.Contains(x.ProspectingCustomer.ProspectingGoalId.Value) && x.ProspectingType == (int)ProspectingTypeEnum.Service)
                .ToList();
            return result;
        }

        public List<ProspectingCustomerResult> getProspectingCustomerResultsByUserIds(List<int> userIds)
        {
            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
                List<ProspectingCustomerResult> prospectingCustomerResults = _ipsDataContext.ProspectingCustomerResults
                    .Include("ProspectingActivity")
                    .Include("ProspectingCustomer").Where(x => prospectingGoalIds.Contains(x.ProspectingCustomer.ProspectingGoalId.Value))
                    .ToList();
                result.AddRange(prospectingCustomerResults);
            }
            return result;
        }
        public List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserIds(List<int> userIds)
        {
            List<ProspectingCustomerResult> result = new List<ProspectingCustomerResult>();
            foreach (int userId in userIds)
            {
                List<ProspectingGoalInfoModel> prospectingGoals = GetServiceProspectingGoalsByUserId(userId);
                List<int> prospectingGoalIds = prospectingGoals.Select(x => x.Id).ToList();
                List<ProspectingCustomerResult> prospectingCustomerResults = _ipsDataContext.ProspectingCustomerResults
                    .Include("ProspectingActivity")
                    //.Include("ProspectingActivity.ProspectingGoalActivityInfo")
                    .Include("ProspectingCustomer").Where(x => prospectingGoalIds.Contains(x.ProspectingCustomer.ProspectingGoalId.Value) && x.ProspectingType == (int)ProspectingTypeEnum.Service)
                    .ToList();
                result.AddRange(prospectingCustomerResults);
            }
            return result;
        }

        private Task AddNewTask(int customerId, ProspectingSchedule schedule)
        {
            Data.Task newTask = new Data.Task();
            ProspectingCustomer prospectingCustomer = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == customerId).FirstOrDefault();

            ProspectingGoalInfo prospectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingCustomer.ProspectingGoalId).FirstOrDefault();
            int userId = 0;
            if (prospectingGoalInfo != null)
            {
                if (prospectingGoalInfo.UserId != null)
                {
                    userId = prospectingGoalInfo.UserId.Value;
                }
                else if (prospectingGoalInfo.ParticipantId != null)
                {
                    EvaluationParticipant evaluationParticipant = new EvaluationParticipant();
                    // get user id by participant id
                    EvaluationParticipantsService evaluationParticipantsService = new EvaluationParticipantsService();
                    evaluationParticipant = evaluationParticipantsService.GetEvaluationParticipantsById(prospectingGoalInfo.ParticipantId.Value).FirstOrDefault();
                    userId = evaluationParticipant.UserId;
                }
            }

            // get user id by participant id

            newTask.AssignedToId = userId;
            // check for categort List 
            TaskCategoryListsService TaskCategoryListsService = new TaskCategoryListsService();

            TaskCategoryList taskCategoryList = TaskCategoryListsService.GetUserlist(userId).FirstOrDefault();
            if (taskCategoryList != null)
            {
                TaskCategoryListItem taskCategoryListItem = new TaskCategoryListItem();
                if (schedule.IsMeeting)
                {
                    taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("meeting") == true).FirstOrDefault();
                    if (taskCategoryListItem == null)
                    {
                        taskCategoryListItem = new TaskCategoryListItem();
                        taskCategoryListItem.Name = "Meeting";
                        taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                        taskCategoryListItem.Color = "#c3c3c3";
                        taskCategoryListItem.Description = "Meeting Schedule";
                        taskCategoryListItem.TextColor = "#ffffff";
                        TaskCategoryListItemsService TaskCategoryListItemsService = new TaskCategoryListItemsService();
                        taskCategoryListItem = TaskCategoryListItemsService.Add(taskCategoryListItem);
                    }
                }
                else if (schedule.IsServiceAgreed)
                {
                    taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("service Appointment") == true).FirstOrDefault();
                    if (taskCategoryListItem == null)
                    {
                        taskCategoryListItem = new TaskCategoryListItem();
                        taskCategoryListItem.Name = "Service Appointment";
                        taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                        taskCategoryListItem.Color = "#c3c3c3";
                        taskCategoryListItem.Description = "Service Appointment";
                        taskCategoryListItem.TextColor = "#ffffff";
                        TaskCategoryListItemsService TaskCategoryListItemsService = new TaskCategoryListItemsService();
                        taskCategoryListItem = TaskCategoryListItemsService.Add(taskCategoryListItem);
                    }
                }
                else if (schedule.IsFollowUp)
                {
                    taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("follow-up") == true).FirstOrDefault();
                    if (taskCategoryListItem == null)
                    {
                        taskCategoryListItem = new TaskCategoryListItem();
                        taskCategoryListItem.Name = "Follow-Up";
                        taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                        taskCategoryListItem.Color = "#c3c3c3";
                        taskCategoryListItem.Description = "Follow-Up Schedule";
                        taskCategoryListItem.TextColor = "#ffffff";
                        TaskCategoryListItemsService TaskCategoryListItemsService = new TaskCategoryListItemsService();
                        taskCategoryListItem = TaskCategoryListItemsService.Add(taskCategoryListItem);
                    }
                }
                newTask.CategoryId = taskCategoryListItem.Id;
            }

            AuthService authService = new AuthService();
            IpsUser user = authService.getCurrentUser();
            newTask.CreatedById = authService.GetCurrentUserId();
            newTask.CreatedByName = user.FirstName + " " + user.LastName;
            newTask.CreatedDate = DateTime.Now;
            newTask.Description = schedule.Agenda;
            //Get and Set Profile based on evaluationAgreement

            newTask.ProfileId = null;

            // Get And set Priority 
            TaskPriorityListsService taskPriorityListsService = new TaskPriorityListsService();
            TaskPriorityList taskPriorityList = taskPriorityListsService.GetUserlist(userId).FirstOrDefault();

            TaskPriorityListItem taskPriorityListItem = taskPriorityList.TaskPriorityListItems.Where(x => x.Name.Contains("High")).FirstOrDefault();
            if (taskPriorityListItem != null)
            {
                newTask.PriorityId = taskPriorityListItem.Id;
            }
            TaskList taskList = _ipsDataContext.TaskLists.Where(x => x.UserId == userId).FirstOrDefault();
            newTask.TaskListId = taskList.Id;
            TaskStatusListItem statusListItem = _ipsDataContext.TaskStatusListItems.Where(x => x.TaskStatusListId == taskList.TaskStatusListId && x.Name.Contains("Not Started")).FirstOrDefault();
            if (statusListItem != null)
            {
                newTask.StatusId = statusListItem.Id;
            }
            newTask.TimeEstimateMinutes = 10;
            newTask.StartDate = schedule.ScheduleDate;
            if (schedule.IsFollowUp)
            {
                newTask.DueDate = schedule.ScheduleDate.AddMinutes(15);
            }
            else if (schedule.IsMeeting || schedule.IsServiceAgreed)
            {
                newTask.DueDate = schedule.ScheduleDate.AddHours(1);
            }
            else
            {
                newTask.DueDate = schedule.ScheduleDate.AddMinutes(30);
            }
            newTask.IsEmailNotification = true;
            string currentCulture = GetCurrentCulture().ToLower();
            NotificationTemplate defaultTaskNotification = getDefaultTaskReminderNotifactionTemplate();
            if (defaultTaskNotification != null)
            {
                newTask.EmailBefore = -15;
                newTask.NotificationTemplateId = defaultTaskNotification.Id;
            }
            string title = string.Empty;
            if (schedule.IsMeeting)
            {
                title = "Meeting with " + prospectingCustomer.Name;
            }
            else if (schedule.IsFollowUp)
            {
                title = "Follow Up of " + prospectingCustomer.Name;
            }
            else if (schedule.IsServiceAgreed)
            {
                title = "Service Appointment of " + prospectingCustomer.Name;
            }

            newTask.Title = title;
            _ipsDataContext.Tasks.Add(newTask);
            _ipsDataContext.SaveChanges();

            if (newTask.Id > 0)
            {
                NotificationService _notificationService = new NotificationService();
                if (schedule.IsMeeting || schedule.IsServiceAgreed)
                {
                    _notificationService.SendMeetingTaskCreatedEmailNotification(newTask.Id, prospectingCustomer.Id, schedule.Notification);
                }
                else if (schedule.IsFollowUp)
                {
                    _notificationService.SendFollowupTaskCreatedEmailNotification(newTask.Id, prospectingCustomer.Id, schedule.Notification);
                }
            }
            return newTask;
        }

        private NotificationTemplate getDefaultTaskReminderNotifactionTemplate()
        {
            NotificationTemplate defaultTaskNotification = null;
            string currentCulture = "nb-no";
            int organizationId = _authService.GetCurrentUserOrgId();

            defaultTaskNotification = _ipsDataContext.NotificationTemplates.Include("Culture")
                .Where(x => x.IsDefualt == true
                && x.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks
                && x.StageTypeId == (int)NotificationTemplateStageTypeEnum.TaskReminder
                && x.EvaluationRoleId == null
                && x.Culture.CultureName.ToLower() == currentCulture
                && x.OrganizationId == organizationId).FirstOrDefault();

            if (defaultTaskNotification == null)
            {
                defaultTaskNotification = _ipsDataContext.NotificationTemplates.Include("Culture")
                .Where(x => x.IsDefualt == true
                && x.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks
                && x.StageTypeId == (int)NotificationTemplateStageTypeEnum.TaskReminder
                && x.EvaluationRoleId == null
                && x.Culture.CultureName.ToLower() == "en-us"
                && x.OrganizationId == organizationId).FirstOrDefault();
            }
            if (defaultTaskNotification == null)
            {
                defaultTaskNotification = _ipsDataContext.NotificationTemplates.Include("Culture")
                .Where(x => x.IsDefualt == true
                && x.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks
                && x.StageTypeId == (int)NotificationTemplateStageTypeEnum.TaskReminder
                && x.EvaluationRoleId == null
                && x.Culture.CultureName.ToLower() == currentCulture
                && x.OrganizationId == null).FirstOrDefault();
            }
            if (defaultTaskNotification == null)
            {
                defaultTaskNotification = _ipsDataContext.NotificationTemplates.Include("Culture")
                .Where(x => x.IsDefualt == true
                && x.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks
                && x.StageTypeId == (int)NotificationTemplateStageTypeEnum.TaskReminder
                && x.EvaluationRoleId == null
                  && x.Culture.CultureName.ToLower() == "en-us"
                && x.OrganizationId == null).FirstOrDefault();
            }

            return defaultTaskNotification;
        }

        public List<ProspectingGoalInfoModel> getTaskProspectingGoals(int? taskId)
        {
            List<ProspectingGoalInfoModel> taskProspectingGoals = new List<ProspectingGoalInfoModel>();

            if (taskId.HasValue)
            {
                taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Where(x => x.TaskId == taskId).Select(x => new ProspectingGoalInfoModel()
                {
                    Name = x.Name,
                    GoalStartDate = x.GoalStartDate,
                    GoalEndDate = x.GoalEndDate,
                    Id = x.Id,
                    UserId = x.UserId,
                    ProfileName = "",
                    ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                    TaskId = x.TaskId,
                    UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                }).ToList();
            }
            else
            {
                taskProspectingGoals = _ipsDataContext.ProspectingGoalInfoes.Include("User").Where(x => x.TaskId == null).Select(x => new ProspectingGoalInfoModel()
                {
                    Name = x.Name,
                    GoalStartDate = x.GoalStartDate,
                    GoalEndDate = x.GoalEndDate,
                    Id = x.Id,
                    UserId = x.UserId,
                    ProfileName = "",
                    ProspectingSkillGoals = x.ProspectingSkillGoals.ToList(),
                    TaskId = x.TaskId,
                    UserName = x.User != null ? x.User.FirstName + " " + x.User.LastName : "",
                }).ToList();
            }
            return taskProspectingGoals;
        }

        public List<ProspectingActivity> getTaskProspectingActivities(int goalId)
        {
            List<ProspectingActivity> result = new List<ProspectingActivity>();
            result = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo")
               .Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == goalId)
               .ToList();
            return result;
        }

        public List<ProspectingGoalScaleRanx> getProspectingScaleRangesByGoalId(int goalId)
        {
            List<ProspectingGoalScaleRanx> result = new List<ProspectingGoalScaleRanx>();
            ProspectingGoalInfo prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == goalId).FirstOrDefault();
            if (prospectingGoal != null)
            {
                if (prospectingGoal.ProspectingGoalScaleId.HasValue)
                {
                    result = _ipsDataContext.ProspectingGoalScaleRanges.Include("ProspectingGoalScale")
                   .Where(x => x.ProspectingGoalScale.Id == prospectingGoal.ProspectingGoalScaleId.Value)
                   .ToList();
                }

            }
            return result;
        }

        public ProspectingActivityFeedback saveProspectingActivityFeedback(ProspectingActivityFeedback prospectingActivityFeedback)
        {
            if (!(prospectingActivityFeedback.Id > 0))
            {
                if (prospectingActivityFeedback.ProspectingActivityId > 0)
                {

                    ProspectingActivity prospectingActivity = _ipsDataContext.ProspectingActivities.Where(x => x.Id == prospectingActivityFeedback.ProspectingActivityId).FirstOrDefault();
                    if (prospectingActivity != null)
                    {
                        prospectingActivityFeedback.ActvityStartTime = prospectingActivity.ActivityStart;
                        prospectingActivityFeedback.ActvityEndTime = prospectingActivity.ActivityEnd;
                        prospectingActivityFeedback.FeedbackDateTime = DateTime.Now;
                        _ipsDataContext.ProspectingActivityFeedbacks.Add(prospectingActivityFeedback);
                        _ipsDataContext.SaveChanges();
                    }
                }
            }
            else
            {
                ProspectingActivityFeedback original = _ipsDataContext.ProspectingActivityFeedbacks.Where(x => x.Id == prospectingActivityFeedback.Id).FirstOrDefault();
                if (original != null)
                {
                    ProspectingActivity prospectingActivity = _ipsDataContext.ProspectingActivities.Where(x => x.Id == prospectingActivityFeedback.ProspectingActivityId).FirstOrDefault();
                    if (prospectingActivity != null)
                    {
                        prospectingActivityFeedback.ActvityStartTime = prospectingActivity.ActivityStart;
                        prospectingActivityFeedback.ActvityEndTime = prospectingActivity.ActivityEnd;
                        prospectingActivityFeedback.FeedbackDateTime = DateTime.Now;
                    }
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingActivityFeedback);
                    _ipsDataContext.SaveChanges();
                }
            }
            return prospectingActivityFeedback;
        }

        public ProspectingActivityFeedback getProspectingActivityFeedbackByActivityId(int activityId)
        {
            ProspectingActivityFeedback ProspectingActivityFeedback = _ipsDataContext.ProspectingActivityFeedbacks.Where(x => x.ProspectingActivityId == activityId).FirstOrDefault();
            return ProspectingActivityFeedback;
        }

        public ExpiredProspectingActivityReason SaveActivityReason(ExpiredProspectingActivityReason expiredProspectingActivityReason)
        {
            if (!(expiredProspectingActivityReason.Id > 0))
            {
                expiredProspectingActivityReason.CreatedBy = _authService.GetCurrentUserId();
                expiredProspectingActivityReason.CreatedOn = DateTime.Now;
                _ipsDataContext.ExpiredProspectingActivityReasons.Add(expiredProspectingActivityReason);
                _ipsDataContext.SaveChanges();
            }
            return expiredProspectingActivityReason;
        }



    }
}

using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using IPS.BusinessModels.ProjectModel;

namespace IPS.Business
{
    public class PerformanceGroupsService : BaseService, IPerformanceGroupService
    {
        public IQueryable<PerformanceGroup> Get(int? profileTypeId = null)
        {
            List<int> idList = _authService.GetUserOrganizations();
            IQueryable<PerformanceGroup> query = _ipsDataContext.PerformanceGroups;

            if (profileTypeId.HasValue)
            {
                query =
                    query.Include(x => x.ProfileTypes).Where(x => x.ProfileTypes.Any(p => p.Id == profileTypeId.Value));
            }
            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                query =
                    query.Where(pg => pg.OrganizationId != null && idList.Contains((int)pg.OrganizationId))
                        .AsNoTracking()
                        .AsQueryable();
            }
            return query.AsNoTracking().AsQueryable();
        }

        public IQueryable<PerformanceGroup> GetById(int id)
        {
            return _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == id).AsQueryable();
        }

        public PerformanceGroup Add(PerformanceGroup performanceGroup)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    Add(_ipsDataContext, performanceGroup);
                    _ipsDataContext.SaveChanges();
                    dbContextTransaction.Commit();
                }
                catch
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
                return performanceGroup;
            }
        }

        public void Add(IPSData dataContext, PerformanceGroup performanceGroup)
        {
            if (performanceGroup.Scale != null)
            {
                performanceGroup.Scale.ProfileType1 = null;
                performanceGroup.Scale.ScaleCategory = null;
                performanceGroup.Scale.MeasureUnit = null;
                performanceGroup.Scale.Profiles = null;
                performanceGroup.Scale.Questions = null;
                performanceGroup.Scale.PerformanceGroups = null;
                performanceGroup.Scale.Profiles = null;

            }

            performanceGroup.StructureLevel = null;
            performanceGroup.Industry = null;
            performanceGroup.Organization = null;
            performanceGroup.PerformanceGroup1 = null;
            performanceGroup.PerformanceGroups1 = null;
            performanceGroup.Profile = null;

            performanceGroup.StructureLevel = null;

            List<ScorecardGoal> scorecardGoals = new List<ScorecardGoal>();
            foreach (ScorecardGoal scorecardGoal in performanceGroup.ScorecardGoals)
            {
                ScorecardGoal scorecardGoalDB = dataContext.ScorecardGoals.Where(sg => sg.Id == scorecardGoal.Id).FirstOrDefault();
                scorecardGoals.Add(scorecardGoalDB);
            }
            performanceGroup.ScorecardGoals = scorecardGoals;

            List<JobPosition> jobPositions = new List<JobPosition>();
            foreach (JobPosition jp in performanceGroup.JobPositions)
            {
                JobPosition jobPosition = dataContext.JobPositions.Where(j => j.Id == jp.Id).FirstOrDefault();
                jobPositions.Add(jobPosition);
            }
            performanceGroup.JobPositions = jobPositions;



            List<ProfileType> profileTypes = new List<ProfileType>();
            foreach (ProfileType pt in performanceGroup.ProfileTypes)
            {
                ProfileType profileType = dataContext.ProfileTypes.Where(p => p.Id == pt.Id).FirstOrDefault();
                profileTypes.Add(profileType);
            }
            performanceGroup.ProfileTypes = profileTypes;

            dataContext.PerformanceGroups.Add(performanceGroup);


        }

        public PerformanceGroup ClonePerformanceGroup(PerformanceGroup performanceGroup, string namePattern)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    string copyName = namePattern;
                    if (_ipsDataContext.PerformanceGroups.Where(pg => pg.Name == copyName).Count() > 0)
                    {
                        int i = 1;
                        while (true)
                        {
                            if (_ipsDataContext.PerformanceGroups.Where(pg => pg.Name == copyName + i.ToString()).Count() == 0)
                            {
                                copyName = copyName + i.ToString();
                                break;
                            }
                            i++;
                        }
                    }
                    var newPG = CreateCopy(_ipsDataContext, performanceGroup, copyName);
                    dbContextTransaction.Commit();
                    return newPG;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public PerformanceGroup CreateCopy(IPSData dataContext, PerformanceGroup performanceGroup, string copyName)
        {
            PerformanceGroup performanceGroupSource = dataContext.PerformanceGroups
                .Include("Link_PerformanceGroupSkills")
                .Include("PerformanceGroups1")
                .Include("ScorecardGoals")
                .Include("ProfileTypes")
                .Include("JobPositions")
                .FirstOrDefault(pg => pg.Id == performanceGroup.Id);

            PerformanceGroup newPerformanceGroup = new PerformanceGroup
            {
                Name = copyName,
                Description = performanceGroupSource.Description,
                OrganizationId = performanceGroup.OrganizationId,
                IsTemplate = false,
                ParentId = performanceGroupSource.ParentId,
                LevelId = performanceGroupSource.LevelId,
                IndustryId = performanceGroupSource.IndustryId,
                ScorecardPerspectiveId = performanceGroupSource.ScorecardPerspectiveId,
                IsActive = performanceGroupSource.IsActive,
                SeqNo = performanceGroupSource.SeqNo,
                ScaleId = performanceGroupSource.ScaleId,
                ProfileId = performanceGroup.ProfileId,
                TrainingComments = performanceGroupSource.TrainingComments
            };

            foreach (ProfileType pt in performanceGroupSource.ProfileTypes)
            {
                newPerformanceGroup.ProfileTypes.Add(pt);
            }

            dataContext.PerformanceGroups.Add(newPerformanceGroup);
            dataContext.SaveChanges();

            IpsPerformanceGroupSkillQuestion[] ipsPerformanceGroupSkillQuestion;

            foreach (Link_PerformanceGroupSkills link_PerformanceGroupSkill in performanceGroupSource.Link_PerformanceGroupSkills)
            {
                Link_PerformanceGroupSkills link_PerformanceGroupSkillsDB = dataContext.Link_PerformanceGroupSkills
                    .Include("Questions")
                    .Include("Trainings")
                    .FirstOrDefault(lpg => lpg.Id == link_PerformanceGroupSkill.Id);
                //Skill newSkill = new Skill();
                //if (link_PerformanceGroupSkillsDB.SkillId > 0)
                //{

                //    newSkill = _ipsDataContext.Skills.Where(x => x.Id == link_PerformanceGroupSkillsDB.SkillId).FirstOrDefault();
                //    newSkill.Id = 0;
                //    _ipsDataContext.Skills.Add(newSkill);
                //    _ipsDataContext.SaveChanges();
                //}
                Link_PerformanceGroupSkills newLink_PerformanceGroupSkill = new Link_PerformanceGroupSkills
                {
                    PerformanceGroupId = newPerformanceGroup.Id,
                    SkillId = link_PerformanceGroupSkillsDB.SkillId,
                    SubSkillId = link_PerformanceGroupSkillsDB.SubSkillId,
                    Action = link_PerformanceGroupSkillsDB.Action,
                    Benchmark = link_PerformanceGroupSkillsDB.Benchmark,
                    CSF = link_PerformanceGroupSkillsDB.CSF,
                    Weight = link_PerformanceGroupSkillsDB.Weight
                };


                dataContext.Link_PerformanceGroupSkills.Add(newLink_PerformanceGroupSkill);
                dataContext.SaveChanges();

                List<IpsPerformanceGroupSkillQuestion> skillQuestionList = new List<IpsPerformanceGroupSkillQuestion>();
                foreach (Question question in link_PerformanceGroupSkill.Questions)
                {
                    IpsPerformanceGroupSkillQuestion skillQuestionRecord = new IpsPerformanceGroupSkillQuestion
                    {
                        QuestionId = question.Id,
                        SkillId =
                            link_PerformanceGroupSkill.SubSkillId > 0
                                ? link_PerformanceGroupSkill.SubSkillId.Value
                                : link_PerformanceGroupSkill.SkillId
                    };

                    skillQuestionList.Add(skillQuestionRecord);
                }
                ipsPerformanceGroupSkillQuestion = skillQuestionList.ToArray();
                AddQuestionToPerformanceGroup(dataContext, newPerformanceGroup.Id, ipsPerformanceGroupSkillQuestion);

                //TRAINING
                foreach (Training training in link_PerformanceGroupSkill.Trainings)
                {
                    Training trainingDB = dataContext.Trainings.FirstOrDefault(t => t.Id == training.Id);
                    newLink_PerformanceGroupSkill.Trainings.Add(trainingDB);
                }

            }

            foreach (ScorecardGoal scorecardGoal in performanceGroupSource.ScorecardGoals)
            {
                ScorecardGoal scorecardGoalDB = dataContext.ScorecardGoals.FirstOrDefault(sg => sg.Id == scorecardGoal.Id);
                newPerformanceGroup.ScorecardGoals.Add(scorecardGoalDB);
            }

            foreach (ProfileType profileType in performanceGroupSource.ProfileTypes)
            {
                ProfileType profileTypeDB = dataContext.ProfileTypes.FirstOrDefault(pt => pt.Id == profileType.Id);
                newPerformanceGroup.ProfileTypes.Add(profileTypeDB);
            }

            foreach (JobPosition jobPosition in performanceGroupSource.JobPositions)
            {
                JobPosition jobPositionDB = dataContext.JobPositions.FirstOrDefault(jp => jp.Id == jobPosition.Id);
                newPerformanceGroup.JobPositions.Add(jobPositionDB);
            }
            dataContext.SaveChanges();
            return newPerformanceGroup;

        }

        public PerformanceGroup CreateCopy(PerformanceGroup performanceGroup, string copyName)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    var newPerformanceGroup = CreateCopy(_ipsDataContext, performanceGroup, copyName);
                    dbContextTransaction.Commit();
                    return newPerformanceGroup;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }

        }

        public void Update(PerformanceGroup performanceGroup)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    if (performanceGroup.Scale != null)
                    {
                        performanceGroup.Scale.ProfileType1 = null;
                        performanceGroup.Scale.ScaleCategory = null;
                        performanceGroup.Scale.MeasureUnit = null;
                        performanceGroup.Scale.Profiles = null;
                        performanceGroup.Scale.Questions = null;
                        performanceGroup.Scale.PerformanceGroups = null;
                        performanceGroup.Scale.Profiles = null;
                    }

                    var original = _ipsDataContext.PerformanceGroups.Include("Scale").Include("ScorecardGoals").Include("ProfileTypes").Include("JobPositions").Where(pg => pg.Id == performanceGroup.Id).SingleOrDefault();

                    if (original != null)
                    {
                        if (performanceGroup.Scale != null)
                        {
                            performanceGroup.Scale.Id = original.Scale.Id;
                            performanceGroup.ScaleId = original.ScaleId;
                        }
                        _ipsDataContext.Entry(original).CurrentValues.SetValues(performanceGroup);
                        if (performanceGroup.Scale != null)
                        {
                            Scale scaleOriginal = _ipsDataContext.Scales.Include("ScaleRanges").Where(sc => sc.Id == original.ScaleId).FirstOrDefault();
                            if (scaleOriginal != null)
                            {
                                performanceGroup.Scale.IsTemplate = false;

                                _ipsDataContext.Entry(scaleOriginal).CurrentValues.SetValues(performanceGroup.Scale);

                                _ipsDataContext.ScaleRanges.RemoveRange(scaleOriginal.ScaleRanges);
                                foreach (ScaleRange scaleRange in performanceGroup.Scale.ScaleRanges)
                                {
                                    scaleRange.ScaleId = performanceGroup.ScaleId.Value;
                                    _ipsDataContext.ScaleRanges.Add(scaleRange);
                                }
                            }
                        }


                        original.ScorecardGoals.Clear();
                        foreach (ScorecardGoal scoreCardGoal in performanceGroup.ScorecardGoals)
                        {
                            ScorecardGoal scoreCardGoalDb = _ipsDataContext.ScorecardGoals.Where(sg => sg.Id == scoreCardGoal.Id).FirstOrDefault();
                            original.ScorecardGoals.Add(scoreCardGoalDb);
                        }

                        original.ProfileTypes.Clear();
                        foreach (ProfileType profileType in performanceGroup.ProfileTypes)
                        {
                            ProfileType profileTypeDb = _ipsDataContext.ProfileTypes.Where(pt => pt.Id == profileType.Id).FirstOrDefault();
                            original.ProfileTypes.Add(profileTypeDb);
                        }


                        original.JobPositions.Clear();
                        foreach (JobPosition jobPosition in performanceGroup.JobPositions)
                        {
                            JobPosition jobPositionDb = _ipsDataContext.JobPositions.Where(jp => jp.Id == jobPosition.Id).FirstOrDefault();
                            original.JobPositions.Add(jobPositionDb);
                        }

                        _ipsDataContext.SaveChanges();
                        dbContextTransaction.Commit();
                    }
                }
                catch
                {
                    dbContextTransaction.Rollback();
                    throw;
                }

            }
        }

        public bool Delete(PerformanceGroup performanceGroup)
        {

            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    bool isStages = false;
                    bool isAnswers = false;
                    List<Link_PerformanceGroupSkills> links = _ipsDataContext.Link_PerformanceGroupSkills.Include("Questions").Where(l => l.PerformanceGroupId == performanceGroup.Id).ToList();

                    if (performanceGroup.ProfileId != null)
                    {
                        List<StageGroup> stageGroups = _ipsDataContext.Profiles.Include("StageGroups").Where(p => p.Id == performanceGroup.ProfileId).FirstOrDefault().StageGroups.ToList();


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


                        foreach (Link_PerformanceGroupSkills link in links)
                        {
                            int[] questionIds = link.Questions.Select(q => q.Id).ToArray();
                            List<Answer> answers = _ipsDataContext.Answers.Where(a => questionIds.Contains(a.QuestionId)).ToList();
                            if (answers != null && answers.Count > 0)
                            {
                                isAnswers = true;
                                break;
                            }

                        }
                    }

                    if (!isAnswers && !isStages)
                    {
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformanceGroupTargetAudience WHERE PerformanceGroupId = {0}", performanceGroup.Id);
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformanceGroupGoals WHERE PerformanceGroupId = {0}", performanceGroup.Id);
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformanceGroupProfileTypes WHERE PerformanceGroupId = {0}", performanceGroup.Id);
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformanceGroupQuestions WHERE PerformanceGroupSkillId in (SELECT Id FROM Link_PerformanceGroupSkills WHERE PerformanceGroupId = {0})", performanceGroup.Id);
                        foreach (var link in links)
                        {
                            if (link.Questions != null && link.Questions.Count > 0)
                            {
                                foreach (var q in link.Questions)
                                {
                                    _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_SkillQuestions WHERE QuestionId = {0}", q.Id);
                                    _ipsDataContext.Database.ExecuteSqlCommand(
                                        "DELETE FROM [dbo].[PossibleAnswers] WHERE QuestionId = {0}", q.Id);
                                    _ipsDataContext.Database.ExecuteSqlCommand(
                                        "DELETE FROM [dbo].[QuestionMaterials] WHERE QuestionId = {0}", q.Id);
                                    _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Questions WHERE Id = {0}", q.Id);
                                }
                            }
                        }
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformancGroupTrainings WHERE PerformanceGroupSkillId in (SELECT Id FROM Link_PerformanceGroupSkills WHERE PerformanceGroupId = {0})", performanceGroup.Id);
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM Link_PerformanceGroupSkills WHERE PerformanceGroupId = {0}", performanceGroup.Id);
                        _ipsDataContext.Database.ExecuteSqlCommand("DELETE FROM PerformanceGroups WHERE Id = {0}", performanceGroup.Id);

                        dbContextTransaction.Commit();
                    }
                    else
                    {
                        return false;
                    }
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }

            }
            return true;
        }

        public bool AddSkillToPerformanceGroup(int performanceGroupId, int[] skills)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                foreach (int skill in skills)
                {
                    Skill currentSkill = _ipsDataContext.Skills.Where(s => s.Id == skill).FirstOrDefault();
                    if (currentSkill != null)
                    {
                        Link_PerformanceGroupSkills newLink_PgS = new Link_PerformanceGroupSkills();
                        newLink_PgS.PerformanceGroupId = originalPG.Id;
                        newLink_PgS.SkillId = currentSkill.Id;
                        _ipsDataContext.Link_PerformanceGroupSkills.Add(newLink_PgS);
                    }

                }

                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        /*public bool UpdateSkillInPerformanceGroup(int performanceGroupId, int[] skills)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                List<Link_PerformanceGroupSkills> list_Link_PerformanceGroupSkills = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Include("Questions").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();
                
                foreach(Link_PerformanceGroupSkills lpgSkill in list_Link_PerformanceGroupSkills)
                {
                    lpgSkill.Trainings.Clear();
                    lpgSkill.Questions.Clear();
                }
                _ipsDataContext.Link_PerformanceGroupSkills.RemoveRange(list_Link_PerformanceGroupSkills);

                foreach (int skill in skills)
                {
                    Skill currentSkill = _ipsDataContext.Skills.Where(s => s.Id == skill).FirstOrDefault();
                    if (currentSkill != null)
                    {
                        Link_PerformanceGroupSkills newLink_PgS = new Link_PerformanceGroupSkills();
                        newLink_PgS.PerformanceGroupId = originalPG.Id;
                        newLink_PgS.SkillId = currentSkill.Id;
                        _ipsDataContext.Link_PerformanceGroupSkills.Add(newLink_PgS);
                    }
                }
                _ipsDataContext.SaveChanges();
            }

            return true;
        }*/

        public bool UpdateSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

                    if (originalPG != null)
                    {
                        List<Link_PerformanceGroupSkills> existingSkillLinks = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Include("Questions").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();

                        // Remove from DB skills that have been removed by user
                        List<Link_PerformanceGroupSkills> toBeRemovedLinks = new List<Link_PerformanceGroupSkills>();
                        foreach (Link_PerformanceGroupSkills lpgSkill in existingSkillLinks)
                        {
                            if (link_skills.Where(l => l.SkillId == lpgSkill.SkillId && (!lpgSkill.SubSkillId.HasValue || lpgSkill.SubSkillId == l.SubSkillId)).Count() == 0)
                            {
                                lpgSkill.Trainings.Clear();
                                lpgSkill.Questions.Clear();
                                toBeRemovedLinks.Add(lpgSkill);
                            }
                        }

                        if (toBeRemovedLinks.Count > 0)
                        {
                            _ipsDataContext.Link_PerformanceGroupSkills.RemoveRange(toBeRemovedLinks);
                        }

                        // update existing skills
                        foreach (Link_PerformanceGroupSkills newSkill in link_skills)
                        {
                            if (newSkill.SkillId <= 0)
                            {
                                continue;
                            }

                            Link_PerformanceGroupSkills linkToBeChanged = existingSkillLinks.Where(l => l.SkillId == newSkill.SkillId && (!l.SubSkillId.HasValue || l.SubSkillId == newSkill.SubSkillId)).FirstOrDefault();

                            if (linkToBeChanged == null)
                            {
                                // New Skill
                                Link_PerformanceGroupSkills newLink_PgS = new Link_PerformanceGroupSkills();
                                newLink_PgS.PerformanceGroupId = originalPG.Id;
                                newLink_PgS.SkillId = newSkill.SkillId;
                                /*if (!newSkill.SubSkillId.HasValue || newSkill.SubSkillId == 0)
                                {
                                    newLink_PgS.SubSkillId = null;
                                }
                                else
                                {
                                    newLink_PgS.SubSkillId = newSkill.SubSkillId;
                                }*/
                                newLink_PgS.SubSkillId = !newSkill.SubSkillId.HasValue || newSkill.SubSkillId == 0 ? null : newSkill.SubSkillId;
                                newLink_PgS.Benchmark = newSkill.Benchmark;
                                newLink_PgS.Weight = newSkill.Weight;
                                newLink_PgS.CSF = newSkill.CSF;
                                newLink_PgS.Action = newSkill.Action;
                                _ipsDataContext.Link_PerformanceGroupSkills.Add(newLink_PgS);
                                _ipsDataContext.SaveChanges();
                            }
                            else
                            {
                                // update skill
                                linkToBeChanged.Benchmark = newSkill.Benchmark;
                                linkToBeChanged.Weight = newSkill.Weight;
                                linkToBeChanged.CSF = newSkill.CSF;
                                linkToBeChanged.Action = newSkill.Action;
                                linkToBeChanged.Trainings = null;
                                linkToBeChanged.Questions = null;
                                _ipsDataContext.SaveChanges();
                            }

                        }

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


        public List<Link_PerformanceGroupSkills> UpdateNewSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills)

        {
            List<Link_PerformanceGroupSkills> result = new List<Link_PerformanceGroupSkills>();
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

                    if (originalPG != null)
                    {
                        List<Link_PerformanceGroupSkills> existingSkillLinks = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Include("Questions").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();

                        // update existing skills
                        foreach (Link_PerformanceGroupSkills link_newSkill in link_skills)
                        {
                            if (link_newSkill.SkillId <= 0)
                            {
                                Skill newSkill = new Skill();
                                newSkill.Name = link_newSkill.Skill.Name;
                                newSkill.Description = link_newSkill.Skill.Description;
                                if(link_newSkill.SkillId < 0)
                                {
                                    newSkill.SeqNo = (link_newSkill.SkillId * (-1));
                                }
                               
                                if (link_newSkill.Skill.TrainingDescriptions.Count() > 0)
                                {
                                    newSkill.TrainingDescriptions = link_newSkill.Skill.TrainingDescriptions;
                                }
                                newSkill.CreatedBy = _authService.GetCurrentUserId();
                                newSkill.CreatedOn = DateTime.Now;
                                _ipsDataContext.Skills.Add(newSkill);
                                _ipsDataContext.SaveChanges();
                                link_newSkill.Skill.Id = newSkill.Id;
                                link_newSkill.SkillId = newSkill.Id;
                                //continue;
                            }

                            Link_PerformanceGroupSkills linkToBeChanged = existingSkillLinks.Where(l => l.SkillId == link_newSkill.SkillId && (!l.SubSkillId.HasValue || l.SubSkillId == link_newSkill.SubSkillId)).FirstOrDefault();

                            if (linkToBeChanged == null)
                            {
                                // New Skill
                                Link_PerformanceGroupSkills newLink_PgS = new Link_PerformanceGroupSkills();
                                newLink_PgS.PerformanceGroupId = originalPG.Id;
                                newLink_PgS.SkillId = link_newSkill.SkillId;
                                /*if (!newSkill.SubSkillId.HasValue || newSkill.SubSkillId == 0)
                                {
                                    newLink_PgS.SubSkillId = null;
                                }
                                else
                                {
                                    newLink_PgS.SubSkillId = newSkill.SubSkillId;
                                }*/
                                newLink_PgS.SubSkillId = !link_newSkill.SubSkillId.HasValue || link_newSkill.SubSkillId == 0 ? null : link_newSkill.SubSkillId;
                                newLink_PgS.Benchmark = link_newSkill.Benchmark;
                                newLink_PgS.Weight = link_newSkill.Weight;
                                newLink_PgS.CSF = link_newSkill.CSF;
                                newLink_PgS.Action = link_newSkill.Action;
                                _ipsDataContext.Link_PerformanceGroupSkills.Add(newLink_PgS);
                                _ipsDataContext.SaveChanges();

                                result.Add(newLink_PgS);
                            }
                            else
                            {
                                // update skill
                                linkToBeChanged.Benchmark = link_newSkill.Benchmark;
                                linkToBeChanged.Weight = link_newSkill.Weight;
                                linkToBeChanged.CSF = link_newSkill.CSF;
                                linkToBeChanged.Action = link_newSkill.Action;
                                //linkToBeChanged.Trainings = null;
                                //linkToBeChanged.Questions = null;
                                _ipsDataContext.SaveChanges();
                            }

                        }

                    }

                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }

            return result;
        }


        public bool RemoveSkillFromPerformanceGroup(int performanceGroupId, int[] skills)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                foreach (int skill in skills)
                {
                    Skill currentSkill = _ipsDataContext.Skills.Where(s => s.Id == skill).FirstOrDefault();
                    if (currentSkill != null)
                    {
                        Link_PerformanceGroupSkills Link_PgS = _ipsDataContext.Link_PerformanceGroupSkills.Where(pgs => pgs.SkillId == currentSkill.Id && pgs.PerformanceGroupId == originalPG.Id).FirstOrDefault();
                        if (Link_PgS != null)
                        {
                            _ipsDataContext.Link_PerformanceGroupSkills.Remove(Link_PgS);
                        }
                        // _ipsDataContext.link_perormancegroupqu
                    }

                }

                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool RemoveSkillFromPerformanceGroup(int performanceGroupId, int skillsID)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                //foreach (int skill in skills)
                // {
                try
                {
                    Skill currentSkill = _ipsDataContext.Skills.Where(s => s.Id == skillsID).FirstOrDefault();
                    if (currentSkill != null)
                    {
                        Link_PerformanceGroupSkills Link_PgS = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Include("Questions").Where(pgs => pgs.SkillId == currentSkill.Id && pgs.PerformanceGroupId == originalPG.Id).FirstOrDefault();
                        if (Link_PgS != null)
                        {

                            _ipsDataContext.Link_PerformanceGroupSkills.Remove(Link_PgS);
                        }
                        // _ipsDataContext.link_perormancegroupqu
                    }

                    //}

                    _ipsDataContext.SaveChanges();
                }
                catch (Exception ex)
                {
                    return false;
                }
            }

            return true;
        }

        public bool AddTrainingToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {

                /*List<Link_PerformanceGroupSkills> link_PGSkills = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(lpg => lpg.PerformanceGroupId == performanceGroupId).ToList();

                foreach(Link_PerformanceGroupSkills link_PGSkill in link_PGSkills)
                {
                    link_PGSkill.Trainings.Clear();
                }
                */
                foreach (IpsPerformanceGroupSkillTraining skillTraining in PGskillTrainings)
                {
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(lpg => lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillTraining.SkillId).FirstOrDefault();

                    if (link_PGSkill != null)
                    {
                        Training dbTraining = _ipsDataContext.Trainings.Where(t => t.Id == skillTraining.TrainingId).FirstOrDefault();
                        link_PGSkill.Trainings.Add(dbTraining);
                    }
                }
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool UpdateTrainingInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                List<Link_PerformanceGroupSkills> list_Link_PerformanceGroupSkills = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();

                foreach (Link_PerformanceGroupSkills lpgSkill in list_Link_PerformanceGroupSkills)
                {
                    lpgSkill.Trainings.Clear();
                }

                foreach (IpsPerformanceGroupSkillTraining skillTraining in PGskillTrainings)
                {
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(lpg => (lpg.PerformanceGroupId == performanceGroupId && lpg.SubSkillId == skillTraining.SkillId) || (lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillTraining.SkillId)).FirstOrDefault();

                    if (link_PGSkill != null)
                    {
                        Training dbTraining = _ipsDataContext.Trainings.Where(t => t.Id == skillTraining.TrainingId).FirstOrDefault();
                        link_PGSkill.Trainings.Add(dbTraining);
                    }
                }

                _ipsDataContext.SaveChanges();
            }


            return true;
        }

        public bool RemoveTrainingFromPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                foreach (IpsPerformanceGroupSkillTraining skillTraining in PGskillTrainings)
                {
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills.Include("Trainings").Where(lpg => lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillTraining.SkillId).FirstOrDefault();

                    if (link_PGSkill != null)
                    {
                        Training dbTraining = _ipsDataContext.Trainings.Where(t => t.Id == skillTraining.TrainingId).FirstOrDefault();

                        if (dbTraining != null)
                        {
                            link_PGSkill.Trainings.Remove(dbTraining);
                        }
                    }

                }

                _ipsDataContext.SaveChanges();
            }


            return true;
        }

        public bool AddQuestionToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            AddQuestionToPerformanceGroup(_ipsDataContext, performanceGroupId, PGskillQuestions);
            _ipsDataContext.SaveChanges();
            return true;
        }
        public void AddQuestionToPerformanceGroup(IPSData context, int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            IPSData _ipsDataContext = context;
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.FirstOrDefault(pg => pg.Id == performanceGroupId);

            if (originalPG != null)
            {
                foreach (IpsPerformanceGroupSkillQuestion skillQuestion in PGskillQuestions)
                {
                    Question dbQuestion = _ipsDataContext.Questions
                        .Include(x => x.QuestionMaterial)
                        .Include(x => x.PossibleAnswer)
                        .FirstOrDefault(q => q.Id == skillQuestion.QuestionId);
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills
                        .Include("Questions")
                        .FirstOrDefault(lpg => (lpg.PerformanceGroupId == performanceGroupId && lpg.SubSkillId == skillQuestion.SkillId)
                        || (lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillQuestion.SkillId));
                    if (dbQuestion != null && link_PGSkill != null)
                    {
                        Question newQuestion = new Question
                        {
                            QuestionText = dbQuestion.QuestionText,
                            Description = dbQuestion.Description,
                            AnswerTypeId = dbQuestion.AnswerTypeId,
                            IsActive = dbQuestion.IsActive,
                            IsTemplate = false,
                            OrganizationId = dbQuestion.OrganizationId,
                            ProfileTypeId = dbQuestion.ProfileTypeId,
                            ScaleId = dbQuestion.ScaleId,
                            QuestionSettings = dbQuestion.QuestionSettings,
                            Points = dbQuestion.Points,
                            SeqNo = dbQuestion.SeqNo,
                            TimeForQuestion = dbQuestion.TimeForQuestion,
                            ParentQuestionId = dbQuestion.Id
                        };

                        if (dbQuestion.QuestionMaterial != null)
                        {
                            newQuestion.QuestionMaterial = new QuestionMaterial()
                            {
                                DocumentId = dbQuestion.QuestionMaterial.DocumentId,
                                Link = dbQuestion.QuestionMaterial.Link,
                                MaterialType = dbQuestion.QuestionMaterial.MaterialType
                            };
                        }

                        if (dbQuestion.PossibleAnswer != null)
                        {
                            newQuestion.PossibleAnswer = new PossibleAnswer
                            {
                                Answer = dbQuestion.PossibleAnswer.Answer
                            };
                        }

                        _ipsDataContext.Questions.Add(newQuestion);
                        _ipsDataContext.SaveChanges();
                        link_PGSkill.Questions.Add(newQuestion);
                    }
                }

                _ipsDataContext.SaveChanges();
            }

            // return true;
        }

        public void UpdateQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            AddQuestionToPerformanceGroup(_ipsDataContext, performanceGroupId, PGskillQuestions);
            _ipsDataContext.SaveChanges();
        }


        public void UpdateQuestionInPerformanceGroup(IPSData datacontext, int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            using (var dbContextTransaction = datacontext.Database.BeginTransaction())
            {
                try
                {
                    PerformanceGroup originalPG = datacontext.PerformanceGroups.FirstOrDefault(pg => pg.Id == performanceGroupId);

                    if (originalPG != null)
                    {
                        if (PGskillQuestions.Length > 0)
                        {
                            ////////////////---------------DELETE OLD questions from Performance Group ----------------/////////////////////////////
                            List<Link_PerformanceGroupSkills> list_Link_PerformanceGroupSkills = datacontext.Link_PerformanceGroupSkills.Include("Questions").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();

                            foreach (Link_PerformanceGroupSkills lpgs in list_Link_PerformanceGroupSkills)
                            {
                                List<Question> questionsToUnlink = new List<Question>();
                                foreach (Question question in lpgs.Questions)
                                {
                                    if (PGskillQuestions.Where(sq => sq.SkillId == lpgs.SkillId && sq.QuestionId == question.Id).Count() == 0)
                                    {
                                        // Remove
                                        questionsToUnlink.Add(question);
                                    }
                                }

                                foreach (Question question in questionsToUnlink)
                                {
                                    lpgs.Questions.Remove(question);

                                    if (question.IsTemplate == false)
                                    {
                                        datacontext.Questions.Remove(question);
                                    }
                                }

                            }

                            //---Update Questions Data---
                            foreach (var question in PGskillQuestions)
                            {
                                var dbQuestion = datacontext.Questions.Where(q => q.Id == question.QuestionId).FirstOrDefault();
                                dbQuestion.SeqNo = question.SeqNo;
                            }

                        }
                        else
                        {

                            List<Link_PerformanceGroupSkills> list_Link_PerformanceGroupSkills = _ipsDataContext.Link_PerformanceGroupSkills.Include("Questions").Where(lpgs => lpgs.PerformanceGroupId == performanceGroupId).ToList();

                            foreach (Link_PerformanceGroupSkills lpgSkill in list_Link_PerformanceGroupSkills)
                            {
                                List<Question> questions = new List<Question>(lpgSkill.Questions);
                                foreach (Question question in questions)
                                {
                                    lpgSkill.Questions.Remove(question);
                                    if (question.IsTemplate == false)
                                    {
                                        datacontext.Questions.Remove(question);
                                    }
                                }

                            }

                        }
                        _ipsDataContext.SaveChanges();
                        ////////////////---------------DELETE OLD questions from Performance Group ----------------/////////////////////////////


                        ////////////////---------------Add New questions to Performance Group ----------------/////////////////////////////
                        foreach (IpsPerformanceGroupSkillQuestion skillQuestion in PGskillQuestions)
                        {
                            Link_PerformanceGroupSkills link_PerformanceGroupSkill = datacontext.Link_PerformanceGroupSkills.Include("Questions").Where(lpgs => (lpgs.PerformanceGroupId == performanceGroupId && lpgs.SkillId == skillQuestion.SkillId) || (lpgs.PerformanceGroupId == performanceGroupId && lpgs.SubSkillId == skillQuestion.SkillId)).FirstOrDefault();

                            if (link_PerformanceGroupSkill != null)
                            {
                                bool addNewQuestionRequired = link_PerformanceGroupSkill.Questions.Count == 0;

                                if (!addNewQuestionRequired && link_PerformanceGroupSkill.Questions.Count > 0)
                                {
                                    addNewQuestionRequired = true;
                                    foreach (Question question in link_PerformanceGroupSkill.Questions)
                                    {
                                        if (skillQuestion.QuestionId == question.Id)
                                        {
                                            addNewQuestionRequired = false;
                                            break;
                                        }
                                    }
                                }

                                if (addNewQuestionRequired)
                                {

                                    Question questionDB = datacontext.Questions
                                        .Include("Skills")
                                        .Include(x => x.PossibleAnswer)
                                        .Include(x => x.QuestionMaterial)
                                        .FirstOrDefault(q => q.Id == skillQuestion.QuestionId);

                                    Question newQuestion = new Question();

                                    newQuestion.QuestionText = questionDB.QuestionText;
                                    newQuestion.Description = questionDB.Description;
                                    newQuestion.AnswerTypeId = questionDB.AnswerTypeId;
                                    newQuestion.IsActive = questionDB.IsActive;
                                    newQuestion.IsTemplate = false;
                                    newQuestion.OrganizationId = questionDB.OrganizationId;
                                    newQuestion.ProfileTypeId = questionDB.ProfileTypeId;
                                    newQuestion.ScaleId = questionDB.ScaleId;
                                    newQuestion.QuestionSettings = questionDB.QuestionSettings;
                                    newQuestion.SeqNo = questionDB.SeqNo;
                                    newQuestion.Points = questionDB.Points;
                                    newQuestion.TimeForQuestion = questionDB.TimeForQuestion;
                                    if (questionDB.QuestionMaterial != null)
                                    {
                                        newQuestion.QuestionMaterial = new QuestionMaterial()
                                        {
                                            DocumentId = questionDB.QuestionMaterial.DocumentId,
                                            Link = questionDB.QuestionMaterial.Link,
                                            MaterialType = questionDB.QuestionMaterial.MaterialType
                                        };
                                    }

                                    if (questionDB.PossibleAnswer != null)
                                    {
                                        newQuestion.PossibleAnswer = new PossibleAnswer() { Answer = questionDB.PossibleAnswer.Answer };
                                    }
                                    datacontext.Questions.Add(newQuestion);
                                    datacontext.SaveChanges();
                                    foreach (var skill in questionDB.Skills)
                                        newQuestion.Skills.Add(skill);
                                    datacontext.SaveChanges();
                                    link_PerformanceGroupSkill.Questions.Add(newQuestion);
                                    datacontext.SaveChanges();
                                }
                            }
                        }

                        ////////////////---------------Add New questions to Performance Group ----------------/////////////////////////////


                        datacontext.SaveChanges();
                    }
                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
            // return true;

        }
        public List<IpsPerformanceGroupSkillQuestion> UpdateNewQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            List<IpsPerformanceGroupSkillQuestion> result = new List<IpsPerformanceGroupSkillQuestion>();
            IPSData _ipsDataContext = new IPSData();
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.FirstOrDefault(pg => pg.Id == performanceGroupId);

            if (originalPG != null)
            {
                foreach (IpsPerformanceGroupSkillQuestion skillQuestion in PGskillQuestions)
                {
                    Question dbQuestion = _ipsDataContext.Questions
                        .Include(x => x.QuestionMaterial)
                        .Include(x => x.PossibleAnswer)
                        .FirstOrDefault(q => q.Id == skillQuestion.QuestionId);
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills
                        .Include("Questions")
                        .FirstOrDefault(lpg => (lpg.PerformanceGroupId == performanceGroupId && lpg.SubSkillId == skillQuestion.SkillId)
                        || (lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillQuestion.SkillId));
                    if (dbQuestion != null && link_PGSkill != null)
                    {
                        Question newQuestion = new Question
                        {
                            QuestionText = dbQuestion.QuestionText,
                            Description = dbQuestion.Description,
                            AnswerTypeId = dbQuestion.AnswerTypeId,
                            IsActive = dbQuestion.IsActive,
                            IsTemplate = false,
                            OrganizationId = dbQuestion.OrganizationId,
                            ProfileTypeId = dbQuestion.ProfileTypeId,
                            ScaleId = dbQuestion.ScaleId,
                            QuestionSettings = dbQuestion.QuestionSettings,
                            Points = dbQuestion.Points,
                            SeqNo = dbQuestion.SeqNo,
                            TimeForQuestion = dbQuestion.TimeForQuestion,
                            ParentQuestionId = dbQuestion.Id
                        };

                        if (dbQuestion.QuestionMaterial != null)
                        {
                            newQuestion.QuestionMaterial = new QuestionMaterial()
                            {
                                DocumentId = dbQuestion.QuestionMaterial.DocumentId,
                                Link = dbQuestion.QuestionMaterial.Link,
                                MaterialType = dbQuestion.QuestionMaterial.MaterialType
                            };
                        }

                        if (dbQuestion.PossibleAnswer != null)
                        {
                            newQuestion.PossibleAnswer = new PossibleAnswer
                            {
                                Answer = dbQuestion.PossibleAnswer.Answer
                            };
                        }

                        _ipsDataContext.Questions.Add(newQuestion);
                        _ipsDataContext.SaveChanges();
                        IpsPerformanceGroupSkillQuestion newIpsPerformanceGroupSkillQuestion = new IpsPerformanceGroupSkillQuestion()
                        {
                            QuestionId = newQuestion.Id,
                            SkillId = skillQuestion.SkillId,
                            SeqNo = skillQuestion.SeqNo,
                        };
                        result.Add(newIpsPerformanceGroupSkillQuestion);
                        link_PGSkill.Questions.Add(newQuestion);
                    }
                }

                _ipsDataContext.SaveChanges();
            }
            return result;
        }


        public bool RemoveQuestionFromPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            PerformanceGroup originalPG = _ipsDataContext.PerformanceGroups.Where(pg => pg.Id == performanceGroupId).FirstOrDefault();

            if (originalPG != null)
            {
                foreach (IpsPerformanceGroupSkillQuestion skillQuestion in PGskillQuestions)
                {
                    Link_PerformanceGroupSkills link_PGSkill = _ipsDataContext.Link_PerformanceGroupSkills.Include("Questions").Where(lpg => lpg.PerformanceGroupId == performanceGroupId && lpg.SkillId == skillQuestion.SkillId).FirstOrDefault();

                    if (link_PGSkill != null)
                    {
                        Question dbQuestion = _ipsDataContext.Questions.Where(q => q.Id == skillQuestion.QuestionId).FirstOrDefault();


                        if (dbQuestion != null)
                        {
                            link_PGSkill.Questions.Remove(dbQuestion);
                            _ipsDataContext.Questions.Remove(dbQuestion);
                        }
                    }

                }

                _ipsDataContext.SaveChanges();
            }


            return true;
        }

        public List<IpsPerformanceGroup> GetPerformanceGroupsWithProfile()
        {
            List<int> idList = _authService.GetUserOrganizations();
            List<IpsPerformanceGroup> result = new List<IpsPerformanceGroup>();
            string query = "select pg.Id,pg.Name,p.OrganizationId,p.id ProfileId,p.Name ProfileName from PerformanceGroups pg join Profiles p on p.id = pg.profileid order by pg.name";
            result = _ipsDataContext.Database.SqlQuery<IpsPerformanceGroup>(query).ToList(); ;
            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                result =
                    result.Where(pg => pg.OrganizationId != null && idList.Contains((int)pg.OrganizationId))
                       .ToList();
            }
            return result;
        }

        public List<PerformanceGroup> getPerformanceGroupTemplates(int projectId)
        {
            List<PerformanceGroup> result = new List<PerformanceGroup>();
            string[] ignoreWords = new[] { "this", "your", "that", "does", "about", "have" };
            ProjectService _projectService = new ProjectService();

            IpsProjectModel projectinfo = _projectService.GetProjectById(projectId);
            List<string> pgText = new List<string>();


            List<string> pgwords = new List<string>();

            if (projectinfo != null)
            {
                foreach (IpsProjectGoalModel goal in projectinfo.ProjectGoals)
                {
                    if (!string.IsNullOrEmpty(goal.Goal))
                    {
                        List<string> splittedGoal = goal.Goal.Split(' ').ToList();
                        foreach (string splitText in splittedGoal)
                        {
                            if (splitText.Length > 3)
                            {
                                if ((!ignoreWords.Contains(splitText.ToLower())) && (!pgwords.Contains(splitText.ToLower())))
                                {
                                    pgwords.Add(splitText.ToLower());
                                    pgText.Add("pg.Description like '%" + splitText + "%'");
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
                                if ((!ignoreWords.Contains(splitText.ToLower())) && (!pgwords.Contains(splitText.ToLower())))
                                {
                                    pgwords.Add(splitText.ToLower());
                                    pgText.Add("pg.Description like '%" + splitText + "%'");
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
                            if ((!ignoreWords.Contains(splitText.ToLower())) && (!pgwords.Contains(splitText.ToLower())))
                            {
                                pgwords.Add(splitText.ToLower());
                                pgText.Add("pg.Description like '%" + splitText + "%'");
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
                            if ((!ignoreWords.Contains(splitText.ToLower())) && (!pgwords.Contains(splitText.ToLower())))
                            {
                                pgwords.Add(splitText.ToLower());
                                pgText.Add("pg.Description like '%" + splitText + "%'");
                                //strategyText.Add("pgoal.Strategy like '%" + splitText + "%'");
                            }
                        }
                    }
                }

            }
            string query = "select distinct pg.id from Profiles p " +
                           " join performancegroups pg on pg.profileid = p.id " +
                           " where pg.istemplate = 1 ";

            if (pgText.Count > 0)
            {
                query += " and  ( ";
                query += string.Join(" or ", pgText);
                query += " ) ";
            }


            //and(proj.MissionStatement like '%001%')
            List<int> pgIds = _ipsDataContext.Database.SqlQuery<int>(query).ToList();
            result = _ipsDataContext.PerformanceGroups.Include("ProfileTypes").Where(x => pgIds.Contains(x.Id)).ToList();
            return result;
        }
    }
}
/*bool UpdateQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions);*/

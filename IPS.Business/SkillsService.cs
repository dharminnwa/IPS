using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.Common;

namespace IPS.Business
{
    public class SkillsService : BaseService, IPS.Business.ISkillsService
    {
        public IQueryable<Skill> Get()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Skills.AsNoTracking().AsQueryable();
            }
            else
            {
                return _ipsDataContext.Skills.Where(s => s.OrganizationId == null || idList.Contains((int)s.OrganizationId)).AsQueryable();
            }
        }

        public List<IPSDropDown> GetDDL()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Skills.Select(x => new IPSDropDown
                {
                    Id = x.Id,
                    Name = x.Name
                }).OrderBy(x => x.Name).ToList();
            }
            else
            {
                return _ipsDataContext.Skills.Where(s => s.OrganizationId == null || idList.Contains((int)s.OrganizationId)).Select(x => new IPSDropDown
                {
                    Id = x.Id,
                    Name = x.Name
                }).OrderBy(x => x.Name).ToList();
            }
        }

        public IQueryable<Skill> GetSkillsWithTrainings()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Skills.Include("Trainings").AsQueryable();
            }
            else
            {
                return _ipsDataContext.Skills.Include("Trainings").Where(s => s.OrganizationId == null || idList.Contains((int)s.OrganizationId)).AsQueryable();
            }
        }
        public IQueryable<Skill> GetByOrganisation(int organisationID)
        {

            return _ipsDataContext.Skills.Where(s => s.OrganizationId == null || s.OrganizationId == organisationID).AsNoTracking().AsQueryable();

        }

        public List<IpsSkillDDL> GetDDL(IpsSkillFilter ipsSkillFilter)
        {
            //Not is use now
            List<IpsSkillDDL> result = new List<IpsSkillDDL>();
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                result = (from p in _ipsDataContext.Profiles
                          join pg in _ipsDataContext.PerformanceGroups on p.Id equals pg.ProfileId
                          join lpgs in _ipsDataContext.Link_PerformanceGroupSkills on pg.Id equals lpgs.PerformanceGroupId
                          join s in _ipsDataContext.Skills on lpgs.SkillId equals s.Id
                          select new IpsSkillDDL
                          {
                              Id = s.Id,
                              Name = s.Name,
                              PerformanceGroupId = pg.Id,
                              PerformanceGroupName = pg.Name,
                              ProfileId = p.Id,
                              ProfileName = p.Name
                          }).Distinct().ToList();
            }
            else
            {
                result = (from p in _ipsDataContext.Profiles
                          join pg in _ipsDataContext.PerformanceGroups on p.Id equals pg.ProfileId
                          join lpgs in _ipsDataContext.Link_PerformanceGroupSkills on pg.Id equals lpgs.PerformanceGroupId
                          join s in _ipsDataContext.Skills on lpgs.SkillId equals s.Id
                          where s.OrganizationId != null || idList.Contains((int)s.OrganizationId)
                          select new IpsSkillDDL
                          {
                              Id = s.Id,
                              Name = s.Name,
                              PerformanceGroupId = pg.Id,
                              PerformanceGroupName = pg.Name,
                              ProfileId = p.Id,
                              ProfileName = p.Name
                          }).Distinct().ToList();

                //if (ipsSkillFilter.OrganizationId.HasValue)
                //{
                //    if(ipsSkillFilter.OrganizationId.Value > 0)
                //    {
                //        result = result.Where(x => x.OrganizationId == ipsSkillFilter.OrganizationId.Value).ToList();
                //    }
                //}
                if (ipsSkillFilter.PerformanceGroupId.HasValue)
                {
                    if (ipsSkillFilter.PerformanceGroupId.Value > 0)
                    {
                        result = result.Where(x => x.PerformanceGroupId == ipsSkillFilter.PerformanceGroupId.Value).ToList();
                    }
                }

                //return _ipsDataContext.Skills.Where(s => s.OrganizationId == null || idList.Contains((int)s.OrganizationId)).AsQueryable();
            }
            return result;
        }

        public List<IpsSkillDDL> GetFilteredSkill(IpsSkillFilter ipsSkillFilter)
        {
            List<IpsSkillDDL> filteredSkills = new List<IpsSkillDDL>();


            string filterQuery = " select p.Id ProfileId,p.Name ProfileName,pg.Id PerformanceGroupId,pg.Name PerformanceGroupName,s.id Id,s.Name Name from profiles p " +
                                 " join PerformanceGroups pg on pg.ProfileId = p.Id " +
                                 " join Link_PerformanceGroupSkills lpg on pg.Id = lpg.PerformanceGroupId " +
                                 " join Skills s on s.Id = lpg.SkillId " +
                                 " where s.IsActive = 1 and s.IsTemplate = 1 ";

            List<int> idList = _authService.GetUserOrganizations();
            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                string organizations = string.Join(",", idList.ToArray());
                filterQuery += " and s.OrganizationId in(" + organizations + ")";
            }

            if (ipsSkillFilter.OrganizationId > 0)
            {
                filterQuery += " and pg.OrganizationId = " + ipsSkillFilter.OrganizationId;
            }

            if (ipsSkillFilter.PerformanceGroupId > 0)
            {
                filterQuery += " and pg.Id = " + ipsSkillFilter.PerformanceGroupId;
            }

            filteredSkills = _ipsDataContext.Database.SqlQuery<IpsSkillDDL>(filterQuery).ToList();

            return filteredSkills;
        }

        public List<IpsSkillDDL> GetTrainingsSkills()
        {
            List<IpsSkillDDL> filteredSkills = new List<IpsSkillDDL>();


            string filterQuery = " select distinct s.id,s.Name from Skills s " +
                                 " join Link_SkillTrainings lst on lst.SkillId = s.Id " +
                                 " join Trainings t on t.id = lst.TrainingId " +
                                 " where t.IsTemplate = 1 ";
            List<int> idList = _authService.GetUserOrganizations();
            if (!(_authService.IsFromGlobalOrganization(idList)))
            {
                string organizations = string.Join(",", idList.ToArray());
                filterQuery += " and (s.OrganizationId in(" + organizations + ") or s.OrganizationId is null)";
            }
            filteredSkills = _ipsDataContext.Database.SqlQuery<IpsSkillDDL>(filterQuery).ToList();

            return filteredSkills;
        }

        public List<string> GetSkillCSFList(int skillId)
        {
            List<string> csfList = new List<string>();
            csfList = _ipsDataContext.Link_PerformanceGroupSkills.Where(x => x.SkillId == skillId && (!string.IsNullOrEmpty(x.CSF))).Select(x => x.CSF).Distinct().ToList();
            return csfList;
        }
        public List<string> GetSkillActionList(int skillId)
        {
            List<string> actionList = new List<string>();
            actionList = _ipsDataContext.Link_PerformanceGroupSkills.Where(x => x.SkillId == skillId && (!string.IsNullOrEmpty(x.Action))).Select(x => x.Action).Distinct().ToList();
            return actionList;
        }
        public List<IpsFilterSkillResultModel> GetFilteredProfileSkill(IpsSkillFilter ipsSkillFilter)
        {
            List<IpsFilterSkillResultModel> filteredSkills = new List<IpsFilterSkillResultModel>();




            //List<int> idList = _authService.GetUserOrganizations();
            //if (!(_authService.IsFromGlobalOrganization(idList)))
            //{
            //    string organizations = string.Join(",", idList.ToArray());
            //    filterQuery += " and s.OrganizationId in(" + organizations + ")";
            //}

            if (ipsSkillFilter.ProfileCategoryId > 0 || ipsSkillFilter.ProfileLevelId > 0 || ipsSkillFilter.ProfileTypeId > 0)
            {
                string filterQuery = "select distinct s.id as Id,s.Name as Name, " +
                " pt.Id as ProfileTypeId,pt.Name as ProfileTypeName, " +
                " pl.Id ProfileLevelId,pl.Name as ProfileLevelName, " +
                " pc.Id ProfileCategoryId,pc.Name as ProfileCategoryName,row_number() over(PARTITION BY  s.id order by s.id asc) as RowNum , " +
                " case " +
                " when(pt.Id is not null and pl.Id is not null  and pc.Id is not null) then 3 ";
                if (ipsSkillFilter.ProfileLevelId > 0)
                {
                    filterQuery += " when(pt.Id is not null and pl.Id is not null and pl.Id = " + ipsSkillFilter.ProfileLevelId + "  and pc.Id is null) then 2 ";
                }
                if (ipsSkillFilter.ProfileCategoryId > 0)
                {
                    filterQuery += " when(pt.Id is not null and pl.Id is null  and pc.Id is not null and pc.Id = " + ipsSkillFilter.ProfileCategoryId + ") then 2 ";
                }
                filterQuery += " when(pt.Id is not null and pl.Id is null  and pc.Id is null) then 1 " +
                    " ELSE 1 " +
                    " END AS Priority" +
                    " from profiles p " +
                    " left join ProfileTypes pt on pt.Id = p.ProfileTypeId " +
                    " left join StructureLevels pl on pl.Id = p.LevelId " +
                    " left join ProfileCategories pc on pc.Id = p.CategoryId " +
                    " join PerformanceGroups pg on pg.ProfileId = p.Id " +
                    " join Link_PerformanceGroupSkills lpg on pg.Id = lpg.PerformanceGroupId " +
                    " join Skills s on s.Id = lpg.SkillId " +
                    " where s.IsActive = 1 ";

                if (ipsSkillFilter.ProfileTypeId > 0)
                {
                    filterQuery += " and  ";
                    filterQuery += " p.ProfileTypeId = " + ipsSkillFilter.ProfileTypeId;
                }

                filterQuery += " and  ";
                List<string> profileFilters = new List<string>();
                if (ipsSkillFilter.ProfileCategoryId > 0)
                {
                    profileFilters.Add(" p.CategoryId = " + ipsSkillFilter.ProfileCategoryId);
                }

                if (ipsSkillFilter.ProfileLevelId > 0)
                {
                    profileFilters.Add(" p.LevelId = " + ipsSkillFilter.ProfileLevelId);
                }

                string groupedprofileFilters = string.Join(" or ", profileFilters);

                filterQuery += " (" + groupedprofileFilters + ") ";

                filterQuery += "order by  Id,ProfileTypeId,ProfileLevelId,ProfileCategoryId";
                filteredSkills = _ipsDataContext.Database.SqlQuery<IpsFilterSkillResultModel>(filterQuery).ToList();
                var list = filteredSkills.GroupBy(x => x.Id)
                    .SelectMany(grouping => grouping.OrderByDescending(item => item.RowNum).Take(1))
                    .ToList();
                filteredSkills = list.Where(x => x.Priority > 1).ToList();
            }
            return filteredSkills;
        }

        public IQueryable<Skill> GetById(int id)
        {
            return _ipsDataContext.Skills.Where(s => s.Id == id).AsQueryable();
        }

        public Skill GetSkillById(int id)
        {
            return _ipsDataContext.Skills.Where(s => s.Id == id).FirstOrDefault();
        }
        public Skill Add(Skill skill)
        {
            skill.Link_PerformanceGroupSkills = null;
            skill.Skills1 = null;
            skill.Questions = null;
            skill.Trainings = null;
            skill.Organization = null;
            skill.ProfileType = null;
            skill.StructureLevel = null;
            if (skill.IsActive == null)
            {
                skill.IsActive = true;
            }

            List<Industry> industries = new List<Industry>(skill.Industries);
            skill.Industries.Clear();

            List<JobPosition> jobPositions = new List<JobPosition>();
            foreach (JobPosition jp in skill.JobPositions)
            {
                JobPosition jobPosition = _ipsDataContext.JobPositions.Where(j => j.Id == jp.Id).FirstOrDefault();
                jobPositions.Add(jobPosition);
            }
            skill.JobPositions = jobPositions;
            skill.CreatedBy = _authService.GetCurrentUserId();
            skill.CreatedOn = DateTime.Now;

            skill = _ipsDataContext.Skills.Add(skill);

            _ipsDataContext.SaveChanges();

            foreach (Industry industry in industries)
            {
                Industry industryDB = _ipsDataContext.Industries.Include("Skills").Where(i => i.Id == industry.Id).FirstOrDefault();
                if (!industryDB.Skills.Contains(skill))
                {
                    industryDB.Skills.Add(skill);
                }
            }

            _ipsDataContext.SaveChanges();

            return skill;

        }


        public bool Update(Skill skill)
        {


            var original = _ipsDataContext.Skills.Include("JobPositions").Include("Industries").Where(s => s.Id == skill.Id).SingleOrDefault();

            if (original != null)
            {

                skill.ModifiedOn = DateTime.Now;
                skill.ModifiedBy = _authService.GetCurrentUserId();
                _ipsDataContext.Entry(original).CurrentValues.SetValues(skill);

                original.JobPositions.Clear();
                foreach (JobPosition jobPosition in skill.JobPositions)
                {
                    JobPosition jobPositionDb = _ipsDataContext.JobPositions.Where(jp => jp.Id == jobPosition.Id).FirstOrDefault();
                    original.JobPositions.Add(jobPositionDb);
                }

                foreach (Industry dBIndustry in original.Industries)
                {
                    Industry currentIndustry = _ipsDataContext.Industries.Include("Skills").Where(i => i.Id == dBIndustry.Id).FirstOrDefault();
                    currentIndustry.Skills.Remove(original);
                }

                foreach (Industry dBIndustry in skill.Industries)
                {
                    Industry industry = _ipsDataContext.Industries.Include("Skills").Where(s => s.Id == dBIndustry.Id).FirstOrDefault();
                    industry.Skills.Add(original);

                }

                _ipsDataContext.SaveChanges();
            }

            return true;

        }

        public void Delete(Skill skill)
        {
            Skill original = _ipsDataContext.Skills.Include("Industries").Include("Questions").Where(s => s.Id == skill.Id).FirstOrDefault();
            if (original != null)
            {
                List<JobPosition> jobPositions = _ipsDataContext.Skills.Include("JobPositions").Where(pg => pg.Id == skill.Id).FirstOrDefault().JobPositions.ToList();
                jobPositions.Clear();

                foreach (Industry industry in original.Industries)
                {
                    Industry dbIndustry = _ipsDataContext.Industries.Include("Skills").Where(s => s.Id == industry.Id).FirstOrDefault();
                    dbIndustry.Skills.Remove(original);
                }
                skill.Questions.Clear();
                _ipsDataContext.Skills.Remove(skill);
                _ipsDataContext.SaveChanges();
            }
        }
        public IQueryable<Skill> SkillFilter(IpsSkillFilter ipsSkillFilter)
        {
            List<Skill> filteredSkills = new List<Skill>();

            filteredSkills = _ipsDataContext.Skills.Include("Industries").Include("JobPositions").Include("Link_PerformanceGroupSkills").Where(s => s.IsActive == ipsSkillFilter.IsActive).ToList();

            if (ipsSkillFilter.OrganizationId > 0 && filteredSkills.Count > 0)
            {
                filteredSkills = filteredSkills.Where(fq => fq.OrganizationId == ipsSkillFilter.OrganizationId).ToList();
            }

            if (ipsSkillFilter.StructureLevelId > 0 && filteredSkills.Count > 0)
            {

                filteredSkills = filteredSkills.Where(fq => fq.StructureLevelId == ipsSkillFilter.StructureLevelId).ToList();
            }

            List<Skill> skillListFilteredByIndustries = new List<Skill>();

            if (ipsSkillFilter.Industries != null && ipsSkillFilter.Industries.Length > 0 && filteredSkills.Count > 0)
            {

                Hashtable industriesForFilter = new Hashtable(); // will contain industryId which come for filter

                foreach (int industryId in ipsSkillFilter.Industries)
                {
                    industriesForFilter.Add(industryId, "");
                }

                foreach (Skill skill in filteredSkills)
                {
                    foreach (Industry currentIndustry in skill.Industries)
                    {
                        if (industriesForFilter.ContainsKey(currentIndustry.Id))
                        {
                            skillListFilteredByIndustries.Add(skill);
                            break;
                        }
                    }
                }

                filteredSkills = skillListFilteredByIndustries;
            }

            List<Skill> skillListFilteredByPerformanceGroup = new List<Skill>();
            if (ipsSkillFilter.PerformanceGroupId > 0 && filteredSkills.Count > 0)
            {
                foreach (Skill skill in filteredSkills)
                {
                    foreach (Link_PerformanceGroupSkills lpgs in skill.Link_PerformanceGroupSkills)
                    {

                        if (lpgs.PerformanceGroupId == ipsSkillFilter.PerformanceGroupId)
                        {
                            skillListFilteredByPerformanceGroup.Add(skill);
                            break;
                        }
                    }
                }
                filteredSkills = skillListFilteredByPerformanceGroup;

            }


            if (ipsSkillFilter.JobPositions != null && ipsSkillFilter.JobPositions.Length > 0 && filteredSkills.Count > 0)
            {
                List<Skill> skillListFilteredByJobPosition = new List<Skill>();

                Hashtable jobPositionsForFilter = new Hashtable(); // will contain jobPosititonId which come for filter

                foreach (int jobPositionId in ipsSkillFilter.JobPositions)
                {
                    jobPositionsForFilter.Add(jobPositionId, "");
                }

                foreach (Skill skill in filteredSkills)
                {


                    foreach (JobPosition currentJobPosition in skill.JobPositions)
                    {
                        if (jobPositionsForFilter.ContainsKey(currentJobPosition.Id))
                        {
                            skillListFilteredByJobPosition.Add(skill);
                            break;
                        }
                    }
                }

                filteredSkills = skillListFilteredByJobPosition;
            }

            int[] skillIds = filteredSkills.Select(q => q.Id).ToArray();

            return _ipsDataContext.Skills.Where(s => skillIds.Contains(s.Id)).AsNoTracking().AsQueryable();

        }

        public Skill CloneSkill(int skillId)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    string copyName = _ipsDataContext.Skills
                        .Where(s => s.Id == skillId)
                        .Select(s => s.Name).FirstOrDefault() + " clone"; ;
                    if (_ipsDataContext.Skills.Where(s => s.Name == copyName).Count() > 0)
                    {
                        int i = 1;
                        while (true)
                        {
                            if (_ipsDataContext.Skills.Where(s => s.Name == copyName + i.ToString()).Count() == 0)
                            {
                                copyName = copyName + i.ToString();
                                break;
                            }
                            i++;
                        }
                    }
                    var newSkill = CreateCopySkill(_ipsDataContext, skillId, copyName);
                    dbContextTransaction.Commit();
                    return newSkill;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public Skill CreateCopySkill(IPSData dataContext, int skillId, string copyName)
        {

            Skill skillDb = dataContext.Skills
                .Include(s => s.Industries)
                .Where(s => s.Id == skillId)
                .FirstOrDefault();

            Skill newSkill = new Skill();

            newSkill.Id = skillDb.Id;
            newSkill.Name = copyName;
            newSkill.Description = skillDb.Description;
            newSkill.ParentId = skillDb.ParentId;
            newSkill.OrganizationId = skillDb.OrganizationId;
            newSkill.IsTemplate = skillDb.IsTemplate;
            newSkill.StructureLevelId = skillDb.StructureLevelId;
            newSkill.IsActive = skillDb.IsActive;
            newSkill.ProfileTypeId = skillDb.ProfileTypeId;
            newSkill.Industries = skillDb.Industries;
            newSkill.CreatedBy = _authService.GetCurrentUserId();
            newSkill.CreatedOn = DateTime.Now;
            dataContext.Skills.Add(newSkill);
            dataContext.SaveChanges();

            return newSkill;
        }

        public bool IsSkillExist(int skillId)
        {
            return _ipsDataContext.Skills.Any(s => s.Id == skillId);
        }


        public List<IpsSkillDDL> getSkillsByProfileId(int profileId)
        {
            List<IpsSkillDDL> result = new List<IpsSkillDDL>();
            result = (from p in _ipsDataContext.Profiles
                      join pg in _ipsDataContext.PerformanceGroups on p.Id equals pg.ProfileId
                      join lpgs in _ipsDataContext.Link_PerformanceGroupSkills on pg.Id equals lpgs.PerformanceGroupId
                      join s in _ipsDataContext.Skills on lpgs.SkillId equals s.Id
                      where p.Id == profileId
                      select new IpsSkillDDL
                      {
                          Id = s.Id,
                          Name = s.Name,
                          Description = s.Description,
                          PerformanceGroupId = pg.Id,
                          PerformanceGroupName = pg.Name,
                          ProfileId = p.Id,
                          ProfileName = p.Name,
                          SeqNo = s.SeqNo,
                      }).Distinct().OrderBy(x => x.Id).ToList();

            return result;
        }


        public List<IpsProfileSkillModel> getProfileSkills(int profileId)
        {
            List<IpsProfileSkillModel> result = new List<IpsProfileSkillModel>();
            result = (from p in _ipsDataContext.Profiles
                      join pg in _ipsDataContext.PerformanceGroups on p.Id equals pg.ProfileId
                      join lpgs in _ipsDataContext.Link_PerformanceGroupSkills on pg.Id equals lpgs.PerformanceGroupId
                      join s in _ipsDataContext.Skills on lpgs.SkillId equals s.Id
                      where p.Id == profileId
                      select new IpsProfileSkillModel
                      {
                          Id = s.Id,
                          Name = s.Name,
                          Description = s.Description,
                          PerformanceGroupId = pg.Id,
                          PerformanceGroupName = pg.Name,
                          ProfileId = p.Id,
                          ProfileName = p.Name,
                          SeqNo = s.SeqNo,
                          Action = lpgs.Action,
                          Benchmark = lpgs.Benchmark,
                          CSF = lpgs.CSF,
                          Weight = lpgs.Weight
                      }).Distinct().OrderBy(x => x.Id).ToList();

            return result;
        }

        public List<IpsSkillDDL> getSkillsByProspectingGoalId(int prospectingGoalId)
        {
            List<IpsSkillDDL> result = new List<IpsSkillDDL>();
            result = (from g in _ipsDataContext.ProspectingGoalInfoes
                      join gs in _ipsDataContext.ProspectingSkillGoals on g.Id equals gs.ProspectingGoalId
                      join s in _ipsDataContext.Skills on gs.SkillId equals s.Id
                      where g.Id == prospectingGoalId
                      select new IpsSkillDDL
                      {
                          Id = s.Id,
                          Name = s.Name,
                          SeqNo = s.SeqNo,
                      }).Distinct().OrderBy(x => x.Id).ToList();

            return result;
        }
    }
}

using IPS.Data;
using System;
using System.Linq;
using IPS.BusinessModels.Entities;
using System.Collections.Generic;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.SkillModels;

namespace IPS.Business
{
    public interface ISkillsService
    {
        Skill Add(Skill skill);
        void Delete(Skill answer);
        IQueryable<Skill> Get();
        List<IpsSkillDDL> GetDDL(IpsSkillFilter ipsSkillFilter);
        List<IpsSkillDDL> GetTrainingsSkills();
        IQueryable<Skill> GetSkillsWithTrainings();
        IQueryable<Skill> GetById(int id);
        Skill GetSkillById(int id);
        bool Update(Skill skill);
        IQueryable<Skill> SkillFilter(IpsSkillFilter ipsQuestionFilter);
        Skill CloneSkill(int skillId);
        Skill CreateCopySkill(IPSData dataContext, int skillId, string copyName);
        IQueryable<Skill> GetByOrganisation(int organisationID);
        List<IpsSkillDDL> GetFilteredSkill(IpsSkillFilter ipsSkillFilter);
        List<string> GetSkillCSFList(int skillId);
        List<string> GetSkillActionList(int skillId);
        List<IPSDropDown> GetDDL();
        bool IsSkillExist(int skillId);
        List<IpsFilterSkillResultModel> GetFilteredProfileSkill(IpsSkillFilter ipsSkillFilter);
        List<IpsSkillDDL> getSkillsByProfileId(int profileId);
        List<IpsProfileSkillModel> getProfileSkills(int profileId);

        List<IpsSkillDDL> getSkillsByProspectingGoalId(int prospectingGoalId);
    }
}

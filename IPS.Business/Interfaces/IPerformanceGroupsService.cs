using IPS.Data;
using IPS.BusinessModels.Entities;
using System.Linq;
using System.Collections.Generic;

namespace IPS.Business
{
    public interface IPerformanceGroupService
    {
        PerformanceGroup Add(PerformanceGroup question);
        bool Delete(PerformanceGroup question);
        IQueryable<PerformanceGroup> Get(int? profileTypeId = null);
        List<IpsPerformanceGroup> GetPerformanceGroupsWithProfile();
        IQueryable<PerformanceGroup> GetById(int id);
        void Update(PerformanceGroup question);
        //IQueryable<Skill> GetSkillById(int id);
        bool AddSkillToPerformanceGroup(int performanceGroupId, int[] skills);
        //bool UpdateSkillInPerformanceGroup(int performanceGroupId, int[] skills);
        bool UpdateSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills);
        List<Link_PerformanceGroupSkills> UpdateNewSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills);
        bool RemoveSkillFromPerformanceGroup(int performanceGroupId, int[] skills);
        bool AddTrainingToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings);
        bool UpdateTrainingInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings);
        bool RemoveTrainingFromPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings);
        bool AddQuestionToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions);
        void UpdateQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions);
        List<IpsPerformanceGroupSkillQuestion> UpdateNewQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions);
        bool RemoveQuestionFromPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions);
        bool RemoveSkillFromPerformanceGroup(int performanceGroupId, int skillsID);
        PerformanceGroup CreateCopy(PerformanceGroup performanceGroupId, string copyName);
        PerformanceGroup ClonePerformanceGroup(PerformanceGroup performanceGroup, string namePattern);
        List<PerformanceGroup> getPerformanceGroupTemplates(int projectId);
    }
}

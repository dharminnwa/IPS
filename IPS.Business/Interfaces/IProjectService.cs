using System.Linq;
using IPS.Data;
using System.Collections.Generic;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.SalesActivityModels;

namespace IPS.Business.Interfaces
{
    public interface IProjectService
    {
        IpsProjectModel Add(IpsProjectModel project);
        int Update(IpsProjectModel project);
        bool Delete(Project project);
        List<IpsProjectListModel> Get();
        Project GetById(int id);
        int Update(Project project);
        IpsUserProjects getOrganizationProjects(int organizationId);
        IpsProjectModel GetProjectById(int projectId);
        IpsProjectModel GetProjectByProfileId(int profileId);
        IPSUserStatsModel GetUserInfo(int userId);
        IpsUserProjects GetUserProjects();
        IpsUserProjects GetTaskProspectingProjects();
        IpsUserProjects GetServiceProspectingProjects();
        bool IsProjectInUse(int projectId);
        bool StartProject(int id);
        bool SendStageParticipantReminder(int stageId, int participantId);
        bool SendStageEvaluationReminder(int stageId, int participantId);

        bool IsProjectActive(int projectId);
        IpsProjectStatusModel GetProjectStatus(int projectId);
        List<ProspectingGoalResultModel> getSalesActivityData(int profileId);
        List<UserSalesActivityResultDataModel> getUserSalesActivityData(int profileId, int userId);
        IpsUserProjects GetProjectsbyUserId(int userId);
        List<ProspectingGoalResultModel> getUserAggregatedSalesActivityData(int profileId, int userId);
        List<ProspectingSkillResultModel> getProspectingSkillResultByGoalId(int prospectingGoalId, int skillId);
        List<Link_ProjectUsers> getProjectMembers(int projectId);
        List<Link_ProjectUsers> getTaskProspectingProjectMembers(int projectId);
        List<Link_ProjectUsers> getServiceProspectingProjectMembers(int projectId);
        List<IpsProjectTaskModel> GetProjectTask(int projectId);
        List<ProspectingGoalResultModel> getProjectTaskAggregatedActivityData(int projectId);
        List<ProspectingCustomerModel> GetProjectCustomers(int projectId);
        List<ProspectingFollowupCustomerModel> getProjectFollowupCustomers(int projectId);
        
        int AssignUserToCustomer(int customerId, int userId);
    }
}
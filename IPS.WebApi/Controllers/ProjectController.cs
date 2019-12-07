using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProjectRoleModels;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.TrainingDiaryModels;
using System.Net;
using System.Data.Entity.Infrastructure;
using log4net;
using IPS.BusinessModels.SalesActivityModels;
using IPS.WebApi.Filters;
using IPS.AuthData.Models;

namespace IPS.WebApi.Controllers
{
    public class ProjectController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IProjectService _service;
        private readonly IProjectRolesService _projectRolesService;
        public ProjectController(IProjectService service, IProjectRolesService projectRolesService)
        {
            _service = service;
            _projectRolesService = projectRolesService;
        }
        [HttpPost]
        [Route("api/projects/save")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Create)]
        public IpsProjectModel Add(IpsProjectModel project)
        {
            return _service.Add(project);
        }

        [HttpPost]
        [Route("api/projects/update")]
        public int update(IpsProjectModel project)
        {
            return _service.Update(project);
        }

        [HttpGet]
        [Route("api/projects/getProjects/")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<IpsProjectListModel> GetProjects()
        {
            return _service.Get();
        }

        [HttpGet]
        [Route("api/projects/getOrganizationProjects/{organzationId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read)]
        public IpsUserProjects getOrganizationProjects(int organzationId)
        {
            return _service.getOrganizationProjects(organzationId);
        }

        [HttpGet]
        [Route("api/projects/getProjectById/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public IpsProjectModel GetProjectById(int projectId)
        {
            return _service.GetProjectById(projectId);
        }

        [HttpGet]
        [Route("api/projects/getProjectByProfileId/{profileId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read)]
        public IpsProjectModel GetProjectByProfileId(int profileId)
        {
            return _service.GetProjectByProfileId(profileId);
        }

        [HttpGet]
        [Route("api/projects/GetUserInfo/{userId}")]
        public IPSUserStatsModel GetUserInfo(int userId)
        {
            return _service.GetUserInfo(userId);
        }

        [HttpGet]
        [Route("api/projects/GetProjectRoles")]
        public List<IpsProjectRoleModel> GetProjectRoles()
        {
            return _projectRolesService.Get();
        }

        [Route("api/projects/is_in_use/{id}")]
        [HttpGet]
        public bool IsProjectInUse(int id)
        {
            return _service.IsProjectInUse(id);
        }

        [HttpDelete]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Delete)]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                Project project = _service.GetById(id);
                if (project == null)
                {
                    return NotFound();
                }

                _service.Delete(project);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateConcurrencyException DBex)
            {
                return BadRequest(DBex.Message);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Profile was not deleted due to server error");
            }
        }


        [Route("api/project/Start/{id}")]
        [HttpGet]
        public bool StartProject(int id)
        {
            return _service.StartProject(id);
        }

        [HttpGet]
        [Route("api/projects/GetUserProjects")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read)]
        public IpsUserProjects GetUserProjects()
        {
            return _service.GetUserProjects();
        }

        [HttpGet]
        [Route("api/projects/GetTaskProspectingProjects")]
        public IpsUserProjects GetTaskProspectingProjects()
        {
            return _service.GetTaskProspectingProjects();
        }

        [HttpGet]
        [Route("api/projects/GetServiceProspectingProjects")]
        public IpsUserProjects GetServiceProspectingProjects()
        {
            return _service.GetServiceProspectingProjects();
        }

        [HttpGet]
        [Route("api/project/GetProjectStatus/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public IpsProjectStatusModel GetProjectStatus(int projectId)
        {
            return _service.GetProjectStatus(projectId);
        }

        [HttpGet]
        [Route("api/project/SendStageParticipantReminder/{stageId}/{participantId}")]
        public bool SendStageParticipantReminder(int stageId, int participantId)
        {
            return _service.SendStageParticipantReminder(stageId, participantId);
        }

        [HttpGet]
        [Route("api/project/SendStageEvaluationReminder/{stageId}/{evaluatorId}")]
        public bool SendStageEvaluationReminder(int stageId, int evaluatorId)
        {
            return _service.SendStageEvaluationReminder(stageId, evaluatorId);
        }

        [HttpGet]
        [Route("api/project/getSalesActivityData/{profileId}")]
        public List<ProspectingGoalResultModel> getSalesActivityData(int profileId)
        {
            return _service.getSalesActivityData(profileId);
        }

        [HttpGet]
        [Route("api/project/getUserSalesActivityData/{profileId}/{userId}")]
        public List<UserSalesActivityResultDataModel> getUserSalesActivityData(int profileId, int userId)
        {
            return _service.getUserSalesActivityData(profileId, userId);
        }

        [HttpGet]
        [Route("api/projects/GetProjectsbyUserId/{userId}")]
        public IpsUserProjects GetProjectsbyUserId(int userId)
        {
            return _service.GetProjectsbyUserId(userId);
        }

        [HttpGet]
        [Route("api/project/getUserAggregatedSalesActivityData/{profileId}/{userId}")]
        public List<ProspectingGoalResultModel> getUserAggregatedSalesActivityData(int profileId, int userId)
        {
            return _service.getUserAggregatedSalesActivityData(profileId, userId);
        }

        [HttpGet]
        [Route("api/project/getProspectingSkillResultByGoalId/{prospectingGoalId}/{skillId}")]
        public List<ProspectingSkillResultModel> getProspectingSkillResultByGoalId(int prospectingGoalId, int skillId)
        {
            return _service.getProspectingSkillResultByGoalId(prospectingGoalId, skillId);
        }

        [HttpGet]
        [Route("api/project/getProjectMembers/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<Link_ProjectUsers> getProjectMembers(int projectId)
        {
            return _service.getProjectMembers(projectId);
        }

        [HttpGet]
        [Route("api/project/getTaskProspectingProjectMembers/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<Link_ProjectUsers> getTaskProspectingProjectMembers(int projectId)
        {
            return _service.getTaskProspectingProjectMembers(projectId);
        }

        [HttpGet]
        [Route("api/project/getServiceProspectingProjectMembers/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<Link_ProjectUsers> getServiceProspectingProjectMembers(int projectId)
        {
            return _service.getServiceProspectingProjectMembers(projectId);
        }

        [HttpGet]
        [Route("api/project/GetProjectTask/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<IpsProjectTaskModel> GetProjectTask(int projectId)
        {
            return _service.GetProjectTask(projectId);
        }

        [HttpGet]
        [Route("api/project/GetProjectAggregatedData/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<ProspectingGoalResultModel> GetProjectAggregatedData(int projectId)
        {
            return _service.getProjectTaskAggregatedActivityData(projectId);
        }

        [HttpGet]
        [Route("api/project/GetProjectCustomers/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<ProspectingCustomerModel> GetProjectCustomers(int projectId)
        {
            return _service.GetProjectCustomers(projectId);
        }

        [HttpGet]
        [Route("api/project/getProjectFollowupCustomers/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<ProspectingFollowupCustomerModel> getProjectFollowupCustomers(int projectId)
        {
            return _service.getProjectFollowupCustomers(projectId);
        }

        [HttpGet]
        [Route("api/project/AssignUserToCustomer/{customerId}/{userId}")]
        public int AssignUserToCustomer(int customerId, int userId)
        {
            return _service.AssignUserToCustomer(customerId, userId);
        }
    }
}
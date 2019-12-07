using IPS.AuthData.Models;
using IPS.Business;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.SalesActivityModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.TaskModels;
using IPS.Data;
using IPS.WebApi.Filters;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class ProfilesController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IProfileService _profileService;
        private readonly IKTMedalRuleService _ktMedalRuleService;
        private IProfileTypeService _profileTypeService;
        private IProjectService _projectService;
        public ProfilesController(IProfileService profileService, IKTMedalRuleService ktMedalRuleService, IProfileTypeService profileTypeService, IProjectService projectService)
        {
            _profileService = profileService;
            _ktMedalRuleService = ktMedalRuleService;
            _profileTypeService = profileTypeService;
            _projectService = projectService;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 5)]
        public IQueryable<Profile> GetProfiles()
        {
            return _profileService.Get();
        }

        [EnableQuery(MaxExpansionDepth = 5)]
        [ResourcePermisionAuthorize(ResourceKey = "profiles", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public SingleResult<Profile> GetProfile(int id)
        {
            SingleResult<Profile> result = SingleResult.Create(_profileService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Profile profile)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            ManageMedalRule(profile);
            Profile result = _profileService.Add(profile);

            return Ok(profile.Id);

        }


        [Route("api/profiles/GetProjectProfiles/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "profiles", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        [HttpGet]
        public List<IpsProjectProfileModel> GetProjectProfiles(int projectId)
        {
            try
            {   //return Ok(profile.Id);
                List<IpsProjectProfileModel> result = _profileService.GetProjectProfiles(projectId);
                return result;
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return null;//BadRequest("Profile was not saved due to server error");
            }
        }


        [Route("api/profiles/addProfile")]
        [HttpPost]
        [ResourcePermisionAuthorize(ResourceKey = "Profiles", OperationKey = Operations.Create)]
        public Profile AddProfile(Profile profile)
        {
            try
            {   //return Ok(profile.Id);
                Profile result = _profileService.AddProfile(profile);
                return result;
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return null;//BadRequest("Profile was not saved due to server error");
            }
        }


        private void ManageMedalRule(Profile profile)
        {
            if (profile.MedalRuleId.HasValue)
            {
                _ktMedalRuleService.Update(profile.KTMedalRule);
            }
            else
            {
                if (!string.IsNullOrEmpty(profile.KTMedalRule?.Name))
                {
                    profile.KTMedalRule = _ktMedalRuleService.Add(profile.KTMedalRule);
                    profile.MedalRuleId = profile.KTMedalRule.Id;
                }
            }
        }

        [HttpPut]
        [ResourcePermisionAuthorize(ResourceKey = "Profiles", OperationKey = Operations.Update)]
        public IHttpActionResult Update(Profile profile)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Profile obj = _profileService.GetById(profile.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                ManageMedalRule(profile);
                _profileService.Update(profile);

                return Ok();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpDelete]
        [ResourcePermisionAuthorize(ResourceKey = "Profiles", OperationKey = Operations.Delete)]
        public IHttpActionResult Delete(int id)
        {
            try
            {
                Profile profile = _profileService.GetById(id).FirstOrDefault();
                if (profile == null)
                {
                    return NotFound();
                }

                _profileService.Delete(profile);

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

        [Route("api/profiles/clone/{id}/{projectId?}")]
        [HttpPost]
        [ResourcePermisionAuthorize(ResourceKey = "Profiles", OperationKey = Operations.Create)]
        public IHttpActionResult CloneProfile(int Id, int? projectId)
        {
            try
            {
                Profile profileDB = _profileService.GetById(Id).FirstOrDefault();

                if (profileDB == null)
                {
                    return NotFound();
                }
                string newProfileName = profileDB.Name + " clone";
                Profile profile = _profileService.CloneProfile(profileDB, newProfileName, projectId);

                //return Ok(profile.Id);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Profile was not cloned due to server error");
            }
        }

        [Route("api/profiles/{profileId}/performance_groups/copy_from")]
        [HttpPost]
        public IHttpActionResult AddPerformanceGroupToProfileFromTemplate(int profileId, PerformanceGroup[] performanceGroups)
        {
            try
            {
                Profile profileDB = _profileService.GetById(profileId).FirstOrDefault();

                if (profileDB == null)
                {
                    return NotFound();
                }
                _profileService.AddPerformanceGroupToProfileFromTemplate(profileId, performanceGroups);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Performance groups were not added due to server error");
            }
        }

        [Route("api/profiles/is_in_use/{id}")]
        [HttpGet]
        public bool IsProfileInUse(int id)
        {
            return _profileService.IsProfileInUse(id);
        }


        [Route("api/profiles/{profileId}/type")]
        [HttpGet]
        public int GetProfileTypeByProfileId(int profileId)
        {
            return _profileTypeService.GetProfileTypeByProfileId(profileId);
        }

        [Route("api/profiles/{profileId}/stagegroups")]
        [HttpGet]
        public List<IPSDropDown> GetProfileStageGroupsByProfileId(int profileId)
        {
            return _profileService.GetProfileStageGroupsByProfileId(profileId);
        }

        [Route("api/profiles/getProfileTemplates/{projectId}/{profileTypeId}")]
        [HttpGet]
        [ResourcePermisionAuthorize(ResourceKey = "Profiles", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        public List<Profile> getProfileTemplates(int projectId, int profileTypeId)
        {
            return _profileService.getProfileTemplates(projectId, profileTypeId);
        }

        [Route("api/profiles/getTemplateProfileById/{id}")]
        [HttpGet]
        public Profile getTemplateProfileById(int id)
        {
            return _profileService.getTemplateProfileById(id);
        }

        [Route("api/profiles/getFullProfileById/{id}")]
        [HttpGet]
        public Profile getFullProfileById(int id)
        {
            return _profileService.getFullProfileById(id);
        }

        [Route("api/profiles/changeProfileStatus/{profileId}")]
        [HttpPost]
        public bool ChangeProfileStatus(int profileId)
        {
            return _profileService.ChangeProfileStatus(profileId);
        }

        [Route("api/profiles/addProspectingGoal")]
        [HttpPost]
        public ProspectingGoalInfo AddProspectingGoal(ProspectingGoalInfo prospectingGoal)
        {
            return _profileService.AddProspectingGoal(prospectingGoal);
        }

        [Route("api/profiles/upadateProspectingGoal")]
        [HttpPost]
        public ProspectingGoalInfo UpadateProspectingGoal(ProspectingGoalInfo prospectingGoal)
        {
            return _profileService.UpadateProspectingGoal(prospectingGoal);
        }

        [Route("api/profiles/getProspectingGoals")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> GetProspectingGoals()
        {
            return _profileService.GetProspectingGoals();
        }


        [Route("api/profiles/GetProspectingGoalsByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> GetProspectingGoalsByUserId(int userId)
        {
            return _profileService.GetProspectingGoalsByUserId(userId);
        }

        [Route("api/profiles/GetProjectProspectingGoalsByUserId/{userId}/{projectId}")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> GetProjectProspectingGoalsByUserId(int userId, int projectId)
        {
            return _profileService.GetProjectProspectingGoalsByUserId(userId, projectId);
        }


        [Route("api/profiles/addProspectingCustomer")]
        [HttpPost]
        public ProspectingCustomer AddProspectingCustomer(ProspectingCustomer prospectingCustomer)
        {
            return _profileService.AddProspectingCustomer(prospectingCustomer);
        }

        [Route("api/profiles/upadateProspectingCustomer")]
        [HttpPost]
        public ProspectingCustomer UpadateProspectingCustomer(ProspectingCustomer prospectingCustomer)
        {
            return _profileService.UpadateProspectingCustomer(prospectingCustomer);
        }

        [Route("api/profiles/getProspectingCustomers")]
        [HttpGet]
        public List<ProspectingCustomerModel> GetProspectingCustomers()
        {
            return _profileService.GetProspectingCustomers();
        }

        [Route("api/profiles/getProspectingCustomersByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingCustomerModel> getProspectingCustomersByUserId(int userId)
        {
            return _profileService.GetProspectingCustomersByUserId(userId);
        }

        [Route("api/profiles/getProspectingCustomersByUserIds")]
        [HttpPost]
        public List<ProspectingCustomerModel> getProspectingCustomersByUserIds(List<int> userIds)
        {
            return _profileService.GetProspectingCustomersByUserIds(userIds);
        }




        [Route("api/profiles/getScaleRanges/{profileId}")]
        [HttpGet]
        public List<ScaleRange> getScaleRanges(int profileId)
        {
            return _profileService.getScaleRanges(profileId);
        }


        [Route("api/profiles/addProspectingGoalActivityInfo")]
        [HttpPost]
        public ProspectingGoalActivityInfo addProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo)
        {
            return _profileService.AddProspectingGoalActivityInfo(prospectingGoalActivityInfo);
        }

        [Route("api/profiles/updateProspectingGoalActivityInfo")]
        [HttpPost]
        public ProspectingGoalActivityInfo updateProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo)
        {
            return _profileService.UpdateProspectingGoalActivityInfo(prospectingGoalActivityInfo);
        }


        [Route("api/profiles/deleteProspectingActivity/{activityId}")]
        [HttpGet]
        public bool DeleteProspectingActivity(int activityId)
        {
            return _profileService.DeleteProspectingActivity(activityId);
        }

        [Route("api/profiles/GetProspectingGoalActivityInfoes")]
        [HttpGet]
        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoes()
        {
            return _profileService.GetProspectingGoalActivityInfoes();
        }

        [Route("api/profiles/GetProspectingGoalActivityInfoesByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserId(int userId)
        {
            return _profileService.GetProspectingGoalActivityInfoesByUserId(userId);
        }

        [Route("api/profiles/GetProspectingGoalActivityInfoesByUserIds")]
        [HttpPost]
        public List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserIds(List<int> userIds)
        {
            return _profileService.GetProspectingGoalActivityInfoesByUserIds(userIds);
        }



        [Route("api/profiles/getCustomerActivityResult/{activityId}/{customerId}")]
        [HttpGet]
        public List<ProspectingCustomerResult> getCustomerActivityResult(int activityId, int customerId)
        {
            return _profileService.getCustomerActivityResult(activityId, customerId);
        }

        [Route("api/profiles/GetCustomerSalesAgreedDatas/{activityId}/{customerId}")]
        [HttpGet]
        public List<ProspectingCustomerSalesAgreedData> GetCustomerSalesAgreedDatas(int activityId, int customerId)
        {
            return _profileService.GetCustomerSalesAgreedDatas(activityId, customerId);
        }

        [Route("api/profiles/saveCustomerActivityResult")]
        [HttpPost]
        public ProspectingCustomerResult saveCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult)
        {
            return _profileService.saveCustomerActivityResult(prospectingCustomerResult);
        }

        [Route("api/profiles/getProspectingCustomerResults")]
        [HttpGet]
        public List<ProspectingCustomerResult> getProspectingCustomerResults()
        {
            return _profileService.getProspectingCustomerResults();
        }


        [Route("api/profiles/getProspectingCustomerResultsByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingCustomerResult> getProspectingCustomerResultsByUserId(int userId)
        {
            return _profileService.getProspectingCustomerResultsByUserId(userId);
        }

        [Route("api/profiles/getServiceProspectingCustomerResultsByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserId(int userId)
        {
            return _profileService.getServiceProspectingCustomerResultsByUserId(userId);
        }

        [Route("api/profiles/getProspectingCustomerResultsByUserIds")]
        [HttpPost]
        public List<ProspectingCustomerResult> getProspectingCustomerResultsByUserIds(List<int> userIds)
        {
            return _profileService.getProspectingCustomerResultsByUserIds(userIds);
        }




        [Route("api/profiles/saveActivityLog")]
        [HttpPost]
        public ProspectingActivityLog saveActivityLog(ProspectingActivityLog ProspectingActivityLog)
        {
            return _profileService.saveActivityLog(ProspectingActivityLog);
        }
        [Route("api/profiles/saveProspectingActivity")]
        [HttpPost]
        public ProspectingActivity saveProspectingActivity(ProspectingActivity prospectingActivity)
        {
            return _profileService.saveProspectingActivity(prospectingActivity);
        }

        [Route("api/profiles/updateProspectingActivity")]
        [HttpPost]
        public ProspectingActivity updateProspectingActivity(ProspectingActivity prospectingActivity)
        {
            return _profileService.updateProspectingActivity(prospectingActivity);
        }

        [Route("api/profiles/restartProspectingActivity/{prospectingActivityId}")]
        [HttpGet]
        public bool restartProspectingActivity(int prospectingActivityId)
        {
            return _profileService.restartProspectingActivity(prospectingActivityId);
        }

        //[Route("api/profiles/deleteProspectingActivity/{prospectingActivityId}")]
        //[HttpGet]
        //public bool deleteProspectingActivity(int prospectingActivityId)
        //{
        //    return _profileService.deleteProspectingActivity(prospectingActivityId);
        //}

        [Route("api/profiles/uncheckCustomerActivityResult")]
        [HttpPost]
        public List<int> uncheckCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult)
        {
            return _profileService.uncheckCustomerActivityResult(prospectingCustomerResult);
        }


        [Route("api/profiles/getTaskProspectingGoals/{taskId}")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> getTaskProspectingGoals(int? taskId)
        {
            return _profileService.getTaskProspectingGoals(taskId);
        }

        [Route("api/profiles/getTaskProspectingActivities/{goalId}")]
        [HttpGet]
        public List<ProspectingActivity> getTaskProspectingActivities(int goalId)
        {
            return _profileService.getTaskProspectingActivities(goalId);
        }

        [Route("api/profiles/getProspectingScaleRangesByGoalId/{goalId}")]
        [HttpGet]
        public List<ProspectingGoalScaleRanx> getProspectingScaleRangesByGoalId(int goalId)
        {
            return _profileService.getProspectingScaleRangesByGoalId(goalId);
        }

        [Route("api/profiles/saveProspectingActivityFeedback")]
        [HttpPost]
        public ProspectingActivityFeedback saveProspectingActivityFeedback(ProspectingActivityFeedback prospectingActivityFeedback)
        {
            return _profileService.saveProspectingActivityFeedback(prospectingActivityFeedback);
        }

        [Route("api/profiles/getProspectingActivityFeedbackByActivityId/{activityId}")]
        [HttpGet]
        public ProspectingActivityFeedback getProspectingActivityFeedbackByActivityId(int activityId)
        {
            return _profileService.getProspectingActivityFeedbackByActivityId(activityId);
        }

        [Route("api/profiles/SaveActivityReason")]
        [HttpPost]
        public ExpiredProspectingActivityReason SaveActivityReason(ExpiredProspectingActivityReason expiredProspectingActivityReason)
        {
            return _profileService.SaveActivityReason(expiredProspectingActivityReason);
        }

        [Route("api/profiles/GetProjectServiceProspectingGoalsByUserId/{userId}/{projectId}")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> GetProjectServiceProspectingGoalsByUserId(int userId, int projectId)
        {
            return _profileService.GetProjectServiceProspectingGoalsByUserId(userId, projectId);
        }

        [Route("api/profiles/getServiceProspectingCustomersByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingCustomerModel> getServiceProspectingCustomersByUserId(int userId)
        {
            return _profileService.GetServiceProspectingCustomersByUserId(userId);
        }

        [Route("api/profiles/getServiceProspectingCustomersByUserIds")]
        [HttpPost]
        public List<ProspectingCustomerModel> getServiceProspectingCustomersByUserIds(List<int> userIds)
        {
            return _profileService.GetServiceProspectingCustomersByUserIds(userIds);
        }

        [Route("api/profiles/getServiceProspectingCustomerResultsByUserIds")]
        [HttpPost]
        public List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserIds(List<int> userIds)
        {
            return _profileService.getServiceProspectingCustomerResultsByUserIds(userIds);
        }

        [Route("api/profiles/getServiceProspectingGoalActivityInfoesByUserIds")]
        [HttpPost]
        public List<ProspectingGoalActivityInfoModel> getServiceProspectingGoalActivityInfoesByUserIds(List<int> userIds)
        {
            return _profileService.GetServiceProspectingGoalActivityInfoesByUserIds(userIds);
        }

        [Route("api/profiles/getServiceProspectingGoalsByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalInfoModel> GetServiceProspectingGoalsByUserId(int userId)
        {
            return _profileService.GetServiceProspectingGoalsByUserId(userId);
        }

        [Route("api/profiles/getServiceProspectingGoalActivityInfoesByUserId/{userId}")]
        [HttpGet]
        public List<ProspectingGoalActivityInfoModel> getServiceProspectingGoalActivityInfoesByUserId(int userId)
        {
            return _profileService.GetServiceProspectingGoalActivityInfoesByUserId(userId);
        }
    }
}


using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;
using IPS.Data.Enums;
using IPS.BusinessModels.ProfileModels;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class StageGroupsController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IStageGroupsService _stageGroupsService;

        public StageGroupsController(IStageGroupsService stageGroupsService)
        {
            _stageGroupsService = stageGroupsService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<StageGroup> GetStageGroup()
        {
            return _stageGroupsService.GetStageGroups();
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        public SingleResult<StageGroup> GetStageGroup(int id)
        {
            SingleResult<StageGroup> result = SingleResult.Create(_stageGroupsService.GetStageGroupById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(StageGroup stageGroup)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            StageGroup result = _stageGroupsService.AddStageGroup(stageGroup);

            return Ok(stageGroup.Id);
        }

        [HttpPut]
        public IHttpActionResult UpdateStageGroup(StageGroup stageGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StageGroup org = _stageGroupsService.GetStageGroupById(stageGroup.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _stageGroupsService.UpdateStageGroup(stageGroup);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPut]
        [Route("api/stagegroups/updateStageGroupBasicInfo")]
        public IHttpActionResult UpdateStageGroupBasicInfo(StageGroup stageGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StageGroup org = _stageGroupsService.GetStageGroupById(stageGroup.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _stageGroupsService.UpdateStageGroupBasicInfo(stageGroup);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpDelete]
        public IHttpActionResult DeleteStageGroup(int id)
        {
            StageGroup stageGroup = _stageGroupsService.GetStageGroupById(id).FirstOrDefault();
            if (stageGroup == null)
            {
                return NotFound();
            }

            bool result = _stageGroupsService.DeleteStageGroup(stageGroup);

            return Ok(result);
        }

        [Route("api/stagegroups/{stageGroupId}/participants")]
        [HttpPut]
        public IHttpActionResult UpdateParticipantsInStageGroup(int stageGroupId, IpsStageGroupParticipant[] stageGroupParticipants)
        {
            StageGroup stageGroup = _stageGroupsService.GetStageGroupById(stageGroupId).FirstOrDefault();
            if (stageGroup == null)
            {

                return NotFound();
            }

            bool result = _stageGroupsService.UpdateParticipantsInStageGroup(stageGroupId, stageGroupParticipants);

            return Ok(result);

        }

        [Route("api/stagegroups/participants/{stageGroupId}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetStageGroupParticipants(int stageGroupId)
        {
            return _stageGroupsService.GetParticipants(stageGroupId);
        }

        [Route("api/stagegroups/GetStageGroupEvaluation/{stageGroupId}")]
        [HttpGet]
        public List<IpsStageGroupEvaluation> GetStageGroupEvaluation(int stageGroupId)
        {
            return _stageGroupsService.GetStageGroupEvaluation(stageGroupId);
        }

        

        [Route("api/stagegroups/evaluators/{stageGroupId}")]
        [HttpGet]
        public List<IpsEvaluationUser> GetStageGroupEvaluators(int stageGroupId)
        {
            return _stageGroupsService.GetEvaluators(stageGroupId);
        }

        [Route("api/stagegroups/{stageGroupId}/StatusAndProgress/{stageId}")]
        [HttpGet]
        public List<IpsSurveyProgress> GetStatusAndProgress(int stageGroupId, int stageId, ProfileTypeEnum profileTypeId)
        {
            return _stageGroupsService.GetStatusAndProgress(stageGroupId, stageId, profileTypeId);
        }

        [Route("api/stagegroups/participant/{participantId}/{IsSelfEvaluation}")]
        [HttpPut]
        public IHttpActionResult selfEvaluationUpdate(int participantId, bool IsSelfEvaluation)
        {
            try
            {
                bool result = _stageGroupsService.selfEvaluationUpdate(participantId, IsSelfEvaluation);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participant was not updated due to server error");
            }
        }

        [Route("api/stagegroups/participant/{participantId}/lock/{IsLocked}")]
        [HttpPut]
        public IHttpActionResult LockUpdate(int participantId, bool IsLocked)
        {
            try
            {
                bool result = _stageGroupsService.LockUpdate(participantId, IsLocked);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participant was not updated due to server error");
            }
        }

        [Route("api/stagegroups/participant/{participantId}/scoreManager/{isScoreManager}")]
        [HttpPut]
        public IHttpActionResult ScoreManagerUpdate(int participantId, bool isScoreManager)
        {
            try
            {
                bool result = _stageGroupsService.ScoreManagerUpdate(participantId, isScoreManager);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participant was not updated due to server error");
            }
        }

        [Route("api/stagegroups/participant/{participantId}")]
        [HttpDelete]
        public IHttpActionResult RemoveParticipant(int participantId)
        {
            try
            {
                _stageGroupsService.RemoveParticipant(participantId);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participant was not deleted due to server error");
            }
        }

        [Route("api/stagegroups/{stageGroupId}/participants/{roleId}")]
        [HttpDelete]
        public IHttpActionResult RemoveAllParticipants(int stageGroupId, int? roleId)
        {
            try
            {
                _stageGroupsService.RemoveAllParticipants(stageGroupId, roleId);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participants was not deleted due to server error");
            }
        }

        [Route("api/stagegroups/stage/{stageId}/participant/{participantId}/answers")]
        [HttpDelete]
        public IHttpActionResult RemoveParticipantAnswers(int stageId, int participantId)
        {
            try
            {
                _stageGroupsService.ReopenParticipantAnswers(stageId, participantId);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Participant answers was not deleted due to server error");
            }

        }


        [Route("api/stagegroups/restartsoftprofile/{stageGroupId}/{participantId}")]
        [HttpPut]
        public IHttpActionResult RestartSoftProfile(int stageGroupId, int participantId, StageGroup newStageGroup)
        {
            StageGroup stageGroup = _stageGroupsService.GetStageGroupById(stageGroupId).FirstOrDefault();
            if (stageGroup == null)
            {

                return NotFound();
            }
            try
            {
                Profile newProfile = _stageGroupsService.RestartSoftProfile(stageGroupId, participantId, newStageGroup);
                IpsRestartProfile restartProfile = new IpsRestartProfile();
                restartProfile.ProfileId = newProfile.Id;
                restartProfile.ProfileTypeId = newProfile.ProfileTypeId;
                restartProfile.ProfileTypeName = newProfile.ProfileType.Name;
                restartProfile.StageGroupId = newProfile.StageGroups.FirstOrDefault().Id;
                return Ok(restartProfile);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Restart failed due to server error");
            }
        }

        [Route("api/stagegroups/restartprofile/{stageGroupId}")]
        [HttpPut]
        public IHttpActionResult UpdateParticipantsInStageGroup(int stageGroupId, StageGroup newStageGroup)
        {
            StageGroup stageGroup = _stageGroupsService.GetStageGroupById(stageGroupId).FirstOrDefault();
            if (stageGroup == null)
            {

                return NotFound();
            }
            try
            {
                _stageGroupsService.RestartProfile(stageGroupId, newStageGroup);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Restart failed due to server error");
            }
        }

        [Route("api/stagegroups/is_in_use/{id}")]
        [HttpGet]
        public bool IsStageGroupInUse(int id)
        {
            return _stageGroupsService.IsStageGroupInUse(id);
        }

        [Route("api/stagegroups/{id}/stagesstatus")]
        [HttpGet]
        public IpsStageStatusInfo[] GetStagesStatus(int id)
        {
            return _stageGroupsService.GetStagesStatus(id);
        }

        [Route("api/stagegroups/{stageId}/stagesinfo")]
        [HttpGet]
        public List<Stage> GetAllStageGroupStages(int stageId)
        {
            return _stageGroupsService.GetAllStageGroupStages(stageId);
        }

        [Route("api/stagegroups/{stageGroupId}/allstages")]
        [HttpGet]
        public List<Stage> GetAllStagesByStageGroupId(int stageGroupId)
        {
            return _stageGroupsService.GetAllStagesByStageGroupId(stageGroupId);
        }


        [Route("api/stagegroups/AddRecurrentTrainingSetting")]
        [HttpPost]
        public IpsRecurrentTrainingModel AddRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel)
        {
            return _stageGroupsService.AddRecurrentTrainingSetting(ipsRecurrentTrainingModel);
        }

        [Route("api/stagegroups/UpdateRecurrentTrainingSetting")]
        [HttpPut]
        public int UpdateRecurrentTrainingSetting(IpsRecurrentTrainingModel ipsRecurrentTrainingModel)
        {
            return _stageGroupsService.UpdateRecurrentTrainingSetting(ipsRecurrentTrainingModel);
        }
    }
}
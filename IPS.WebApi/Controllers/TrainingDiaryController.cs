using IPS.AuthData.Models;
using IPS.Business;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.TrainingModels;
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
    public class TrainingDiaryController : BaseController
    {
        private readonly IAuthService _authService;
        private readonly ITrainingDiaryService _trainingDiaryService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public TrainingDiaryController(IAuthService authService, ITrainingDiaryService trainingDiaryService)
        {
            _trainingDiaryService = trainingDiaryService;
            _authService = authService;
        }

        [Route("api/trainingdiary/GetActiveProfilesByUserKey/{userKey}")]
        [HttpGet]
        public List<IpsTrainingDiary> GetActiveProfilesByUserKey(string userKey)
        {
            var result = new List<IpsTrainingDiary>();
            var user = _authService.GetUserById(userKey);
            if (user != null)
            {
                result = _trainingDiaryService.GetUserActiveProfiles(user.User.Id);
            }
            return result;
        }


        [Route("api/trainingdiary/GetPassedProfilesByUserKey")]
        [HttpPost]
        public List<IpsTrainingDiary> GetPassedProfilesByUserKey(IpsProfileFilterModel ipsProfileFilterModel)
        {
            var result = new List<IpsTrainingDiary>();
            var user = _authService.GetUserById(ipsProfileFilterModel.UserKey);
            if (user != null)
            {
                result = _trainingDiaryService.GetUserPassedProfiles(user.User.Id, ipsProfileFilterModel.StartDate, ipsProfileFilterModel.EndDate);
            }
            return result;
        }



        [Route("api/trainingdiary/GetUserProfileStageTrainings/{userId}/{profileId}")]
        [HttpGet]
        public List<IpsTrainingDiary> GetUserProfileStageTrainings(int userId, int profileId)
        {
            return _trainingDiaryService.GetUserProfileStageTrainings(userId, profileId);
        }

        [Route("api/trainingdiary/GetUserTrainingsForTimeCalculation/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserTrainingsForTimeCalculation(int userId)
        {
            return _trainingDiaryService.GetUserTrainingsForTimeCalculation(userId);
        }

        [Route("api/trainingdiary/GetUserPersonalTrainingsForToday/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserPersonalTrainingsForToday(int userId)
        {
            return _trainingDiaryService.GetUserPersonalTrainingsForToday(userId);
        }

        [AllowAnonymous]
        [Route("api/trainingdiary/GetUserProfileTrainingsForToday/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserProfileTrainingsForToday(int userId)
        {
            return _trainingDiaryService.GetUserProfileTrainingsForToday(userId);
        }



        [Route("api/trainingdiary/GetProjectTrainings/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Projects", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        [HttpGet]
        public List<IpsProjectTrainingModel> GetProjectTrainings(int projectId)
        {
            return _trainingDiaryService.GetProjectTrainings(projectId);
        }


        [Route("api/trainingdiary/TrainingFeedback")]
        [HttpPost]
        public IHttpActionResult AddTrainingFeedback(TrainingFeedback trainingFeedback)
        {
            TrainingFeedback result = _trainingDiaryService.AddTrainingFeedback(trainingFeedback);
            return Ok(result);
        }

        [Route("api/trainingdiary/UpdateTrainingFeedback")]
        [HttpPost]
        public IHttpActionResult UpdateTrainingFeedback(TrainingFeedback trainingFeedback)
        {
            int result = _trainingDiaryService.UpdateTrainingFeedback(trainingFeedback);
            return Ok(result);
        }

        [Route("api/trainingdiary/GetTrainingFeedbacks/{trainingId}")]
        [HttpGet]
        public List<IPSTrainingFeedback> GetTrainingFeedbacks(int trainingId)
        {
            return _trainingDiaryService.getTrainingFeedbacks(trainingId);
        }

        [Route("api/trainingdiary/getTrainingNotes/{trainingId}")]
        [HttpGet]
        public List<IPSTrainingNote> GetTrainingNotes(int trainingId)
        {
            return _trainingDiaryService.getTrainingNotes(trainingId);
        }

        [Route("api/trainingdiary/TrainingFeedback/{trainingFeedbackId}")]
        [HttpGet]
        public IPSTrainingFeedback GetTrainingFeedbackById(int trainingFeedbackId)
        {
            return _trainingDiaryService.getTrainingFeedbackById(trainingFeedbackId);
        }

        [Route("api/trainingdiary/GetOwnTraining/{trainingId}/{statusId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetOwnTraining(int trainingId, int statusId)
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            if (trainingId > 0)
            {
                result = _trainingDiaryService.GetOwnTraining(trainingId, statusId);
            }
            return result;
        }

        [Route("api/trainingdiary/GetOwnTrainingCounts/{userId}")]
        [HttpGet]
        public IpsOwnTrainingsCounts GetOwnTrainingCounts(int userId)
        {
            IpsOwnTrainingsCounts result = new IpsOwnTrainingsCounts();
            if (userId > 0)
            {
                result = _trainingDiaryService.GetOwnTrainingCounts(userId);
            }
            return result;
        }

        [Route("api/trainingdiary/GetOrganizationParticipants/{organizationId}")]
        [HttpGet]
        public List<IPSParticipants> GetOrganizationParticipants(int organizationId)
        {
            List<IPSParticipants> result = new List<IPSParticipants>();
            if (organizationId > 0)
            {
                result = _trainingDiaryService.GetOrganizationParticipants(organizationId);
            }
            return result;
        }

        [Route("api/trainingdiary/SendTrainingNotification")]
        [HttpPost]
        public IHttpActionResult SendTrainingNotification(int trainingId, int participantId, string trainingType)
        {
            NotificationService ntfService = new NotificationService();
            ntfService.PushTrainingEmailNotification(trainingId, participantId, trainingType);
            return Ok();
        }

        [Route("api/trainingdiary/getEventsByUserId")]
        [HttpPost]
        public List<IpsCalenderEvents> getEventsByUserId(IpsCalenderEventFilterModel ipsCalenderEventFilterModel)
        {
            List<IpsCalenderEvents> result = new List<IpsCalenderEvents>();
            result = _trainingDiaryService.getCalanderEventsByUserId(ipsCalenderEventFilterModel);
            return result;
        }


        [Route("api/trainingdiary/setEventsByUserId")]
        [HttpPost]
        public int SetEventsByUserId(IpsCalenderEvents ipsCalenderEvent)
        {
            int result = 0;
            result = _trainingDiaryService.setEventsByUserId(ipsCalenderEvent);
            return result;
        }

        [Route("api/trainingdiary/SubmitTrainingMaterialRating")]
        [HttpPost]
        public int SubmitTrainingMaterialRating(TrainingMaterialRating trainingMaterialRating)
        {

            return _trainingDiaryService.SubmitTrainingMaterialRating(trainingMaterialRating);

        }

        [Route("api/trainingdiary/SendProfileEvalutionReminderNotificaition")]
        [HttpPost]
        public IHttpActionResult SendProfileEvalutionReminderNotificaition(int profileId, int stageid, int participantId)
        {
            NotificationService ntfService = new NotificationService();
            bool result = ntfService.EvalutionReminderNotificaition(profileId, stageid, participantId);
            return Ok(result);
        }

        [HttpGet]
        [Route("api/trainingdiary/GetUserStats/{userId}")]
        public IPSUserStatsModel GetUserStats(int userId)
        {
            return _trainingDiaryService.GetUserStats(userId);
        }


        [HttpPost]
        [Route("api/trainingdiary/RecurrenceTaskCompleted")]
        public IHttpActionResult RecurrenceTaskCompleted(TaskActivity taskActivity)
        {
            return Ok(_trainingDiaryService.AddTaskActivity(taskActivity));
        }


        [HttpPost]
        [Route("api/trainingdiary/saveNewTrainingMaterial")]
        public TrainingMaterial SaveNewTrainingMaterial(TrainingMaterial trainingMaterial)
        {
            return _trainingDiaryService.AddTrainingMaterial(trainingMaterial);
        }
    }
}
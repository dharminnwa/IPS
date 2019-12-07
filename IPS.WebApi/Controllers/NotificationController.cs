using IPS.Business.Interfaces;
using System;
using System.Web.Http;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class NotificationController : BaseController
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [Route("api/notification/{stageId}")]
        [HttpGet]
        public IHttpActionResult SendStartNotification(int? stageId)
        {
            try
            {
                _notificationService.SendStartNewStageNotification(stageId, null, false);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/{stageId}/{templateId}")]
        [HttpGet]
        public IHttpActionResult SendNotification(int? stageId, int templateId)
        {
            try
            {
                _notificationService.Notify(stageId, null, templateId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/{participantId}/{stageId}/{templateId}")]
        [HttpGet]
        public IHttpActionResult SendNotification(int participantId, int? stageId, int templateId)
        {
            try
            {
                _notificationService.Notify(participantId, stageId, null, templateId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/getByUserId/{userId}/{stageId}/{templateId}")]
        [HttpGet]
        public IHttpActionResult SendNotificationByUserId(int userId, int? stageId, int templateId)
        {
            try
            {
                _notificationService.NotifyByUserId(userId, stageId, null, templateId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/getUICompleteMessage/{participantId}/{stageId}")]
        [HttpGet]
        public IHttpActionResult getUICompleteMessage(int participantId, int? stageId)
        {
            string message = null;
            try
            {
                message = _notificationService.GetUICompleteMessage(participantId, stageId, null);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(message);
        }



        [Route("api/notification/getUIStartMessage")]
        [HttpGet]
        public IHttpActionResult getUIStartMessage(int participantId, int? stageId, int? stageEvolutionId)
        {
            string message = null;
            try
            {
                message = _notificationService.GetUIStartMessage(participantId, stageId, stageEvolutionId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(message);
        }

        [Route("api/notification/sendCompleteNotification/{participantId}/{stageId}")]
        [HttpGet]
        public IHttpActionResult SendCompleteNotification(int participantId, int? stageId)
        {
            try
            {
                _notificationService.SendCompleteNotification(participantId, stageId, null);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/sendResultsNotification/{participantId}/{stageId}")]
        [HttpGet]
        public IHttpActionResult SendResultsNotification(int participantId, int? stageId)
        {
            try
            {
                _notificationService.SendResultsNotification(participantId, stageId, null);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }

        [Route("api/notification/{stageId}/{templateId}")]
        [HttpPost]
        public IHttpActionResult SendNotification(int? stageId, int templateId, int[] participants)
        {
            try
            {
                _notificationService.Notify(participants, stageId, null, templateId);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok();
        }
    }
}
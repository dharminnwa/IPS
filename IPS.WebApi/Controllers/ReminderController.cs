using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class ReminderController : BaseController
    {
        private readonly IReminderService _reminderService;
        private readonly IAuthService _authService;

        public ReminderController(IReminderService reminderService, IAuthService authService)
        {
            _reminderService = reminderService;
            _authService = authService;
        }

        [HttpGet]
        [EnableQuery]
        public IHttpActionResult GetRemindersByUserId(string id)
        {
            var result = new List<IpsReminder>();
            var user = _authService.GetUserById(id);
            if (user != null)
            {
                result = _reminderService.GetReminders(user.User.Id);
            }

            return Ok(result);
        }

        [Route("api/reminder/SetRemindMeDate/{reminderId}/{remindAt}")]
        [HttpPut]
        public IHttpActionResult SetRemindMeDate(string reminderId, DateTime remindAt)
        {
            _reminderService.SetRemindMeDate(reminderId, remindAt);
            return Ok();
        }
    }
}
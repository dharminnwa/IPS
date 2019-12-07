using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.OData;
using IPS.Business;
using IPS.Business.Interfaces;
using IPS.Data;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class NotificationIntervalController : BaseController
    {
        private readonly INotificationIntervalService notificationIntervalService;

        public NotificationIntervalController(INotificationIntervalService notificationIntervalSer)
        {
            notificationIntervalService = notificationIntervalSer;
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/notificationIntervals/getAllNotificationIntervals")]
        public IQueryable<NotificationInterval> GetNotificationIntervals()
        {
            return notificationIntervalService.GetAllNotificationIntervals();
        }
    }
}

using IPS.Business;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace IPS.WebApi.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class DailyEvaluationController : BaseController
    {
        private readonly IDailyEvaluationService _dailyEvaluationService;

        public DailyEvaluationController(IDailyEvaluationService dailyEvaluationService)
        {
            _dailyEvaluationService = dailyEvaluationService;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/DailyEvaluation/GetUserLastEvaluation/{userId}")]
        public DailyEvaluation GetUserLastEvaluation(int userId)
        {
            return _dailyEvaluationService.GetUserLastEvaluation(userId);
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("api/DailyEvaluation/Save")]
        public DailyEvaluation Save(DailyEvaluation dailyEvaluation)
        {
            return _dailyEvaluationService.Save(dailyEvaluation);
        }


    }
}
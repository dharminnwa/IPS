using IPS.Business;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Enums;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class TestController : BaseController
    {
        private readonly ITrainingDiaryService _trainingDiaryService;
        private readonly ITrainingService _trainingService;
        private readonly IPerformanceService _performanceService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public TestController(ITrainingDiaryService trainingDiaryService, ITrainingService trainingService, IPerformanceService performanceService)
        {
            _trainingDiaryService = trainingDiaryService;
            _trainingService = trainingService;
            _performanceService = performanceService;
        }


        [AllowAnonymous]
        [Route("api/Test/GetUserProfileTrainingsForToday/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserProfileTrainingsForToday(int userId)
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            if (userId > 0)
            {
                result = _trainingDiaryService.GetUserProfileTrainingsForToday(userId);
            }
            return result;
        }

        [AllowAnonymous]
        [Route("api/Test/GetUserPersonalTrainingsForToday/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserPersonalTrainingsForToday(int userId)
        {
            List<IpsTrainingModel> result = new List<IpsTrainingModel>();
            if (userId > 0)
            {
                result = _trainingDiaryService.GetUserPersonalTrainingsForToday(userId);
            }
            return result;
        }


        [AllowAnonymous]
        [Route("api/Test/GetTrainingDetailById/{trainingId}")]
        [HttpGet]
        public IpsTrainingModel GetTrainingDetailById(int trainingId)
        {
            IpsTrainingModel result = new IpsTrainingModel();
            if (trainingId > 0)
            {
                result = _trainingService.GetTrainingDetailById(trainingId);
            }
            return result;
        }


        [AllowAnonymous]
        [Route("api/Test/TrainingFeedback")]
        [HttpPost]
        public IHttpActionResult AddTrainingFeedback(TrainingFeedback trainingFeedback)
        {
            return Ok(_trainingService.AddTrainingFeedback(trainingFeedback));
        }

        [AllowAnonymous]
        [Route("api/Test/SensorData")]
        [HttpPost]
        public bool AddSensorData(List<SensorData> sensorDatas)
        {
            return _trainingService.AddSensorData(sensorDatas);
        }

        [AllowAnonymous]
        [Route("api/Test/GetSensorDataByUserId/{userId}")]
        [HttpGet]
        public List<SensorData> GetSensorDataByUserId(int userId)
        {
            return _trainingService.GetSensorDataByUserId(userId);
        }

        [AllowAnonymous]
        [Route("api/Test/DeleteSensorDataById/{id}")]
        [HttpGet]
        public bool DeleteSensorDataById(int id)
        {
            return _trainingService.DeleteSensorDataById(id);
        }

        [AllowAnonymous]
        [Route("api/Test/profilescorecard/{profileId}/{isBenchmarkNeeded}/{participantIds?}/{evaluatorIds?}/{stageId?}/{typeOfProfile?}/{statusOn?}/{stageGroupId?}")]
        [HttpGet]
        public IpsProfileScorecard GetProfileScoreCards(int profileId, bool isBenchmarkNeeded, string participantIds, string evaluatorIds, int? stageId, int? typeOfProfile, DateTime? statusOn = null, int? stageGroupId = null)
        {
            string[] DefaultSeparators = { ";" };

            if (statusOn == null)
                statusOn = DateTime.Now;

            var participantsIds = GetParamsFromString(participantIds, DefaultSeparators);
            var evaluatorsIds = GetParamsFromString(evaluatorIds, DefaultSeparators);
            var resultType = TypeOfProfile.None;

            if (typeOfProfile.HasValue)
                resultType = (TypeOfProfile)typeOfProfile;
            else
            {
                resultType = TypeOfProfile.Undefined;
            }

            var stage = 0;
            if (stageId.HasValue)
            {
                stage = stageId.Value;
            }

            return _performanceService.GetProfileScoreCards(profileId, isBenchmarkNeeded, participantsIds, evaluatorsIds, stage, resultType, statusOn, stageGroupId);
        }
        private List<int> GetParamsFromString(string input, string[] separators)
        {
            var inputStrArray = input.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            var result = new List<int>();
            foreach (var inputPart in inputStrArray)
            {
                int intId;
                if (int.TryParse(inputPart, out intId))
                {
                    result.Add(intId);
                }
            }
            return result;
        }


        [AllowAnonymous]
        [Route("api/Test/GetUserTrainingsForTimeCalculation/{userId}")]
        [HttpGet]
        public List<IpsTrainingModel> GetUserTrainingsForTimeCalculation(int userId)
        {
            return _trainingDiaryService.GetUserTrainingsForTimeCalculation(userId);
        }
    }
}
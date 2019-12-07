using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using System.Web.Http;
using System.Collections.Generic;
using System.Linq;
using IPS.Business;
using IPS.BusinessModels.Enums;
using IPS.Data.Enums;
using System;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    [RoutePrefix("api/survey")]
    public class SurveyController : BaseController
    {
        private readonly ISurveyService _surveyService;
        private readonly INotificationService _notificationService;
        private readonly IEvaluationStatusService _evaluationStatusService;
        private readonly IPerformanceService _performanceService;
        private readonly IStageGroupsService _stageGroupsService;
        private readonly IStagesService _stagesService;
        private static readonly string[] DefaultSeparators = { ";" };

        public SurveyController(ISurveyService surveyService, INotificationService notificationService,
            IEvaluationStatusService evaluationStatusService, IPerformanceService performanceService,
            IStageGroupsService stageGroupsService, IStagesService stagesService)
        {
            _surveyService = surveyService;
            _notificationService = notificationService;
            _evaluationStatusService = evaluationStatusService;
            _performanceService = performanceService;
            _stageGroupsService = stageGroupsService;
            _stagesService = stagesService;
        }

        [HttpGet]
        [Route("kt/{profileId}")]
        public IHttpActionResult LoadData(int profileId, int participantId, int? stageEvolutionId)
        {
            var result = _surveyService.GetKtSurveyInfo(profileId, participantId, stageEvolutionId);
            return Ok(result);
        }

        [HttpPost]
        [Route("kt")]
        public IHttpActionResult SaveAnswers(IpsKTSurveySave data)
        {
            _surveyService.SaveSurveyResult(data);
            _evaluationStatusService.SetEvaluationStatus(data.StageId, data.StageEvolutionId,
                data.ParticipantId, _performanceService.NeedToEvaluateTextQuestions(data.ParticipantId, data.StageId, data.StageEvolutionId, ProfileTypeEnum.Knowledge));
            if (_performanceService.NeedToEvaluateTextQuestions(data.ParticipantId, data.StageId, data.StageEvolutionId, ProfileTypeEnum.Knowledge))
            {
                _notificationService.SendTextEvaluationNotification(data.StageId, data.StageEvolutionId, data.ParticipantId);
            }
            var isSurveyCompleted = _stageGroupsService.GetStageStatus(data.StageId, data.StageEvolutionId, data.ParticipantId) == StageStatusEnum.Completed;
            return Ok(new { isSurveyCompleted });
        }

        [HttpGet]
        [Route("kt/evaluate/{profileId}")]
        public IHttpActionResult LoadData(int profileId, int? stageId, int participantId, int? stageEvolutionId)
        {
            var result = _surveyService.GetKtEvaluationInfo(profileId, stageId, stageEvolutionId, participantId);
            return Ok(result);
        }

        [HttpGet]
        [Route("kt/analysis/{profileId}")]
        public IHttpActionResult LoadAnalysisData(int profileId, int? stageId, int participantId, int? stageEvolutionId)
        {
            var result = _surveyService.GetKtAnalysisInfo(profileId, stageId, stageEvolutionId, participantId);
            return Ok(result);
        }

        [HttpGet]
        [Route("kt/result/{profileId}")]
        public IHttpActionResult LoadSurveyResultData(int profileId, int? stageId, string participantId, int? stageEvolutionId)
        {
            List<int> partcipantsId = GetParamsFromString(participantId, DefaultSeparators);
            var result = _surveyService.GetKtResultInfo(profileId, stageId, stageEvolutionId, partcipantsId);
            return Ok(result);
        }

        [HttpGet]
        [Route("kt/aggregatedResult/{profileId}")]
        public IHttpActionResult LoadSurveyAggregatedResultData(int profileId, int? stageId, int participantId, int? stageEvolutionId)
        {
            var result = _surveyService.GetKtAggregatedResultInfo(profileId, stageId, participantId, stageEvolutionId);
            return Ok(result);
        }

        [HttpGet]
        [Route("kt/final_KPI/{profileId}")]
        public IpsKTFinalKPIResult LoadFinalKPIData(int profileId, int? stageId, int participantId, int? stageEvolutionId)
        {
            List<IpsKTFinalKPIItem> questions = _surveyService.GetKtFinalKPI(profileId, stageId, stageEvolutionId, participantId);
            var hasDevContract = _surveyService.HasDevContract(stageId, stageEvolutionId, participantId);

            IpsKTFinalKPIResult result = new IpsKTFinalKPIResult
            {
                Questions = questions,
                HasDevContract = hasDevContract,
            };
            return result;
        }

        [HttpPost]
        [Route("kt/final_KPI")]
        public IHttpActionResult CompleteFinalKPI(IpsKTFinalKPI data)
        {
            var stageEvolutionId = _stagesService.SaveStageEvolution(data);
            _surveyService.UpdateAgreements(data.SurveyAnswerAgreements);
            _evaluationStatusService.SetEvaluationStatus(data.StageId, data.StageEvolutionId, data.ParticipantId);

            return Ok();
        }

        [HttpGet]
        [Route("kt/final_KPI_PreviousResults/{profileId}")]
        public IHttpActionResult LoadFinalKPIDataPreviousResults(int profileId, int participantId, int stageEvolutionId)
        {
            var result = _surveyService.GetKtFinalKPIPreviousResults(profileId, stageEvolutionId, participantId);
            return Ok(result);
        }

        [HttpPut]
        [Route("kt/evaluate")]
        public IHttpActionResult UpdateAnswers(IEnumerable<IpsKTSurveyEvaluate> data)
        {
            _surveyService.UpdateAnswerIsCorrect(data);
            return Ok();
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
    }
}
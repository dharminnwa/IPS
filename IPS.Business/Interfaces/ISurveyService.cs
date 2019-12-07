using System.Collections.Generic;
using IPS.BusinessModels.Entities;
using IPS.Data;

namespace IPS.Business.Interfaces
{
    public interface ISurveyService
    {
        IpsSurveyInfo GetSurveyInfo(int stageId, int participantId);
        string GetParticipantFullName(int participantId);
        IpsKTSurveyInfo GetKtSurveyInfo(int profileId, int participantId, int? stageEvolutionId);
        void SaveSurveyResult(IpsKTSurveySave data);
        IpsKTEvaluationInfo GetKtEvaluationInfo(int profileId, int? stageId, int? stageEvolutionId, int participantId);
        void UpdateAnswerIsCorrect(IEnumerable<IpsKTSurveyEvaluate> data);
        IpsKTAnalysisInfo GetKtAnalysisInfo(int profileId, int? stageId, int? stageEvolutionId, int participantId);
        IpsKTSurveyResult GetKtResultInfo(int profileId, int? stageId, int? stageEvolutionId, List<int> participantId);
        List<IpsKTFinalKPIItem> GetKtFinalKPI(int profileId, int? stageId, int? stageEvolutionId, int participantId);
        bool HasDevContract(int? stageId, int? stageEvolutionId, int participantId);
        IEnumerable<IpsKTFinalKPIItem> GetKtFinalKPIPreviousResults(int profileId, int stageEvolutionId, int participantId);
        IpsKTSurveyResult GetKtAggregatedResultInfo(int profileId, int? stageId, int participantId, int? stageEvolutionId);
        List<SurveyAnswer> GetFinalStageResult(int stageEvolutionId, int participantId);
        List<SurveyAnswer> GetKtStageEvolutionSurveyAnswers(int stageEvolutionId, int participantId);
        List<SurveyAnswer> GetStartStageResult(int stageId, int participantId);
        void UpdateAgreements(IEnumerable<IpsSurveyAnswerAgreement> surveyAnswerAgreements);
        bool StageEvolutionHasAnswers(int stageEvolutionId, int participantId);
    }
}

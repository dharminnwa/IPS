using IPS.Data;
using System;
using IPS.BusinessModels.Entities;
using System.Linq;
using System.Collections.Generic;
namespace IPS.Business
{
    public interface IEvaluationAgreementsService
    {
        EvaluationAgreement[] AddEvaluationAgreement(EvaluationAgreement[] evaluationAgreement);
        void DeleteEvaluationAgreement(EvaluationAgreement evaluationAgreement);
        IQueryable<EvaluationAgreement> GetEvaluationAgreements();
        IQueryable<EvaluationAgreement> GetEvaluationAgreementById(int id);
        void UpdateEvaluationAgreement(EvaluationAgreement[] evaluationAgreement);
        void UpdateTeamEvaluationAgreement(EvaluationAgreement[] evaluationAgreement);
    }
}

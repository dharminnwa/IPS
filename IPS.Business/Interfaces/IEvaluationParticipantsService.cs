using System;
namespace IPS.Business.Interfaces
{
    public interface IEvaluationParticipantsService
    {
        IPS.Data.EvaluationParticipant Add(IPS.Data.EvaluationParticipant evaluationParticipant);
        string Delete(IPS.Data.EvaluationParticipant evaluationParticipant);
        System.Linq.IQueryable<IPS.Data.EvaluationParticipant> GetEvaluationParticipants();
        System.Linq.IQueryable<IPS.Data.EvaluationParticipant> GetEvaluationParticipantsById(int id);
    }
}

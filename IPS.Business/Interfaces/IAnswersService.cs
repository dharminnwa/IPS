using IPS.BusinessModels.AnswerModel;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;

namespace IPS.Business
{
    public interface IAnswersService
    {
        Answer[] AddAnswer(Answer[] answers);
        IQueryable<Answer> GetAnswers();
        List<IpsAnswerModel> GetAnswersByParticipantId(int participantId,int stageId);
        IQueryable<Answer> GetAnswerById(int id);
        string UpdateAnswer(Answer[] answers);
    }
}

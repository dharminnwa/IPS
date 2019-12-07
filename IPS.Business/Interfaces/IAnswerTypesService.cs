using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IAnswerTypesService
    {
        AnswerType Add(AnswerType answerType);
        bool Delete(AnswerType answerType);
        IQueryable<AnswerType> Get();
        IQueryable<AnswerType> GetById(int id);
        bool Update(AnswerType answerType);
    }
}

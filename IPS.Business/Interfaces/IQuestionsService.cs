using IPS.Data;
using System;
using IPS.BusinessModels.Entities;
using System.Linq;
using System.Collections.Generic;
namespace IPS.Business
{
    public interface IQuestionsService
    {
        Question Add(Question question);
        void Delete(Question question);
        IQueryable<Question> Get();
        IQueryable<Question> GetById(int id);
        bool Update(Question question);
        IQueryable<Question> QuestionFilter(IpsQuestionFilter ipsQuestionFilter);
        Question CloneQuestion(Question question, string textPattern);
        Question CreateCopyQuestion(IPSData dataContext, Question question, string copyText);

        List<Question> getProfileQuestions(int profileId);
    }
}

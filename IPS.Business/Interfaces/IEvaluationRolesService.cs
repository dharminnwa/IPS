using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IEvaluationRolesService
    {
        /*EvaluationRole Add(EvaluationRole evaluationRole);
        string Delete(EvaluationRole evaluationRole);*/
        IQueryable<EvaluationRole> GetEvaluationRoles();
        IQueryable<EvaluationRole> GetEvaluationRolesById(int id);
        //bool Update(EvaluationRole evaluationRole);
    }
}

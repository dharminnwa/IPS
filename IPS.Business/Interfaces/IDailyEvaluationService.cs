using IPS.BusinessModels.ResourceModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public interface IDailyEvaluationService
    {
        DailyEvaluation GetUserLastEvaluation(int userId);
        DailyEvaluation Save(DailyEvaluation dailyEvaluation);
    }
}

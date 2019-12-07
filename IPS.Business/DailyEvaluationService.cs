using IPS.AuthData;
using IPS.AuthData.Models;
using IPS.Business.Interfaces;
using IPS.BusinessModels.ResourceModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class DailyEvaluationService : BaseService, IDailyEvaluationService
    {

        public DailyEvaluation GetUserLastEvaluation(int userId)
        {
            return _ipsDataContext.DailyEvaluations.Where(x => x.UserId == userId).OrderByDescending(x => x.TimeStamp).FirstOrDefault();
        }

        public DailyEvaluation Save(DailyEvaluation dailyEvaluation)
        {
            if (dailyEvaluation.Id == 0)
            {
                dailyEvaluation.TimeStamp = DateTime.Now;
                _ipsDataContext.DailyEvaluations.Add(dailyEvaluation);
                _ipsDataContext.SaveChanges();
            }
            return dailyEvaluation;
        }
    }
}

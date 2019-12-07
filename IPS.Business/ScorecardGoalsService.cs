using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class ScorecardGoalsService : BaseService, IPS.Business.IScorecardGoalsService
    {
       public IQueryable<ScorecardGoal> GetScorecardGoals()
        {
            return _ipsDataContext.ScorecardGoals.AsNoTracking().AsQueryable();
        }

        public ScorecardGoal GetScorecardGoalById(int id)
        {
            return _ipsDataContext.ScorecardGoals.Where(i => i.Id == id).FirstOrDefault();
        }

        public ScorecardGoal Add(ScorecardGoal scorecardGoal)
        {
            scorecardGoal.Organization = null;
            scorecardGoal.PerformanceGroups = null;
            if (scorecardGoal.OrganizationId == 0)
            {
                scorecardGoal.OrganizationId = null;
            }
            _ipsDataContext.ScorecardGoals.Add(scorecardGoal);
            _ipsDataContext.SaveChanges();
            return scorecardGoal;
        }

        public bool Update(ScorecardGoal scorecardGoal)
        {
            scorecardGoal.Organization = null;
            scorecardGoal.PerformanceGroups = null;
            if (scorecardGoal.OrganizationId == 0)
            {
                scorecardGoal.OrganizationId = null;
            }
            var original = _ipsDataContext.ScorecardGoals.Find(scorecardGoal.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(scorecardGoal);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ScorecardGoal scorecardGoal)
        {

            _ipsDataContext.ScorecardGoals.Remove(scorecardGoal);
            _ipsDataContext.SaveChanges();

            return true;
        }

    }
}

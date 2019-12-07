using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IScorecardGoalsService
    {
        ScorecardGoal Add(ScorecardGoal scorecardGoal);
        bool Delete(ScorecardGoal scorecardGoal);
        IQueryable<ScorecardGoal> GetScorecardGoals();
        ScorecardGoal GetScorecardGoalById(int id);
        bool Update(ScorecardGoal scorecardGoal);
    }
}

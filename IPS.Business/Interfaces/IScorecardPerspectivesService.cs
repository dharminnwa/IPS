using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IScorecardPerspectiveService
    {
        ScorecardPerspective Add(ScorecardPerspective scorecardPerspective);
        bool Delete(ScorecardPerspective scorecardPerspective);
        IQueryable<ScorecardPerspective> GetScorecardPerspectives();
        ScorecardPerspective GetScorecardPerspectiveById(int id);
        bool Update(ScorecardPerspective scorecardPerspective);
    }
}

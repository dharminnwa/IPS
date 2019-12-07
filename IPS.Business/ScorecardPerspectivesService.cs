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
    public class ScorecardPerspectiveService : BaseService, IPS.Business.IScorecardPerspectiveService
    {
        public IQueryable<ScorecardPerspective> GetScorecardPerspectives()
        {
            return _ipsDataContext.ScorecardPerspectives.AsNoTracking().AsQueryable();
        }

        public ScorecardPerspective GetScorecardPerspectiveById(int id)
        {
            return _ipsDataContext.ScorecardPerspectives.Where(i => i.Id == id).FirstOrDefault();
        }

        public ScorecardPerspective Add(ScorecardPerspective scorecardPerspective)
        {
            scorecardPerspective.Organization = null;
            scorecardPerspective.PerformanceGroups = null;
            if (scorecardPerspective.OrganizationId == 0)
            {
                scorecardPerspective.OrganizationId = null;
            }
            _ipsDataContext.ScorecardPerspectives.Add(scorecardPerspective);
            _ipsDataContext.SaveChanges();
            return scorecardPerspective;
        }

        public bool Update(ScorecardPerspective scorecardPerspective)
        {
            scorecardPerspective.Organization = null;
            scorecardPerspective.PerformanceGroups = null;
            if (scorecardPerspective.OrganizationId == 0)
            {
                scorecardPerspective.OrganizationId = null;
            }
            var original = _ipsDataContext.ScorecardPerspectives.Find(scorecardPerspective.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(scorecardPerspective);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(ScorecardPerspective scorecardPerspective)
        {
            _ipsDataContext.ScorecardPerspectives.Remove(scorecardPerspective);
            _ipsDataContext.SaveChanges();

            return true;
        }

    }
}

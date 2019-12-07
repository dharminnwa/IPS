using System.Collections.Generic;
using IPS.Data;
using System.Data.Entity;
using System.Linq;

namespace IPS.Business
{
    public class TeamService : BaseService, ITeamService
    {
        public IQueryable<Team> Get()
        {
            return _ipsDataContext.Teams.AsQueryable();
        }

        public IQueryable<Team> GetTeamsByOrganizationAndDepartment(int organizationId, List<int> departmentIds)
        {
            var departmentQuery = _ipsDataContext.Teams.AsQueryable();
            if (organizationId > 0)
            {
                departmentQuery = departmentQuery.Where(_ => _.OrganizationId == organizationId);
            }
            if (departmentIds != null && departmentIds.Any())
            {
                departmentQuery = departmentQuery.Where(_ => departmentIds.AsQueryable().Contains(_.DepartmentId.Value));
            }
            return departmentQuery;
        }

        public List<Team> GetTeamsByOrganizationId(int organizationId)
        {
            List<Team> teams = new List<Team>();
            if (organizationId > 0)
            {
                teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
            }
            return teams;
        }

        public Team GetTeamById(int teamId)
        {
            Team team = new Team();
            if (teamId > 0)
            {
                team = _ipsDataContext.Teams.Include("Link_TeamUsers").Include("Link_TeamUsers.User").Where(_ => _.Id == teamId).FirstOrDefault();
            }
            return team;
        }

        public IQueryable<Team> GetById(int id)
        {
            return _ipsDataContext.Teams.Where(t => t.Id == id).AsQueryable();
        }

        public Team Add(Team team)
        {
            _ipsDataContext.Teams.Add(team);
            _ipsDataContext.SaveChanges();
            return team;
        }

        public bool Update(Team team)
        {
            var original = _ipsDataContext.Teams.Include("Link_TeamUsers").FirstOrDefault(s => s.Id == team.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(team);

                _ipsDataContext.Link_TeamUsers.RemoveRange(original.Link_TeamUsers);
                _ipsDataContext.Link_TeamUsers.AddRange(team.Link_TeamUsers);
                foreach (Link_TeamUsers lu in team.Link_TeamUsers)
                {
                    _ipsDataContext.Entry(lu.User).State = EntityState.Unchanged;

                }
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(Team team)
        {

            List<Link_TeamUsers>  teamusers = _ipsDataContext.Link_TeamUsers.Where(x => x.TeamId == team.Id).ToList();
            if(teamusers.Count() > 0)
            {
                _ipsDataContext.Link_TeamUsers.RemoveRange(teamusers);
            }
            _ipsDataContext.Teams.Remove(team);
            int count = _ipsDataContext.SaveChanges();
            if (count > 0)
            {
                return true;
            }
            return false;
        }
    }
}

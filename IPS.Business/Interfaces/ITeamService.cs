using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business
{
    public interface ITeamService
    {
        Team Add(Team department);
        bool Delete(Team department);
        IQueryable<Team> Get();
        IQueryable<Team> GetTeamsByOrganizationAndDepartment(int organizationId, List<int> departmentId);
        List<Team> GetTeamsByOrganizationId(int organizationId);
        Team GetTeamById(int teamId);
        IQueryable<Team> GetById(int id);
        bool Update(Team department);
    }
}

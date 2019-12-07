using System.Linq;
using IPS.Data;
using System.Collections.Generic;
using IPS.BusinessModels.ProjectRoleModels;

namespace IPS.Business.Interfaces
{
    public interface IProjectRolesService
    {
        ProjectRole Add(ProjectRole projectRole);
        void Delete(ProjectRole projectRole);
        List<IpsProjectRoleModel> Get();
        IQueryable<ProjectRole> GetById(int id);
        int Update(ProjectRole projectRole); 
    }
}
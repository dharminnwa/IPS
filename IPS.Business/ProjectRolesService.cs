using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.BusinessModels.ProjectRoleModels;

namespace IPS.Business
{
    public class ProjectRolesService : BaseService, IProjectRolesService
    {
        public ProjectRole Add(ProjectRole projectRole)
        {
            _ipsDataContext.ProjectRoles.Add(projectRole);
            _ipsDataContext.SaveChanges();
            return projectRole;
        }

        public void Delete(ProjectRole projectRole)
        {
            _ipsDataContext.ProjectRoles.Remove(projectRole);
            _ipsDataContext.SaveChanges();
        }

        public List<IpsProjectRoleModel> Get()
        {
            List<IpsProjectRoleModel> projectRoles;
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            var isAdminOrSuperAdmin =
                _authService.IsInOrganizationInRoleOf("Admin", realCurrentUser.User.OrganizationId) ||
                _authService.IsInOrganizationInRoleOf("Super Admin", realCurrentUser.User.OrganizationId);
            if (isAdminOrSuperAdmin)
            {
                projectRoles = _ipsDataContext.ProjectRoles.Select(x=> new IpsProjectRoleModel() {
                    Id = x.Id,
                    Description = x.Description,
                    Name = x.Name,
                }).ToList();
            }
            else
            {
                projectRoles =
                    _ipsDataContext.Link_ProjectUsers.Where(_ => _.UserId == realCurrentUser.User.Id)
                        .Select(_ => _.ProjectRole).Select(x => new IpsProjectRoleModel()
                        {
                            Id = x.Id,
                            Description = x.Description,
                            Name = x.Name,
                        }).ToList();
            }
            return projectRoles;
        }

        public IQueryable<ProjectRole> GetById(int id)
        {
            return _ipsDataContext.ProjectRoles.Where(_ => _.Id == id);
        }

        public int Update(ProjectRole projectRole)
        {
            var result = -1;
            var source = _ipsDataContext.ProjectRoles.FirstOrDefault(_ => _.Id == projectRole.Id);
            if (source != null)
            {
                _ipsDataContext.Entry(source).CurrentValues.SetValues(projectRole);
                result = _ipsDataContext.SaveChanges();
            }
            return result;
        }
    }
}

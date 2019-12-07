using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business.Interfaces
{
    public interface IRolePermitionsService
    {
        IQueryable<IpsRolePermission> GetByRoleId(string roleId);
        bool Update(List<IpsRolePermission> rolePermissions);
        IQueryable<OrganisationResourcePermission> GetByOrganisationRoleId(string roleId);
        RoleOrganisationPermission GetOrganisationPermissionById(int id);
        bool UpdateOrganisationPermission(List<OrganisationResourcePermission> OrganisationPermissions);
    }
}

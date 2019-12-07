using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;

namespace IPS.Business.Interfaces
{
    public interface IRoleService : IDisposable
    {
        IpsRole Add(IpsRole role);
        bool Delete(IpsRole role);
        System.Linq.IQueryable<IpsRole> Get();
        List<IpsRole> GetRolesByOrganizationId(int organizationId);
        List<IpsRole> GetRolesByLevelId(int levelId);
        IpsRole GetById(string id);
        bool Update(IpsRole role);
    }
}

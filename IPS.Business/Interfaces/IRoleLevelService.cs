using IPS.AuthData.Models;
using IPS.BusinessModels.RoleModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public interface IRoleLevelService : IDisposable
    {
        List<IpsRoleLevelModel> getRoleLevels();
        List<IpsRoleLevelModel> getRoleLevelsByOrganizationId(int organizationId);
        UserRoleLevels Save(UserRoleLevels userRoleLevel);

        int Delete(int roleLevelId);
    }
}

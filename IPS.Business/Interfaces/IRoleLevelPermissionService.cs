using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business.Interfaces
{
    public interface IRoleLevelPermissionService : IDisposable
    {
        List<IpsResourceModel> GetAllResources();
        List<IpsOperationModel> GetAllOperations();
        List<IpsPermissionLevelModel> GetAllermissionLevels();
        
        List<IpsRoleLevelResourcesPermissionModel> GetPermissionsByLevelId(int roleLevelId);
        IpsRoleLevelAdvancePermission GetAdvancePermissionsByLevelId(int roleLevelId);
        int Save(IpsRoleLevelPermissionModel ipsRoleLevelPermissionModel);
        int SaveAdvancePermission(IpsRoleLevelAdvancePermission RoleLevelAdvancePermission);
    }
}

using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public interface IRoleLevelPermissionTemplateService
    {
        List<IpsResourceModel> GetAllResources();
        List<IpsOperationModel> GetAllOperations();
        int Add(IpsPermissionTemplatesModel IpsPermissionTemplatesModel);
        int Update(IpsPermissionTemplatesModel IpsPermissionTemplatesModel);
        IpsPermissionTemplatesModel GetPermissionTemplateById(int permissionTemplateById);
        List<IpsPermissionTemplatesModel> GetPermissionTemplates();
        
    }
}

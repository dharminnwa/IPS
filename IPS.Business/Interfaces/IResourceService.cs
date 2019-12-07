using IPS.AuthData.Models;
using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public interface IResourceService
    {
        List<IpsResourceModel> GetAllResources();
        List<IpsOperationModel> GetAllOperations();
        List<IpsResourceDependencyModel> GetResourceDepedencies();
    }
}

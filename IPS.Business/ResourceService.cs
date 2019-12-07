using IPS.AuthData;
using IPS.AuthData.Models;
using IPS.Business.Interfaces;
using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class ResourceService : IResourceService
    {
        private ApplicationDbContext _context;
        public ResourceService()
        {
            _context = ApplicationDbContext.Create("IdentityConnection");
        }

        public List<IpsResourceModel> GetAllResources()
        {
            return _context.Resources.Select(x => new IpsResourceModel()
            {
                Id = x.Id,
                Name = x.Name,
                IsPage = x.IsPage,
                ParentResourceId = x.ParentResourceId
            }).ToList();
        }

        public List<IpsOperationModel> GetAllOperations()
        {
            return _context.Operations.Select(x => new IpsOperationModel()
            {
                Id = x.Id,
                Name = x.Name,
                IsPageLevel = x.IsPageLevel,
            }).ToList();
        }

        public List<IpsResourceDependencyModel> GetResourceDepedencies()
        {
            List<IpsResourceDependencyModel> result = new List<IpsResourceDependencyModel>();
            List<ResourceDepedencyPermission> data = _context.ResourceDepedencyPermissions.ToList();
            result = GetLayers(data);
            return result;
        }

        private List<IpsResourceDependencyModel> GetLayers(List<ResourceDepedencyPermission> resourceDepedencyPermissions)
        {

            List<IpsResourceDependencyModel> data = resourceDepedencyPermissions.Select(x => new IpsResourceDependencyModel()
            {
                DependentResourceId = x.DependentResourceId,
                Id = x.Id,
                OperationId = x.OperationId,
                ResourceId = x.ResourceId,
                DependentResources = new List<IpsResourceDependencyModel>()
            }).ToList();

            //List<IpsResourceDependencyModel> hierarcy = new List<IpsResourceDependencyModel>();

            //foreach (var layer in data)
            //{
            //    var layer1 = layer;

            //    var sublayers = data.Where(i => i.ResourceId == layer1.DependentResourceId).ToList();
            //    foreach (var sublayer in sublayers)
            //    {
            //        layer.DependentResources.Add(sublayer);
            //    }
            //}

            return data;
        }
    }
}

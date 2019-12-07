using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.ResourceModels;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class ResourcesManagementController : BaseController
    {
        private readonly IResourceService _resourceService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public ResourcesManagementController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpGet]
        [Route("api/resourcesmanagement/getresources")]
        public List<IpsResourceModel> GetResources()
        {
            return _resourceService.GetAllResources();
        }

        [HttpGet]
        [Route("api/resourcesmanagement/getresourcedepedencies")]
        public List<IpsResourceDependencyModel> GetResourceDepedencies()
        {
            return _resourceService.GetResourceDepedencies();
        }

        [HttpGet]
        [Route("api/resourcesmanagement/getoperations")]
        public List<IpsOperationModel> GetOperations()
        {
            return _resourceService.GetAllOperations();
        }
    }
}
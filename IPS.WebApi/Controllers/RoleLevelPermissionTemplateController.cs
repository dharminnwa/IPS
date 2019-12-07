using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.ResourceModels;
using IPS.BusinessModels.RoleModels;
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
    public class RoleLevelPermissionTemplateController : BaseController
    {
        private readonly IRoleLevelPermissionTemplateService _roleLevelPermissionTemplateService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public RoleLevelPermissionTemplateController(IRoleLevelPermissionTemplateService roleLevelPermissionTemplateService)
        {
            _roleLevelPermissionTemplateService = roleLevelPermissionTemplateService;
        }

        [HttpGet]
        [Route("api/rolelevelpermissiontemplate/GetPermissionTemplateById/{permissionTemplateId}")]
        public IpsPermissionTemplatesModel GetPermissionTemplateById(int permissionTemplateId)
        {
            return _roleLevelPermissionTemplateService.GetPermissionTemplateById(permissionTemplateId);
        }

        [HttpGet]
        [Route("api/rolelevelpermissiontemplate/GetPermissionTemplates")]
        public List<IpsPermissionTemplatesModel> GetPermissionTemplates()
        {
            return _roleLevelPermissionTemplateService.GetPermissionTemplates();
        }

        [HttpPost]
        [Route("api/rolelevelpermissiontemplate/save")]
        public int Save(IpsPermissionTemplatesModel ipsPermissionTemplatesModel)
        {
            if (ipsPermissionTemplatesModel.Id > 0)
            {
                return _roleLevelPermissionTemplateService.Update(ipsPermissionTemplatesModel);
            }
            else
            {
                return _roleLevelPermissionTemplateService.Add(ipsPermissionTemplatesModel);
            }
        }
    }
}
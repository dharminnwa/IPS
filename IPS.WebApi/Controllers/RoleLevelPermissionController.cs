using IPS.AuthData.Models;
using IPS.Business;
using IPS.Business.Interfaces;
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
    public class RoleLevelPermissionController : BaseController
    {
        private readonly IRoleLevelPermissionService _roleLevelPermissionService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public RoleLevelPermissionController(IRoleLevelPermissionService roleLevelPermissionService)
        {
            _roleLevelPermissionService = roleLevelPermissionService;
        }

        [HttpGet]
        [Route("api/rolelevelpermission/GetPermissionsByLevelId/{levelId}")]
        public List<IpsRoleLevelResourcesPermissionModel> GetPermissionsByLevelId(int levelId)
        {
            return _roleLevelPermissionService.GetPermissionsByLevelId(levelId);
        }

        [HttpGet]
        [Route("api/rolelevelpermission/GetAdvancePermissionsByLevelId/{levelId}")]
        public IpsRoleLevelAdvancePermission GetAdvancePermissionsByLevelId(int levelId)
        {
            return _roleLevelPermissionService.GetAdvancePermissionsByLevelId(levelId);
        }


        [HttpPost]
        [Route("api/rolelevelpermission/save")]
        public int Save(IpsRoleLevelPermissionModel ipsRoleLevelPermissionModel)
        {
            int result = 0;
            result = _roleLevelPermissionService.Save(ipsRoleLevelPermissionModel);
            return result;
        }

        [HttpGet]
        [Route("api/rolelevelpermission/GetAllPermissionsLevels")]
        public List<IpsPermissionLevelModel> GetAllPermissionsLevels()
        {
            return _roleLevelPermissionService.GetAllermissionLevels();
        }

        [HttpPost]
        [Route("api/rolelevelpermission/saveAdvancePermission")]
        public int SaveAdvancePermission(IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission)
        {
            return _roleLevelPermissionService.SaveAdvancePermission(ipsRoleLevelAdvancePermission);
        }

    }
}
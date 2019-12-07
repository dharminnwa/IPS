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
    public class RoleLevelController : BaseController
    {
        private readonly IRoleLevelService _roleLevelService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public RoleLevelController(IRoleLevelService roleLevelService)
        {
            _roleLevelService = roleLevelService;
        }

        [HttpGet]
        [Route("api/rolelevels/all")]
        public List<IpsRoleLevelModel> getRoleLevels()
        {
            return _roleLevelService.getRoleLevels();
        }


        [HttpGet]
        [Route("api/rolelevel/getRoleLevelsByOrganizationId/{organizationId}")]
        public List<IpsRoleLevelModel> getRoleLevelsByOrganizationId(int organizationId)
        {
            return _roleLevelService.getRoleLevelsByOrganizationId(organizationId);
        }

        [HttpPost]
        [Route("api/rolelevel/save")]
        public UserRoleLevels Save(UserRoleLevels userRoleLevel)
        {
            return _roleLevelService.Save(userRoleLevel);
        }

        [HttpDelete]
        [Route("api/rolelevel/delete/{roleLevelId}")]
        public int Delete(int roleLevelId)
        {
            return _roleLevelService.Delete(roleLevelId);
        }
    }
}
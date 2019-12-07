using IPS.Business;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class UserTypeController : BaseController
    {
        IUserTypeService _userTypeService;

        public UserTypeController(IUserTypeService userTypeService)
        {
            _userTypeService = userTypeService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<UserType> GetUserTypes()
        {
            return _userTypeService.Get();
        }

        [HttpGet]
        public UserType GetUserType(int id)
        {
            UserType result = _userTypeService.GetById(id);
             return result;
        }
        
    }
}
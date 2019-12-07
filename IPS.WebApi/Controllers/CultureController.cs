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
    public class CultureController : BaseController
    {
        ICultureService _cultureService;

        public CultureController(ICultureService cultureService)
        {
            _cultureService = cultureService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Culture> GetCultures()
        {
            return _cultureService.Get();
        }

        [HttpGet]
        public Culture GetCulture(int id)
        {
            Culture result = _cultureService.GetById(id);
             return result;
        }
        
    }
}
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
    public class CountryController : BaseController
    {
        ICountryService _countryService;

        public CountryController(ICountryService countryService)
        {
            _countryService = countryService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Country> GetContries()
        {
            return _countryService.Get();
        }

        [HttpGet]
        public Country GetCountry(int id)
        {
            Country result = _countryService.GetById(id);
             return result;
        }
        
    }
}
using IPS.AuthData.Models;
using IPS.Business;
using IPS.Data;
using IPS.WebApi.Filters;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using System.Web.Script.Serialization;


namespace IPS.WebApi.Controllers
{
    public class RegistrationController : BaseController
    {
        IPS.Business.Interfaces.IUserService _IUserService;
        ICountryService _countryService;
        IOrganizationService _organizationService;
        IIndustryService _industryService;
        //private IAuthService _authService = null;
        public RegistrationController(IPS.Business.Interfaces.IUserService IUserService, ICountryService countryService, IOrganizationService organizationService, IIndustryService industryService)
        {
            _IUserService = IUserService;
            _countryService = countryService;
            _organizationService = organizationService;
            _industryService = industryService;
        }
        [HttpGet]
        [Route("api/Registration/GetRegistration")]
        public Registration GetRegistration()
        {
            return new Registration(_countryService.Get(), _industryService.Get());
        }

        [HttpPost]
        public IHttpActionResult AddUser(Registration Registration)
        {
            //if (!ModelState.IsValid)
            //{

            //    return BadRequest(ModelState);
            //}

            Organization resultorg = _organizationService.Add(Registration.Ogranisation);

            User original = _IUserService.GetById(Registration.RegisteredUser.Id);

            if (original == null)
            {
                return NotFound();
            }

            try
            {
                Registration.RegisteredUser.Organization = Registration.Ogranisation;
                Registration.RegisteredUser.OrganizationId = Registration.Ogranisation.Id;

                bool result = _IUserService.Update(Registration.RegisteredUser);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
            // return Ok(result.Id);

        }

        [EnableQuery]
        [Route("api/Registration/GetCountries")]
        public IQueryable<Country> GetContries()
        {
            return _countryService.Get().Select(c => new Country { Id = c.Id, CountryName = c.CountryName, FlagImage = c.FlagImage }).AsQueryable();
        }
    }
    public class Registration
    {
        public IQueryable<Country> _Country { get; set; }
        public IQueryable<Industry> _Industry { get; set; }
        public Organization Ogranisation { get; set; }
        public User RegisteredUser { get; set; }
        public Registration(IQueryable<Country> Country, IQueryable<Industry> Industry)
        {
            _Country = Country;
            _Industry = Industry;
            Ogranisation = new Organization();
            RegisteredUser = new User();
        }
    }
}
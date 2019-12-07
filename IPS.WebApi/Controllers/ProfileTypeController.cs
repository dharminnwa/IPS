using IPS.Business;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class ProfileTypeController : BaseController
    {
        IProfileTypeService _profileTypeService;

        public ProfileTypeController(IProfileTypeService profileTypeService)
        {
            _profileTypeService = profileTypeService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<ProfileType> GetProfileTypes()
        {
            return _profileTypeService.Get();
        }


        public IHttpActionResult GetProfileType(int id)
        {
            ProfileType result = _profileTypeService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(ProfileType profileType)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            ProfileType result = _profileTypeService.Add(profileType);

            return Ok(profileType.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ProfileType profileType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ProfileType org = _profileTypeService.GetById(profileType.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _profileTypeService.Update(profileType);
                
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            ProfileType profileType = _profileTypeService.GetById(id);
            if (profileType == null)
            {
                return NotFound();
            }

            bool result = _profileTypeService.Delete(profileType);

            return Ok(result);
        }
    }
}
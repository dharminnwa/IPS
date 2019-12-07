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
    public class ProfileCategoryController : BaseController
    {
        IProfileCategoryService _profileCategoryService;

        public ProfileCategoryController(IProfileCategoryService profileCategoryService)
        {
            _profileCategoryService = profileCategoryService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<ProfileCategory> GetProfileCategories()
        {
            return _profileCategoryService.Get();
        }


        public IHttpActionResult GetProfileCategory(int id)
        {
            ProfileCategory result = _profileCategoryService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(ProfileCategory profileCategory)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            ProfileCategory result = _profileCategoryService.Add(profileCategory);

            return Ok(profileCategory.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ProfileCategory profileCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ProfileCategory org = _profileCategoryService.GetById(profileCategory.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _profileCategoryService.Update(profileCategory);
                
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
            ProfileCategory profileCategory = _profileCategoryService.GetById(id);
            if (profileCategory == null)
            {
                return NotFound();
            }

            bool result = _profileCategoryService.Delete(profileCategory);

            return Ok(result);
        }
    }
}
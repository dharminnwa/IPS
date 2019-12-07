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
    public class ProfileTagsController : BaseController
    {
        IProfileTagService _profileTagService;

        public ProfileTagsController(IProfileTagService profileTagService)
        {
            _profileTagService = profileTagService;
        }

        [EnableQuery]
        [HttpGet]
        public List<Tag> GetProfileTags()
        {
            return _profileTagService.Get();
        }


        public IHttpActionResult GetProfileTag(int id)
        {
            Tag result = _profileTagService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(Tag profileTag)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            Tag result = _profileTagService.Add(profileTag);

            return Ok(profileTag.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(Tag profileTag)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Tag org = _profileTagService.GetById(profileTag.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _profileTagService.Update(profileTag);
                
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
            Tag profileTag = _profileTagService.GetById(id);
            if (profileTag == null)
            {
                return NotFound();
            }

            bool result = _profileTagService.Delete(profileTag);

            return Ok(result);
        }
    }
}
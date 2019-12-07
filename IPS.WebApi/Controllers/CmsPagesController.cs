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
      [Authorize]
    public class CmsPagesController : BaseController
    {
        IManageCmsContentService _manageCmsContentService;
      

        public CmsPagesController(IManageCmsContentService manageCmsContentService)
        {
            _manageCmsContentService = manageCmsContentService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<CmsPage> GetPageByAccessCode(int PageAccessCode,int languageID)
        {
            return _manageCmsContentService.GetByAccessCode(PageAccessCode, languageID);
        }
       // [Authorize]
        [EnableQuery]
        [HttpGet]
        public IQueryable<CmsPage> GetPages()
        {
            return _manageCmsContentService.GetPages();
        }


      //  [Authorize]
        [EnableQuery(MaxExpansionDepth = 8)]
        [HttpGet]
        public SingleResult<CmsPage> GetByAccessCode(int PageAccessCode, int languageID)
        {
            SingleResult<CmsPage> result = SingleResult.Create(_manageCmsContentService.GetByAccessCode(PageAccessCode,languageID));

            return result;
        }
        //[Authorize]
        [EnableQuery(MaxExpansionDepth = 8)]
        public SingleResult<CmsPage> GetPage(int id)
        {
            SingleResult<CmsPage> result = SingleResult.Create(_manageCmsContentService.GetByID(id));

            return result;
        }
       // [Authorize]
        [HttpPost]
        public IHttpActionResult Add(CmsPage cmspage)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            CmsPage result = _manageCmsContentService.Add(cmspage);

            return Ok(cmspage.PageID);

        }
        //[Authorize]
        [HttpPut]
        public IHttpActionResult Update(CmsPage cmspage)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            CmsPage page = _manageCmsContentService.GetByID(cmspage.PageID).FirstOrDefault();

            if (page == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _manageCmsContentService.Update(cmspage);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }
       // [Authorize]
        [EnableQuery]
        [HttpGet]
        [Route("api/CmsPages/GetLanguages")]
        public IQueryable<LookupItem> GetLanguages()
        {
            return _manageCmsContentService.GetLanguages();
        }
        
    }
}
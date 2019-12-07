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
    public class HelpContentController : BaseController
    {
        

         IManageHelpContentService _managehelpcontentservice;
         public HelpContentController(IManageHelpContentService managehelpcontentservice)
        {
            _managehelpcontentservice = managehelpcontentservice;
        }


         [EnableQuery]
         [HttpGet]
         [Route("api/HelpContent/GetHelpContent")]
         public IQueryable<HelpContent> GetHelpContent()
         {
             return _managehelpcontentservice.GetHelpContent();
         }

         [EnableQuery(MaxExpansionDepth = 8)]
         [Route("api/HelpContent/GetHelpContentByID/{id}")]
         public SingleResult<HelpContent> GetHelpContentByID(int id)
         {
             SingleResult<HelpContent> result = SingleResult.Create(_managehelpcontentservice.GetHelpHelpContentByID(id));

             return result;
         }

         [HttpPost]
         public IHttpActionResult AddHelpContent(HelpContent HelpContent)
         {
             if (!ModelState.IsValid)
             {

                 return BadRequest(ModelState);
             }

             HelpContent result = _managehelpcontentservice.AddHelpContent(HelpContent);

             return Ok(HelpContent.HelpContentID);
         }


         [HttpPut]
         public IHttpActionResult UpdateHelpContent(HelpContent HelpContent)
         {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             HelpContent page = _managehelpcontentservice.GetHelpHelpContentByID(HelpContent.HelpContentID).FirstOrDefault();

             if (page == null)
             {
                 return NotFound();
             }

             try
             {
                 bool result = _managehelpcontentservice.UpdateHelpContent(HelpContent);

                 return Ok(result);
             }
             catch (DbUpdateConcurrencyException ex)
             {
                 return InternalServerError(ex);
             }


         }

         [EnableQuery]
         [HttpGet]
         [Route("api/HelpContent/GetLanguages")]
         public IQueryable<LookupItem> GetLanguages()
         {
             return _managehelpcontentservice.GetLanguages();
         }
         ////////////////////////////////////////////////////////////////////////////
    }
}
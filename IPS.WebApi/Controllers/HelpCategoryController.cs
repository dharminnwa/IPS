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
    public class HelpCategoryController: BaseController
    {
         IManageHelpContentService _managehelpcontentservice;
         public HelpCategoryController(IManageHelpContentService managehelpcontentservice)
        {
            _managehelpcontentservice = managehelpcontentservice;
        }


         
         [EnableQuery]
         [HttpGet]
         [Route("api/HelpCategory/GetHelpCategory/")]
         public IQueryable<HelpCategory> GetHelpCategory()
         {
             return _managehelpcontentservice.GetHelpCategory();
         }
         //api/{controller}/{id}


         [EnableQuery(MaxExpansionDepth = 8)]
         [Route("api/HelpCategory/GetHelpCategoryByID/{id}")]
         public SingleResult<HelpCategory> GetHelpCategoryByID(int id)
         {
             SingleResult<HelpCategory> result = SingleResult.Create(_managehelpcontentservice.GetHelpCategoryByID(id));

             return result;
         }

         [HttpPost]
        
         public IHttpActionResult AddHelpCategory(HelpCategory HelpCategory)
         {
             if (!ModelState.IsValid)
             {

                 return BadRequest(ModelState);
             }

             HelpCategory result = _managehelpcontentservice.AddHelpCategory(HelpCategory);

             return Ok(HelpCategory.HelpCategoryID);
         }


         [HttpPut]
         public IHttpActionResult  UpdateHelpCategory(HelpCategory HelpCategory)
         {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             HelpCategory page = _managehelpcontentservice.GetHelpCategoryByID(HelpCategory.HelpCategoryID).FirstOrDefault();

             if (page == null)
             {
                 return NotFound();
             }

             try
             {
                 bool result = _managehelpcontentservice.UpdateHelpCategory(HelpCategory);

                 return Ok(result);
             }
             catch (DbUpdateConcurrencyException ex)
             {
                 return InternalServerError(ex);
             }


         }

         [EnableQuery]
         [HttpGet]
         [Route("api/HelpCategory/GetLanguages")]
         public IQueryable<LookupItem> GetLanguages()
         {
             return _managehelpcontentservice.GetLanguages();
         }

    }
}
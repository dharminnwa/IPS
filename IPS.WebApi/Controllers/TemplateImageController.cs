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
    public class TemplateImageController: BaseController
    {
         IManageTemplatepContentService _iManageTemplatepContentService;
         public TemplateImageController(IManageTemplatepContentService IManageTemplatepContentService)
        {
            _iManageTemplatepContentService = IManageTemplatepContentService;
        }

        [HttpPost]

         public IHttpActionResult AddTemplateImage(TemplateContentImage TemplateContentImage)
        {
            if (ModelState.Keys.Count == 1)
            {
                ModelState[ModelState.Keys.FirstOrDefault()].Errors.Clear();
            }

            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TemplateContentImage result = _iManageTemplatepContentService.AddTemplateImage(TemplateContentImage);

            return Ok(TemplateContentImage.TemplateImageID);
        }

    }
}
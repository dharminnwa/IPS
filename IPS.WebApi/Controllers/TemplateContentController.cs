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
    public class TemplateContentController : BaseController
    {
         IManageTemplatepContentService _iManageTemplatepContentService;
         public TemplateContentController(IManageTemplatepContentService IManageTemplatepContentService)
        {
            _iManageTemplatepContentService = IManageTemplatepContentService;
        }

        // POST api/<controller>
        //[Route("api/trainings/{trainingId}/trainingMaterials")]
        [HttpPost]
        [Route("api/Upload/UploadTemplateImages")]
        public IHttpActionResult UploadTemplateImages()
        {
            string fileName = string.Empty;
            var imageHostUrl = HttpContext.Current.Request.Url.ToString();
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                HttpFileCollection files = HttpContext.Current.Request.Files;
                var userName = HttpContext.Current.Request.Form["name"];
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];
                    if (i > 0)
                    {
                        fileName += ",";
                    }
                    fileName += Guid.NewGuid() + System.IO.Path.GetExtension(file.FileName);

                    string fname = HttpContext.Current.Server.MapPath("~\\Uploads\\TemplateImage\\" + fileName);
                    file.SaveAs(fname);
                }
            }
            return Ok(fileName);
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        [Route("api/Template/GetTemplateTemplateContentByID/{id}")]
        public SingleResult<TemplateContent> GetTemplateTemplateContentByID(int id)
        {
            SingleResult<TemplateContent> result = SingleResult.Create(_iManageTemplatepContentService.GetTemplateTemplateContentByID(id));

            return result;
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        [Route("api/Template/GetTemplateTemplateContentByCategoryID/{id}")]
        public IQueryable<TemplateContent> GetTemplateTemplateContentByCategoryID(int id)
        {
            IQueryable<TemplateContent> result = _iManageTemplatepContentService.GetTemplateTemplateContentByCategoryID(id);

            return result;
        }
        //[EnableQuery(MaxExpansionDepth = 8)]
        //[Route("api/Template/GetTemplateTemplateContentByCategoryID/{id}")]
        //public IQueryable<TemplateContent> GetTemplateTemplateContentByCategoryID(int id)
        //{
        //    IQueryable<TemplateContent> result = SingleResult.Create(_iManageTemplatepContentService.GetTemplateTemplateContentByCategoryID(id));

        //    return result;
        //}

        [HttpPost]

        public IHttpActionResult AddTemplateContent(TemplateContent TemplateContent)
        {
            if (ModelState.Keys.Count == 1)
            {
                ModelState[ModelState.Keys.FirstOrDefault()].Errors.Clear();
            }

            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            TemplateContent result = _iManageTemplatepContentService.AddTemplateContent(TemplateContent);

            return Ok(TemplateContent.TemplateContentID);
        }


        [HttpPut]
        public IHttpActionResult UpdateTemplateContent(TemplateContent TemplateContent)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            TemplateContent page = _iManageTemplatepContentService.GetTemplateTemplateContentByID(TemplateContent.TemplateContentID).FirstOrDefault();

            if (page == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _iManageTemplatepContentService.UpdateTemplateContent(TemplateContent);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        
    }
}
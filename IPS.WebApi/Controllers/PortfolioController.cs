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
    // [Authorize]
    public class PortfolioController: BaseController
    {
        IPortfolioService _iPortfolioService;
        public PortfolioController(IPortfolioService IPortfolioService)
        {
            _iPortfolioService = IPortfolioService;
        }


         [EnableQuery]
         [HttpGet]
         [Route("api/PortfolioCategory/GetPortfolioCategory/")]
         public IQueryable<PortfolioCategory> GetHelpCategory()
         {
             return _iPortfolioService.GetPortfolioCategory();
         }
         //api/{controller}/{id}


         [EnableQuery(MaxExpansionDepth = 8)]
         [Route("api/PortfolioCategory/GetPortfolioCategoryByID/{id}")]
         public IQueryable<PortfolioCategory> GetPortfolioCategoryByID(int id)
         {
             IQueryable<PortfolioCategory> result = _iPortfolioService.GetPortfolioCategoryByID(id);

             return result;
         }

         [HttpPost]
        //[Route("api/GetPortfolioCategory/AddPortfolioCategory/{PortfolioCategory}")]
         public IHttpActionResult AddPortfolioCategory(PortfolioCategory PortfolioCategory)
         {

             if (ModelState.Keys.Count == 1)
             {
                 ModelState[ModelState.Keys.FirstOrDefault()].Errors.Clear();
             }

             if (!ModelState.IsValid)
             {

                 return BadRequest(ModelState);
             }

             PortfolioCategory result = _iPortfolioService.AddPortfolioCategory(PortfolioCategory);

             return Ok(PortfolioCategory.PortfolioCategoryID);
         }


         [HttpPut]
        // [Route("api/GetPortfolioCategory/UpdatePortfolioCategory/{PortfolioCategory}")]
         public IHttpActionResult UpdatePortfolioCategory(PortfolioCategory PortfolioCategory)
         {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             PortfolioCategory page = _iPortfolioService.GetPortfolioCategoryByID(PortfolioCategory.PortfolioCategoryID).FirstOrDefault();

             if (page == null)
             {
                 return NotFound();
             }

             try
             {
                 bool result = _iPortfolioService.UpdatePortfolioCategory(PortfolioCategory);

                 return Ok(result);
             }
             catch (DbUpdateConcurrencyException ex)
             {
                 return InternalServerError(ex);
             }


         }

         [EnableQuery]
         [HttpGet]
         [Route("api/Portfolio/GetLanguages")]
         public IQueryable<LookupItem> GetLanguages()
         {
             return _iPortfolioService.GetLanguages();
         }


         //// POST api/<controller>
         ////[Route("api/trainings/{trainingId}/trainingMaterials")]
         //[HttpPost]
         //[Route("api/Upload/UploadPortfolioImages")]
         //public IHttpActionResult UploadPortfolioImages()
         //{
         //    string fileName = string.Empty;
         //    var imageHostUrl = HttpContext.Current.Request.Url.ToString();
         //    if (HttpContext.Current.Request.Files.Count > 0)
         //    {
         //        HttpFileCollection files = HttpContext.Current.Request.Files;
         //        var userName = HttpContext.Current.Request.Form["name"];
         //        for (int i = 0; i < files.Count; i++)
         //        {
         //            HttpPostedFile file = files[i];

         //            fileName = Guid.NewGuid() + System.IO.Path.GetExtension(file.FileName);

         //            string fname = HttpContext.Current.Server.MapPath("~\\Uploads\\PortfolioImage\\" + fileName);
         //            file.SaveAs(fname);
         //        }
         //    }
         //    return Ok(fileName);
         //}


         //[EnableQuery(MaxExpansionDepth = 8)]
         //[Route("api/Portfolio/GetPortfolioProjectByCategoryID/{id}")]
         //public IQueryable<PortfolioProject> GetPortfolioProjectByCategoryID(int id)
         //{
         //    IQueryable<PortfolioProject> result = _iPortfolioService.GetPortfolioProjectByCategoryID(id);

         //    return result;
         //}

         //[EnableQuery(MaxExpansionDepth = 8)]
         //[Route("api/Portfolio/GetPortfolioProjectByID/{id}")]
         //public SingleResult<PortfolioProject> GetPortfolioProjectByID(int id)
         //{
         //    SingleResult<PortfolioProject> result = SingleResult.Create(_iPortfolioService.GetPortfolioProjectByID(id));

         //    return result;
         //}

         //[HttpPost]

         //public IHttpActionResult AddPortfolioProject(PortfolioProject PortfolioProject)
         //{
         //    if (!ModelState.IsValid)
         //    {

         //        return BadRequest(ModelState);
         //    }

         //    PortfolioProject result = _iPortfolioService.AddPortfolioProject(PortfolioProject);

         //    return Ok(PortfolioProject.PortfolioProjectID);
         //}


         //[HttpPut]
         //public IHttpActionResult UpdatePortfolioProject(PortfolioProject PortfolioProject)
         //{
         //    if (!ModelState.IsValid)
         //    {
         //        return BadRequest(ModelState);
         //    }

         //    PortfolioProject page = _iPortfolioService.GetPortfolioProjectByID(PortfolioProject.PortfolioProjectID).FirstOrDefault();

         //    if (page == null)
         //    {
         //        return NotFound();
         //    }

         //    try
         //    {
         //        bool result = _iPortfolioService.UpdatePortfolioProject(PortfolioProject);

         //        return Ok(result);
         //    }
         //    catch (DbUpdateConcurrencyException ex)
         //    {
         //        return InternalServerError(ex);
         //    }


         //}

        
    }
}
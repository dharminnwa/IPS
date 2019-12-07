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
     //[Authorize]
    public class PortFolioProjectController : BaseController
    {
        // POST api/<controller>
        //[Route("api/trainings/{trainingId}/trainingMaterials")]
         IPortfolioService _iPortfolioService;
         public PortFolioProjectController(IPortfolioService IPortfolioService)
        {
            _iPortfolioService = IPortfolioService;
        }

        [HttpPost]
        [Route("api/Upload/UploadPortfolioImages")]
        public IHttpActionResult UploadPortfolioImages()
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

                    fileName = Guid.NewGuid() + System.IO.Path.GetExtension(file.FileName);

                    string fname = HttpContext.Current.Server.MapPath("~\\Uploads\\PortfolioImage\\" + fileName);
                    file.SaveAs(fname);
                }
            }
            return Ok(fileName);
        }


        [EnableQuery(MaxExpansionDepth = 8)]
        [Route("api/Portfolio/GetPortfolioProjectByCategoryID/{id}")]
        public IQueryable<PortfolioProject> GetPortfolioProjectByCategoryID(int id)
        {
            IQueryable<PortfolioProject> result = _iPortfolioService.GetPortfolioProjectfromCategoryID(id);

            return result;
        }

        [EnableQuery(MaxExpansionDepth = 8)]
        [Route("api/Portfolio/GetPortfolioProjectByID/{id}")]
        public SingleResult<PortfolioProject> GetPortfolioProjectByID(int id)
        {
            SingleResult<PortfolioProject> result = SingleResult.Create(_iPortfolioService.GetPortfolioProjectByID(id));

            return result;
        }

        [HttpPost]

        public IHttpActionResult AddPortfolioProject(PortfolioProject PortfolioProject)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            PortfolioProject result = _iPortfolioService.AddPortfolioProject(PortfolioProject);

            return Ok(PortfolioProject.PortfolioProjectID);
        }


        [HttpPut]
        public IHttpActionResult UpdatePortfolioProject(PortfolioProject PortfolioProject)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PortfolioProject page = _iPortfolioService.GetPortfolioProjectByID(PortfolioProject.PortfolioProjectID).FirstOrDefault();

            if (page == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _iPortfolioService.UpdatePortfolioProject(PortfolioProject);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

    }
}
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
    public class PortfolioImageController : BaseController
    {
        // POST api/<controller>
        //[Route("api/trainings/{trainingId}/trainingMaterials")]
        IPortfolioService _iPortfolioService;
        public PortfolioImageController(IPortfolioService IPortfolioService)
        {
            _iPortfolioService = IPortfolioService;
        }

        [HttpPost]

        public IHttpActionResult AddportfolioImage(PortfolioImage PortfolioImage)
        {
            if (ModelState.Keys.Count == 1)
            {
                ModelState[ModelState.Keys.FirstOrDefault()].Errors.Clear();
            }

            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            PortfolioImage result = _iPortfolioService.AddPortfolioImage(PortfolioImage);

            return Ok(PortfolioImage.ProtfolioProjectImageID);
        }

    }
}
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
   
    ///[Authorize]
    public class PlanController : BaseController
    {
        IManagePlanService _manageplanservice;


        public PlanController(IManagePlanService manageplanservice)
        {
            _manageplanservice = manageplanservice;
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/Plan/GetPlanByID/{PlanID}")]
        public Plans GetPlanByID(int PlanID)
        {
            return _manageplanservice.GetPlanByID(PlanID);
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/Plan/GetAllPlan")]
        public IQueryable<IpsPlan> GetAllPlan()
        {
            return _manageplanservice.GetAllPlan();
        }


        [HttpPut]
        public IHttpActionResult Update(Plans IpsPlan)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IpsPlan plan = _manageplanservice.GetByID(IpsPlan.Plan.FirstOrDefault().PlanID).FirstOrDefault();

            if (plan == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _manageplanservice.Update(IpsPlan);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }
        [EnableQuery]
        [HttpGet]
        [Route("api/Plan/GetLanguages")]
        public IQueryable<LookupItem> GetLanguages()
        {
            return _manageplanservice.GetLanguages();
        }

    }
}
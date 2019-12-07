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
    public class SubscriptionPlanController : BaseController
    {
         IManagePlanService _manageplanservice;
         public SubscriptionPlanController(IManagePlanService manageplanservice)
        {
            _manageplanservice = manageplanservice;
        }

         [EnableQuery]
         [HttpGet]
         public Plans GetPlanByID(int PlanID)
         {
             return _manageplanservice.GetPlanByID(PlanID);
         }
         [HttpPut]
         public IHttpActionResult Update(Plans IpsPlan)
         {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             IpsPlan page = _manageplanservice.GetByID(IpsPlan.Plan.FirstOrDefault().PlanID).FirstOrDefault();

             if (page == null)
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
    }
}
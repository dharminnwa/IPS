using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.IndustryModels;
using IPS.Data;
using IPS.WebApi.Filters;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class IndustriesController : BaseController
    {
        IIndustryService _industryService;

        public IndustriesController(IIndustryService industryService)
        {
            _industryService = industryService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Industry> GetIndustries()
        {
            return _industryService.Get();
        }

        [HttpGet]
        [Route("api/Industries/GetAllIndustries")]
        public List<IpsIndustryModel> GetAllIndustries()
        {
            return _industryService.GetAllIndustries();
        }

        [HttpGet]
        [Route("api/Industries/GetAllIndustriesByOrganizationId/{organizationId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Industries", OperationKey = Operations.Read)]
        public List<IpsIndustryModel> GetAllIndustriesByOrganizationId(int organizationId)
        {
            return _industryService.GetAllIndustriesByOrganizationId(organizationId);
        }

        [HttpGet]
        [Route("api/Industries/IsIndustryExist/{organizationId}/{name}")]
        [ResourcePermisionAuthorize(ResourceKey = "Industries", OperationKey = Operations.Read)]
        public bool IsIndustryExist(int organizationId,string name)
        {
            return _industryService.IsIndustryExist(organizationId, name);
        }

        [HttpGet]
        [Route("api/Industries/GetAllSubIndustriesByParentId/{parentId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Industries", OperationKey = Operations.Read)]
        public List<IpsIndustryModel> GetAllSubIndustriesByParentId(int parentId)
        {
            return _industryService.GetAllSubIndustriesByParentId(parentId);
        }

        

        public IHttpActionResult GetIndustries(int id)
        {
             Industry result = _industryService.GetById(id);

             if (result == null)
             {
                 return NotFound();
             }
             return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(Industry industry)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Industry result = _industryService.Add(industry);

            return Ok(industry.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Industry industry)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Industry org = _industryService.GetById(industry.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _industryService.Update(industry);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            Industry industry = _industryService.GetById(id);
            if (industry == null)
            {
                return NotFound();
            }

            bool result = _industryService.Delete(industry);

            return Ok(result);
        }
    }
}
using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class RoleOrganisationPermissionController : BaseController
    {
        IRolePermitionsService _service;

        public RoleOrganisationPermissionController(IRolePermitionsService service)
        {
            _service = service;
        }

        [HttpGet]
        public IQueryable<OrganisationResourcePermission> GetByOrganisationRoleId(string id)
        {
            IQueryable<OrganisationResourcePermission> result = _service.GetByOrganisationRoleId(id);

           
            return result;
        }

        [HttpPut]
        public IHttpActionResult Update(List<OrganisationResourcePermission> OrganisationPermissions)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool result = _service.UpdateOrganisationPermission(OrganisationPermissions);
                
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }
    }
}
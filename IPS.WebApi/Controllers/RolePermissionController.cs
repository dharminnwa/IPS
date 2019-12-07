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
    public class RolePermissionController : BaseController
    {
        IRolePermitionsService _service;

        public RolePermissionController(IRolePermitionsService service)
        {
            _service = service;
        }

        [HttpGet]
        public IHttpActionResult GetRolePermission(string id)
        {
            IQueryable<IpsRolePermission> result = _service.GetByRoleId(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPut]
        public IHttpActionResult Update(List<IpsRolePermission> rolePermissions)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                bool result = _service.Update(rolePermissions);
                
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }
    }
}
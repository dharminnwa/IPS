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
    public class RoleController : BaseController
    {
        IRoleService _service;

        public RoleController(IRoleService service)
        {
            _service = service;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<IpsRole> Get()
        {
            return _service.Get();
        }


        [HttpGet]
        [Route("api/role/getRolesByOrganizationId/{organizationId}")]
        public List<IpsRole> GetRolesByOrganizationId(int organizationId)
        {
            return _service.GetRolesByOrganizationId(organizationId);
        }

        [HttpGet]
        [Route("api/role/GetRolesByLevelId/{levelId}")]
        public List<IpsRole> GetRolesByLevelId(int levelId)
        {
            return _service.GetRolesByLevelId(levelId);
        }


        public IHttpActionResult Get(string id)
        {
            IpsRole result = _service.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(IpsRole role)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            IpsRole result = _service.Add(role);

            return Ok(result.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(IpsRole role)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IpsRole original = _service.GetById(role.Id);

            if (original == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _service.Update(role);
                
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }

        [HttpDelete]
        public IHttpActionResult Delete(string id)
        {
            IpsRole role = _service.GetById(id);
            if (role == null)
            {
                return NotFound();
            }

            bool result = _service.Delete(role);

            return Ok(result);
        }
    }
}
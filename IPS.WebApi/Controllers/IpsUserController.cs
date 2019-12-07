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
    public class IpsUserController : BaseController
    {
        IIpsUserService _service;

        public IpsUserController(IIpsUserService userService)
        {
            _service = userService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<IpsUser> GetUsers()
        {
            return _service.Get();
        }

        [EnableQuery]
        [HttpGet]
        public SingleResult<IpsUser> GetUser(string id)
        {
            SingleResult<IpsUser> result = SingleResult.Create(_service.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(IpsUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                string result = _service.Add(user);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPut]
        public IHttpActionResult Update(IpsUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IpsUser original = _service.GetById(user.Id).FirstOrDefault();

            if (original == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _service.Update(user);
                
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }   
        }
    }
}
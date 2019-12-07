using IPS.Business;
using IPS.Data;
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
    public class LookupItemsController : BaseController
    {
        ILookupItemsService _lookupItemsService;

        public LookupItemsController(ILookupItemsService lookupItemsService)
        {
            _lookupItemsService = lookupItemsService;
        }

        
        [HttpGet]
        public IHttpActionResult GetLookupItems(string id)
        {
            List<LookupItem> result = _lookupItemsService.GetLookupItemByType(id);

             if (result == null)
             {
                 return NotFound();
             }
             return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(LookupItem lookupItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            LookupItem result = _lookupItemsService.Add(lookupItem);

            return Ok(lookupItem.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(LookupItem lookupItem)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            LookupItem org = _lookupItemsService.GetLookupItemById(lookupItem.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _lookupItemsService.Update(lookupItem);

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
            LookupItem lookupItem = _lookupItemsService.GetLookupItemById(id);
            if (lookupItem == null)
            {
                return NotFound();
            }

            string result = _lookupItemsService.Delete(lookupItem);
            if (result != "OK")
            {

                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }
        }

    }
}
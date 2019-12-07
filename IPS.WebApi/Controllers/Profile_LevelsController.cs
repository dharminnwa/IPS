using IPS.Business;
using IPS.BusinessModels.Common;
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
    public class Profile_LevelsController : BaseController
    {
        IStructureLevelService _structureLevelService;

        public Profile_LevelsController(IStructureLevelService structureLevelService)
        {
            _structureLevelService  = structureLevelService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<StructureLevel> GetStructureLevels()
        {
            return _structureLevelService.Get();
        }

        [HttpGet]
        [Route("api/StructureLevel/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _structureLevelService.GetDDL();
        }

        public IHttpActionResult GetStructureLevel(int id)
        {
            StructureLevel result = _structureLevelService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
            
        }

        [HttpPost]
        public IHttpActionResult Add(StructureLevel structureLevel)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            StructureLevel result = _structureLevelService.Add(structureLevel);

            return Ok(structureLevel.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(StructureLevel structureLevel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            StructureLevel org = _structureLevelService.GetById(structureLevel.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _structureLevelService.Update(structureLevel);

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
            StructureLevel structureLevel = _structureLevelService.GetById(id);
            if (structureLevel == null)
            {
                return NotFound();
            }

            bool result = _structureLevelService.Delete(structureLevel);

            return Ok(result);
        }
        
    }
}
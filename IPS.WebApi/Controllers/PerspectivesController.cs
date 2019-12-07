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
    public class PerspectivesController : BaseController
    {
        IScorecardPerspectiveService _scorecardPerspectiveService;

        public PerspectivesController(IScorecardPerspectiveService scorecardPerspectiveService)
        {
            _scorecardPerspectiveService = scorecardPerspectiveService;
        }

     
        [HttpGet]
        public IHttpActionResult GetScorecardPerspective(int id)
        {
            ScorecardPerspective result = _scorecardPerspectiveService.GetScorecardPerspectiveById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<ScorecardPerspective> GetScorecardPerspectives()
        {
            return _scorecardPerspectiveService.GetScorecardPerspectives();
        }

        [HttpPost]
        public IHttpActionResult Add(ScorecardPerspective scorecardPerspective)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            ScorecardPerspective result = _scorecardPerspectiveService.Add(scorecardPerspective);

            return Ok(scorecardPerspective.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ScorecardPerspective scorecardPerspective)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ScorecardPerspective org = _scorecardPerspectiveService.GetScorecardPerspectiveById(scorecardPerspective.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _scorecardPerspectiveService.Update(scorecardPerspective);

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
            ScorecardPerspective scorecardPerspective = _scorecardPerspectiveService.GetScorecardPerspectiveById(id);
            if (scorecardPerspective == null)
            {
                return NotFound();
            }

            bool result = _scorecardPerspectiveService.Delete(scorecardPerspective);

            return Ok(result);
        }
      
        
        
    }
}
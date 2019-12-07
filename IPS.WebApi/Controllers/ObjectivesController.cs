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
    public class ObjectivesController : BaseController
    {
        IScorecardGoalsService _scorecardGoalsService;

        public ObjectivesController(IScorecardGoalsService scorecardGoalsService)
        {
            _scorecardGoalsService = scorecardGoalsService;
        }

        [HttpGet]
        public IHttpActionResult GetScorecardObjective(int id)
        {
            ScorecardGoal result = _scorecardGoalsService.GetScorecardGoalById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<ScorecardGoal> GetScorecardObjectives()
        {
            return _scorecardGoalsService.GetScorecardGoals();
        }

        [HttpPost]
        public IHttpActionResult Add(ScorecardGoal scorecardGoal)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            ScorecardGoal result = _scorecardGoalsService.Add(scorecardGoal);

            return Ok(scorecardGoal.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ScorecardGoal scorecardGoal)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ScorecardGoal org = _scorecardGoalsService.GetScorecardGoalById(scorecardGoal.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _scorecardGoalsService.Update(scorecardGoal);

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
            ScorecardGoal scorecardGoal = _scorecardGoalsService.GetScorecardGoalById(id);
            if (scorecardGoal == null)
            {
                return NotFound();
            }

            bool result = _scorecardGoalsService.Delete(scorecardGoal);

            return Ok(result);
        }
    }
}
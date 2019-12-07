using System;
using IPS.Business;
using IPS.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Http;
using System.Web.OData;
using System.Collections.Generic;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TeamController : BaseController
    {
        readonly ITeamService _teamService;

        public TeamController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Team> GetTeams()
        {
            return _teamService.Get();
        }

        [HttpGet]
        [EnableQuery]
        [Route("api/teams/getTeamsByDepartmentId/{organizationId}/{departmentIds?}")]
        public IQueryable<Team> GetTeamsByOrganizationAndDepartment(int organizationId, string departmentIds)
        {
            var departmentArrayStr = departmentIds.Split(new[] { ";" }, StringSplitOptions.RemoveEmptyEntries);
            var departmIds = new List<int>();
            foreach (var departmentId in departmentArrayStr)
            {
                int intId;
                if (int.TryParse(departmentId, out intId))
                {
                    departmIds.Add(intId);
                }
            }
            var result = _teamService.GetTeamsByOrganizationAndDepartment(organizationId, departmIds);
            return result;
        }


        [HttpGet]
        [Route("api/teams/GetTeamsByOrganizationId/{organizationId}")]
        public List<Team> GetTeamsByOrganizationId(int organizationId)
        {
            var result = _teamService.GetTeamsByOrganizationId(organizationId);
            return result;
        }



        [EnableQuery]
        public SingleResult<Team> GetTeam(int id)
        {
            SingleResult<Team> result = SingleResult.Create(_teamService.GetById(id));

            return result;
        }
        [HttpGet]
        [Route("api/teams/GetTeamById/{teamId}")]
        public Team GetTeamById(int teamId)
        {
            Team result = _teamService.GetTeamById(teamId);
            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Team team)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Team result = _teamService.Add(team);

            return Ok(team.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Team team)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Team tm = _teamService.GetById(team.Id).FirstOrDefault();

            if (tm == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _teamService.Update(team);

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
            Team team = _teamService.GetById(id).FirstOrDefault();
            if (team == null)
            {
                return NotFound();
            }

            bool result = _teamService.Delete(team);

            return Ok(result);
        }
    }
}
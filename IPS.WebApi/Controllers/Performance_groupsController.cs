using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Data;
using log4net;
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
    // [Authorize]
    public class Performance_groupsController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        IPerformanceGroupService _performanceGroupService;

        public Performance_groupsController(IPerformanceGroupService performanceGroupService)
        {
            _performanceGroupService = performanceGroupService;
        }

        [HttpGet]
        [EnableQuery(MaxExpansionDepth = 4)]
        public IQueryable<PerformanceGroup> GetPerformanceGroups(int? profileTypeId = null)
        {
            return _performanceGroupService.Get(profileTypeId);
        }


        [EnableQuery(MaxExpansionDepth = 4)]
        public SingleResult<PerformanceGroup> GetPerformanceGroup(int id)
        {
            SingleResult<PerformanceGroup> result = SingleResult.Create(_performanceGroupService.GetById(id));
            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(PerformanceGroup performanceGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                PerformanceGroup result = _performanceGroupService.Add(performanceGroup);
                return Ok(performanceGroup.Id);
            }
            catch (Exception ex)
            {
                Log.Error("Perfomance Group creation failed!", ex);
                return BadRequest("Perfomance Group creation failed!");
            }


        }

        [HttpPut]
        public IHttpActionResult Update(PerformanceGroup performanceGroup)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            PerformanceGroup obj = _performanceGroupService.GetById(performanceGroup.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                _performanceGroupService.Update(performanceGroup);
                return Ok();
            }
            catch (Exception ex)
            {
                Log.Error("Perfomance Group update failed!", ex);
                return BadRequest("Perfomance Group update failed!");
            }


        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(id).FirstOrDefault();
            if (performanceGroup == null)
            {
                return NotFound();
            }
            try
            {
                bool result = _performanceGroupService.Delete(performanceGroup);
                if (!result)
                {
                    return BadRequest("Performance Group has answers or linked to profile with active or past stages");
                }
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [Route("api/RemoveSkillFromPerformanceGroup/{performanceGroupId}/{skillID}")]
        [HttpDelete]
        public IHttpActionResult RemoveSkillFromPerformanceGroup(int performanceGroupId, int skillID)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();
            if (performanceGroup == null)
            {
                return NotFound();
            }
            try
            {
                bool result = _performanceGroupService.RemoveSkillFromPerformanceGroup(performanceGroupId, skillID);
                if (!result)
                {
                    return BadRequest("No Skills found to remove");
                }
                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }

        }

        [Route("api/performance_groups/{performanceGroupId}/skills")]
        [HttpPost]
        public IHttpActionResult AddSkillToPerformanceGroup(int performanceGroupId, int[] skills)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            bool result = _performanceGroupService.AddSkillToPerformanceGroup(performanceGroupId, skills);

            return Ok(result);
        }

        [Route("api/performance_groups/{performanceGroupId}/skills")]
        [HttpPut]
        public IHttpActionResult UpdateSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            bool result = _performanceGroupService.UpdateSkillInPerformanceGroup(performanceGroupId, link_skills);

            return Ok(result);
        }


        [Route("api/performance_groups/{performanceGroupId}/newskills")]
        [HttpPut]
        public IHttpActionResult UpdateNewSkillInPerformanceGroup(int performanceGroupId, Link_PerformanceGroupSkills[] link_skills)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            List<Link_PerformanceGroupSkills> result = _performanceGroupService.UpdateNewSkillInPerformanceGroup(performanceGroupId, link_skills);

            return Ok(result);
        }


        [Route("api/performance_groups/{performanceGroupId}/trainings")]
        [HttpPost]
        public IHttpActionResult AddTrainingToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            bool result = _performanceGroupService.AddTrainingToPerformanceGroup(performanceGroupId, PGskillTrainings);

            return Ok(result);
        }

        [Route("api/performance_groups/{performanceGroupId}/trainings")]
        [HttpPut]
        public IHttpActionResult UpdateTrainingInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillTraining[] PGskillTrainings)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            bool result = _performanceGroupService.UpdateTrainingInPerformanceGroup(performanceGroupId, PGskillTrainings);

            return Ok(result);
        }

        [Route("api/performance_groups/{performanceGroupId}/questions")]
        [HttpPost]
        public IHttpActionResult AddQuestionToPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            bool result = _performanceGroupService.AddQuestionToPerformanceGroup(performanceGroupId, PGskillQuestions);

            return Ok(result);
        }


        [Route("api/performance_groups/{performanceGroupId}/questions")]
        [HttpPut]
        public IHttpActionResult UpdateQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            _performanceGroupService.UpdateQuestionInPerformanceGroup(performanceGroupId, PGskillQuestions);

            return Ok(HttpStatusCode.OK);
        }

        [Route("api/performance_groups/{performanceGroupId}/newquestions")]
        [HttpPut]
        public List<IpsPerformanceGroupSkillQuestion> UpdateNewQuestionInPerformanceGroup(int performanceGroupId, IpsPerformanceGroupSkillQuestion[] PGskillQuestions)
        {
            List<IpsPerformanceGroupSkillQuestion> result = new List<IpsPerformanceGroupSkillQuestion>();
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return null;
            }

            result = _performanceGroupService.UpdateNewQuestionInPerformanceGroup(performanceGroupId, PGskillQuestions);

            return result;
        }

        [Route("api/performance_groups/clone/{performanceGroupId}")]
        [HttpPut]
        public IHttpActionResult ClonePerformanceGroup(int performanceGroupId)
        {
            try
            {
                PerformanceGroup performanceGroupDB = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

                if (performanceGroupDB == null)
                {
                    return NotFound();
                }
                string newPerformanceGroupName = performanceGroupDB.Name + " clone";
                PerformanceGroup performanceGroup = _performanceGroupService.ClonePerformanceGroup(performanceGroupDB, newPerformanceGroupName);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error("ClonePerformanceGroup", ex);
                return BadRequest("Performance groups was not cloned due to server error");
            }
        }

        [Route("api/performance_groups/{performanceGroupId}/order/{value}")]
        [HttpPut]
        public IHttpActionResult UpdatePerformanceGroupOrder(int performanceGroupId, int value)
        {
            PerformanceGroup performanceGroup = _performanceGroupService.GetById(performanceGroupId).FirstOrDefault();

            if (performanceGroup == null)
            {
                return NotFound();
            }

            performanceGroup.SeqNo = value;

            try
            {
                _performanceGroupService.Update(performanceGroup);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error("Perfomance Group update failed!", ex);
                return BadRequest("Perfomance Group update failed!");
            }

        }


        [HttpGet]
        [Route("api/performance_groups/GetAllWithProfile")]
        public List<IpsPerformanceGroup> GetPerformanceGroupsWithProfile()
        {
            return _performanceGroupService.GetPerformanceGroupsWithProfile();
        }

        [Route("api/performance_groups/getPerformanceGroupTemplates/{projectId}")]
        [HttpGet]
        public List<PerformanceGroup> getPerformanceGroupTemplates(int projectId)
        {
            return _performanceGroupService.getPerformanceGroupTemplates(projectId);
        }
    }
}
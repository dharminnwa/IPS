using IPS.Business;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.SkillModels;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class SkillsController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        ISkillsService _skillsService;

        public SkillsController(ISkillsService skillsService)
        {
            _skillsService = skillsService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Skill> GetSkills()
        {
            return _skillsService.Get();
        }

        [HttpGet]
        [Route("api/skills/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _skillsService.GetDDL();
        }


        [HttpGet]
        [EnableQuery]
        [Route("api/skills/GetSkillsWithTrainings")]
        public IQueryable<Skill> GetSkillsWithTrainings()
        {
            return _skillsService.GetSkillsWithTrainings();
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<Skill> GetByOrganisation(int organisationID)
        {
            return _skillsService.GetByOrganisation(organisationID);
        }

        [HttpPost]
        [Route("api/skills/GetFilteredSkill")]
        public List<IpsSkillDDL> GetFilteredSkill(IpsSkillFilter ipsSkillFilter)
        {
            return _skillsService.GetFilteredSkill(ipsSkillFilter);
        }

        [HttpGet]
        [Route("api/skills/GetTrainingsSkills")]
        public List<IpsSkillDDL> GetTrainingsSkills()
        {
            return _skillsService.GetTrainingsSkills();
        }

        [HttpPost]
        [Route("api/skills/GetFilteredProfileSkill")]
        public List<IpsFilterSkillResultModel> GetFilteredProfileSkill(IpsSkillFilter ipsSkillFilter)
        {
            return _skillsService.GetFilteredProfileSkill(ipsSkillFilter);
        }

        [HttpGet]
        [Route("api/skills/GetSkillCSFList/{skillId}")]
        public List<string> GetSkillCSFList(int skillId)
        {
            return _skillsService.GetSkillCSFList(skillId);
        }
        [HttpGet]
        [Route("api/skills/GetSkillActionList/{skillId}")]
        public List<string> GetSkillActionList(int skillId)
        {
            return _skillsService.GetSkillActionList(skillId);
        }

        [EnableQuery]
        public SingleResult<Skill> GetSkills(int id)
        {
            SingleResult<Skill> result = SingleResult.Create(_skillsService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Skill skill)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Skill result = _skillsService.Add(skill);

            return Ok(skill.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Skill skill)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Skill obj = _skillsService.GetById(skill.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _skillsService.Update(skill);

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
            try
            {
                Skill skill = _skillsService.GetById(id).FirstOrDefault();
                if (skill == null)
                {
                    return NotFound();
                }

                _skillsService.Delete(skill);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateException ex)
            {
                Log.Error(ex);
                return BadRequest("Skill is used in performance group or is parent for other skill");
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Skill was not deleted due to server error");
            }
        }

        [HttpPost]
        [EnableQuery]
        [Route("api/skills/search")]

        public IQueryable<Skill> Search(IpsSkillFilter id)
        {

            IQueryable<Skill> result = _skillsService.SkillFilter(id);

            return result;
        }

        [Route("api/skills/clone/{skillId}")]
        [HttpPost]
        public IHttpActionResult CloneSkill(int skillId)
        {
            try
            {
                if (!_skillsService.IsSkillExist(skillId))
                {
                    return NotFound();
                }

                Skill skill = _skillsService.CloneSkill(skillId);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Skill was not cloned due to server error");
            }
        }



        [Route("api/skills/getSkillsByProfileId/{profileId}")]
        [HttpGet]
        public List<IpsSkillDDL> getSkillsByProfileId(int profileId)
        {
            List<IpsSkillDDL> result = new List<IpsSkillDDL>();
            try
            {
                result = _skillsService.getSkillsByProfileId(profileId);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
            }
            return result;
        }

        [Route("api/skills/getProfileSkills/{profileId}")]
        [HttpGet]
        public List<IpsProfileSkillModel> getProfileSkills(int profileId)
        {
            List<IpsProfileSkillModel> result = new List<IpsProfileSkillModel>();
            try
            {
                result = _skillsService.getProfileSkills(profileId);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
            }
            return result;
        }


        [Route("api/skills/getSkillsByProspectingGoalId/{prospectingGoalId}")]
        [HttpGet]
        public List<IpsSkillDDL> getSkillsByProspectingGoalId(int prospectingGoalId)
        {
            List<IpsSkillDDL> result = new List<IpsSkillDDL>();
            try
            {
                result = _skillsService.getSkillsByProspectingGoalId(prospectingGoalId);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
            }
            return result;
        }
    }
}
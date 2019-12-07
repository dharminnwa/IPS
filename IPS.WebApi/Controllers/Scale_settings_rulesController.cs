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
    public class Scale_settings_rulesController : BaseController
    {
        IProfileScaleSettingsRuleService _profileScaleSettingsRuleService;

        public Scale_settings_rulesController(IProfileScaleSettingsRuleService profileScaleSettingsRuleServiceService)
        {
            _profileScaleSettingsRuleService = profileScaleSettingsRuleServiceService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<ProfileScaleSettingsRule> GetProfileScaleSettingsRules()
        {
            return _profileScaleSettingsRuleService.Get();
        }

        public IHttpActionResult GetProfileScaleSettingsRule(int id)
        {
            ProfileScaleSettingsRule result = _profileScaleSettingsRuleService.GetById(id);
            result = _profileScaleSettingsRuleService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(ProfileScaleSettingsRule profileScaleSettingsRule)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            ProfileScaleSettingsRule result = _profileScaleSettingsRuleService.Add(profileScaleSettingsRule);

            return Ok(profileScaleSettingsRule.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ProfileScaleSettingsRule profileScaleSettingsRule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ProfileScaleSettingsRule org = _profileScaleSettingsRuleService.GetById(profileScaleSettingsRule.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _profileScaleSettingsRuleService.Update(profileScaleSettingsRule);

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
            ProfileScaleSettingsRule profileScaleSettingsRule = _profileScaleSettingsRuleService.GetById(id);
            if (profileScaleSettingsRule == null)
            {
                return NotFound();
            }

            bool result = _profileScaleSettingsRuleService.Delete(profileScaleSettingsRule);

            return Ok(result);
        }
    }
}
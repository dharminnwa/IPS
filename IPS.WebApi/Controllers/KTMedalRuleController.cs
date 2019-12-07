using IPS.Business;
using IPS.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class KTMedalRuleController : BaseController
    {
        private readonly IKTMedalRuleService _kTMedalRuleService;

        public KTMedalRuleController(IKTMedalRuleService kTMedalRuleService)
        {
            _kTMedalRuleService = kTMedalRuleService;
        }

        [HttpGet]
        [Route("api/ktmedalrule")]
        public IHttpActionResult GetKTMedalRules()
        {
            var items = _kTMedalRuleService.Get().Select(x => new { x.Id, x.Name, x.BronzeStart, x.BronzeEnd, x.SilverEnd }).OrderBy(x=>x.Name).ToList();
            return Ok(items);
        }

        [HttpGet]
        [Route("api/ktmedalrule/{id}")]
        public IHttpActionResult GetKTMedalRule(int id)
        {
            KTMedalRule result = _kTMedalRuleService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(new
            {
                result.Id,
                result.Name,
                result.BronzeEnd,
                result.BronzeStart,
                result.SilverEnd
            });
        }

        [HttpGet]
        [Route("api/ktmedalrule/checkinuse/{id}")]
        public IHttpActionResult CheckInUse(int id)
        {
            var result = _kTMedalRuleService.IsMedalRuleInUse(id);
            return Ok(result);
        }

        [HttpPost]
        [Route("api/ktmedalrule")]
        public IHttpActionResult Add(KTMedalRule kTMedalRule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            KTMedalRule result = _kTMedalRuleService.Add(kTMedalRule);

            return Ok(kTMedalRule.Id);
        }

        [HttpPut]
        [Route("api/ktmedalrule")]
        public IHttpActionResult Update(KTMedalRule kTMedalRule)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            KTMedalRule org = _kTMedalRuleService.GetById(kTMedalRule.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _kTMedalRuleService.Update(kTMedalRule);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpDelete]
        [Route("api/ktmedalrule/{id}")]
        public IHttpActionResult Delete(int id)
        {
            KTMedalRule kTMedalRule = _kTMedalRuleService.GetById(id);
            if (kTMedalRule == null)
            {
                return NotFound();
            }

            bool result = _kTMedalRuleService.Delete(kTMedalRule);

            return Ok(result);
        }

        [Route("api/ktmedalrule/{id}/clone")]
        [HttpPost]
        public IHttpActionResult CloneKtMedalRule(int Id)
        {
            try
            {
                if (!_kTMedalRuleService.IsMedalRuleExist(Id))
                {
                    return NotFound();
                }

                KTMedalRule ktMedalRuleCopy = _kTMedalRuleService.CloneMedalRule(Id);

                return Ok(HttpStatusCode.OK);
            }
            catch
            {
                return BadRequest("KtMedalRule was not cloned due to server error");
            }
        }
    }
}
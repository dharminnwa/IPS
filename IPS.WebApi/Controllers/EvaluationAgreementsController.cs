using IPS.Business;
using IPS.BusinessModels.Entities;
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
    public class EvaluationAgreementsController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        IEvaluationAgreementsService _evaluationAgreementsService;

        public EvaluationAgreementsController(IEvaluationAgreementsService evaluationAgreementsService)
        {
            _evaluationAgreementsService = evaluationAgreementsService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<EvaluationAgreement> GetEvaluationAgreements()
        {
            return _evaluationAgreementsService.GetEvaluationAgreements();
        }

   
        [EnableQuery]
        public SingleResult<EvaluationAgreement> GetEvaluationAgreement(int id)
        {
            SingleResult<EvaluationAgreement> result = SingleResult.Create(_evaluationAgreementsService.GetEvaluationAgreementById(id));
            return result;
        }


        [HttpPost]
        public IHttpActionResult AddEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _evaluationAgreementsService.AddEvaluationAgreement(evaluationAgreements);

            return Ok(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/EvaluationAgreements/AddTeamEvaluationAgreement")]
        public IHttpActionResult AddTeamEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _evaluationAgreementsService.UpdateTeamEvaluationAgreement(evaluationAgreements);

            return Ok(HttpStatusCode.OK);
        }

        [HttpPut]
        public IHttpActionResult UpdateEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _evaluationAgreementsService.UpdateEvaluationAgreement(evaluationAgreements);

                return Ok();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }

        [HttpDelete]
        public IHttpActionResult DeleteEvaluationAgreement(int id)
        {
            try
            {
                EvaluationAgreement evaluationAgreement = _evaluationAgreementsService.GetEvaluationAgreementById(id).FirstOrDefault();
                if (evaluationAgreement == null)
                {
                    return NotFound();
                }

                _evaluationAgreementsService.DeleteEvaluationAgreement(evaluationAgreement);

                return Ok(HttpStatusCode.OK);
            }
            catch (DbUpdateException ex)
            {
                Log.Error(ex);
                return BadRequest("EvaluationAgreement is used in training");
            }
            catch (Exception ex)
            {
                Log.Error(ex);
                return BadRequest("EvaluationAgreement was not deleted due to server error");
            }
        }
    }
}
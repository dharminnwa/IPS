using IPS.Business;
using IPS.Business.Interfaces;
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
    public class EvaluationParticipantsController : BaseController
    {
        IEvaluationParticipantsService _EvaluationParticipantsService;

        public EvaluationParticipantsController(IEvaluationParticipantsService evaluationParticipantservice)
        {
            _EvaluationParticipantsService = evaluationParticipantservice;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<EvaluationParticipant> GetEvaluationParticipants()
        {
            return _EvaluationParticipantsService.GetEvaluationParticipants();
        }

   
        [EnableQuery]
        public SingleResult<EvaluationParticipant> GetEvaluationParticipants(int id)
        {
            SingleResult<EvaluationParticipant> result = SingleResult.Create(_EvaluationParticipantsService.GetEvaluationParticipantsById(id).AsQueryable());

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(EvaluationParticipant evaluationParticipant)
        {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             EvaluationParticipant result = _EvaluationParticipantsService.Add(evaluationParticipant);

             return Ok(result.Id);
        }
        /*
         [HttpPut]
         public IHttpActionResult Update(EvaluationRole notificationTemplate)
         {
             if (!ModelState.IsValid)
             {
                 return BadRequest(ModelState);
             }

             NotificationTemplate obj = _notificationTemplatesService.GetById(notificationTemplate.Id).FirstOrDefault();

             if (obj == null)
             {
                 return NotFound();
             }

             try
             {
                 bool result = _notificationTemplatesService.Update(notificationTemplate);

                 return Ok(result);
             }
             catch (DbUpdateConcurrencyException ex)
             {
                 return InternalServerError(ex);
                
             }
                
            
         }*/

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            EvaluationParticipant evaluationParticipant = _EvaluationParticipantsService.GetEvaluationParticipantsById(id).FirstOrDefault();
            if (evaluationParticipant == null)
            {
                return NotFound();
            }

            string result = _EvaluationParticipantsService.Delete(evaluationParticipant);
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
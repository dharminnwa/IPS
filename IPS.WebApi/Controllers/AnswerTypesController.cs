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
    public class AnswerTypesController : BaseController
    {
        IAnswerTypesService _answerTypesService;

        public AnswerTypesController(IAnswerTypesService answerTypesService)
        {
            _answerTypesService = answerTypesService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<AnswerType> GetAnswersTypes()
        {
            return _answerTypesService.Get();
        }

   
        [EnableQuery]
        public SingleResult<AnswerType> GetAnswerType(int id)
        {
            SingleResult<AnswerType> result = SingleResult.Create(_answerTypesService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(AnswerType answerType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AnswerType result = _answerTypesService.Add(answerType);

            return Ok(answerType.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(AnswerType answerType)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            AnswerType obj = _answerTypesService.GetById(answerType.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _answerTypesService.Update(answerType);

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
            AnswerType department = _answerTypesService.GetById(id).FirstOrDefault();
            if (department == null)
            {
                return NotFound();
            }

            bool result = _answerTypesService.Delete(department);

            return Ok(result);
        }
    }
}
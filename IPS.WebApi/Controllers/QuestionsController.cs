using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Data;
using log4net;
using System;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;
using IPS.Data.Enums;
using System.Collections.Generic;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class QuestionsController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private readonly IQuestionsService _questionsService;
        private readonly IAnswerTypesService _answerTypesService;
        private readonly IProfileService _profileService;

        public QuestionsController(IQuestionsService questionsService, IAnswerTypesService answerTypesService,
            IProfileService profileService)
        {
            _questionsService = questionsService;
            _answerTypesService = answerTypesService;
            _profileService = profileService;
        }

        [HttpGet]
        [EnableQuery(MaxNodeCount = int.MaxValue)]
        public IQueryable<Question> GetQuestions()
        {
            return _questionsService.Get();
        }


        [EnableQuery]
        public SingleResult<Question> GetQuestion(int id)
        {
            SingleResult<Question> result = SingleResult.Create(_questionsService.GetById(id));

            /*if (result.Queryable. == null)
            {
                return NotFound();
            }*/

            return result;
        }


        [HttpPost]
        public IHttpActionResult Add(Question question)
        {
            Question result = _questionsService.Add(question);

            return Ok(question.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Question question)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Question obj = _questionsService.GetById(question.Id).FirstOrDefault();

            if (obj == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _questionsService.Update(question);

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
                Question question = _questionsService.GetById(id).FirstOrDefault();
                if (question == null)
                {
                    return NotFound();
                }

                _questionsService.Delete(question);

                return Ok(HttpStatusCode.OK);

            }
            catch (DbUpdateException ex)
            {
                Log.Error(ex);
                return BadRequest("Question is used in performance group or skill");
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Questionn was not deleted due to server error");
            }
        }

        [HttpGet]
        [Route("api/questions/getProfileQuestions/{profileId}")]
        public List<Question> getProfileQuestions(int profileId)
        {
            return _questionsService.getProfileQuestions(profileId);
        }

        [HttpGet]
        [Route("api/questions/types")]

        public IHttpActionResult GetQuestionTypes()
        {
            var allowedQuestionTypes = Enum.GetValues(typeof(QuestionTypeEnum)).Cast<int>().ToList();
            var result = _answerTypesService.Get().Where(x => allowedQuestionTypes.Any(qt => qt == x.Id)).Select(x => new { Id = x.Id, Name = x.TypeName }).ToList();
            return Ok(result);
        }

        [HttpPost]
        [EnableQuery]
        [Route("api/questions/search")]

        public IQueryable<Question> Search(IpsQuestionFilter id)
        {

            IQueryable<Question> result = _questionsService.QuestionFilter(id);

            return result;
        }


        [Route("api/Questions/{questionId}/order/{value}")]
        [HttpPut]
        public IHttpActionResult UpdateQuestionsGroupOrder(int questionId, int value)
        {
            Question question = _questionsService.GetById(questionId).FirstOrDefault();

            if (question == null)
            {
                return NotFound();
            }

            question.SeqNo = value;

            bool result = _questionsService.Update(question);

            return Ok(result);
        }

        [Route("api/questions/clone/{questionId}")]
        [HttpPost]
        public IHttpActionResult CloneQuestion(int questionId)
        {
            try
            {
                Question questionDB = _questionsService.GetById(questionId).FirstOrDefault();


                if (questionDB == null)
                {
                    return NotFound();
                }

                string newQuestionText = questionDB.QuestionText + " clone";
                Question question = _questionsService.CloneQuestion(questionDB, newQuestionText);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Question was not cloned due to server error");
            }
        }

        [Route("api/questions/{id}/profile_in_use")]
        [HttpGet]
        public bool IsProfileInUse(int id)
        {
            return _profileService.IsProfileInUseByQuestion(id);
        }
    }
}
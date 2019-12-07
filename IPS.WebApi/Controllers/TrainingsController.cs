using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using IPS.WebApi.Filters;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class TrainingsController : BaseController
    {
        private readonly ITrainingService _trainingService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public TrainingsController(ITrainingService trainingService)
        {
            _trainingService = trainingService;
        }


        [HttpGet]
        public List<IpsTrainingModel> GetTrainings()
        {
            return _trainingService.Get();
        }

        [HttpGet]
        [Route("api/trainings/GetTemplates")]
        public List<IpsTrainingModel> GetTemplates()
        {
            return _trainingService.GetTemplates();
        }

        [HttpGet]
        [Route("api/trainings/GetTrainingDetailById/{trainingId}")]
        public IpsTrainingModel GetTrainingDetailById(int trainingId)
        {
            return _trainingService.GetTrainingDetailById(trainingId);
        }

        [HttpPost]
        public IHttpActionResult Add(Training training)
        {
            return Ok(_trainingService.Add(training));
        }

        [HttpPut]
        public IHttpActionResult Update(Training training)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IpsTrainingModel org = _trainingService.GetTrainingDetailById(training.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _trainingService.Update(training);

                return Ok(training);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            IpsTrainingModel training = _trainingService.GetTrainingDetailById(id);
            if (training == null)
            {
                return NotFound();
            }

            string result = _trainingService.Delete(training);
            if (result != "OK")
            {

                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }
        }


        [HttpDelete]
        [Route("api/trainings/deleteperformancegrouptraining/{id}")]
        public IHttpActionResult DeletePerformanceGroupTraining(int id)
        {
            IpsTrainingModel training = _trainingService.GetTrainingDetailById(id);
            if (training == null)
            {
                return NotFound();
            }

            string result = _trainingService.DeletePerformanceGroupTraining(training);
            if (result != "OK")
            {

                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }
        }

        [Route("api/trainings/checkinuse/{id}")]
        [HttpGet]
        public IHttpActionResult CheckTrainingInUse(int id)
        {
            try
            {
                _trainingService.CheckTrainingInUse(id);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/trainings/checkperformancegrouptraininginuse/{id}")]
        [HttpGet]
        public IHttpActionResult CheckPerformanceGroupTrainingInUse(int id)
        {
            try
            {
                _trainingService.CheckPerformanceGroupTrainingInUse(id);
                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("api/trainings/clone/{trainingId}")]
        [HttpPost]
        public IHttpActionResult CloneTraining(int trainingId)
        {
            try
            {
                if (!_trainingService.IsTrainingExist(trainingId))
                {
                    return NotFound();
                }


                Training training = _trainingService.CloneTraining(trainingId);

                return Ok(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return BadRequest("Training was not cloned due to server error");
            }
        }

        [Route("api/trainings/TrainingFeedback")]
        [HttpPost]
        public IHttpActionResult AddTrainingFeedback(TrainingFeedback trainingFeedback)
        {
            return Ok(_trainingService.AddTrainingFeedback(trainingFeedback));
        }

        [Route("api/trainings/SaveTrainingNote")]
        [HttpPost]
        public IHttpActionResult SaveTrainingNote(TrainingNote trainingNote)
        {
            return Ok(_trainingService.SaveTrainingNote(trainingNote));
        }


        [Route("api/trainings/GetTrainingFeedbacks/{trainingId}")]
        [HttpGet]
        public List<IPSTrainingFeedback> GetTrainingFeedbacks(int trainingId)
        {
            return _trainingService.getTrainingFeedbacks(trainingId);

        }

        [Route("api/trainings/TrainingFeedback/{Id}")]
        [HttpGet]
        public IPSTrainingFeedback GetTrainingFeedbackById(int Id)
        {
            return _trainingService.getTrainingFeedbackById(Id);
        }


        [Route("api/trainings/FilterTraining")]
        [HttpPost]
        public List<IpsTrainingModel> GetFilterTraining(IpsTrainingFilter ipsTrainingFilter)
        {
            return _trainingService.FilterTraining(ipsTrainingFilter);
        }

        [Route("api/trainings/FilterSkillTraining")]
        [HttpPost]
        public List<IpsTrainingModel> FilterSkillTraining(IpsTrainingFilter ipsTrainingFilter)
        {
            return _trainingService.FilterSkillTraining(ipsTrainingFilter);
        }

        [Route("api/trainings/getTrainingTemplatesBySkill/{skillId}")]
        [HttpGet]
        public List<IpsTrainingModel> getTrainingTemplatesBySkill(int skillId)
        {
            return _trainingService.getTrainingTemplatesBySkill(skillId);
        }



        [Route("api/trainings/GetProjectTrainings/{projectId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Trainings", OperationKey = Operations.Read, CheckProjectLevelPermission = true)]
        [HttpPost]
        public List<IpsTrainingModel> GetProjectTrainings(int projectId)
        {
            return _trainingService.GetProjectTrainings(projectId);
        }
    }
}
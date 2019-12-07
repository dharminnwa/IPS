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
    public class EvaluationRolesController : BaseController
    {
        IEvaluationRolesService _evaluationRoleService;

        public EvaluationRolesController(IEvaluationRolesService evaluationRoleService)
        {
            _evaluationRoleService = evaluationRoleService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<EvaluationRole> GetEvaluationRoles()
        {
            return _evaluationRoleService.GetEvaluationRoles();
        }

   
        [EnableQuery]
        public SingleResult<EvaluationRole> GetEvaluationRoles(int id)
        {
            SingleResult<EvaluationRole> result = SingleResult.Create(_evaluationRoleService.GetEvaluationRolesById(id));

            return result;
        }

       /* [HttpPost]
        public IHttpActionResult Add(EvaluationRole notificationTemplate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            EvaluationRole result = _notificationTemplatesService.Add(notificationTemplate);

            return Ok(notificationTemplate.Id);
        }

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
                
            
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            EvaluationRole notificationTemplate = _notificationTemplatesService.GetById(id).FirstOrDefault();
            if (notificationTemplate == null)
            {
                return NotFound();
            }
            
            string result = _notificationTemplatesService.Delete(notificationTemplate);
            if (result != "OK")
            {
                
                return BadRequest(result);
            }
            else
            {
                return Ok(HttpStatusCode.OK);
            }
        }*/
    }
}
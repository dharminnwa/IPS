using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.NotificationTemplateModels;
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
    public class NotificationTemplatesController : BaseController
    {
        INotificationTemplatesService _notificationTemplatesService;

        public NotificationTemplatesController(INotificationTemplatesService NotificationTemplatesService)
        {
            _notificationTemplatesService = NotificationTemplatesService;
        }

        [HttpGet]
        [EnableQuery]
        public IQueryable<NotificationTemplate> GetNotificationTemplates()
        {
            return _notificationTemplatesService.Get();
        }

        [HttpGet]
        [Route("api/NotificationTemplates/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _notificationTemplatesService.GetDDL();
        }

        [HttpGet]
        [Route("api/NotificationTemplates/GetNotificationTemplateTypesDDL")]
        public List<NotificationTemplateType> GetNotificationTemplateTypesDDL()
        {
            return _notificationTemplatesService.GetNotificationTemplateTypesDDL();
        }

        [HttpGet]
        [Route("api/NotificationTemplates/GetNotificationTemplateById/{id}")]
        public IPSNotificationTemplateModel GetNotificationTemplateById(int id)
        {
            return _notificationTemplatesService.GetNotificationTemplateById(id);
        }

        [EnableQuery]
        public SingleResult<NotificationTemplate> GetNotificationTemplates(int id)
        {
            SingleResult<NotificationTemplate> result = SingleResult.Create(_notificationTemplatesService.GetById(id));

            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(NotificationTemplate notificationTemplate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            NotificationTemplate result = _notificationTemplatesService.Add(notificationTemplate);

            return Ok(notificationTemplate.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(NotificationTemplate notificationTemplate)
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
            NotificationTemplate notificationTemplate = _notificationTemplatesService.GetById(id).FirstOrDefault();
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
        }


        [HttpPost]
        [Route("api/NotificationTemplates/clone/{id}")]
        public bool CloneNotificationTemplateById(int id)
        {
            return _notificationTemplatesService.CloneNotificationTemplateById(id);
        }
    }
}
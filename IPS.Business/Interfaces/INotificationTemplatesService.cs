using IPS.BusinessModels.Common;
using IPS.BusinessModels.NotificationTemplateModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business
{
    public interface INotificationTemplatesService
    {
        NotificationTemplate Add(NotificationTemplate notificationTemplate);
        string Delete(NotificationTemplate notificationTemplate);
        IQueryable<NotificationTemplate> Get();
        List<IPSDropDown> GetDDL();
        List<NotificationTemplateType> GetNotificationTemplateTypesDDL();
        IQueryable<NotificationTemplate> GetById(int id);
        bool Update(NotificationTemplate notificationTemplate);

        IPSNotificationTemplateModel GetNotificationTemplateById(int id);
        bool CloneNotificationTemplateById(int id);
    }
}

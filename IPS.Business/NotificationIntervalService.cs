using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IPS.Data;
using IPS.Business.Interfaces;

namespace IPS.Business
{
    public class NotificationIntervalService : BaseService, INotificationIntervalService
    {
        public IQueryable<NotificationInterval> GetAllNotificationIntervals()
        {
            return _ipsDataContext.NotificationIntervals.AsQueryable();
        }
    }
}

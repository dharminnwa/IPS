using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IPS.Data;

namespace IPS.Business.Interfaces
{
    public interface INotificationIntervalService
    {
        IQueryable<NotificationInterval> GetAllNotificationIntervals();
    }
}

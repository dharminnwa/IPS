using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Linq;
using System.Collections.Generic;
namespace IPS.Business
{
    public interface IReminderService
    {
        List<IpsReminder> GetReminders(int userId);
        void SetRemindMeDate(string reminderId, DateTime remindAt);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data.Enums
{
    public enum NotificationTemplateTypeEnum
    {
        MilestoneStartNotification = 1,
        GreenMilestoneAlarm = 2,
        YellowMilestoneAlarm = 3,
        RedMilestoneAlarm = 4,
        ProfileTrainingNotification = 5,
        RecurrentTrainingNotification = 6,
        PersonalTrainingNotification = 7,
        Tasks = 8,
        MilestoneCompleteNotification = 9,
        MilestoneResultNotification = 10,
        GreenTrainingAlarm = 11,
        YellowTrainingAlarm = 12,
        RedTrainingAlarm = 13,
    }
}

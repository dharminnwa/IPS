using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business.Utils
{
    class Nullify
    {
        public static void Profile(Profile profile) 
        {
            profile.Industry = null;
            profile.KTMedalRule = null;
            profile.PerformanceGroups = null;
            profile.ProfileCategory = null;
            profile.ProfileScaleSettingsRule = null;
            profile.ProfileType = null;
            profile.Scale = null;
            profile.StructureLevel = null;
            profile.StageGroups = null;
            profile.JobPositions = null;
            profile.Organization = null;
        }

        public static void Stage(Stage stage)
        {
            stage.Answers = null;
            stage.EvaluationAgreements = null;
            stage.EvaluationStatuses = null;
            stage.StageGroup = null;
            stage.NotificationTemplate = null;
            stage.NotificationTemplate1 = null;
            stage.NotificationTemplate2 = null;
            stage.NotificationTemplate3 = null;
            stage.NotificationTemplate4 = null;
            stage.NotificationTemplate5 = null;
            stage.NotificationTemplate6 = null;
            stage.NotificationTemplate7 = null;
            stage.NotificationTemplate8 = null;
            stage.NotificationTemplate9 = null;
            stage.NotificationTemplate10 = null;
            stage.NotificationTemplate11 = null;
            stage.NotificationTemplate12 = null;
            stage.NotificationTemplate13 = null;
            stage.NotificationTemplate14 = null;
            stage.NotificationTemplate15 = null;
            stage.NotificationTemplate16 = null;
            stage.NotificationTemplate17 = null;
            stage.NotificationTemplate18 = null;
            stage.NotificationTemplate19 = null;
            stage.NotificationTemplate20 = null;
            stage.NotificationTemplate21 = null;
            stage.NotificationTemplate22 = null;
            stage.NotificationTemplate23 = null;
        }

        public static void User(User user)
        {
            user.Culture = null;
            user.Departments = null;
            user.Departments1 = null;
            user.JobPositions = null;
            user.Link_TeamUsers = null;
            user.Organization = null;
            user.Stages = null;
            user.Stages1 = null;
            user.Teams = null;
            user.UserType = null;
        }

    }
}

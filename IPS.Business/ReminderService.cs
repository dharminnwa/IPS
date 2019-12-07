using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public class ReminderService : BaseService, IReminderService
    {
        public List<IpsReminder> GetReminders(int userId)
        {
            List<IpsReminder> reminders = new List<IpsReminder>();

            var service = new PerformanceService();
            var userProfiles = service.GetUserProfiles(userId);
            foreach (var ap in userProfiles.ActiveProfiles)
            {
                if (ap.Status != null && ap.Status.RemindAt != null && ap.Status.RemindAt > DateTime.Now)
                    continue;

                BusinessModels.Enums.ReminderType rType;
                if (!ap.IsSurveyPassed)
                    rType = BusinessModels.Enums.ReminderType.Evaluate;
                else
                    if (!ap.IsKPISet)
                        rType = BusinessModels.Enums.ReminderType.SetKPI;
                    else
                    {
                        if ((ap.Participant.IsScoreManager || (ap.Participant.IsSelfEvaluation.HasValue && ap.Participant.IsSelfEvaluation.Value)) && !ap.IsFinalKPISet && ap.IsParticipantPassedSurvey)
                            rType = BusinessModels.Enums.ReminderType.SetFinalKPI;
                        else
                            continue;
                }

                EvaluationStatus original = _ipsDataContext.EvaluationStatuses.FirstOrDefault(es => es.ParticipantId == ap.Participant.Id && es.StageId == ap.Stage.Id);
                if (original != null)
                    reminders.Add(new IpsReminder(
                        String.Format("{0}_{1}_{2}", rType, ap.Participant.Id, ap.Stage.Id),
                        rType,
                        ap.Stage.EndDateTime,
                        ap.Profile,
                        ap.Evaluatee,
                        ap.Participant,
                        ap.Stage
                        ));
            }
            return reminders.OrderBy(r => r.DueDate).ToList();
        }

        public void SetRemindMeDate(string reminderId, DateTime remindAt)
        {
            string[] parsedId = reminderId.Split('_');
            int participantId =  int.Parse(parsedId[1]);
            int stageId = int.Parse(parsedId[2]);

            EvaluationStatus original = _ipsDataContext.EvaluationStatuses.FirstOrDefault(es => es.ParticipantId == participantId && es.StageId == stageId);
            if (original != null)
            {
                original.RemindAt = remindAt;
                _ipsDataContext.SaveChanges();
            }
        }
    }
}

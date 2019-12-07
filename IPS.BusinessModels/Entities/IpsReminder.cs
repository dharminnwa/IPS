using IPS.Data;
using System;

namespace IPS.BusinessModels.Entities
{
    public class IpsReminder
    {
        public string Id { get; set; }
        public Enums.ReminderType ReminderType { get; set; }
        public DateTime DueDate { get; set; }
        public Training Training { get; set; }
        public IpsProfile Profile { get; set; }
        public User Evaluatee { get; set; }
        public EvaluationParticipant Evaluator { get; set; }
        public IpsStageEvolution Stage { get; set; }

        public bool IsSelfEvaluation => Evaluator != null && (bool)Evaluator.IsSelfEvaluation;

        public IpsReminder(string id, Enums.ReminderType reminderType, DateTime dueDate, IpsProfile profile, User evaluatee, EvaluationParticipant evaluator, IpsStageEvolution stage)
        {
            Id = id;
            ReminderType = reminderType;
            DueDate = dueDate;
            Profile = profile;
            Evaluatee = evaluatee;
            Evaluator = evaluator;
            Stage = stage;
        }
        
    }
}

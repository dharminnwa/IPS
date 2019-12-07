using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsCalenderEvents
    {
        public IpsCalenderEvents()
        {
            TrainingFeedbacks = new List<IPSTrainingFeedback>();
            Skills = new List<Skill>();
        }
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ParticipantId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? Start { get; set; }
        public DateTime? End { get; set; }
        public int EventType { get; set; }
        public string RecurrenceRule { get; set; }
        public int TaskListId { get; set; }
        public int CategoryId { get; set; }
        public int StatusId { get; set; }
        public int PriorityId { get; set; }
        public int? Duration { get; set; }
        public int? DurationMetricId { get; set; }

        public List<Skill> Skills { get; set; }

        public List<IPSTrainingFeedback> TrainingFeedbacks { get; set; }
    }
}

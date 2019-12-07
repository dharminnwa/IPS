using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{
    public class IPSTrainingFeedback
    {
        public int Id { get; set; }
        public Nullable<int> TrainingId { get; set; }
        public Nullable<int> TaskId { get; set; }
        public Nullable<int> Rating { get; set; }
        public string WorkedWell { get; set; }
        public string WorkedNotWell { get; set; }
        public string WhatNextDescription { get; set; }
        public Nullable<int> TimeSpentMinutes { get; set; }
        public Nullable<System.DateTime> StartedAt { get; set; }
        public Nullable<System.DateTime> FeedbackDateTime { get; set; }
        public Nullable<System.DateTime> RecurrencesStartTime { get; set; }
        public Nullable<System.DateTime> RecurrencesEndTime { get; set; }
        public bool IsRecurrences { get; set; }
        public string RecurrencesRule { get; set; }


        public bool IsEvaluatorFeedBack { get; set; }
        public Nullable<int> EvaluatorId { get; set; }
        public Nullable<System.DateTime> EvaluatorFeedBackTime { get; set; }

        public bool IsParticipantPaused { get; set; }
        public Nullable<System.DateTime> ParticipantPausedAt { get; set; }
    }
}

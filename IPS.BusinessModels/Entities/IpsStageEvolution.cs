using System;

namespace IPS.BusinessModels.Entities
{
    public class IpsStageEvolution
    {
        public int? Id { get; set; }
        public int? StageEvolutionId { get; set; }
        public string Name { get; set; }
        public int StageGroupId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }

        public DateTime? EvaluationStartDate { get; set; }
        public DateTime? EvaluationEndDate { get; set; }

        public bool IsPaused { get; set; }
        public bool IsStopped { get; set; }
    }
}
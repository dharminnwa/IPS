using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsEvaluationAgreementItem
    {
        public IpsEvaluationAgreementItem() {
            Skills = new List<IpsSkillDDL>();
            Trainings = new List<IpsTrainingModel>();
            SkillNames = new List<string>();
        }

        public string Comment { get; set; }
        public bool IsCorrect { get; set; }
        public bool InDevContract { get; set; }
        public int Points { get; set; }
        public int QuestionId { get; set; }
        public bool SelectForNextStage { get; set; }
        public string PerformanceGroupName { get; set; }
        public string QuestionText { get; set; }
        public bool IsAvailable { get; set; }
        public int AnswerId { get; set; }
        public string Answer { get; set; }
        public string PossibleAnswers { get; set; }
        public int AnswerTypeId { get; set; }

        public QuestionMaterial QuestionMaterial { get; set; }
        public IpsEvaluationAgreementTrainings EvaluationAgreementTrainings { get; set; }
        public List<IpsSkillDDL> Skills { get; set; }
        public List<IpsTrainingModel> Trainings { get; set; }
        public List<string> SkillNames { get; set; }

    }

    
}

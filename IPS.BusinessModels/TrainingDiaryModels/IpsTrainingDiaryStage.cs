using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsTrainingDiaryStage
    {

        public IpsTrainingDiaryStage()
        {
            EvaluationAgreement = new List<IpsEvaluationAgreement>();
            Skills = new List<Skill>();
        } 

        public int Id { get; set; }
        public string Name { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsKPISet { get; set; }
        public bool IsSelfEvaluation { get; set; }
        public List<IpsEvaluationAgreement> EvaluationAgreement { get; set; }
        public List<Skill> Skills { get; set; }
    }
}

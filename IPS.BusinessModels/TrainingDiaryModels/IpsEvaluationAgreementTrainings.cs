using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsEvaluationAgreementTrainings
    {
        public IpsEvaluationAgreementTrainings() {
            Trainings = new List<Training>();
        }
        public List<Training> Trainings { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsKTSurveyResult
    {
        public IpsKtMedalRules MedalRules { get; set; }
        public List<IpsKTSurveyResultAnswer> Answers { get; set; }
        public bool IsPassed { get; set; }
        public string EvolutionStage { get; set; }
        public int PassingScore { get; set; }
    }
}

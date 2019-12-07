using IPS.BusinessModels.TrainingModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsSurveyAnswerModel
    {
        public int SurveyResultId { get; set; }
        public int QuestionId { get; set; }
        public Nullable<bool> IsCorrect { get; set; }
        public string Answer { get; set; }
        public string Comment { get; set; }
        public Nullable<bool> InDevContract { get; set; }

        public  IpsQuestionModel Question { get; set; }
        public  IpsSurveyResultModel SurveyResult { get; set; }
        public  List<IpsTrainingModel> Trainings { get; set; }
    }
}

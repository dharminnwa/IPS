using IPS.BusinessModels.SkillModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
    public class IpsQuestionModel
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public string Description { get; set; }
        public int AnswerTypeId { get; set; }
        public bool IsActive { get; set; }
        public bool IsTemplate { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public Nullable<int> ProfileTypeId { get; set; }
        public Nullable<int> ScaleId { get; set; }
        public string QuestionSettings { get; set; }
        public Nullable<int> StructureLevelId { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public Nullable<int> SeqNo { get; set; }
        public Nullable<int> Points { get; set; }
        public Nullable<int> TimeForQuestion { get; set; }
        public Nullable<int> ParentQuestionId { get; set; }
        public List<IpsSkillDDL> Skills { get; set; }
    }
}

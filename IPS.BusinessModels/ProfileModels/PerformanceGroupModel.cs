using IPS.BusinessModels.IndustryModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class PerformanceGroupModel
    {
        public PerformanceGroupModel() {
            Link_PerformanceGroupSkills = new List<IpsLink_PerformanceGroupSkillsModel>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public bool IsTemplate { get; set; }
        public Nullable<int> ParentId { get; set; }
        public Nullable<int> LevelId { get; set; }
        public Nullable<int> IndustryId { get; set; }
        public Nullable<int> ScorecardPerspectiveId { get; set; }
        public bool IsActive { get; set; }
        public Nullable<int> SeqNo { get; set; }
        public Nullable<int> ScaleId { get; set; }
        public Nullable<int> ProfileId { get; set; }
        public string TrainingComments { get; set; }

        public IpsIndustryModel Industry { get; set; }
        //public List<PerformanceGroupModel> PerformanceGroups1 { get; set; }
        //public PerformanceGroupModel PerformanceGroup1 { get; set; }
        //public Scale Scale { get; set; }
        //public ScorecardPerspective ScorecardPerspective { get; set; }
        //public StructureLevel StructureLevel { get; set; }
        //public ICollection<ScorecardGoal> ScorecardGoals { get; set; }
        //public ICollection<ProfileType> ProfileTypes { get; set; }
        //public ICollection<JobPosition> JobPositions { get; set; }
        public IpsProfile Profile { get; set; }
        //public Organization Organization { get; set; }
        public List<IpsLink_PerformanceGroupSkillsModel> Link_PerformanceGroupSkills { get; set; }

    }
}

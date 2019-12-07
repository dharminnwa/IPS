using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProfileModels
{
    public class IpsStageGroupModel
    {
        public IpsStageGroupModel()
        {
            Profiles = new List<IpsProfile>();
            Stages = new List<IpsStageModel>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<System.DateTime> StartDate { get; set; }
        public Nullable<System.DateTime> EndDate { get; set; }
        public Nullable<int> ParentStageGroupId { get; set; }
        public Nullable<int> ParentParticipantId { get; set; }
        public int MonthsSpan { get; set; }
        public int WeeksSpan { get; set; }
        public int DaysSpan { get; set; }
        public int HoursSpan { get; set; }
        public int MinutesSpan { get; set; }
        public Nullable<long> ActualTimeSpan { get; set; }
        public List<IpsProfile> Profiles { get; set; }
        public List<IpsStageModel> Stages { get; set; }
    }
}

using System;
using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsStage
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string StatusText { get; set; }
        public int StageGroupId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
    }

   public class IpsStageComparer : IEqualityComparer<IpsStage>
    {
        public bool Equals(IpsStage x, IpsStage y)
        {
            if (Object.ReferenceEquals(x, y)) return true;
            
            if (Object.ReferenceEquals(x, null) || Object.ReferenceEquals(y, null))
                return false;

            return x.Id == y.Id;
        }

        public int GetHashCode(IpsStage stage)
        {
            return stage.Id;
        }

    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingModels
{

    public class IPSTrainingMaterial
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Nullable<int> TrainingId { get; set; }
        public string MaterialType { get; set; }
        public string ResourceType { get; set; }
        public string Link { get; set; }
        public List<IPSTrainingMaterialRating> TrainingMaterialRatings { get; set; }
    }

    public class IPSTrainingMaterialRating
    {
        public int Id { get; set; }
        public Nullable<int> TrainingMaterialId { get; set; }
        public Nullable<int> Rating { get; set; }
        public Nullable<int> RatingBy { get; set; }
        public Nullable<System.DateTime> RatingSubmitDate { get; set; }
    }
}

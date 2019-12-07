using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TrainingDiaryModels
{
   public class IPSUserStatsModel
    {
        public IPSUserStatsModel()
        {
            JobPositions = new List<IPSJobPosition>();
            Departments = new List<IPSDepartment>();
        }

        public int Id { get; set; }
        public string ImagePath { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PrivateEmail { get; set; }
        public string WorkEmail { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Facebook { get; set; }
        public string Twitter { get; set; }
        public string Skype { get; set; }
        public string LinkedIn { get; set; }
        public Nullable<System.DateTime> BirthDate { get; set; }
        public List<IPSJobPosition> JobPositions { get; set; }
        public List<IPSDepartment> Departments { get; set; }
    }

   

    

}

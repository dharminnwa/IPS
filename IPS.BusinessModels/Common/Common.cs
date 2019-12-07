using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Common
{
    public class IPSDropDown
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class IPSParticipants
    {
        public int Id { get; set; }
        public string UserKey { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserImage { get; set; }
        public string WorkEmail { get; set; }
    }

    public class IPSPhasesStatus
    {
        public string PhaseName { get; set; }
        public bool IsComplete { get; set; }
    }

    public class PagingParams
    {
        public int Take { get; set; }
        public int Skip { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}

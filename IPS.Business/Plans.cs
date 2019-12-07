using System.Globalization;
using IPS.BusinessModels.Entities;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class Plans
    {
       public IQueryable<IpsPlan> Plan;
       public IQueryable<IpsPlanRole> Mstrole;
       public List<PlanFeatures> Features;
       


    }
    public class PlanFeatures
    {
        public int PlanfeatureID { get; set; }
        public String Label { get; set; }
        public Nullable<int> Value { get; set; }
    }
}

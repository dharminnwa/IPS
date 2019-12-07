using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public interface IManagePlanService
    {

        Plans GetPlanByID(int PlanID);
        IQueryable<IpsPlan> GetByID(int ID);
        IQueryable<IpsPlan> GetAllPlan();
        bool Update(Plans IpsPlan);
        IQueryable<LookupItem> GetLanguages();
        Plans GetAllPlans();
    }
}

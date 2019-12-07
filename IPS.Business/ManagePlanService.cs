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
   public class ManagePlanService : BaseService, IPS.Business.IManagePlanService
    {

       public Plans GetPlanByID(int PlanID)
        {
            Plans IpsPlan = new Plans();

            //if (_authService.IsSuperAdmin())
            //{
                IpsPlan.Plan = _ipsDataContext.IpsPlans.Include(pl => pl.IPSPlanFeatures).Where(p => p.PlanID == PlanID).AsNoTracking().AsQueryable();
                IpsPlan.Mstrole = _ipsDataContext.IpsPlanRoles.Where(Pr => Pr.PlanID == PlanID).AsNoTracking().AsQueryable();
                //IpsPlan.Features = ;
                // IpsPlan.Mstfields= _ipsDataContext.IPSPlanFieldsLookups.Where(pl=>pl.IpsPlanLabelID.ToString().Contains(IpsPlan.MstFeatures.Select(pf=>pf.PlanFieldID.ToString())))
                IpsPlan.Features =
                (from fields in _ipsDataContext.IPSPlanFieldsLookups
                join features in (_ipsDataContext.IPSPlanFeatures.Where(Pr => Pr.PlanID == PlanID).AsNoTracking().AsQueryable()) on fields.IpsPlanLabelID equals features.PlanFieldID
                where fields.LanguageID == 65
                select new PlanFeatures { PlanfeatureID = features.IpsPlanFeatureID, Label = fields.LabelText, Value = features.Value }).ToList();
            //}
            //else
            //{
            //    IpsPlan = null;
            //}

            return IpsPlan;
        }


       public Plans GetAllPlans()
       {
           Plans IpsPlan = new Plans();

           //if (_authService.IsSuperAdmin())
           //{
           IpsPlan.Plan = _ipsDataContext.IpsPlans.Include(pl => pl.IPSPlanFeatures).AsNoTracking().AsQueryable();
           IpsPlan.Mstrole = _ipsDataContext.IpsPlanRoles.AsNoTracking().AsQueryable();
           //IpsPlan.Features = ;
           // IpsPlan.Mstfields= _ipsDataContext.IPSPlanFieldsLookups.Where(pl=>pl.IpsPlanLabelID.ToString().Contains(IpsPlan.MstFeatures.Select(pf=>pf.PlanFieldID.ToString())))
           IpsPlan.Features =
           (from fields in _ipsDataContext.IPSPlanFieldsLookups
            join features in (_ipsDataContext.IPSPlanFeatures.AsNoTracking().AsQueryable()) on fields.IpsPlanLabelID equals features.PlanFieldID
           // where fields.LanguageID == 65
            select new PlanFeatures { PlanfeatureID = features.IpsPlanFeatureID, Label = fields.LabelText, Value = features.Value }).ToList();
           //}
           //else
           //{
           //    IpsPlan = null;
           //}

           return IpsPlan;
       }

        public IQueryable<IpsPlan> GetByID(int ID)
        {
            IQueryable<IpsPlan> IpsPlan;

            //if (_authService.IsSuperAdmin())
            //{
                IpsPlan = _ipsDataContext.IpsPlans.Where(p => p.PlanID== ID).AsNoTracking().AsQueryable();
            //}
            //else
            //{
            //    IpsPlan = null;
            //}

            return IpsPlan;
        }

        public IQueryable<IpsPlan> GetAllPlan()
        {
            IQueryable<IpsPlan> IpsPlan;

           // if (_authService.IsSuperAdmin())
            {
                IpsPlan = _ipsDataContext.IpsPlans.AsNoTracking().AsQueryable();
            }
            //else
            //{
            //    IpsPlan = null;
            //}

            return IpsPlan;
        }

        public bool Update(Plans IpsPlan)
        {

            var original = _ipsDataContext.IpsPlans.Find(IpsPlan.Plan.FirstOrDefault().PlanID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(IpsPlan.Plan);
                _ipsDataContext.SaveChanges();
                foreach (PlanFeatures features in IpsPlan.Features)
                {
                    var originalFeature = _ipsDataContext.IPSPlanFeatures.Where(pf => pf.IpsPlanFeatureID == features.PlanfeatureID).FirstOrDefault();
                    if (originalFeature != null)
                    {
                        originalFeature.Value = features.Value;
                        _ipsDataContext.SaveChanges();
                    }

                }
               // _ipsDataContext.Entry(IPSPlanFeature).CurrentValues.SetValues(IpsPlan.MstFeatures);
               // _ipsDataContext.IPSPlanFeatures.up
               
            }

            return true;
        }
        public IQueryable<LookupItem> GetLanguages()
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == "SystemLanguage").AsNoTracking().AsQueryable();
        }
    }
}

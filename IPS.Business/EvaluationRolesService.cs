using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class EvaluationRolesService : BaseService, IPS.Business.IEvaluationRolesService
    {
        public IQueryable<EvaluationRole> GetEvaluationRoles()
        {
            return _ipsDataContext.EvaluationRoles.AsQueryable();
        }

        public IQueryable<EvaluationRole> GetEvaluationRolesById(int id)
        {
            return _ipsDataContext.EvaluationRoles.Where(er => er.Id == id).AsQueryable();
        }

       /* public EvaluationRole Add(EvaluationRole evaluationRole)
        {
            
           

            _ipsDataContext.NotificationTemplates.Add(notificationTemplate);
            _ipsDataContext.SaveChanges();
            return notificationTemplate;
        }

        public bool Update(NotificationTemplate notificationTemplate)
        {
            var original = _ipsDataContext.NotificationTemplates.Find(notificationTemplate.Id);

            if (original != null)
            {
                notificationTemplate.Stages = null;
                notificationTemplate.Stages1 = null;
                notificationTemplate.Stages2 = null;
                notificationTemplate.Stages3 = null;
                notificationTemplate.Stages4 = null;
                notificationTemplate.Stages5 = null;
                notificationTemplate.Stages6 = null;
                notificationTemplate.Stages7 = null;
                notificationTemplate.Stages8 = null;
                notificationTemplate.Stages9 = null;
                notificationTemplate.Stages10 = null;
                notificationTemplate.Stages11 = null;
                notificationTemplate.Stages12 = null;
                notificationTemplate.Stages13 = null;
                notificationTemplate.Stages14 = null;
                notificationTemplate.Stages15 = null;

                _ipsDataContext.Entry(original).CurrentValues.SetValues(notificationTemplate);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public string Delete(NotificationTemplate notificationTemplate)
        {
            _ipsDataContext.NotificationTemplates.Remove(notificationTemplate);
            try
            {
                var result = _ipsDataContext.SaveChanges();
                return "OK";
            }
            
            
            catch(DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
                

            }
            
            
            
        }*/
    }
}

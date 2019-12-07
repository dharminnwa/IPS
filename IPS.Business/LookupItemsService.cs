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
    public class LookupItemsService : BaseService, IPS.Business.ILookupItemsService
    {
        public LookupItem GetLookupItemById(int id)
        {
            return _ipsDataContext.LookupItems.Where(li => li.Id == id).FirstOrDefault();
        }
        public List<LookupItem> GetLookupItemByType(string type)
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == type).ToList();
        }

        public LookupItem Add(LookupItem lookupItem)
        {
            lookupItem.Organizations = null;
            lookupItem.Organizations1 = null;

            _ipsDataContext.LookupItems.Add(lookupItem);
            _ipsDataContext.SaveChanges();
            return lookupItem;
        }

        public bool Update(LookupItem lookupItem)
        {
            lookupItem.Organizations = null;
            lookupItem.Organizations1 = null;
            var original = _ipsDataContext.LookupItems.Find(lookupItem.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(lookupItem);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public string Delete(LookupItem lookupItem)
        {
            _ipsDataContext.LookupItems.Remove(lookupItem);
            try
            {
                var result = _ipsDataContext.SaveChanges();
                return "OK";
            }


            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }
        }

    }
}

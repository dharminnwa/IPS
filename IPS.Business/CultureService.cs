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
    public class CultureService : BaseService, IPS.Business.ICultureService
    {
        public IQueryable<Culture> Get()
        {
            return _ipsDataContext.Cultures.AsQueryable();
        }

        public Culture GetById(int id)
        {
            return _ipsDataContext.Cultures.Where(c => c.Id == id).FirstOrDefault();
        }

    }
}

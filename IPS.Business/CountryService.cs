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
    public class CountryService : BaseService, IPS.Business.ICountryService
    {
        public IQueryable<Country> Get()
        {
            return _ipsDataContext.Countries.AsQueryable();
        }

        public Country GetById(int id)
        {
            return _ipsDataContext.Countries.Where(c => c.Id == id).FirstOrDefault();
        }

    }
}

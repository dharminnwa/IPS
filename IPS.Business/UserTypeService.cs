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
    public class UserTypeService : IPS.Business.BaseService, IPS.Business.IUserTypeService
    {
        public IQueryable<UserType> Get()
        {
            return _ipsDataContext.UserTypes.AsQueryable();
        }

        public UserType GetById(int id)
        {
            return _ipsDataContext.UserTypes.Where(ut => ut.Id == id).FirstOrDefault();
        }

    }
}

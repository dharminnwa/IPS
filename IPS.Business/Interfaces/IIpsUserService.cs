using IPS.BusinessModels.Entities;
using System;
using System.Linq;
namespace IPS.Business.Interfaces
{
    public interface IIpsUserService
    {
        System.Linq.IQueryable<IPS.BusinessModels.Entities.IpsUser> Get();
        IQueryable<IpsUser> GetById(string id);
        string Add(IPS.BusinessModels.Entities.IpsUser user);
        bool Update(IPS.BusinessModels.Entities.IpsUser user);

        void UpdateImagePath(string userKey, string imagePath);
    }
}

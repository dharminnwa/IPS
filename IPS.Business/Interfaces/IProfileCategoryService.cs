using System;
using IPS.Data;
namespace IPS.Business
{
    public interface IProfileCategoryService
    {
        ProfileCategory Add(ProfileCategory profile);
        bool Delete(ProfileCategory profile);
        System.Linq.IQueryable<ProfileCategory> Get();
        ProfileCategory GetById(int id);
        bool Update(ProfileCategory profile);
    }
}

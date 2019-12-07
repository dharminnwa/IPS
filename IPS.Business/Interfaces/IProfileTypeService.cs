using System;
using IPS.Data;
namespace IPS.Business
{
    public interface IProfileTypeService
    {
        ProfileType Add(ProfileType profileType);
        bool Delete(ProfileType profileType);
        System.Linq.IQueryable<ProfileType> Get();
        ProfileType GetById(int id);
        bool Update(ProfileType profileType);
        int GetProfileTypeByProfileId(int id);
    }
}

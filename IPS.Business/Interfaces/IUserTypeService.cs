using IPS.Data;
using System;
namespace IPS.Business
{
    public interface IUserTypeService
    {

        System.Linq.IQueryable<IPS.Data.UserType> Get();
        IPS.Data.UserType GetById(int id);

    }
}

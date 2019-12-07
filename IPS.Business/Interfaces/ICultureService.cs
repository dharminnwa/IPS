using IPS.Data;
using System;
namespace IPS.Business
{
    public interface ICultureService
    {

        System.Linq.IQueryable<IPS.Data.Culture> Get();
        IPS.Data.Culture GetById(int id);

    }
}

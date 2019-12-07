using IPS.Data;
using System;
namespace IPS.Business
{
    public interface ICountryService
    {

        System.Linq.IQueryable<IPS.Data.Country> Get();
        IPS.Data.Country GetById(int id);

    }
}

using System;
using IPS.Data;
using System.Linq;
namespace IPS.Business
{
    public interface IScaleCategoryService
    {
        ScaleCategory Add(ScaleCategory scale);
        bool Delete(ScaleCategory scale);
        IQueryable<ScaleCategory> Get();
        ScaleCategory GetById(int id);
        bool Update(ScaleCategory scale);
    }
}

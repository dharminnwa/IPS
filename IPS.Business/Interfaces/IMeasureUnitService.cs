using IPS.Data;
using System;
using System.Linq;
namespace IPS.Business
{
    public interface IMeasureUnitService
    {
        MeasureUnit Add(MeasureUnit measureUnit);
        bool Delete(MeasureUnit measureUnit);
        IQueryable<MeasureUnit> Get();
        MeasureUnit GetById(int id);
        bool Update(MeasureUnit measureUnit);

        
    }
}

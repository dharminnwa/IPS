using System;
using IPS.Data;
using System.Linq;
namespace IPS.Business
{
    public interface IScaleRangeService
    {
        ScaleRange Add(ScaleRange scale);
        bool Delete(ScaleRange scale);
        IQueryable<ScaleRange> Get();
        ScaleRange GetById(int id);
        bool Update(ScaleRange scale);
    }
}

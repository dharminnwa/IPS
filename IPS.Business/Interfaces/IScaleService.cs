using System;
using IPS.Data;
using System.Linq;
namespace IPS.Business
{
    public interface IScaleService
    {
        Scale Add(Scale scale);
        bool Delete(Scale scale);
        IQueryable<Scale> Get();
        IQueryable<Scale> GetById(int id);
        bool Update(Scale scale);
    }
}

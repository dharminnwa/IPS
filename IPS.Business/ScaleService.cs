using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;

namespace IPS.Business
{
    
    public class ScaleService : BaseService, IPS.Business.IScaleService
    {
        public IQueryable<Scale> Get()
        {
            return _ipsDataContext.Scales.AsNoTracking().AsQueryable();
        }


        public IQueryable<Scale> GetById(int id)
        {
            return _ipsDataContext.Scales.Where(s => s.Id == id).AsQueryable();
        }

        public Scale Add(Scale scale)
        {
            _ipsDataContext.Scales.Add(scale);
            _ipsDataContext.SaveChanges();
            return scale;
        }

        public bool Update(Scale scale)
        {

            var original = _ipsDataContext.Scales.Include("ScaleRanges").Where(s => s.Id == scale.Id).SingleOrDefault();
            
            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(scale);

                _ipsDataContext.ScaleRanges.RemoveRange(original.ScaleRanges);
                _ipsDataContext.ScaleRanges.AddRange(scale.ScaleRanges);
                /*_ipsDataContext.SaveChanges();
                foreach (ScaleRange scaleRange in scale.ScaleRanges)
                {
                    scaleRange.Id = -1;
                    _ipsDataContext.ScaleRanges.Add(scaleRange);
                }*/
                
                _ipsDataContext.SaveChanges();
            } 

            


            return true;
        }

        public bool Delete(Scale scale)
        {
            List<ScaleRange> scaleRanges = _ipsDataContext.ScaleRanges.Where(s => s.ScaleId == scale.Id).ToList();
            _ipsDataContext.ScaleRanges.RemoveRange(scaleRanges);
            _ipsDataContext.Scales.Remove(scale);
            _ipsDataContext.SaveChanges();

            return true;
        }
    }
}

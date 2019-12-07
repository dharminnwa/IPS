using IPS.BusinessModels.Common;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class StructureLevelService : BaseService, IPS.Business.IStructureLevelService
    {
        public IQueryable<StructureLevel> Get()
        {
            return _ipsDataContext.StructureLevels.AsNoTracking().AsQueryable();
        }

        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.StructureLevels.Select(x => new IPSDropDown
            {
                Id = x.Id,
                Name = x.Name,
            }).OrderBy(x => x.Name).ToList();
        }

        public StructureLevel GetById(int id)
        {
            return _ipsDataContext.StructureLevels.Where(sl => sl.Id == id).FirstOrDefault();
        }

    

        public StructureLevel Add(StructureLevel structureLevel)
        {
            _ipsDataContext.StructureLevels.Add(structureLevel);
            _ipsDataContext.SaveChanges();
            return structureLevel;
        }

        public bool Update(StructureLevel structureLevel)
        {

            var original = _ipsDataContext.StructureLevels.Find(structureLevel.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(structureLevel);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(StructureLevel structureLevel)
        {
            _ipsDataContext.StructureLevels.Remove(structureLevel);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }
    }
    
}

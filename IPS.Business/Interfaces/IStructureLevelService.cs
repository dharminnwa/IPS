using IPS.BusinessModels.Common;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business
{
    public interface IStructureLevelService
    {
        StructureLevel Add(StructureLevel structureLevel);
        bool Delete(StructureLevel structureLevel);
        IQueryable<StructureLevel> Get();
        StructureLevel GetById(int id);
        bool Update(StructureLevel structureLevel);
        List<IPSDropDown> GetDDL();
    }
}

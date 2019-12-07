using IPS.Data;
using System;
using System.Collections.Generic;
namespace IPS.Business
{
    public interface ILookupItemsService
    {
        LookupItem Add(LookupItem lookupItem);
        string Delete(LookupItem lookupItem);
        //System.Linq.IQueryable<IPS.Data.Industry> Get();
        LookupItem GetLookupItemById(int id);
        List<LookupItem> GetLookupItemByType(string type);
        bool Update(LookupItem lookupItem);
    }
}

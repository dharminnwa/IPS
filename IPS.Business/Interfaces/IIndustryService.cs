using IPS.BusinessModels.IndustryModels;
using IPS.Data;
using System;
using System.Collections.Generic;

namespace IPS.Business
{
    public interface IIndustryService
    {
        Industry Add(IPS.Data.Industry industry);
        bool Delete(IPS.Data.Industry industry);
        System.Linq.IQueryable<IPS.Data.Industry> Get();
        IPS.Data.Industry GetById(int id);
        bool Update(IPS.Data.Industry industry);
        List<IpsIndustryModel> GetAllIndustries();
        List<IpsIndustryModel> GetAllIndustriesByOrganizationId(int organizationId);
        bool IsIndustryExist(int organizationId, string name);

        List<IpsIndustryModel> GetAllSubIndustriesByParentId(int parentId);
    }
}

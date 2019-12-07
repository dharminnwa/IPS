using IPS.BusinessModels.IndustryModels;
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
    public class IndustryService : BaseService, IPS.Business.IIndustryService
    {
        public IQueryable<Industry> Get()
        {
            return _ipsDataContext.Industries.AsNoTracking().AsQueryable();
        }

        public List<IpsIndustryModel> GetAllIndustries()
        {
            return _ipsDataContext.Industries.Select(x => new IpsIndustryModel
            {
                Description = x.Description,
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                OrganizationId = x.OrganizationId,
                SubIndustries = x.SubIndustries.Select(s => new IpsSubIndustryModel()
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                }).ToList()
            }).OrderBy(x => x.Name).ToList();
        }

        public Industry GetById(int id)
        {
            return _ipsDataContext.Industries.Where(i => i.Id == id).FirstOrDefault();
        }

        public Industry Add(Industry industry)
        {
            _ipsDataContext.Industries.Add(industry);
            _ipsDataContext.SaveChanges();
            return industry;
        }

        public bool Update(Industry industry)
        {
            var original = _ipsDataContext.Industries.Find(industry.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(industry);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(Industry industry)
        {
            _ipsDataContext.Industries.Remove(industry);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

        public List<IpsIndustryModel> GetAllIndustriesByOrganizationId(int organizationId)
        {
            return _ipsDataContext.Industries.Where(x => x.OrganizationId == organizationId && x.ParentId == null).Select(x => new IpsIndustryModel
            {
                Description = x.Description,
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                OrganizationId = x.OrganizationId,
                SubIndustries = x.SubIndustries.Select(s => new IpsSubIndustryModel()
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                }).ToList()
            }).OrderBy(x => x.Name).ToList();
        }

        public bool IsIndustryExist(int organizationId, string name)
        {
            return _ipsDataContext.Industries.Any(x => x.OrganizationId == organizationId && x.Name.ToLower() == name);
        }

        public List<IpsIndustryModel> GetAllSubIndustriesByParentId(int parentId)
        {
            return _ipsDataContext.Industries.Where(x => x.ParentId == parentId).Select(x => new IpsIndustryModel
            {
                Description = x.Description,
                Id = x.Id,
                Name = x.Name,
                ParentId = x.ParentId,
                OrganizationId = x.OrganizationId,
                SubIndustries = x.SubIndustries.Select(s => new IpsSubIndustryModel()
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description
                }).ToList()
            }).OrderBy(x => x.Name).ToList();
        }
    }
}

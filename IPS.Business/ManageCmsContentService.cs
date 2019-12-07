using System.Globalization;
using IPS.BusinessModels.Entities;
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
    public class ManageCmsContentService : BaseService, IPS.Business.IManageCmsContentService
    {
        public IQueryable<CmsPage> GetPages()
        {
            IQueryable<CmsPage> CmsPages;

            if (_authService.IsSuperAdmin())
            {
               // CmsPages = _ipsDataContext.CmsPages.Where(pg => pg.LanguageID == 65).AsNoTracking().AsQueryable();
                 CmsPages = _ipsDataContext.CmsPages.AsNoTracking().AsQueryable();
            }
            else
            {
                CmsPages = null;
            }

            return CmsPages;
        }

        public IQueryable<LookupItem> GetLanguages()
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == "SystemLanguage").AsNoTracking().AsQueryable();
        }

        public IQueryable<CmsPage> GetByID(int PageID)
        {
            return _ipsDataContext.CmsPages.Where(pg => pg.PageID == PageID);
        }
        public IQueryable<CmsPage> GetByAccessCode(int PageAccessCode, int languageID)
        {
            return _ipsDataContext.CmsPages.Where(pg => pg.PageAccessCode == PageAccessCode && pg.LanguageID == languageID);
        }
        public CmsPage Add(CmsPage CmsPage)
        {
            _ipsDataContext.CmsPages.Add(CmsPage);
            _ipsDataContext.SaveChanges();
            return CmsPage;
        }

        public bool Update(CmsPage CmsPage)
        {

            var original = _ipsDataContext.CmsPages.Find(CmsPage.PageID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(CmsPage);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }
    }
}

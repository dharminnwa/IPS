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
    public class ManageHelpContentService : BaseService, IPS.Business.IManageHelpContentService
    {
        public IQueryable<HelpCategory> GetHelpCategory()
        {
            IQueryable<HelpCategory> HelpCategory;

            if (_authService.IsSuperAdmin())
            {
                HelpCategory = _ipsDataContext.HelpCategories.AsNoTracking().AsQueryable();
            }
            else
            {
                HelpCategory = null;
            }

            return HelpCategory;
        }

        public IQueryable<HelpCategory> GetHelpCategoryByLanguageID(int languageID)
        {
            IQueryable<HelpCategory> HelpCategory;

           // if (_authService.IsSuperAdmin())
            {
                HelpCategory = _ipsDataContext.HelpCategories.Where(hc=>hc.LanguageID==languageID).AsNoTracking().AsQueryable();
            }
            //else
           // {
           //     HelpCategory = null;
           // }

            return HelpCategory;
        }


        public IQueryable<HelpCategory> GetHelpCategoryByID(int HelpCategoryID)
        {
            return _ipsDataContext.HelpCategories.Where(hc => hc.HelpCategoryID == HelpCategoryID);
        }

        public HelpCategory AddHelpCategory(HelpCategory HelpCategory)
        {
            _ipsDataContext.HelpCategories.Add(HelpCategory);
            _ipsDataContext.SaveChanges();
            return HelpCategory;
        }

        public bool UpdateHelpCategory(HelpCategory HelpCategory)
        {

            var original = _ipsDataContext.HelpCategories.Find(HelpCategory.HelpCategoryID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(HelpCategory);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }


        public IQueryable<HelpContent> GetHelpContent()
        {
            IQueryable<HelpContent> HelpContent;

            if (_authService.IsSuperAdmin())
            {
                HelpContent = _ipsDataContext.HelpContents.AsNoTracking().AsQueryable();
            }
            else
            {
                HelpContent = null;
            }

            return HelpContent;
        }

        public IQueryable<HelpContent> GetHelpContentByLanguageID(int LanguageID)
        {
            IQueryable<HelpContent> HelpContent;

           // if (_authService.IsSuperAdmin())
           // {
                HelpContent = _ipsDataContext.HelpContents.Where(hc=>hc.LanguageID==LanguageID).AsNoTracking().AsQueryable();
            //}
           // else
           // {
            //    HelpContent = null;
           // }

            return HelpContent;
        }

        public IQueryable<LookupItem> GetLanguages()
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == "SystemLanguage").AsNoTracking().AsQueryable();
        }

        public IQueryable<HelpContent> GetHelpHelpContentByID(int HelpContentID)
        {
            return _ipsDataContext.HelpContents.Where(hc => hc.HelpContentID == HelpContentID);
        }

        public HelpContent AddHelpContent(HelpContent HelpContent)
        {
            _ipsDataContext.HelpContents.Add(HelpContent);
            _ipsDataContext.SaveChanges();
            return HelpContent;
        }

        public bool UpdateHelpContent(HelpContent HelpContent)
        {

            var original = _ipsDataContext.HelpContents.Find(HelpContent.HelpContentID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(HelpContent);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }
    }
}


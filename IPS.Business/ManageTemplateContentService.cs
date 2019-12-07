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
    public class ManageTemplateContentService : BaseService, IPS.Business.IManageTemplatepContentService
    {
        public IQueryable<TemplateCategory> GetTemplateCategory()
        {
            IQueryable<TemplateCategory> TemplateCategory;

           // if (_authService.IsSuperAdmin())
            {
                TemplateCategory = _ipsDataContext.TemplateCategories.AsNoTracking().AsQueryable();
            }
            //else
            //{
            //    TemplateCategory = null;
            //}

            return TemplateCategory;
        }

        public IQueryable<TemplateCategory> GetTemplateCategoryByLanguageID(int languageID)
        {
            IQueryable<TemplateCategory> TemplateCategory;

            // if (_authService.IsSuperAdmin())
            {
                TemplateCategory = _ipsDataContext.TemplateCategories.Where(hc => hc.LanguageID == languageID).Include(TC=>TC.TemplateCategory1).AsNoTracking().AsQueryable();
            }
            //else
            // {
            //     TemplateCategory = null;
            // }

            return TemplateCategory;

        }

        public IQueryable<TempalteData> GetTemplateData(int languageID)
        {
            // IQueryable<TemplateCategory> parentcategories;
             //IQueryable<TemplateCategory> subcategories;
             //IQueryable<TemplateContent> content;


            var data = (from
              content in (_ipsDataContext.TemplateContents.Include(ci => ci.TemplateContentImages).AsNoTracking().AsQueryable())
                        join
                        categories in (_ipsDataContext.TemplateCategories.Where(hc => hc.LanguageID == languageID).AsNoTracking().AsQueryable())
                        on content.TemplateCategoryID equals categories.TemplateCategoryID
                        //join parentcategories in (_ipsDataContext.TemplateCategories.Where(hc => hc.LanguageID == languageID && hc.IsParentCategory == true).AsNoTracking().AsQueryable())
                        //on categories.ParentCategoryID equals parentcategories.TemplateCategoryID
                        select new TempalteData { ParentCaregories = null, Caregories = categories, Content = content }).AsQueryable();
            return data;
        }
        public IQueryable<TemplateCategory> GetTemplateCategoryByID(int TemplateCategoryID)
        {
            return _ipsDataContext.TemplateCategories.Where(hc => hc.TemplateCategoryID == TemplateCategoryID);
        }

        public IQueryable<TemplateContentImage> GetTemplateImages(int TemplateContentID)
        {
            IQueryable<TemplateContentImage> TemplateContentImage;

            // if (_authService.IsSuperAdmin())
            {
                TemplateContentImage = _ipsDataContext.TemplateContentImages.Where(hc => hc.TemplateContentID == TemplateContentID).AsNoTracking().AsQueryable();
            }
            //else
            // {
            //     TemplateCategory = null;
            // }

            return TemplateContentImage;
        }
        public TemplateContentImage AddTemplateImage(TemplateContentImage TemplateContentImage)
        {
            _ipsDataContext.TemplateContentImages.RemoveRange(_ipsDataContext.TemplateContentImages.Where(TI => TI.TemplateContentID == TemplateContentImage.TemplateContentID).ToList());
            _ipsDataContext.TemplateContentImages.Add(TemplateContentImage);
            _ipsDataContext.SaveChanges();
            return TemplateContentImage;
        }

        public TemplateCategory AddTemplateCategory(TemplateCategory TemplateCategory)
        {
            _ipsDataContext.TemplateCategories.Add(TemplateCategory);
            _ipsDataContext.SaveChanges();
            return TemplateCategory;
        }


        public bool UpdateTemplateCategory(TemplateCategory TemplateCategory)
        {

            var original = _ipsDataContext.TemplateCategories.Find(TemplateCategory.TemplateCategoryID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(TemplateCategory);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }


        public IQueryable<TemplateContent> GetTemplateContent()
        {
            IQueryable<TemplateContent> TemplateContent;

            if (_authService.IsSuperAdmin())
            {
                TemplateContent = _ipsDataContext.TemplateContents.AsNoTracking().AsQueryable();
            }
            else
            {
                TemplateContent = null;
            }

            return TemplateContent;
        }

        public IQueryable<TemplateContent> GetTemplateContentByLanguageID(int LanguageID)
        {
            IQueryable<TemplateContent> TemplateContent;

            // if (_authService.IsSuperAdmin())
            // {
            TemplateContent = _ipsDataContext.TemplateContents.Where(hc => hc.LanguageID == LanguageID).Include(ci => ci.TemplateContentImages).Include(tc=>tc.TemplateCategory).AsNoTracking().AsQueryable();
           
            //}
            // else
            // {
            //    TemplateContent = null;
            // }

            return TemplateContent;
        }

        public IQueryable<LookupItem> GetLanguages()
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == "SystemLanguage").AsNoTracking().AsQueryable();
        }

        public IQueryable<TemplateContent> GetTemplateTemplateContentByID(int TemplateContentID)
        {
            return _ipsDataContext.TemplateContents.Where(hc => hc.TemplateContentID == TemplateContentID);
        }
        public IQueryable<TemplateContent> GetTemplateTemplateContentByCategoryID(int ID)
        {
            return _ipsDataContext.TemplateContents.Where(hc => hc.TemplateCategoryID == ID).AsNoTracking().AsQueryable();
        }
        public TemplateContent AddTemplateContent(TemplateContent TemplateContent)
        {
            _ipsDataContext.TemplateContents.Add(TemplateContent);
            _ipsDataContext.SaveChanges();
            return TemplateContent;
        }

        public bool UpdateTemplateContent(TemplateContent TemplateContent)
        {

            var original = _ipsDataContext.TemplateContents.Find(TemplateContent.TemplateContentID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(TemplateContent);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }
    }

    public class TempalteData
    {
        public TemplateCategory ParentCaregories { get; set; }   
        public TemplateCategory Caregories{get ; set;}
        public TemplateContent Content { get; set; }
        
    }
}


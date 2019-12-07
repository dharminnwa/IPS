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
    public class PortfolioService : BaseService, IPortfolioService
    {
        public IQueryable<PortfolioCategory> GetPortfolioCategory()
        {
            IQueryable<PortfolioCategory> PortfolioCategory;

            //if (_authService.IsSuperAdmin())
            {
                PortfolioCategory = _ipsDataContext.PortfolioCategories.AsNoTracking().AsQueryable();
            }
            //else
            //{
            //    PortfolioCategory = null;
            //}

            return PortfolioCategory;
        }

        public IQueryable<PortfolioCategory> GetPortfolioCategoryByLanguageID(int languageID)
        {
            IQueryable<PortfolioCategory> PortfolioCategory;

            // if (_authService.IsSuperAdmin())
            {
                PortfolioCategory = _ipsDataContext.PortfolioCategories.Where(hc => hc.LanguageID == languageID).AsNoTracking().AsQueryable();
            }
            //else
            // {
            //     PortfolioCategory = null;
            // }

            return PortfolioCategory;
        }
        
        public IQueryable<PortfolioCategory> GetPortfolioCategoryByID(int PortfolioCategoryID)
        {
            try
            {
                return _ipsDataContext.PortfolioCategories.Where(hc => hc.PortfolioCategoryID == PortfolioCategoryID);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public IQueryable<PortfolioImage> GetPortfolioImages(int PortfolioProjectID)
        {
            IQueryable<PortfolioImage> PortfolioImage;

            // if (_authService.IsSuperAdmin())
            {
                PortfolioImage = _ipsDataContext.PortfolioImages.Where(hc => hc.PortfolioProjectID == PortfolioProjectID).AsNoTracking().AsQueryable();
            }
            //else
            // {
            //     PortfolioCategory = null;
            // }

            return PortfolioImage;
        }
        
        public PortfolioCategory AddPortfolioCategory(PortfolioCategory PortfolioCategory)
        {
            //try
            //{

                _ipsDataContext.PortfolioCategories.Add(PortfolioCategory);
                _ipsDataContext.SaveChanges();
                return PortfolioCategory;
            //}
            //catch (Exception ex)
            //{
            //   // throw (ex);
            //    return new PortfolioCategory();
            //}
        }

        public bool UpdatePortfolioCategory(PortfolioCategory PortfolioCategory)
        {

            var original = _ipsDataContext.PortfolioCategories.Find(PortfolioCategory.PortfolioCategoryID);

            if (original != null)
            {
                try
                {
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(PortfolioCategory);
                    _ipsDataContext.SaveChanges();
                }
                catch (Exception ex)
                {
                }
            }

            return true;
        }
        
        public IQueryable<PortfolioProject> GetPortfolioProjects()
        {
            IQueryable<PortfolioProject> PortfolioProject;

            if (_authService.IsSuperAdmin())
            {
                PortfolioProject = _ipsDataContext.PortfolioProjects.AsNoTracking().AsQueryable();
            }
            else
            {
                PortfolioProject = null;
            }

            return PortfolioProject;
        }

        public IQueryable<PortfolioProject> GetPortfolioProjectByCategoryID(int CategoryID)
        {
            IQueryable<PortfolioProject> PortfolioProject;

            // if (_authService.IsSuperAdmin())
            // {
            PortfolioProject = _ipsDataContext.PortfolioProjects.Where(hc => hc.PortfolioCategoryID == CategoryID).Include(pc=>pc.PortfolioCategory).AsNoTracking().AsQueryable();
            //}
            // else
            // {
            //    TemplateContent = null;
            // }

            return PortfolioProject;
        }

        public IQueryable<PortfolioProject> GetPortfolioProjectfromCategoryID(int CategoryID)
        {
            IQueryable<PortfolioProject> PortfolioProject;

            // if (_authService.IsSuperAdmin())
            // {
            PortfolioProject = _ipsDataContext.PortfolioProjects.AsNoTracking().AsQueryable();
            //}
            // else
            // {
            //    TemplateContent = null;
            // }

            return PortfolioProject;
        }
        public IQueryable<LookupItem> GetLanguages()
        {
            return _ipsDataContext.LookupItems.Where(li => li.LookupItemType == "SystemLanguage").AsNoTracking().AsQueryable();
        }

        public IQueryable<PortfolioProject> GetPortfolioProjectByID(int PortfolioProjectID)
        {
            return _ipsDataContext.PortfolioProjects.Where(hc => hc.PortfolioProjectID == PortfolioProjectID);
        }

        public PortfolioProject AddPortfolioProject(PortfolioProject PortfolioProject)
        {
            //try
            //{
                _ipsDataContext.PortfolioProjects.Add(PortfolioProject);
                _ipsDataContext.SaveChanges();
                return PortfolioProject;
            //}
            //catch (Exception ex)
            //{
            //    string err = ex.Message;
            //    return new PortfolioProject();
            //}
        }
        public PortfolioImage AddPortfolioImage(PortfolioImage PortfolioImage)
        {
            _ipsDataContext.PortfolioImages.RemoveRange(_ipsDataContext.PortfolioImages.Where(TI => TI.PortfolioProjectID == PortfolioImage.PortfolioProjectID).ToList());
            _ipsDataContext.PortfolioImages.Add(PortfolioImage);
            _ipsDataContext.SaveChanges();
            return PortfolioImage;
        }
        public bool UpdatePortfolioProject(PortfolioProject PortfolioProject)
        {

            var original = _ipsDataContext.PortfolioProjects.Find(PortfolioProject.PortfolioProjectID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(PortfolioProject);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        
        public bool UpdatePortfolioImage(PortfolioImage PortfolioImage)
        {

            var original = _ipsDataContext.TemplateContents.Find(PortfolioImage.ProtfolioProjectImageID);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(PortfolioImage);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }


    }
    public class PortfolioData
    {
       
        public PortfolioCategory Caregories { get; set; }
        public TemplateContent Projects { get; set; }

    }
}

using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public interface IPortfolioService
    {
         IQueryable<PortfolioCategory> GetPortfolioCategory();
        

         IQueryable<PortfolioCategory> GetPortfolioCategoryByLanguageID(int languageID);
        


         IQueryable<PortfolioCategory> GetPortfolioCategoryByID(int PortfolioCategoryID);
       

         IQueryable<PortfolioImage> GetPortfolioImages(int PortfolioProjectID);
        

         PortfolioCategory AddPortfolioCategory(PortfolioCategory PortfolioCategory);
       

         bool UpdatePortfolioCategory(PortfolioCategory PortfolioCategory);
       

         IQueryable<PortfolioProject> GetPortfolioProjects();
       

         IQueryable<PortfolioProject> GetPortfolioProjectByCategoryID(int CategoryID);

         IQueryable<PortfolioProject> GetPortfolioProjectfromCategoryID(int CategoryID);

         IQueryable<LookupItem> GetLanguages();
        

         IQueryable<PortfolioProject> GetPortfolioProjectByID(int PortfolioProjectID);
       

         PortfolioProject AddPortfolioProject(PortfolioProject PortfolioProject);
        

         bool UpdatePortfolioProject(PortfolioProject PortfolioProject);
         bool UpdatePortfolioImage(PortfolioImage PortfolioImage);

         PortfolioImage AddPortfolioImage(PortfolioImage PortfolioImage);
    }
}

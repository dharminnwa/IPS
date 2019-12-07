using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public interface IManageHelpContentService
    {
         IQueryable<HelpCategory> GetHelpCategory();
         IQueryable<HelpCategory> GetHelpCategoryByID(int HelpCategoryID);
         HelpCategory AddHelpCategory(HelpCategory HelpCategory);
         bool UpdateHelpCategory(HelpCategory HelpCategory);
         IQueryable<HelpContent> GetHelpContent();
         IQueryable<HelpContent> GetHelpHelpContentByID(int HelpContentID);
         HelpContent AddHelpContent(HelpContent HelpContent);
         bool UpdateHelpContent(HelpContent HelpContent);
         IQueryable<LookupItem> GetLanguages();
         IQueryable<HelpContent> GetHelpContentByLanguageID(int LanguageID);
         IQueryable<HelpCategory> GetHelpCategoryByLanguageID(int languageID);
    }
}

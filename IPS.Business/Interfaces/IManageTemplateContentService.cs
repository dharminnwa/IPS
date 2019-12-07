using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public interface IManageTemplatepContentService
    {
        IQueryable<TemplateCategory> GetTemplateCategory();
        IQueryable<TemplateCategory> GetTemplateCategoryByID(int TemplateCategoryID);
        TemplateCategory AddTemplateCategory(TemplateCategory TemplateCategory);
        bool UpdateTemplateCategory(TemplateCategory TemplateCategory);
        IQueryable<TemplateContent> GetTemplateContent();
        IQueryable<TemplateContent> GetTemplateTemplateContentByID(int TemplateContentID);
        IQueryable<TemplateContent> GetTemplateTemplateContentByCategoryID(int TemplateContentID);
        TemplateContent AddTemplateContent(TemplateContent TemplateContent);
        bool UpdateTemplateContent(TemplateContent TemplateContent);
        IQueryable<LookupItem> GetLanguages();
        IQueryable<TemplateContent> GetTemplateContentByLanguageID(int LanguageID);
        IQueryable<TemplateCategory> GetTemplateCategoryByLanguageID(int languageID);
        IQueryable<TemplateContentImage> GetTemplateImages(int TemplateContentID);
        IQueryable<TempalteData> GetTemplateData(int languageID);
       TemplateContentImage AddTemplateImage(TemplateContentImage TemplateContentImage);
    }
}

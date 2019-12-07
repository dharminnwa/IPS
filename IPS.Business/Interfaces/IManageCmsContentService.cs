using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;

namespace IPS.Business
{
    public interface IManageCmsContentService
    {
        CmsPage Add(CmsPage Cmspage);
        IQueryable<CmsPage>  GetPages();
        IQueryable<CmsPage> GetByAccessCode(int PageAccessCode,int languageID);
        IQueryable<CmsPage> GetByID(int PageID);
        bool Update(CmsPage CmsPage);
         IQueryable<LookupItem> GetLanguages();
    }
    

}

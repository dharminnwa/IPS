using IPS.AuthData.Models;
using IPS.Business;
using IPS.Data;
using IPS.WebApi.Filters;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using System.Web.Script.Serialization;

namespace IPS.WebApi.Controllers
{
    public class IPSWebContentController : BaseController
    {
        IManageCmsContentService _manageCmsContentService;
        IManageHelpContentService _managehelpcontentservice;
        ITestimonialService _ITestimonialService;
        IContactUsService  _IContactUsService;
        IManageTemplatepContentService  _IManageTemplatepContentService;
        IPortfolioService _IPortfolioService;
        IManagePlanService _manageplanservice;
        public IPSWebContentController(IManageCmsContentService manageCmsContentService, IManageHelpContentService managehelpcontentservice, IContactUsService IContactUsService, IManageTemplatepContentService IManageTemplatepContentService, ITestimonialService ITestimonialService, IPortfolioService IPortfolioService, IManagePlanService manageplanservice)
        {
            _manageCmsContentService = manageCmsContentService;
            _managehelpcontentservice = managehelpcontentservice;
            _ITestimonialService = ITestimonialService;
            _IContactUsService = IContactUsService;
            _IManageTemplatepContentService = IManageTemplatepContentService;
            _IPortfolioService = IPortfolioService;
            _manageplanservice = manageplanservice;
          
        }
        //public IPSWebContentController()
        //{
        //   // _manageCmsContentService = manageCmsContentService;
        //   // _managehelpcontentservice = managehelpcontentservice;
        //   // _ITestimonialService = ITestimonialService;
        //    _IContactUsService = IContactUsService;
        //   // _IManageTemplatepContentService = IManageTemplatepContentService;
        //}
        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPageContent/{PageAccessCode}/{languageID}")]
        public IQueryable<CmsPage> GetPageContent(int PageAccessCode, int languageID)
        {
           // {PageAccessCode}/{languageID}
          // =1; =65;
            return _manageCmsContentService.GetByAccessCode(PageAccessCode, languageID);
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPages")]
        public IQueryable<CmsPage> GetPages()
        {
            return _manageCmsContentService.GetPages();
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetHelpContent/{languageID}")]
        public IQueryable<HelpContent> GetHelpContent(int languageID)
        {
            return _managehelpcontentservice.GetHelpContentByLanguageID(languageID);
        }
        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetHelpContentCategory/{languageID}")]
        public IQueryable<HelpCategory> GetHelpContentCategory(int languageID)
        {
            return _managehelpcontentservice.GetHelpCategoryByLanguageID(languageID);
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetTemplateContent/{languageID}")]
        public IQueryable<TemplateContent> GetTemplateContent(int languageID)
        {
            return _IManageTemplatepContentService.GetTemplateContentByLanguageID(languageID);
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetTemplateContentCategory/{languageID}")]
        public IQueryable<TemplateCategory> GetTemplateContentCategory(int languageID)
        {

            return _IManageTemplatepContentService.GetTemplateCategoryByLanguageID(languageID);
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetTemplates/{languageID}")]
        public IQueryable<TempalteData> GetTemplates(int languageID)
        {

            return _IManageTemplatepContentService.GetTemplateData(languageID);
        }
        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetTemplateImages/{TemplateContentID}")]
        public IQueryable<TemplateContentImage> GetTemplateImages(int TemplateContentID)
        {
            return _IManageTemplatepContentService.GetTemplateImages(TemplateContentID);
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetTestimonials")]
        public IQueryable<Testimonial> Gettestimonials()
        {
            return _ITestimonialService.GetTestimonial();
        }

        [HttpPost]
        public IHttpActionResult Add(ContactU ContactU)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            ContactU result = _IContactUsService.Add(ContactU);

            return Ok(result.ContactID);

        }

        [HttpGet]
        [Route("api/IPSWebContent/GetContactUS")]
        public ContactU GetContactUS()
        {
            return _IContactUsService.GetContact();
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPortfolioProjects/{CategoryID}")]
        public IQueryable<PortfolioProject> GetPortfolioProjects(int CategoryID)
        {
            return _IPortfolioService.GetPortfolioProjectByCategoryID(CategoryID);
        }


        
        [EnableQuery(MaxExpansionDepth = 8)]
        [Route("api/IPSWebContent/GetPortfolioProjectByCategoryID/{id}")]
        public IQueryable<PortfolioProject> GetPortfolioProjectByCategoryID(int id)
        {
            IQueryable<PortfolioProject> result = _IPortfolioService.GetPortfolioProjectfromCategoryID(id);

            return result;
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPortfolioCategory/{languageID}")]
        public IQueryable<PortfolioCategory> GetPortfolioCategory(int languageID)
        {
           
            return _IPortfolioService.GetPortfolioCategoryByLanguageID(languageID);
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPortfolioImages/{ProjectID}")]
        public IQueryable<PortfolioImage> GetPortfolioImages(int ProjectID)
        {
            return _IPortfolioService.GetPortfolioImages(ProjectID);
        }

        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetPlanByID/{PlanID}")]
        public Plans GetPlanByID(int PlanID)
        {
            return _manageplanservice.GetPlanByID(PlanID);
        }


        [EnableQuery]
        [HttpGet]
        [Route("api/IPSWebContent/GetAllPlan")]
        public Plans GetAllPlan()
        {
            return _manageplanservice.GetAllPlans();
        }

    }

   
}
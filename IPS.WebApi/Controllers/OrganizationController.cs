using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.SalesActivityModels;
using IPS.Data;
using IPS.WebApi.Constants;
using IPS.WebApi.Filters;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Infrastructure;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using System.Web.Script.Serialization;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class OrganizationController : BaseController
    {
        IOrganizationService _organizationService;


        public OrganizationController(IOrganizationService organizationService)
        {
            _organizationService = organizationService;
        }


        [EnableQuery]
        [HttpGet]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Read)]
        public IQueryable<Organization> GetOrganizations()
        {
            //string fileName = "Book4.csv";
            //string fname = HttpContext.Current.Server.MapPath("~\\Uploads\\CSV\\" + fileName);
            return _organizationService.Get();
        }

        [HttpGet]
        [Route("api/organizations/GetDDL")]
        public List<IPSDropDown> GetDDL()
        {
            return _organizationService.GetDDL();
        }


        [EnableQuery]
        [HttpGet]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Read)]
        [Route("api/organizations/getOrgsWithParticipants/")]
        public IQueryable<Organization> GetDashboardOrganizations()
        {
            var result = _organizationService.Get();
            return result;
        }


        [EnableQuery(MaxExpansionDepth = 8)]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Read)]
        public SingleResult<Organization> GetOrganization(int id)
        {
            SingleResult<Organization> result = SingleResult.Create(_organizationService.GetById(id));

            return result;
        }

        [HttpPost]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Create)]
        public IHttpActionResult Add(Organization organization)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            Organization result = _organizationService.Add(organization);

            return Ok(organization.Id);

        }

        [HttpPut]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Update)]
        public IHttpActionResult Update(Organization organization)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Organization org = _organizationService.GetById(organization.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _organizationService.Update(organization);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }


        }

        [HttpDelete]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Delete)]
        public IHttpActionResult Delete(int id)
        {
            Organization organization = _organizationService.GetById(id).FirstOrDefault();
            if (organization == null)
            {
                return NotFound();
            }

            bool result = _organizationService.Delete(organization);

            return Ok(result);
        }

        [Route("api/organizations/GetUsersbyOrganizationId/{organizationId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Users", OperationKey = Operations.Read)]
        public List<IPSParticipants> GetOrganizationUsers(int organizationId)
        {
            return _organizationService.GetOrganizationUsers(organizationId);
        }

        [Route("api/organizations/GetOrganizationUsersbyOrganizationId/{organizationId}")]
        [ResourcePermisionAuthorize(ResourceKey = "Organizations", OperationKey = Operations.Read)]
        public List<User> GetOrganizationUsersbyOrganizationId(int organizationId)
        {
            return _organizationService.GetOrganizationUsersbyOrganizationId(organizationId);
        }

        [Route("api/organizations/importCSV/{fileName}/{organizationId}/{salesManId}")]
        public bool ImportCSV(string fileName, int organizationId, int salesManId)
        {

            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;
            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                filePath = HttpContext.Current.Server.MapPath($"~\\{UploadFolders.BaseFolder}\\{UploadFolders.CustomerCsv}\\{fileName}");
            }
            else
            {
                filePath = fileStorageRoot + $"\\{UploadFolders.CustomerCsv}\\{fileName}";
            }
            return _organizationService.AddCustomersByCsv(filePath, organizationId, salesManId);
        }


        [Route("api/organizations/importOrganizationCSV/{fileName}/{organizationId}")]
        public bool ImportOrganizationCSV(string fileName, int organizationId)
        {

            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;
            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                filePath = HttpContext.Current.Server.MapPath($"~\\{UploadFolders.BaseFolder}\\{UploadFolders.OrganizationCsv}\\{fileName}");
            }
            else
            {
                filePath = fileStorageRoot + $"\\{UploadFolders.OrganizationCsv}\\{fileName}";
            }
            return _organizationService.AddOrganizationByCsv(filePath, organizationId);
        }



        [Route("api/organizations/GetOrganizationCustomers/{organizationId}")]
        public List<UserCusotmerModel> GetOrganizationCustomers(int organizationId)
        {
            return _organizationService.GetOrganizationCustomers(organizationId);
        }

        [Route("api/organizations/GetUserCustomersByOrganization/{organizationId}")]
        public List<UserCusotmerModel> GetUserCustomersByOrganization(int organizationId)
        {
            return _organizationService.GetUserCustomersByOrganization(organizationId);
        }

        [Route("api/organizations/GetUserCustomersForGoalId/{goalId}")]
        public List<UserCusotmerModel> GetUserCustomersForGoalId(int goalId)
        {
            return _organizationService.GetUserCustomersForGoalId(goalId);
        }

        [Route("api/organizations/GetUsersForGoalId/{goalId}")]
        public List<ProspectingCustomer> GetUsersForGoalId(int GoalId)
        {
            return _organizationService.GetUsersForGoalId(GoalId);
        }

        [Route("api/organizations/GetMeetingProspectingCustomersForGoalId/{goalId}")]
        public List<UserCusotmerModel> GetMeetingProspectingCustomersForGoalId(int goalId)
        {
            return _organizationService.GetMeetingProspectingCustomersForGoalId(goalId);
        }

        [Route("api/organizations/AddNewCustomer")]
        [HttpPost]
        public Customer AddNewCustomer(Customer customer)
        {
            return _organizationService.AddNewCustomer(customer);
        }



        [Route("api/organizations/checkCustomerExist/{mobile}")]
        [HttpGet]
        public bool checkCustomerExist(string mobile)
        {
            return _organizationService.checkCustomerExist(mobile);
        }

    }
}
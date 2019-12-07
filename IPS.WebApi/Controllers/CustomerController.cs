using IPS.Business;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.CustomerModels;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.TrainingModels;
using IPS.Data;
using log4net;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class CustomerController : BaseController
    {
        private readonly IAuthService _authService;
        private readonly ICustomerService _customerService;

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public CustomerController(IAuthService authService, ICustomerService customerService)
        {
            _customerService = customerService;
            _authService = authService;
        }

        [Route("api/Customer/GetCustomerById/{id}")]
        [HttpGet]
        public Customer GetCustomerById(int id)
        {
            Customer result = new Customer();
           
                result = _customerService.GetCustomerById(id);
           
            return result;
        }



        [Route("api/Customer/GetCustomerHistoryById/{id}")]
        [HttpGet]
        public List<CustomerHistoryModel> GetCustomerHistoryById(int id)
        {
            List<CustomerHistoryModel> result = new List<CustomerHistoryModel>();

            result = _customerService.GetCustomerHistoryById(id);

            return result;
        }


        [Route("api/Customer/saveCustomerOfferDetail")]
        [HttpPost]
        public ProspectingCustomerOfferDetail saveCustomerOfferDetail(ProspectingCustomerOfferDetail prospectingCustomerOfferDetail)
        {
            return _customerService.saveCustomerOfferDetail(prospectingCustomerOfferDetail);
        }

        [Route("api/Customer/getCustomerOfferDetails/{prospectingCustomerId}")]
        [HttpGet]
        public List<ProspectingCustomerOfferDetail> getCustomerOfferDetails(int prospectingCustomerId)
        {
            return _customerService.getCustomerOfferDetails(prospectingCustomerId);
        }

        [Route("api/Customer/saveOfferClosingDetail")]
        [HttpPost]
        public OfferClosingDetail saveOfferClosingDetail(OfferClosingDetail offerClosingDetail)
        {
            return _customerService.saveOfferClosingDetail(offerClosingDetail);
        }
    }
}
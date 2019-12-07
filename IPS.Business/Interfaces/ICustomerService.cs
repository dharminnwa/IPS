using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.TrainingModels;
using IPS.BusinessModels.CustomerModels;

namespace IPS.Business
{
    public interface ICustomerService
    {
        Customer GetCustomerById(int id);
        List<CustomerHistoryModel> GetCustomerHistoryById(int id);
        ProspectingCustomerOfferDetail saveCustomerOfferDetail(ProspectingCustomerOfferDetail prospectingCustomerOfferDetail);
        List<ProspectingCustomerOfferDetail> getCustomerOfferDetails(int prospectingCustomerId);
        OfferClosingDetail saveOfferClosingDetail(OfferClosingDetail offerClosingDetail);
    }
}

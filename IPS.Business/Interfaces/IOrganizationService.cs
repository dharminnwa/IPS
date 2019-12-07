using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.SalesActivityModels;

namespace IPS.Business
{
    public interface IOrganizationService : IDisposable
    {
        Organization Add(Organization organization);
        bool Delete(Organization organization);
        IQueryable<Organization> Get();
        IQueryable<Organization> GetOrganizationsWithParticipants();
        IQueryable<Organization> GetById(int id);
        bool Update(Organization organization);
        List<IPSDropDown> GetDDL();
        List<IPSParticipants> GetOrganizationUsers(int organizationId);
        List<UserCusotmerModel> GetOrganizationCustomers(int organizationId);
        List<UserCusotmerModel> GetUserCustomersByOrganization(int organizationId);
        bool AddCustomersByCsv(string csvPath, int organizationId, int salesManId);
        bool AddOrganizationByCsv(string csvPath, int organizationId);

        List<UserCusotmerModel> GetUserCustomersForGoalId(int GoalId);
        List<ProspectingCustomer> GetUsersForGoalId(int GoalId);
        List<UserCusotmerModel> GetMeetingProspectingCustomersForGoalId(int GoalId);
        Customer AddNewCustomer(Customer customer);
        bool checkCustomerExist(string mobile);
        List<User> GetOrganizationUsersbyOrganizationId(int organizationId);
        List<User> GetAccessibleUsersbyOrganizationId(int organizationId, int userId);

        List<Organization> GetSubOrganizations(int organizationId);
        List<Organization> GetAccessibleOrganizations(int organizationId, int userId);
    }
}

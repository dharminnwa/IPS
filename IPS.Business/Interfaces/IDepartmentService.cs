using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
namespace IPS.Business
{
    public interface IDepartmentService
    {
        Department Add(IPS.Data.Department department);
        bool Delete(IPS.Data.Department department);
        System.Linq.IQueryable<IPS.Data.Department> Get();
        IQueryable<Department> GetDepartmentsByOrganizationId(int organizationId);
        //IPS.Data.Department GetById(int id);
        IQueryable<Department> GetById(int id);
        Department GetDepartmentById(int id);
        bool Update(IPS.Data.Department department);

        List<Department> GetOrganizationDepartmentsByOrganizationId(int organizationId);
    }
}

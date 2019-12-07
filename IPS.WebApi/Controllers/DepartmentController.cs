using IPS.Business;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class DepartmentController : BaseController
    {
        IDepartmentService _departmentService;

        public DepartmentController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        [EnableQuery]
        [Route("api/departments/getDepartments/")]
        public IQueryable<Department> GetDepartments()
        {
            return _departmentService.Get();
        }

        [HttpGet]
        [EnableQuery]
        [Route("api/departments/getDepartmentsByOrgId/{id}")]
        public IQueryable<Department> GetDepartmentsByOrgnizationId(int id)
        {
            return _departmentService.GetDepartmentsByOrganizationId(id);
        }

        [HttpGet]
        [Route("api/departments/GetOrganizationDepartmentsByOrganizationId/{id}")]
        public List<Department> GetOrganizationDepartmentsByOrganizationId(int id)
        {
            return _departmentService.GetOrganizationDepartmentsByOrganizationId(id);
        }


        [HttpGet]
        [Route("api/departments/GetDepartmentById/{id}")]
        public Department GetDepartmentById(int id)
        {
            Department result = _departmentService.GetDepartmentById(id);
            return result;
        }

        [EnableQuery]
        public SingleResult<Department> GetDepartment(int id)
        {
            SingleResult<Department> result = SingleResult.Create(_departmentService.GetById(id));
       
            return result;
        }

        [HttpPost]
        public IHttpActionResult Add(Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Department result = _departmentService.Add(department);

            return Ok(department.Id);
        }

        [HttpPut]
        public IHttpActionResult Update(Department department)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Department org = _departmentService.GetById(department.Id).FirstOrDefault();

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _departmentService.Update(department);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
                
            
        }

        [HttpDelete]
        public IHttpActionResult Delete(int id)
        {
            Department department = _departmentService.GetById(id).FirstOrDefault();
            if (department == null)
            {
                return NotFound();
            }

            bool result = _departmentService.Delete(department);

            return Ok(result);
        }
    }
}
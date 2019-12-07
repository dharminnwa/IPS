using IPS.Business;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class Scale_CategoriesController : BaseController
    {
        IScaleCategoryService _scaleCategoryService;

        public Scale_CategoriesController(IScaleCategoryService scaleCategoryService)
        {
            _scaleCategoryService = scaleCategoryService;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<ScaleCategory> GetScaleCategories()
        {
            return _scaleCategoryService.Get();
        }


        public IHttpActionResult GetScaleCategory(int id)
        {
            ScaleCategory result = _scaleCategoryService.GetById(id);

            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public IHttpActionResult Add(ScaleCategory scaleCategory)
        {
            if (!ModelState.IsValid){

                return BadRequest(ModelState);
            }

            ScaleCategory result = _scaleCategoryService.Add(scaleCategory);

            return Ok(scaleCategory.Id);

        }

        [HttpPut]
        public IHttpActionResult Update(ScaleCategory scaleCategory)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            ScaleCategory org = _scaleCategoryService.GetById(scaleCategory.Id);

            if (org == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _scaleCategoryService.Update(scaleCategory);
                
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
            ScaleCategory scale = _scaleCategoryService.GetById(id);
            if (scale == null)
            {
                return NotFound();
            }

            bool result = _scaleCategoryService.Delete(scale);

            return Ok(result);
        }
    }
}
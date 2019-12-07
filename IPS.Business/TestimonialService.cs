using System.Globalization;
using IPS.BusinessModels.Entities;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using System.Configuration;
using System.Net;
using System.Net.Mail;


namespace IPS.Business
{
    public class TestimonialService : BaseService, IPS.Business.ITestimonialService
    {
        public IQueryable<Testimonial> GetTestimonial()
        {
            IQueryable<Testimonial> Testimonial;

           // if (_authService.IsSuperAdmin())
           // {
            Testimonial = _ipsDataContext.Testimonials.AsNoTracking().AsQueryable();
           // }
           // else
          //  {
             //   TemplateCategory = null;
          //  }

            return Testimonial;
        }
    }
}

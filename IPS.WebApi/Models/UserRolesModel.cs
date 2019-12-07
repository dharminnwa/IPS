using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using IPS.Validation;

namespace IPS.WebApi.Models
{
    public class UserRolesModel
    {
        [Required]
        public string UserId { get; set; }

        [Required]
        public string[] roles { get; set; }
    }
}

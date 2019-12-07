using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using System.Web.Http;
using IPS.BusinessModels.Entities;
using IPS.Data;

namespace IPS.WebApi.Models
{
    public class UserViewModel
    {
        [Required]
        public User User { get; set; }

        public ResetPasswordViewModel ResetPasswordViewModel { get; set; }

        public UserViewModel(User user, ResetPasswordViewModel passwordViewModel)
        {
            User = user;
            ResetPasswordViewModel = passwordViewModel;
        }
    }
}
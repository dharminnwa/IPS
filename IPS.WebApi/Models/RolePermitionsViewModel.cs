using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IPS.WebApi.Models
{
    public class RolePermitionsViewModel
    {
        public string roleId;
        public bool isApplicableToAllResources;
        public bool isApplicableToOwnResources;
    }
}
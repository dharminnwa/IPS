using IPS.AuthData.Models;
using IPS.Business;
using IPS.Business.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace IPS.WebApi.Filters
{
    [AttributeUsageAttribute(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = true)]
    public class ResourcePermisionAuthorize : AuthorizeAttribute
    {

        public string ResourceKey { get; set; }
        public Operations OperationKey { get; set; }
        public bool CheckProjectLevelPermission { get; set; }
        public bool CheckOrganizationLevelPermission { get; set; }

        //public ResourcePermisionAuthorize(int ResourceId, Operations operation)
        //{
        //    _resourceId = ResourceId;
        //    _operation = operation;
        //}

        public override void OnAuthorization(HttpActionContext actionContext)
        {
            //Perform your logic here
            base.OnAuthorization(actionContext);
        }

        protected override bool IsAuthorized(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            //Get the current claims principal
            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            //Make sure they are authenticated
            if (!prinicpal.Identity.IsAuthenticated)
                return false;
            //Get the roles from the claims
            var roles = prinicpal.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray();
            //Check if they are authorized
            IAuthService service = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService));
            bool isAuthorized = false;
            if (service.IsSuperAdmin())
            {
                isAuthorized = true;
            }
            else
            {
                int userOrganizationId = 0;
                IEnumerable<string> headerOrganizationId;
                if (actionContext.Request.Headers.TryGetValues("OrganizationId", out headerOrganizationId))
                {
                    int.TryParse(headerOrganizationId.FirstOrDefault(), out userOrganizationId);
                }
                isAuthorized = service.Authorize(prinicpal.Identity.Name, ResourceKey, OperationKey);
                if (CheckProjectLevelPermission)
                {
                    if (ResourceKey.ToLower() == "projects")
                    {
                        var projectId = actionContext.RequestContext.RouteData.Values.Where(x => x.Key.ToLower() == "projectid").Select(x => x.Value).FirstOrDefault();
                        if (projectId != null)
                        {
                            int id = Convert.ToInt32(projectId);
                            isAuthorized = service.IsProjectAuthorize(id, OperationKey, userOrganizationId);
                        }
                    }
                    else if (ResourceKey.ToLower() == "profiles")
                    {
                        var profileId = actionContext.RequestContext.RouteData.Values.Where(x => x.Key.ToLower() == "profileid").Select(x => x.Value).FirstOrDefault();
                        if (profileId != null)
                        {
                            int id = Convert.ToInt32(profileId);
                            isAuthorized = service.IsProfileAuthorize(id, OperationKey, userOrganizationId);
                        }
                        else if (actionContext.RequestContext.RouteData.Values.Any(x => x.Key == "controller"))
                        {
                            profileId = actionContext.RequestContext.RouteData.Values.Where(x => x.Key.ToLower() == "id").Select(x => x.Value).FirstOrDefault();
                            if (profileId != null)
                            {
                                int id = Convert.ToInt32(profileId);
                                isAuthorized = service.IsProfileAuthorize(id, OperationKey, userOrganizationId);
                            }
                        }
                    }

                }
                if (CheckOrganizationLevelPermission)
                {
                    var organizationId = actionContext.RequestContext.RouteData.Values.Where(x => x.Key.ToLower() == "organizationid").Select(x => x.Value).FirstOrDefault();
                    if (organizationId != null)
                    {
                        int id = Convert.ToInt32(organizationId);
                        isAuthorized = service.IsOrganizationAuthorize(id, OperationKey, userOrganizationId);
                    }
                }
            }
            return isAuthorized;
        }

    }
}
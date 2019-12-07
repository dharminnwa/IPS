using IPS.AuthData;
using IPS.AuthData.Models;
using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.WebApi.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using IPS.BusinessModels.ResourceModels;

namespace IPS.WebApi.Providers
{
    public class SimpleAuthorizationServerProvider : OAuthAuthorizationServerProvider
    {
        public override Task ValidateClientAuthentication(OAuthValidateClientAuthenticationContext context)
        {

            string clientId = string.Empty;
            string clientSecret = string.Empty;
            Client client = null;

            if (!context.TryGetBasicCredentials(out clientId, out clientSecret))
            {
                context.TryGetFormCredentials(out clientId, out clientSecret);
            }

            if (context.ClientId == null)
            {


                //Remove the comments from the below line context.SetError, and invalidate context 
                //if you want to force sending clientId/secrects once obtain access tokens. 
                context.Validated();
                //context.SetError("invalid_clientId", "ClientId should be sent.");
                return Task.FromResult<object>(null);
            }

            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                client = authService.FindClient(context.ClientId);
            }


            if (client == null)
            {
                context.SetError("invalid_clientId", string.Format("Client '{0}' is not registered in the system.", context.ClientId));
                return Task.FromResult<object>(null);
            }

            if (client.ApplicationType == (int)ApplicationTypes.NativeConfidential)
            {
                if (string.IsNullOrWhiteSpace(clientSecret))
                {
                    context.SetError("invalid_clientId", "Client secret should be sent.");
                    return Task.FromResult<object>(null);
                }
                else
                {
                    if (client.Secret != Helper.GetHash(clientSecret))
                    {
                        context.SetError("invalid_clientId", "Client secret is invalid.");
                        return Task.FromResult<object>(null);
                    }
                }
            }

            if (!client.Active)
            {
                context.SetError("invalid_clientId", "Client is inactive.");
                return Task.FromResult<object>(null);
            }

            context.OwinContext.Set<string>("as:clientAllowedOrigin", client.AllowedOrigin);
            context.OwinContext.Set<string>("as:clientRefreshTokenLifeTime", client.RefreshTokenLifeTime.ToString());

            context.Validated();
            return Task.FromResult<object>(null);
        }

        public override Task GrantResourceOwnerCredentials(OAuthGrantResourceOwnerCredentialsContext context)
        {

            var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");


            ApplicationUser user = null;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                try
                {
                    user = authService.FindUser(context.UserName, context.Password);
                }
                catch (Exception ex)
                {
                    context.SetError("invalid_grant", "An error occurred while executing the command definition. Please contact your administrator.");
                }
            }

            if (user == null)
            {
                context.SetError("invalid_grant", "The user name or password is incorrect.");
                return Task.FromResult<object>(null);
            }

            if (!user.IsActive)
            {
                context.SetError("invalid_grant", "The user account is locked. Please contact your administrator.");
                return Task.FromResult<object>(null);
            }

            var identity = new ClaimsIdentity(context.Options.AuthenticationType);
            identity.AddClaim(new Claim(ClaimTypes.Name, context.UserName));
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id));

            List<string> userRoles;
            List<IpsUserPermission> userPermitions;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                userRoles = authService.GetUserRoles(user.Id);
                IpsUser ipsUser = authService.GetUserById(user.Id);
                userPermitions = authService.GetUserPermissions(ipsUser);

            }

            int orgId = -1;
            int userId = -1;
            using (IUserService userService = (IUserService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IUserService)))
            {
                IPS.Data.User ipsUser = userService.GetUserByKey(user.Id).FirstOrDefault();
                orgId = ipsUser.OrganizationId.Value;
                userId = ipsUser.Id;

            }
            List<int> subOrganizationIds = new List<int>();
            List<int> accessibleUserIds = new List<int>();
            using (IOrganizationService organizationService = (IOrganizationService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IOrganizationService)))
            {
                subOrganizationIds = organizationService.GetAccessibleOrganizations(orgId,userId).Select(x => x.Id).ToList();
                List<int> ownUserIds = organizationService.GetAccessibleUsersbyOrganizationId(orgId, userId).Select(x => x.Id).ToList();
                accessibleUserIds.AddRange(ownUserIds);
                foreach (int subOrgid in subOrganizationIds)
                {
                    List<int> subOrganizationUserIds = organizationService.GetAccessibleUsersbyOrganizationId(subOrgid, userId).Select(x => x.Id).ToList();
                    accessibleUserIds.AddRange(subOrganizationUserIds);
                }

            }
            int roleLevelId = 0;
            using (IRoleService roleService = (IRoleService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IRoleService)))
            {
                string roleid = userRoles.FirstOrDefault();
                IpsRole role = roleService.GetById(roleid);
                if (role != null)
                {
                    roleLevelId = role.RoleLevel;
                }
            }
            IpsRoleLevelAdvancePermission roleLevelAdvancePermission = null;
            using (IRoleLevelPermissionService roleLevelPermissionService = (IRoleLevelPermissionService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IRoleLevelPermissionService)))
            {
                if (roleLevelId > 0)
                {
                    roleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(roleLevelId);
                }
            }


            if (userRoles != null)
            {
                foreach (string role in userRoles)
                {
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }

            identity.AddClaim(new Claim("sub", context.UserName));

            var props = new AuthenticationProperties(new Dictionary<string, string>
                {
                    {
                        "as:client_id", (context.ClientId == null) ? string.Empty : context.ClientId
                    },
                    {
                        "id", user.Id
                    },
                    {
                        "username", user.UserName
                    },
                    {
                        "email", user.Email != null ? user.Email : ""
                    },
                    {
                        "firstName", user.FirstName != null ? user.FirstName : ""
                    },
                    {
                        "lastName", user.LastName != null ? user.LastName : ""
                    },
                    {
                        "isActive", user.IsActive.ToString().ToLower()
                    },
                    {
                        "roles", string.Join(",", userRoles.ToArray())
                    },
                    {
                        "isAdmin", userRoles.Contains("Admin").ToString().ToLower()
                    },
                    {
                        "imageUrl", user.ImageUrl == null ? "" : user.ImageUrl
                    },
                    {
                        "useRefreshTokens", "true"
                    },
                    {
                        "permitions", JsonConvert.SerializeObject(userPermitions)
                    },
                    {
                    "roleLevelAdvancePermission" , JsonConvert.SerializeObject(roleLevelAdvancePermission)
                    },
                    {
                        "organizationId", orgId.ToString()
                    },
                    {
                        "userId", userId.ToString()
                    },
                    {
                        "subOrganizationIds",JsonConvert.SerializeObject(subOrganizationIds)
                    },
                { "accessibleUserIds", JsonConvert.SerializeObject(accessibleUserIds)}

                });
            var ticket = new AuthenticationTicket(identity, props);
            context.Validated(ticket);
            return Task.FromResult<object>(null);
        }

        public override Task GrantRefreshToken(OAuthGrantRefreshTokenContext context)
        {
            var originalClient = context.Ticket.Properties.Dictionary["as:client_id"];
            var currentClient = context.ClientId;

            if (originalClient != currentClient)
            {
                context.SetError("invalid_clientId", "Refresh token is issued to a different clientId.");
                return Task.FromResult<object>(null);
            }

            // Change auth ticket for refresh token requests
            var newIdentity = new ClaimsIdentity(context.Ticket.Identity);

            var newClaim = newIdentity.Claims.Where(c => c.Type == "newClaim").FirstOrDefault();
            if (newClaim != null)
            {
                newIdentity.RemoveClaim(newClaim);
            }
            newIdentity.AddClaim(new Claim("newClaim", "newValue"));

            var newTicket = new AuthenticationTicket(newIdentity, context.Ticket.Properties);
            context.Validated(newTicket);

            return Task.FromResult<object>(null);
        }

        public override Task TokenEndpoint(OAuthTokenEndpointContext context)
        {
            foreach (KeyValuePair<string, string> property in context.Properties.Dictionary)
            {
                context.AdditionalResponseParameters.Add(property.Key, property.Value);
            }

            return Task.FromResult<object>(null);
        }

    }
}
using IPS.WebApi.Models;
using IPS.WebApi.Results;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using IPS.Business;
using System.Web.Security;
using IPS.WebApi;
using IPS.Business.Interfaces;
using IPS.AuthData.Models;
using System.IO;
using Newtonsoft.Json;
using IPS.BusinessModels.Entities;
using System.Web.OData;
using IPS.WebApi.App_Start;
using log4net;
using IPS.Fx.Security.Crytography;
using IPS.BusinessModels.ResourceModels;
using IPS.WebApi.Filters;

namespace IPS.WebApi.Controllers
{

    [Authorize]
    [RoutePrefix("api/Account")]
    public class AccountController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private IAuthService _authService = null;

        private IAuthenticationManager Authentication
        {
            get { return Request.GetOwinContext().Authentication; }
        }

        public AccountController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST api/Account/Register
        //[AllowAnonymous]
        [Route("Register")]
        [ResourcePermisionAuthorize(ResourceKey = "users", OperationKey = Operations.Create)]
        public IHttpActionResult Register(RegisterViewModel registerViewModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            RSAAsymmetricProvider rsaAsymmetricProvider = new RSAAsymmetricProvider();

            ApplicationUser user = new ApplicationUser();
            user.Email = registerViewModel.Email;
            user.UserName = registerViewModel.UserName;
            user.IsActive = true;
            user.EmailConfirmed = true;
            user.PhoneNumberConfirmed = true;
            user.TwoFactorEnabled = false;
            user.LockoutEnabled = false;
            user.AccessFailedCount = 0;
            user.Id = Guid.NewGuid().ToString();
            user.Password = rsaAsymmetricProvider.Encrypt(registerViewModel.Password);
            user.FirstName = registerViewModel.FirstName;
            user.LastName = registerViewModel.LastName;

            IdentityResult result = _authService.CreateUser(user, registerViewModel.Password);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }
            return Ok(user.Id);
        }

        // GET api/Account/ExternalLogin
        [OverrideAuthentication]
        [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
        [AllowAnonymous]
        [Route("ExternalLogin", Name = "ExternalLogin")]
#pragma warning disable 1998
        public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
        {
            string redirectUri = string.Empty;

            if (error != null)
            {
                return BadRequest(Uri.EscapeDataString(error));
            }

            if (!User.Identity.IsAuthenticated)
            {
                return new ChallengeResult(provider, this);
            }

            var redirectUriValidationResult = ValidateClientAndRedirectUri(this.Request, ref redirectUri);

            if (!string.IsNullOrWhiteSpace(redirectUriValidationResult))
            {
                return BadRequest(redirectUriValidationResult);
            }

            ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

            if (externalLogin == null)
            {
                return InternalServerError();
            }

            if (externalLogin.LoginProvider != provider)
            {
                Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
                return new ChallengeResult(provider, this);
            }

            IpsUser user = _authService.Find(externalLogin.LoginProvider, externalLogin.ProviderKey);

            bool hasRegistered = user != null;

            redirectUri = string.Format("{0}#external_access_token={1}&provider={2}&haslocalaccount={3}&external_user_name={4}",
                                            redirectUri,
                                            externalLogin.ExternalAccessToken,
                                            externalLogin.LoginProvider,
                                            hasRegistered.ToString(),
                                            externalLogin.UserName);

            return Redirect(redirectUri);

        }
#pragma warning restore 1998

        // POST api/Account/RegisterExternal
        [AllowAnonymous]
        [Route("RegisterExternal")]
        public async Task<IHttpActionResult> RegisterExternal(RegisterExternalBindingModel model)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var verifiedAccessToken = await VerifyExternalAccessToken(model.Provider, model.ExternalAccessToken);
            if (verifiedAccessToken == null)
            {
                return BadRequest("Invalid Provider or External Access Token");
            }

            IpsUser user = _authService.Find(model.Provider, verifiedAccessToken.user_id);

            bool hasRegistered = user != null;

            if (hasRegistered)
            {
                return BadRequest("External user is already registered");
            }

            user = new IpsUser() { UserName = model.UserName };

            IdentityResult result = _authService.Create(user);
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            var info = new ExternalLoginInfo()
            {
                DefaultUserName = model.UserName,
                Login = new UserLoginInfo(model.Provider, verifiedAccessToken.user_id)
            };

            result = _authService.AddLogin(user.Id, model.Provider, verifiedAccessToken.user_id);
            if (!result.Succeeded)
            {
                return GetErrorResult(result);
            }

            //generate access token response
            var accessTokenResponse = GenerateLocalAccessTokenResponse(model.UserName);

            return Ok(accessTokenResponse);
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("ObtainLocalAccessToken")]
        public async Task<IHttpActionResult> ObtainLocalAccessToken(string provider, string externalAccessToken)
        {

            if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(externalAccessToken))
            {
                return BadRequest("Provider or external access token is not sent");
            }

            var verifiedAccessToken = await VerifyExternalAccessToken(provider, externalAccessToken);
            if (verifiedAccessToken == null)
            {
                return BadRequest("Invalid Provider or External Access Token");
            }

            IpsUser user = _authService.Find(provider, verifiedAccessToken.user_id);

            bool hasRegistered = user != null;

            if (!hasRegistered)
            {
                return BadRequest("External user is not registered");
            }

            //generate access token response
            var accessTokenResponse = GenerateLocalAccessTokenResponse(user.UserName);

            return Ok(accessTokenResponse);

        }
        [HttpPost]
        [Route("ChangePassword")]
        public IHttpActionResult ChangePassword(ChangePasswordViewModel changePassword)
        {
            var user = _authService.GetUserById(changePassword.UserId);

            if (user == null)
            {
                return BadRequest("User doesn't exists");
            }

            if (user.UserName == changePassword.NewPassword)
            {
                return BadRequest("The password and user name should be different.");
            }

            if (!ModelState.IsValid)
            {
                var messages = string.Join("; ", ModelState.Values
                                        .SelectMany(x => x.Errors)
                                        .Select(x => x.ErrorMessage));
                return BadRequest(messages);
            }


            ClaimsPrincipal claimsPrincipal = User as ClaimsPrincipal;
            Claim userIdClaim = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            IdentityResult result = _authService.ChangePassword(changePassword.UserId, user.User.OrganizationId, changePassword.CurrentPassword, changePassword.ConfirmNewPassword, userIdClaim == null ? false : changePassword.UserId == userIdClaim.Value);

            if (result != null && !result.Succeeded && result.Errors.Count() > 0 && result.Errors.First() == "Password has no change. Don't need to update it!")
            {
                return Ok();
            }

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("ForgotPassword/{username}")]
        public IHttpActionResult ForgotPassword(string username)
        {
            try
            {
                IdentityResult result = _authService.ForgotPassword(username);
                IHttpActionResult errorResult = GetErrorResult(result);

                if (errorResult != null)
                {
                    return errorResult;
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Log.Error(ex.InnerException.InnerException.Message);
                return Ok();
            }
        }

        [Authorize(Roles = "Admin")]
        [Route("ResetPassword")]
        public IHttpActionResult ResetPassword(ResetPasswordViewModel resetPassword, string token)
        {

            if (resetPassword.UserId == null)
            {
                return BadRequest("User id can't be empty.");
            }

            string userName = _authService.GetUserById(resetPassword.UserId).UserName;

            if (userName == resetPassword.NewPassword)
            {
                return BadRequest("The password and user name should be different.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = _authService.ResetPassword(resetPassword.UserId, token, resetPassword.NewPassword);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }

            return Ok(result);
        }

        [HttpGet]
        [ActionName("GetCurrentUser")]
        public IHttpActionResult GetCurrentUser()
        {
            string userId = Authentication.User.Identity.GetUserId();
            //_authService.Find(User.Identity.GetUserId)
            IpsUser user = _authService.GetUserById(userId);
            return Ok(user);
        }

        [HttpGet]
        [ActionName("GetCurrentUserRoles")]
        public IHttpActionResult GetCurrentUserRoles()
        {
            List<IpsUserRole> roles = _authService.GetCurrentUserRoles();
            return Ok(roles);
        }


        [HttpGet]
        [ActionName("GetCurrentUserPermissions")]
        public IHttpActionResult GetCurrentUserPermissions()
        {
            List<IpsPermissionModel> permissions = _authService.GetCurrentUserPermissions();
            return Ok(permissions);
        }


        [HttpGet]
        //[Authorize(Roles = "Admin")]
        [ActionName("GetUserById")]
        public IHttpActionResult GetUserById(string id)
        {
            IpsUser user = _authService.GetUserById(id);
            return Ok(user);
        }

        [HttpGet]
        [ActionName("GetUserPermitions")]
        public IHttpActionResult GetUserPermitions()
        {
            string userId = Authentication.User.Identity.GetUserId();
            IpsUser user = _authService.GetUserById(userId);
            List<IpsUserPermission> permitions = _authService.GetUserPermissions(user);
            return Ok(JsonConvert.SerializeObject(permitions));
        }

        [HttpGet]
        [Route("GetUsersRoles")]
        [ActionName("GetUsersRoles")]
        public IHttpActionResult GetUserRoles()
        {
            var result = _authService.GetUserRoles();
            return Ok(result);
        }

        [HttpGet]
        [ActionName("GetUsers")]
        public IHttpActionResult GetUsers()
        {
            List<IpsUser> users = _authService.GetUsers();
            return Ok(users);
        }

        [HttpGet]
        [Route("TryGetPassword/{id}/{organizationId}")]
        [ActionName("TryGetPassword")]
        public IHttpActionResult TryGetPassword(string id, int organizationId)
        {
            ClaimsPrincipal claimsPrincipal = User as ClaimsPrincipal;
            Claim userIdClaim = claimsPrincipal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            var response = _authService.TryGetUserPassword(id, organizationId, false, userIdClaim == null ? false : id == userIdClaim.Value);
            return Ok(response);
        }

        [Authorize(Roles = "Admin")]
        [Route("SaveUserRoles")]
        public IHttpActionResult SaveUserRoles(UserRolesModel userRoles)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (_authService.IsUserExists(userRoles.UserId))
            {
                return NotFound();
            }

            IdentityResult result = _authService.AddUserRoles(userRoles.UserId, userRoles.roles);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }
            return Ok();
        }

        [Route("UpdateUser")]
        public IHttpActionResult UpdateUser(IpsUser user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            IdentityResult result = _authService.UpdateUser(user);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }
            return Ok();
        }

        [HttpDelete]
        [Authorize(Roles = "Admin")]
        [AcceptVerbs("DELETE")]
        public IHttpActionResult Delete(string id)
        {
            IdentityResult result = _authService.DeleteUser(id);

            IHttpActionResult errorResult = GetErrorResult(result);

            if (errorResult != null)
            {
                return errorResult;
            }
            return Ok();
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _authService.Dispose();
            }

            base.Dispose(disposing);
        }

        #region Helpers

        private IHttpActionResult GetErrorResult(IdentityResult result)
        {
            if (result == null)
            {
                return InternalServerError();
            }

            if (!result.Succeeded)
            {
                if (result.Errors != null)
                {
                    foreach (string error in result.Errors)
                    {
                        ModelState.AddModelError("Error", error);
                    }
                }

                if (ModelState.IsValid)
                {
                    // No ModelState errors are available to send, so just return an empty BadRequest.
                    return BadRequest();
                }

                return BadRequest(ModelState);
            }

            return null;
        }

        private string ValidateClientAndRedirectUri(HttpRequestMessage request, ref string redirectUriOutput)
        {

            Uri redirectUri;

            var redirectUriString = GetQueryString(Request, "redirect_uri");

            if (string.IsNullOrWhiteSpace(redirectUriString))
            {
                return "redirect_uri is required";
            }

            bool validUri = Uri.TryCreate(redirectUriString, UriKind.Absolute, out redirectUri);

            if (!validUri)
            {
                return "redirect_uri is invalid";
            }

            var clientId = GetQueryString(Request, "client_id");

            if (string.IsNullOrWhiteSpace(clientId))
            {
                return "client_Id is required";
            }

            var client = _authService.FindClient(clientId);

            if (client == null)
            {
                return string.Format("Client_id '{0}' is not registered in the system.", clientId);
            }

            if (!string.Equals(client.AllowedOrigin, redirectUri.GetLeftPart(UriPartial.Authority), StringComparison.OrdinalIgnoreCase))
            {
                return string.Format("The given URL is not allowed by Client_id '{0}' configuration.", clientId);
            }

            redirectUriOutput = redirectUri.AbsoluteUri;

            return string.Empty;

        }

        private string GetQueryString(HttpRequestMessage request, string key)
        {
            var queryStrings = request.GetQueryNameValuePairs();

            if (queryStrings == null) return null;

            var match = queryStrings.FirstOrDefault(keyValue => string.Compare(keyValue.Key, key, true) == 0);

            if (string.IsNullOrEmpty(match.Value)) return null;

            return match.Value;
        }

        private async Task<ParsedExternalAccessToken> VerifyExternalAccessToken(string provider, string accessToken)
        {
            ParsedExternalAccessToken parsedToken = null;

            var verifyTokenEndPoint = "";

            if (provider == "Facebook")
            {
                //You can get it from here: https://developers.facebook.com/tools/accesstoken/
                //More about debug_tokn here: http://stackoverflow.com/questions/16641083/how-does-one-get-the-app-access-token-for-debug-token-inspection-on-facebook
                var appToken = "xxxxxx";
                verifyTokenEndPoint = string.Format("https://graph.facebook.com/debug_token?input_token={0}&access_token={1}", accessToken, appToken);
            }
            else if (provider == "Google")
            {
                verifyTokenEndPoint = string.Format("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={0}", accessToken);
            }
            else
            {
                return null;
            }

            var client = new HttpClient();
            var uri = new Uri(verifyTokenEndPoint);
            var response = await client.GetAsync(uri);

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();

                dynamic jObj = (JObject)Newtonsoft.Json.JsonConvert.DeserializeObject(content);

                parsedToken = new ParsedExternalAccessToken();

                if (provider == "Facebook")
                {
                    parsedToken.user_id = jObj["data"]["user_id"];
                    parsedToken.app_id = jObj["data"]["app_id"];

                    if (!string.Equals(OAuthConfig.facebookAuthOptions.AppId, parsedToken.app_id, StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }
                }
                else if (provider == "Google")
                {
                    parsedToken.user_id = jObj["user_id"];
                    parsedToken.app_id = jObj["audience"];

                    if (!string.Equals(OAuthConfig.googleAuthOptions.ClientId, parsedToken.app_id, StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }

                }

            }

            return parsedToken;
        }

        private JObject GenerateLocalAccessTokenResponse(string userName)
        {

            var tokenExpiration = TimeSpan.FromDays(1);

            ClaimsIdentity identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);

            identity.AddClaim(new Claim(ClaimTypes.Name, userName));
            //identity.AddClaim(new Claim("role", "user"));

            var props = new AuthenticationProperties()
            {
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.Add(tokenExpiration),
            };

            var ticket = new AuthenticationTicket(identity, props);

            var accessToken = OAuthConfig.OAuthBearerOptions.AccessTokenFormat.Protect(ticket);

            JObject tokenResponse = new JObject(
                                        new JProperty("userName", userName),
                                        new JProperty("access_token", accessToken),
                                        new JProperty("token_type", "bearer"),
                                        new JProperty("expires_in", tokenExpiration.TotalSeconds.ToString()),
                                        new JProperty(".issued", ticket.Properties.IssuedUtc.ToString()),
                                        new JProperty(".expires", ticket.Properties.ExpiresUtc.ToString())
        );

            return tokenResponse;
        }

        private class ExternalLoginData
        {
            public string LoginProvider { get; set; }
            public string ProviderKey { get; set; }
            public string UserName { get; set; }
            public string ExternalAccessToken { get; set; }

            public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
            {
                if (identity == null)
                {
                    return null;
                }

                Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

                if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer) || String.IsNullOrEmpty(providerKeyClaim.Value))
                {
                    return null;
                }

                if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
                {
                    return null;
                }

                return new ExternalLoginData
                {
                    LoginProvider = providerKeyClaim.Issuer,
                    ProviderKey = providerKeyClaim.Value,
                    UserName = identity.FindFirstValue(ClaimTypes.Name),
                    ExternalAccessToken = identity.FindFirstValue("ExternalAccessToken"),
                };
            }
        }

        #endregion
    }
}

using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
namespace IPS.Business.Interfaces
{
    public interface IAuthService : IDisposable
    {
        Microsoft.AspNet.Identity.IdentityResult AddLogin(string userId, string loginProvider, string providerKey);
        bool AddRefreshToken(IPS.AuthData.Models.RefreshToken token);
        Microsoft.AspNet.Identity.IdentityResult AddUserRoles(string userId, string[] roles);
        bool Authorize(string userName, string resourceName, IPS.AuthData.Models.Operations operation);
        Microsoft.AspNet.Identity.IdentityResult ChangePassword(string userId, int? organiztionId, string oldPassword, string newPassword, bool updatingOwnPassword);
        Microsoft.AspNet.Identity.IdentityResult CleanUserRoles(string userId);
        Microsoft.AspNet.Identity.IdentityResult Create(IPS.BusinessModels.Entities.IpsUser user);
        Microsoft.AspNet.Identity.IdentityResult CreateUser(ApplicationUser user);
        Microsoft.AspNet.Identity.IdentityResult CreateUser(ApplicationUser user, string password);
        Microsoft.AspNet.Identity.IdentityResult DeleteUser(string userId);
        IPS.BusinessModels.Entities.IpsUser Find(string loginProvider, string providerKey);
        IPS.AuthData.Models.Client FindClient(string clientId);
        IPS.AuthData.Models.RefreshToken FindRefreshToken(string refreshTokenId);
        IPS.AuthData.Models.ApplicationUser FindUser(string userName, string password);
        System.Collections.Generic.List<IPS.AuthData.Models.RefreshToken> GetAllRefreshTokens();
        IPS.BusinessModels.Entities.IpsUser GetUserById(string userId);
        List<IPS.BusinessModels.Entities.IpsUserRole> GetCurrentUserRoles();
        List<BusinessModels.ResourceModels.IpsPermissionModel> GetCurrentUserPermissions();

        System.Collections.Generic.List<string> GetUserRoles(string userId);
        System.Collections.Generic.List<IPS.BusinessModels.Entities.IpsUser> GetUsers();
        bool IsContextInitialized { get; }
        bool IsUserExists(string id);
        bool RemoveRefreshToken(IPS.AuthData.Models.RefreshToken refreshToken);
        bool RemoveRefreshToken(string refreshTokenId);
        Microsoft.AspNet.Identity.IdentityResult ResetPassword(string userId, string token, string newPassword);
        Microsoft.AspNet.Identity.IdentityResult UpdateUser(IPS.BusinessModels.Entities.IpsUser updatedUser);
        List<IpsUserRole> GetUserRoles();
        List<IpsUserPermission> GetUserPermissions(IpsUser user);
        List<int> GetUserOrganizations();
        List<int> GetUserOrganizationsWithReadPermission(string resource, bool actionOnOwnResources);
        Microsoft.AspNet.Identity.IdentityResult ForgotPassword(string username);
        IpsUser getCurrentUser();
        int GetCurrentUserId();
        int GetCurrentUserOrgId();
        bool IsPermissionGranted(int organizationId, string resource, Operations action, bool actionOnOwnResources);
        string TryGetUserPassword(string userId, int? organizationId, bool superAdOnly, bool getOwnPassword);

        bool IsSuperAdmin();
        bool IsProjectAuthorize(int projectId, Operations operation,int userOrganizationId);
        bool IsProfileAuthorize(int profileId, Operations operation, int userOrganizationId);
        bool IsOrganizationAuthorize(int organizationid, Operations operation, int userOrganizationId);
    }
}

using IPS.AuthData.Managers;
using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.Data;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using IPS.Fx.Security.Crytography;
using IPS.BusinessModels.ResourceModels;
using IPS.BusinessModels.Enum;

namespace IPS.Business
{
    public class AuthService : IAuthService
    {
        private ApplicationDbContext _context;
        private ApplicationUserManager _userManager;
        private ApplicationRoleManager _roleManager;
        private IPSData _ipsDataContext;

        public bool IsContextInitialized
        {
            get
            {
                return _context != null;
            }
        }

        public AuthService()
        {
            if (!IsContextInitialized)
            {
                _context = ApplicationDbContext.Create("IdentityConnection");
            }

            _userManager = ApplicationUserManager.Create(_context);
            _roleManager = ApplicationRoleManager.Create(_context);
            //_ipsDataContext = new IPSData();
            _ipsDataContext = DataContextFactory.GetIPSContext();

            AutoMapper.Mapper.CreateMap<ApplicationUser, IpsUser>();
            AutoMapper.Mapper.CreateMap<IpsUser, ApplicationUser>();
            AutoMapper.Mapper.CreateMap<ApplicationRole, IdentityRole>();
            AutoMapper.Mapper.CreateMap<IpsRole, ApplicationRole>();
            AutoMapper.Mapper.CreateMap<ApplicationRole, IpsRole>();
            AutoMapper.Mapper.CreateMap<ApplicationUser, IpsUserRole>();
            AutoMapper.Mapper.CreateMap<ApplicationUserRole, IpsUserRole>();
            AutoMapper.Mapper.CreateMap<IpsUserRole, ApplicationUserRole>();
            AutoMapper.Mapper.CreateMap<IpsRolePermission, IpsUserRolePermission>();
        }

        #region Token
        public bool AddRefreshToken(RefreshToken token)
        {
            _context.RefreshTokens.Add(token);
            return _context.SaveChanges() > 0;
        }
        public RefreshToken FindRefreshToken(string refreshTokenId)
        {
            RefreshToken refreshTokenDto = _context.RefreshTokens.Find(refreshTokenId);
            return refreshTokenDto;
        }
        public List<RefreshToken> GetAllRefreshTokens()
        {
            List<RefreshToken> tokens = _context.RefreshTokens.ToList();
            return tokens;
        }
        public bool RemoveRefreshToken(RefreshToken refreshToken)
        {
            _context.RefreshTokens.Remove(refreshToken);
            return _context.SaveChanges() > 0;
        }
        public bool RemoveRefreshToken(string refreshTokenId)
        {
            bool result = false;
            RefreshToken refreshToken = _context.RefreshTokens.Find(refreshTokenId);
            if (refreshToken != null)
            {
                _context.RefreshTokens.Remove(refreshToken);
                result = _context.SaveChanges() > 0;
            }
            return result;
        }

        #endregion

        #region Client
        public Client FindClient(string clientId)
        {
            Client client = _context.Clients.Find(clientId);
            return client;
        }
        #endregion

        #region User
        public IdentityResult AddLogin(string userId, string loginProvider, string providerKey)
        {
            UserLoginInfo userLoginInfo = new UserLoginInfo(loginProvider, providerKey);
            IdentityResult identityResult = _userManager.AddLogin(userId, userLoginInfo);
            return identityResult;
        }
        public IdentityResult ChangePassword(string userId, int? organizationId, string oldPassword, string newPassword, bool updatingOwnPassword)
        {
            var result = new IdentityResult(new[] { "This user can't change passwords" });

            if (CanChangePassword(organizationId, false, updatingOwnPassword))
            {
                ApplicationUser au = _userManager.Users.FirstOrDefault(u => u.Id == userId);

                if (au.DecryptedPassword == newPassword)
                {
                    result = new IdentityResult(new[] { "Password has no change. Don't need to update it!" });
                }
                else
                {
                    var task = _userManager.ChangePasswordAsync(userId, newPassword);
                    task.Wait();

                    IdentityResult identityResult = task.Result;

                    if (identityResult.Succeeded)
                    {
                        RSAAsymmetricProvider rsaAsymmetricProvider = new RSAAsymmetricProvider();

                        au.Password = rsaAsymmetricProvider.Encrypt(newPassword);
                        _userManager.Update(au);
                    }

                    result = identityResult;
                }
            }

            return result;
        }

        public IdentityResult ForgotPassword(string username)
        {
            ApplicationUser au = _userManager.FindByName(username);

            if (au != null)
            {
                User user = _ipsDataContext.Users.Where(u => u.UserKey == au.Id).FirstOrDefault();
                NotificationService notificationService = new NotificationService();
                NotificationTemplate notificationTemplate = _ipsDataContext.NotificationTemplates.Where(nt => nt.Name == "Forgot Password").FirstOrDefault();
                notificationService.SendEmailNotification(user, null, notificationTemplate, null);


                //TODO: send password to email
            }

            return IdentityResult.Success; // identityResult;
        }
        public IdentityResult ResetPassword(string userId, string token, string newPassword)
        {
            IdentityResult identityResult = _userManager.ResetPassword(userId, token, newPassword);
            return identityResult;
        }
        public IdentityResult Create(IpsUser user)
        {
            ApplicationUser applicationUser = AutoMapper.Mapper.Map<IpsUser, ApplicationUser>(user);
            IdentityResult identityResult = _userManager.Create(applicationUser);

            if (user.User != null)
            {
                user.User.UserKey = user.Id;
                //_ipsDataContext.Users.Add(user.User);
                //_ipsDataContext.SaveChanges();
            }

            return identityResult;
        }
        public IpsUser Find(string loginProvider, string providerKey)
        {
            ApplicationUser applicationUser = _userManager.Find(loginProvider, providerKey);

            IpsUser user = AutoMapper.Mapper.Map<ApplicationUser, IpsUser>(applicationUser);
            return user;
        }
        public ApplicationUser FindUser(string userName, string password)
        {
            /*if (userName.Contains("@"))
            {
                userName = _userManager.FindByEmail(userName).UserName;
            }*/

            ApplicationUser user = _userManager.Find(userName, password);

            return user;
        }

        public int GetCurrentUserOrgId()
        {
            int id = -1;
            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
            var ipsUser = GetUserById(user.Id);
            if (ipsUser.User.OrganizationId.HasValue)
            {
                id = ipsUser.User.OrganizationId.Value;
            }
            return id;
        }

        public List<string> GetUserRoles(string userId)
        {
            return (List<string>)_userManager.GetRoles(userId);
        }

        public string GetUserPlainPassword(string userId)
        {
            ApplicationUser applicationUser = _userManager.FindById(userId);
            RSAAsymmetricProvider rsaAsymmetricProvider = new RSAAsymmetricProvider();
            return applicationUser == null ? String.Empty : applicationUser.DecryptedPassword;
        }

        public string TryGetUserPassword(string userId, int? organizationId, bool superAdminOnly, bool getOwnPassword)
        {
            return CanChangePassword(organizationId, superAdminOnly, getOwnPassword) ? GetUserPlainPassword(userId) : string.Empty;
        }

        public List<IpsUser> GetUsers()
        {
            List<ApplicationUser> applicationUsers = _userManager.Users.AsNoTracking().ToList();
            List<IpsUser> users = AutoMapper.Mapper.Map<List<ApplicationUser>, List<IpsUser>>(applicationUsers);

            return users;
        }


        public List<IpsUserRole> GetUserRoles()
        {
            Dictionary<int, string> organizations = _ipsDataContext.Organizations.AsNoTracking().ToDictionary(o => o.Id, o => o.Name);
            Dictionary<string, string> roles = _context.Roles.AsNoTracking().ToDictionary(o => o.Id, o => o.Name);

            List<ApplicationUser> users = _userManager.Users.AsNoTracking().ToList();
            //List<IpsUser> users = AutoMapper.Mapper.Map<List<ApplicationUser>, List<IpsUser>>(applicationUsers);

            List<IpsUserRole> result = new List<IpsUserRole>();

            foreach (ApplicationUser user in users)
            {
                foreach (ApplicationUserRole role in user.Roles)
                {
                    IpsUserRole userRole = AutoMapper.Mapper.Map<ApplicationUser, IpsUserRole>(user);

                    userRole.RoleId = role.RoleId;
                    //userRole.RoleName = role.;
                    userRole.OrganizationId = role.OrganizationId;
                    //userRole.OrganizationName = role.OrganizationId == 0 ? "All" : organizations[role.OrganizationId];
                    result.Add(userRole);
                }
            }

            return result;
        }

        public List<IpsUserPermission> GetUserPermissions(IpsUser user)
        {
            RolePermitionsService permissionService = new RolePermitionsService();
            List<IpsUserPermission> userPermissions = new List<IpsUserPermission>();

            //List<IpsUserRolePermission> mergedRolePermission = new List<IpsUserRolePermission>();
            List<IpsUserRolePermission> mergedZeroRolePermissionOwnResources = new List<IpsUserRolePermission>();
            List<IpsUserRolePermission> mergedZeroRolePermissionAllResources = new List<IpsUserRolePermission>();
            List<int> organizationIds = new List<int>();

            List<IpsUserRole> roles = user.Roles;

            foreach (IpsUserRole userRole in roles)
            {
                if (!organizationIds.Contains(userRole.OrganizationId))     //Get different organization
                {
                    organizationIds.Add(userRole.OrganizationId);
                }
            }

            int zeroOrganizationIndex = organizationIds.IndexOf(0);
            if (zeroOrganizationIndex >= 0)
            {
                List<IpsUserRole> userRoles = new List<IpsUserRole>();

                userRoles = roles.Where(r => r.OrganizationId == 0).ToList();
                foreach (IpsUserRole userRole in userRoles)
                {
                    List<IpsUserRolePermission> rolePermissionsZero = AutoMapper.Mapper.Map<List<IpsRolePermission>, List<IpsUserRolePermission>>(permissionService.GetByRoleId(userRole.RoleId).ToList()); ;

                    List<IpsUserRolePermission> rolePermissionsZeroOwnResources = rolePermissionsZero.Where(rp => rp.IsApplicableToOwnResources == true).ToList();
                    for (int i = 0; i < rolePermissionsZeroOwnResources.Count; i++)
                    {
                        mergedZeroRolePermissionOwnResources.Add(new IpsUserRolePermission());
                        mergedZeroRolePermissionOwnResources[i].ResourseName = rolePermissionsZeroOwnResources[i].ResourseName;
                        mergedZeroRolePermissionOwnResources[i].IsApplicableToOwnResources = rolePermissionsZeroOwnResources[i].IsApplicableToOwnResources;

                        mergedZeroRolePermissionOwnResources[i].IsCreate |= rolePermissionsZeroOwnResources[i].IsCreate;
                        mergedZeroRolePermissionOwnResources[i].IsRead |= rolePermissionsZeroOwnResources[i].IsRead;
                        mergedZeroRolePermissionOwnResources[i].IsUpdate |= rolePermissionsZeroOwnResources[i].IsUpdate;
                        mergedZeroRolePermissionOwnResources[i].IsDelete |= rolePermissionsZeroOwnResources[i].IsDelete;
                    }

                    List<IpsUserRolePermission> rolePermissionsZeroAllResources = rolePermissionsZero.Where(rp => rp.IsApplicableToOwnResources == false).ToList();
                    for (int i = 0; i < rolePermissionsZeroAllResources.Count; i++)
                    {
                        mergedZeroRolePermissionAllResources.Add(new IpsUserRolePermission());
                        mergedZeroRolePermissionAllResources[i].ResourseName = rolePermissionsZeroAllResources[i].ResourseName;
                        mergedZeroRolePermissionAllResources[i].IsApplicableToOwnResources = rolePermissionsZeroAllResources[i].IsApplicableToOwnResources;

                        mergedZeroRolePermissionAllResources[i].IsCreate |= rolePermissionsZeroAllResources[i].IsCreate;
                        mergedZeroRolePermissionAllResources[i].IsRead |= rolePermissionsZeroAllResources[i].IsRead;
                        mergedZeroRolePermissionAllResources[i].IsUpdate |= rolePermissionsZeroAllResources[i].IsUpdate;
                        mergedZeroRolePermissionAllResources[i].IsDelete |= rolePermissionsZeroAllResources[i].IsDelete;
                    }
                }
            }

            foreach (int organizationId in organizationIds)
            {
                IpsUserPermission userPermission = new IpsUserPermission();
                //List<IpsUserRolePermission> rolePermissions = new List<IpsUserRolePermission>();
                List<IpsUserRole> userRoles = new List<IpsUserRole>();

                userPermission.OrganizationId = organizationId;
                //get roles by organization
                userRoles = roles.Where(r => r.OrganizationId == organizationId).ToList();
                List<IpsUserRolePermission> mergedRolePermissionOwnResources = new List<IpsUserRolePermission>();
                List<IpsUserRolePermission> mergedRolePermissionAllResources = new List<IpsUserRolePermission>();
                foreach (IpsUserRole userRole in userRoles)
                {
                    List<IpsUserRolePermission> rolePermissions = AutoMapper.Mapper.Map<List<IpsRolePermission>, List<IpsUserRolePermission>>(permissionService.GetByRoleId(userRole.RoleId).ToList());
                    List<IpsUserRolePermission> rolePermissionsOwnResources = rolePermissions.Where(rp => rp.IsApplicableToOwnResources == true).ToList();

                    for (int i = 0; i < rolePermissionsOwnResources.Count; i++)
                    {
                        if (mergedRolePermissionOwnResources.Count - 1 < i)
                        {
                            mergedRolePermissionOwnResources.Add(new IpsUserRolePermission());
                        }
                        mergedRolePermissionOwnResources[i].ResourseName = rolePermissionsOwnResources[i].ResourseName;
                        mergedRolePermissionOwnResources[i].IsApplicableToOwnResources = rolePermissionsOwnResources[i].IsApplicableToOwnResources;

                        mergedRolePermissionOwnResources[i].IsCreate |= rolePermissionsOwnResources[i].IsCreate;
                        mergedRolePermissionOwnResources[i].IsRead |= rolePermissionsOwnResources[i].IsRead;
                        mergedRolePermissionOwnResources[i].IsUpdate |= rolePermissionsOwnResources[i].IsUpdate;
                        mergedRolePermissionOwnResources[i].IsDelete |= rolePermissionsOwnResources[i].IsDelete;

                        //merge with zero organizxation if exist
                        if (zeroOrganizationIndex >= 0)
                        {
                            mergedRolePermissionOwnResources[i].IsCreate |= mergedZeroRolePermissionOwnResources[i].IsCreate;
                            mergedRolePermissionOwnResources[i].IsRead |= mergedZeroRolePermissionOwnResources[i].IsRead;
                            mergedRolePermissionOwnResources[i].IsUpdate |= mergedZeroRolePermissionOwnResources[i].IsUpdate;
                            mergedRolePermissionOwnResources[i].IsDelete |= mergedZeroRolePermissionOwnResources[i].IsDelete;
                        }
                    }

                    List<IpsUserRolePermission> rolePermissionsAllResources = rolePermissions.Where(rp => rp.IsApplicableToOwnResources == false).ToList();
                    for (int i = 0; i < rolePermissionsAllResources.Count; i++)
                    {
                        if (mergedRolePermissionAllResources.Count - 1 < i)
                        {
                            mergedRolePermissionAllResources.Add(new IpsUserRolePermission());
                        }

                        mergedRolePermissionAllResources[i].ResourseName = rolePermissionsAllResources[i].ResourseName;
                        mergedRolePermissionAllResources[i].IsApplicableToOwnResources = rolePermissionsAllResources[i].IsApplicableToOwnResources;

                        mergedRolePermissionAllResources[i].IsCreate |= rolePermissionsAllResources[i].IsCreate;
                        mergedRolePermissionAllResources[i].IsRead |= rolePermissionsAllResources[i].IsRead;
                        mergedRolePermissionAllResources[i].IsUpdate |= rolePermissionsAllResources[i].IsUpdate;
                        mergedRolePermissionAllResources[i].IsDelete |= rolePermissionsAllResources[i].IsDelete;

                        //merge with zero organizxation if exist
                        if (zeroOrganizationIndex >= 0)
                        {
                            mergedRolePermissionAllResources[i].IsCreate |= mergedZeroRolePermissionAllResources[i].IsCreate;
                            mergedRolePermissionAllResources[i].IsRead |= mergedZeroRolePermissionAllResources[i].IsRead;
                            mergedRolePermissionAllResources[i].IsUpdate |= mergedZeroRolePermissionAllResources[i].IsUpdate;
                            mergedRolePermissionAllResources[i].IsDelete |= mergedZeroRolePermissionAllResources[i].IsDelete;
                        }
                    }
                }

                userPermission.RolePermissionsOwnResources = mergedRolePermissionOwnResources;
                userPermission.RolePermissionsAllResources = mergedRolePermissionAllResources;

                userPermissions.Add(userPermission);
            }

            return userPermissions;
        }

        public bool IsPermissionGranted(int organizationId, string resource, Operations action, bool actionOnOwnResources)
        {
            return IsPermissionGranted(getCurrentUser(), organizationId, resource, action, actionOnOwnResources);
        }

        public bool IsPermissionGranted(IpsUser user, int organizationId, string resource, Operations action, bool actionOnOwnResources)
        {
            RolePermitionsService permissionService = new RolePermitionsService();
            List<IpsUserRole> userRoles = new List<IpsUserRole>();
            userRoles = user.Roles.Where(r => r.OrganizationId == 0 || r.OrganizationId == organizationId).ToList();
            foreach (IpsUserRole userRole in userRoles)
            {
                List<IpsUserRolePermission> rolePermissions = AutoMapper.Mapper.Map<List<IpsRolePermission>, List<IpsUserRolePermission>>(permissionService.GetByRoleId(userRole.RoleId).ToList());
                if (DoesRoleGrantPermission(rolePermissions, resource, action, actionOnOwnResources))
                    return true;
            }
            return false;
        }

        public bool DoesRoleGrantPermission(List<IpsUserRolePermission> permissions, string resource, Operations action, bool actionOnOwnResources)
        {
            foreach (var p in permissions)
            {
                if (p.IsApplicableToOwnResources == actionOnOwnResources)
                {
                    if (p.ResourseName.Equals(resource, StringComparison.OrdinalIgnoreCase))
                    {
                        switch (action)
                        {
                            case Operations.Create: if (p.IsCreate) { return true; }; break;
                            case Operations.Delete: if (p.IsDelete) { return true; }; break;
                            case Operations.Read: if (p.IsRead) { return true; }; break;
                            case Operations.Update: if (p.IsUpdate) { return true; }; break;
                        }
                    }
                }
            }
            return false;
        }

        public bool IsUserExists(string id)
        {
            bool result = false;
            ApplicationUser applicationUser = _userManager.FindById(id);

            if (applicationUser != null)
            {
                result = true;
            }
            return result;
        }
        public IdentityResult CreateUser(ApplicationUser user, string password)
        {
            IdentityResult identityResult = _userManager.Create(user, password);
            return identityResult;
        }
        public IdentityResult CreateUser(ApplicationUser user)
        {
            IdentityResult identityResult = _userManager.Create(user);
            return identityResult;
        }
        public IpsUser GetUserById(string userId)
        {
            ApplicationUser applicationUser = _userManager.FindById(userId);
            IpsUser user = AutoMapper.Mapper.Map<ApplicationUser, IpsUser>(applicationUser);
            user.User = _ipsDataContext.Users.Where(u => u.UserKey == userId).Include("Departments1").AsNoTracking().FirstOrDefault();

            var orgId = user.User.OrganizationId;
            var org = _ipsDataContext.Organizations.Where(o => o.Id == orgId).FirstOrDefault();
            if (org != null)
                user.OrganizationName = org.Name;

            return user;
        }


        public List<IpsUser> GetUsersByRoleId(string roleId)
        {
            List<IpsUser> result = new List<IpsUser>();
            List<ApplicationUser> applicationUsers = _userManager.Users.ToList(); ;
            List<IpsUser> users = AutoMapper.Mapper.Map<List<ApplicationUser>, List<IpsUser>>(applicationUsers);
            foreach (IpsUser user in users)
            {
                if (user.Roles.Any(x => x.RoleId == roleId))
                {
                    result.Add(user);
                }
            }
            return result;
        }

        public List<IpsUserRole> GetCurrentUserRoles()
        {
            List<IpsUserRole> result = new List<IpsUserRole>();
            string[] roleIds;
            IpsUser currentUser = getCurrentUser();
            if (currentUser != null)
            {
                roleIds = getCurrentUser().Roles.Select(x => x.RoleId).ToArray();
                result = _roleManager.Roles.Where(x => roleIds.Contains(x.Id)).Select(x => new IpsUserRole()
                {
                    OrganizationId = x.OrganizationId,
                    RoleId = x.Id,
                    RoleLevelId = x.RoleLevel,
                }).ToList();
            }

            return result;
        }
        public List<IpsUserRole> GetUserRolesByUserId(int useId)
        {
            List<IpsUserRole> result = new List<IpsUserRole>();
            string[] roleIds;
            string userKey = _ipsDataContext.Users.Where(x => x.Id == useId).Select(x => x.UserKey).FirstOrDefault();
            if (!string.IsNullOrEmpty(userKey))
            {
                IpsUser currentUser = GetUserById(userKey);
                if (currentUser != null)
                {
                    roleIds = GetUserById(userKey).Roles.Select(x => x.RoleId).ToArray();
                    result = _roleManager.Roles.Where(x => roleIds.Contains(x.Id)).Select(x => new IpsUserRole()
                    {
                        OrganizationId = x.OrganizationId,
                        RoleId = x.Id,
                        RoleLevelId = x.RoleLevel,
                    }).ToList();
                }
            }


            return result;
        }

        public List<IpsPermissionModel> GetCurrentUserPermissions()
        {
            RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
            List<IpsPermissionModel> permissions = new List<IpsPermissionModel>();
            List<IpsUserRole> roles = GetCurrentUserRoles();
            foreach (IpsUserRole role in roles)
            {
                if (role.RoleLevelId > 0)
                {
                    IpsPermissionModel IpsPermissionModel = new IpsPermissionModel();
                    IpsPermissionModel.RoleLevelId = role.RoleLevelId;
                    IpsPermissionModel.RoleId = role.RoleId;
                    IpsPermissionModel.OrganizationId = role.OrganizationId;
                    IpsRoleLevelAdvancePermission advancePemrission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(role.RoleLevelId);
                    if (advancePemrission != null)
                    {
                        IpsPermissionModel.PermissionLevelId = advancePemrission.PermissionLevelId;
                    }
                    IpsPermissionModel.IpsRoleLevelResourcesPermissionModels = roleLevelPermissionService.GetPermissionsByLevelId(role.RoleLevelId);
                    permissions.Add(IpsPermissionModel);
                }
            }
            return permissions;
        }

        public List<IpsPermissionModel> GetUserPermissionsByUserId(int userId)
        {
            RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
            List<IpsPermissionModel> permissions = new List<IpsPermissionModel>();
            List<IpsUserRole> roles = GetUserRolesByUserId(userId);
            foreach (IpsUserRole role in roles)
            {
                if (role.RoleLevelId > 0)
                {
                    IpsPermissionModel IpsPermissionModel = new IpsPermissionModel();
                    IpsPermissionModel.RoleLevelId = role.RoleLevelId;
                    IpsPermissionModel.RoleId = role.RoleId;
                    IpsPermissionModel.OrganizationId = role.OrganizationId;
                    IpsRoleLevelAdvancePermission advancePemrission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(role.RoleLevelId);
                    if (advancePemrission != null)
                    {
                        IpsPermissionModel.PermissionLevelId = advancePemrission.PermissionLevelId;
                    }
                    IpsPermissionModel.IpsRoleLevelResourcesPermissionModels = roleLevelPermissionService.GetPermissionsByLevelId(role.RoleLevelId);
                    permissions.Add(IpsPermissionModel);
                }
            }
            return permissions;
        }


        public IpsRoleLevelAdvancePermission GetCurrentUserRoleLevelAdvancePermission()
        {
            IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = new IpsRoleLevelAdvancePermission();
            RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
            List<IpsUserRole> roles = GetCurrentUserRoles();
            foreach (IpsUserRole role in roles)
            {
                if (role.RoleLevelId > 0)
                {
                    ipsRoleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(role.RoleLevelId);
                    if (ipsRoleLevelAdvancePermission == null)
                    {
                        ipsRoleLevelAdvancePermission = new IpsRoleLevelAdvancePermission()
                        {
                            Id = 0,
                            PermissionLevelId = (int)PermissionLevelEnum.OwnData,
                            RoleLevelId = role.RoleLevelId,
                        };
                    }
                }
            }
            return ipsRoleLevelAdvancePermission;
        }


        public IpsRoleLevelAdvancePermission GetUserRoleLevelAdvancePermissionByUserId(int userId)
        {
            IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = new IpsRoleLevelAdvancePermission();
            RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
            List<IpsUserRole> roles = GetUserRolesByUserId(userId);
            foreach (IpsUserRole role in roles)
            {
                if (role.RoleLevelId > 0)
                {
                    ipsRoleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(role.RoleLevelId);
                }
            }
            return ipsRoleLevelAdvancePermission;
        }

        //public List<IpsPermissionModel> GetCurrentUserPermissionsByResource(int resourceId)
        //{
        //    RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
        //    List<IpsPermissionModel> permissions = new List<IpsPermissionModel>();
        //    List<IpsUserRole> roles = GetCurrentUserRoles();
        //    foreach (IpsUserRole role in roles)
        //    {
        //        if (role.RoleLevelId > 0)
        //        {
        //            IpsPermissionModel IpsPermissionModel = new IpsPermissionModel();
        //            IpsPermissionModel.RoleLevelId = role.RoleLevelId;
        //            IpsPermissionModel.RoleId = role.RoleId;
        //            IpsPermissionModel.OrganizationId = role.OrganizationId;
        //            IpsRoleLevelAdvancePermission advancePemrission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(role.RoleLevelId);
        //            if (advancePemrission != null)
        //            {
        //                IpsPermissionModel.PermissionLevelId = advancePemrission.PermissionLevelId;
        //            }
        //            IpsPermissionModel.IpsRoleLevelResourcesPermissionModels = roleLevelPermissionService.GetRoleLevelPermissionsByResourceId(role.RoleLevelId, resourceId);
        //            permissions.Add(IpsPermissionModel);
        //        }
        //    }
        //    return permissions;
        //}


        public IdentityResult UpdateUser(IpsUser updatedUser)
        {
            ApplicationUser user = _userManager.FindById(updatedUser.Id);
            if (user == null)
            {
                return new IdentityResult("User not found");
            }

            try
            {
                user.Email = updatedUser.Email;
                user.FirstName = updatedUser.FirstName;
                user.LastName = updatedUser.LastName;
                user.ImageUrl = updatedUser.ImageUrl;

                _userManager.Update(user);

                updatedUser.User.FirstName = updatedUser.FirstName;
                updatedUser.User.LastName = updatedUser.LastName;
                updatedUser.User.ImagePath = updatedUser.ImageUrl;

                _ipsDataContext.Users.Attach(updatedUser.User);
                _ipsDataContext.Entry(updatedUser.User).State = EntityState.Modified;
                _ipsDataContext.SaveChanges();
            }
            catch (DbEntityValidationException e)
            {
                //var newException = new FormattedDbEntityValidationException(e);
                //throw newException;
                return new IdentityResult(e.Message);
            }

            return IdentityResult.Success;
        }
        public IdentityResult DeleteUser(string userId)
        {
            ApplicationUser user = _userManager.FindById(userId);
            return _userManager.Delete(user);
        }
        #endregion

        #region Roles
        public IdentityResult CleanUserRoles(string userId)
        {
            string[] roles = _userManager.GetRoles(userId).ToArray();
            return _userManager.RemoveFromRoles(userId, roles);
        }
        public IdentityResult AddUserRoles(string userId, string[] roles)
        {
            string[] allRoles = _userManager.GetRoles(userId).ToArray();
            _userManager.RemoveFromRoles(userId, allRoles);
            return _userManager.AddToRoles(userId, roles);
        }

        public bool IsSuperAdmin()
        {
            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
            if (user != null)
            {
                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = GetCurrentUserRoleLevelAdvancePermission();
                if (ipsRoleLevelAdvancePermission != null)
                {
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                    {
                        return true;
                    }
                    else
                    {
                        List<string> superAdminRoleIds = _context.Roles.Where(r => r.OrganizationId == 0 && r.Name == "Super Admin").Select(r => r.Id).ToList();
                        return user.Roles.Any(ur => ur.OrganizationId == 0 && superAdminRoleIds.Contains(ur.RoleId));
                    }
                }
                else
                {
                    return false;
                }

            }
            return false;
        }

        #endregion

        #region Authorize
        public bool Authorize(string userName, string resourceName, Operations operation)
        {
            bool authorized = false;
            ApplicationUser user = _userManager.FindByName(userName);
            int resourceId = _context.Resources.Where(r => r.Name == resourceName).FirstOrDefault().Id;
            foreach (IdentityUserRole role in user.Roles)
            {
                RolePermitionsService rolePermitionsService = new RolePermitionsService();
                int count = _context.RolePermissions.Where(r => (r.RoleId == role.RoleId) && (r.ResourceId == resourceId) && (r.Operations == operation)).Count();
                if (count > 0)
                {
                    authorized = true;
                    break;
                }
                else
                {
                    int roleLevelId = _context.Roles.Where(r => r.Id == role.RoleId).Select(r => r.RoleLevel).FirstOrDefault();
                    if (roleLevelId > 0)
                    {
                        RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
                        List<IpsRoleLevelResourcesPermissionModel> IpsRoleLevelResourcesPermissionModels = roleLevelPermissionService.GetPermissionsByLevelId(roleLevelId);
                        count = IpsRoleLevelResourcesPermissionModels.Where(x => x.ResourceId == resourceId && x.OperationId == (int)operation).Count();
                        if (count > 0)
                        {
                            authorized = true;
                            break;
                        }
                    }
                }
            }
            return authorized;
        }

        public bool IsProjectAuthorize(int projectId, Operations operation, int userOrganizationId)
        {
            bool authorized = false;
            int currentUserId = GetCurrentUserId();
            if (projectId > 0)
            {
                Link_ProjectUsers projectUser = _ipsDataContext.Link_ProjectUsers.Where(x => x.ProjectId == projectId && x.UserId == currentUserId).FirstOrDefault();
                if (projectUser != null)
                {
                    if (projectUser.RoleId == (int)ProjectRoleEnum.Participant)
                    {
                        if (operation.HasFlag(Operations.Read))
                        {
                            authorized = true;
                        }
                    }
                    else if (projectUser.RoleId == (int)ProjectRoleEnum.Trainer)
                    {
                        if (operation.HasFlag(Operations.Read))
                        {
                            authorized = true;
                        }
                    }
                    else if (projectUser.RoleId == (int)ProjectRoleEnum.Evaluator)
                    {
                        if (operation.HasFlag(Operations.Read))
                        {
                            authorized = true;
                        }
                    }
                    else if (projectUser.RoleId == (int)ProjectRoleEnum.FinalScoreManager)
                    {
                        if (operation.HasFlag(Operations.Read) || operation.HasFlag(Operations.Update))
                        {
                            authorized = true;
                        }
                    }
                    else if (projectUser.RoleId == (int)ProjectRoleEnum.Manager)
                    {
                        if (operation.HasFlag(Operations.Read) || operation.HasFlag(Operations.Update) || operation.HasFlag(Operations.Delete))
                        {
                            authorized = true;
                        }
                    }
                    else if (projectUser.RoleId == (int)ProjectRoleEnum.ProjectManager)
                    {
                        if (operation.HasFlag(Operations.Create) || operation.HasFlag(Operations.Read) || operation.HasFlag(Operations.Update) || operation.HasFlag(Operations.Delete))
                        {
                            authorized = true;
                        }
                    }
                }
                if (!authorized)
                {
                    Project project = _ipsDataContext.Projects.Where(x => x.Id == projectId).FirstOrDefault();
                    var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                    ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
                    int RoleLevelId = _context.Roles.Where(r => r.OrganizationId == userOrganizationId).Select(r => r.RoleLevel).FirstOrDefault();
                    if (RoleLevelId > 0)
                    {
                        RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
                        RoleLevelService roleLevelService = new RoleLevelService();
                        roleLevelService.getRoleLevelsByOrganizationId(userOrganizationId);
                        IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(RoleLevelId);
                        if (ipsRoleLevelAdvancePermission != null)
                        {
                            if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                            {
                                authorized = true;
                            }
                            else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                            {
                                if (userOrganizationId == project.OrganizationId)
                                {
                                    authorized = true;
                                }
                            }
                            else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                            {
                                if (project.CreatedBy == currentUserId)
                                {
                                    authorized = true;
                                }
                            }
                            else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                            {
                                if (operation.HasFlag(Operations.Read))
                                {
                                    List<UserRoleLevels> childUserRoleLevels = roleLevelService.GetRoleLevelChildsRecursive(RoleLevelId);
                                    List<IpsUserRole> currentUserRoles = GetCurrentUserRoles();
                                    currentUserRoles = currentUserRoles.Where(x => x.OrganizationId > 0).ToList();
                                    if (project.CreatedBy.HasValue)
                                    {
                                        foreach (UserRoleLevels userRoleLevel in childUserRoleLevels)
                                        {
                                            List<string> roleLevelRoles = _roleManager.Roles.Where(x => x.RoleLevel == userRoleLevel.Id).Select(x => x.Id).ToList();

                                            string UserKey = _ipsDataContext.Users.Where(x => x.Id == project.CreatedBy.Value).Select(x => x.UserKey).FirstOrDefault();

                                            ApplicationUser profileUser = _userManager.Users.Where(x => x.Id == UserKey).AsNoTracking().FirstOrDefault();

                                            if (profileUser.Roles.Any(x => roleLevelRoles.IndexOf(x.RoleId) > -1))
                                            {
                                                authorized = true;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else
            {
                authorized = true;
            }
            return authorized;

        }

        public bool IsProfileAuthorize(int profileId, Operations operation, int userOrganizationId)
        {
            bool authorized = false;
            int currentUserId = GetCurrentUserId();
            Profile profile = _ipsDataContext.Profiles.Include("StageGroups.EvaluationParticipants").Where(x => x.Id == profileId).FirstOrDefault();
            if (profile != null)
            {
                if (profile.IsTemplate)
                {
                    authorized = true;
                }
                if (!authorized)
                {
                    // check is added as particpant
                    foreach (StageGroup sg in profile.StageGroups)
                    {
                        if (sg.EvaluationParticipants.Any(x => x.UserId == currentUserId))
                        {
                            authorized = true;
                            break;
                        }
                    }
                    if (!authorized)
                    {
                        if (profile.ProjectId.HasValue)
                        {
                            Link_ProjectUsers projectUser = _ipsDataContext.Link_ProjectUsers.Where(x => x.ProjectId == profile.ProjectId.Value && x.UserId == currentUserId).FirstOrDefault();
                            if (projectUser != null)
                            {
                                if (projectUser.RoleId == (int)ProjectRoleEnum.Manager || projectUser.RoleId == (int)ProjectRoleEnum.ProjectManager)
                                {
                                    if (operation.HasFlag(Operations.Create) || operation.HasFlag(Operations.Read) || operation.HasFlag(Operations.Update) || operation.HasFlag(Operations.Delete))
                                    {
                                        authorized = true;
                                    }
                                }

                            }
                        }

                        if (!authorized)
                        {
                            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                            ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
                            int RoleLevelId = _context.Roles.Where(r => r.OrganizationId == userOrganizationId).Select(r => r.RoleLevel).FirstOrDefault();
                            if (RoleLevelId > 0)
                            {
                                RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
                                RoleLevelService roleLevelService = new RoleLevelService();
                                roleLevelService.getRoleLevelsByOrganizationId(userOrganizationId);
                                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(RoleLevelId);
                                if (ipsRoleLevelAdvancePermission != null)
                                {
                                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                                    {
                                        authorized = true;
                                    }
                                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                                    {
                                        if (userOrganizationId == profile.OrganizationId)
                                        {
                                            authorized = true;
                                        }
                                    }
                                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                                    {
                                        if (profile.CreatedBy == currentUserId)
                                        {
                                            authorized = true;
                                        }
                                    }
                                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                                    {
                                        List<UserRoleLevels> childUserRoleLevels = roleLevelService.GetRoleLevelChildsRecursive(RoleLevelId);
                                        List<IpsUserRole> currentUserRoles = GetCurrentUserRoles();
                                        currentUserRoles = currentUserRoles.Where(x => x.OrganizationId > 0).ToList();
                                        if (profile.CreatedBy.HasValue)
                                        {
                                            foreach (UserRoleLevels userRoleLevel in childUserRoleLevels)
                                            {
                                                List<string> roleLevelRoles = _roleManager.Roles.Where(x => x.RoleLevel == userRoleLevel.Id).Select(x => x.Id).ToList();

                                                string UserKey = _ipsDataContext.Users.Where(x => x.Id == profile.CreatedBy.Value).Select(x => x.UserKey).FirstOrDefault();

                                                ApplicationUser profileUser = _userManager.Users.Where(x => x.Id == UserKey).AsNoTracking().FirstOrDefault();

                                                if (profileUser.Roles.Any(x => roleLevelRoles.IndexOf(x.RoleId) > -1))
                                                {
                                                    authorized = true;
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    }

                }
            }
            return authorized;

        }

        public bool IsOrganizationAuthorize(int organizationid, Operations operation, int userOrganizationId)
        {
            bool authorized = false;
            {
                var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
                ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
                int RoleLevelId = _context.Roles.Where(r => r.OrganizationId == userOrganizationId).Select(r => r.RoleLevel).FirstOrDefault();
                if (RoleLevelId > 0)
                {
                    RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
                    RoleLevelService roleLevelService = new RoleLevelService();
                    roleLevelService.getRoleLevelsByOrganizationId(userOrganizationId);
                    IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = roleLevelPermissionService.GetAdvancePermissionsByLevelId(RoleLevelId);
                    if (ipsRoleLevelAdvancePermission != null)
                    {
                        if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                        {
                            authorized = true;
                        }
                        else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                        {
                            if (userOrganizationId == organizationid)
                            {
                                authorized = true;
                            }
                        }
                        else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                        {
                            if (userOrganizationId == organizationid)
                            {
                                authorized = true;
                            }
                        }
                        else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                        {
                            if (userOrganizationId == organizationid)
                            {
                                authorized = true;
                            }
                        }

                    }
                }
            }

            return authorized;
        }

        public bool isAccess(int organizationId)
        {
            bool isAccess = false;
            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (!string.IsNullOrEmpty(prinicpal.Identity.Name))
            {
                ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
                List<ApplicationUserRole> applicationUserRoles = user.Roles.Where(r => r.OrganizationId == organizationId).ToList();
                if (applicationUserRoles.Count > 0)
                {
                    isAccess = true;
                }
            }
            return isAccess;
        }

        public IpsUser getCurrentUser()
        {
            IpsUser ipsUser = null;
            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (!string.IsNullOrEmpty(prinicpal.Identity.Name))
            {
                ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
                ipsUser = AutoMapper.Mapper.Map<ApplicationUser, IpsUser>(user);
            }
            return ipsUser;
        }


        public int GetCurrentUserId()
        {
            IpsUser user = getCurrentUser();
            if (user != null)
                user = GetUserById(user.Id);
            return (user != null && user.User != null) ? user.User.Id : -1;
        }



        public List<int> GetUserOrganizations()
        {
            List<int> ids = new List<int>();

            var prinicpal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            ApplicationUser user = _userManager.FindByName(prinicpal.Identity.Name);
            if (user != null)
            {
                List<ApplicationUserRole> applicationUserRoles = user.Roles.ToList();
                foreach (ApplicationUserRole applicationUserRole in applicationUserRoles)
                {
                    if (!ids.Contains(applicationUserRole.OrganizationId))
                    {
                        ids.Add(applicationUserRole.OrganizationId);
                    }
                }
            }

            return ids;
        }

        public List<int> GetUserOrganizationsWithReadPermission(string resource, bool actionOnOwnResources)
        {
            List<int> ids = GetUserOrganizations();
            List<int> idFilteredList = new List<int>();
            foreach (var oid in ids)
            {
                if (IsPermissionGranted(oid, resource, Operations.Read, actionOnOwnResources))
                {
                    idFilteredList.Add(oid);
                }
            }
            return idFilteredList;
        }

        //public bool HasRoleLevelPermission(List<IpsPermissionModel> permissions, ResourceEnum resource, OperationEnum action, out List<int> organizationIds, out bool canAccessAllOrganization)
        //{
        //    organizationIds = new List<int>();
        //    canAccessAllOrganization = false;
        //    foreach (var p in permissions)
        //    {
        //        foreach (var permission in p.IpsRoleLevelResourcesPermissionModels.Where(x => x.OperationId == (int)action))
        //        {
        //            organizationIds.Add(p.OrganizationId);
        //            if (p.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
        //            {
        //                canAccessAllOrganization = true;
        //            }
        //        }
        //    }
        //    if (organizationIds.Count() > 0)
        //    {
        //        return true;
        //    }
        //    else
        //    {
        //        return false;
        //    }
        //}

        #endregion

        public void Dispose()
        {
            _userManager.Dispose();
            _roleManager.Dispose();
            _ipsDataContext.Dispose();
            _context.Dispose();
        }

        public bool IsInOrganizationInRoleOf(string role, int? organizationId)
        {
            IpsUser currentUser = getCurrentUser();
            if (currentUser != null)
            {
                var userRoles = currentUser.Roles.Where(r => r.OrganizationId == 0 || r.OrganizationId == organizationId);
                return userRoles.Any(userRole => _roleManager.FindById(userRole.RoleId).Name == role);
            }
            return false;
        }

        private bool CanChangePassword(int? organizationId, bool superAdminOnly, bool updatingOwnPassword)
        {
            return superAdminOnly
                ? IsInOrganizationInRoleOf("Super Admin", organizationId)
                : IsInOrganizationInRoleOf("Admin", organizationId) ||
                  IsInOrganizationInRoleOf("Super Admin", organizationId) ||
                  updatingOwnPassword;
        }

        public bool IsFromGlobalOrganization(List<int> ids)
        {
            if (ids.Contains(0))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
using IPS.Business.Interfaces;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.EmailModel;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.UserModel;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;


namespace IPS.Business
{
    public class IpsEmailService : BaseService, IIpsEmailService
    {
        public int Add(IpsEmail email)
        {
            int result = 0;
            _ipsDataContext.IpsEmails.Add(email);
            result = _ipsDataContext.SaveChanges();
            return result;
        }

        public bool isGmailValid(IpsGmailUserModel ipsGmailUserModel)
        {
            bool result = false;
            if ((!string.IsNullOrEmpty(ipsGmailUserModel.Email)) && (!string.IsNullOrEmpty(ipsGmailUserModel.Password)))
            {
                GmailUserService gmailUserService = new GmailUserService();
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                string userEmail = realCurrentUser.User.WorkEmail != null ? realCurrentUser.User.WorkEmail : (currentUser.Email != null ? currentUser.Email : "");
                result = gmailUserService.isGmailValid(ipsGmailUserModel);
            }
            return result;
        }
        public List<IpsEmailModel> GetAllEmails()
        {
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            List<int> userOrganizationIdList = _authService.GetUserOrganizations();

            List<IpsEmailModel> result = new List<IpsEmailModel>();
            if (_authService.IsFromGlobalOrganization(userOrganizationIdList))
            {
                result = _ipsDataContext.IpsEmails
                    .Include("IPSEMailAttachments")
                    .Where(x => x.FromUserId != realCurrentUser.User.Id)
                    .Select(x => new IpsEmailModel()
                    {
                        BCCAddress = x.BCCAddress,
                        CCAddress = x.CCAddress,
                        FromAddress = x.FromAddress,
                        FromUserId = x.FromUserId,
                        Id = x.Id,
                        Message = x.Message,
                        SentTime = x.SentTime,
                        ToAddress = x.ToAddress,
                        Subject = x.Subject,
                        HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                        IsUserEmail = x.FromUserId > 0 ? true : false,
                        ToUserId = x.ToUserId,
                        IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsRead = x.IsRead
                    })
                    .OrderByDescending(x => x.SentTime)
                    .ToList();
            }
            else
            {
                foreach (int userOrgId in userOrganizationIdList)
                {
                    var isAdminOrSuperAdmin = _authService.IsInOrganizationInRoleOf("Admin", userOrgId) || _authService.IsInOrganizationInRoleOf("Super Admin", userOrgId);
                    if (isAdminOrSuperAdmin)
                    {
                        OrganizationService _organizationService = new OrganizationService();
                        List<IPSParticipants> organizationUsers = _organizationService.GetOrganizationUsers(userOrgId);
                        if (organizationUsers != null)
                        {
                            List<string> otherUsersWorkEmails = organizationUsers.Where(x => x.WorkEmail != realCurrentUser.User.WorkEmail).Select(x => x.WorkEmail).ToList();
                            List<IpsEmailModel> userEmails = _ipsDataContext.IpsEmails.Include("IPSEMailAttachments")
                                .Where(x => (otherUsersWorkEmails.Contains(x.ToAddress) || otherUsersWorkEmails.Contains(x.CCAddress) || otherUsersWorkEmails.Contains(x.BCCAddress)) && x.FromUserId != realCurrentUser.User.Id)
                                .Select(x => new IpsEmailModel()
                                {
                                    BCCAddress = x.BCCAddress,
                                    CCAddress = x.CCAddress,
                                    FromAddress = x.FromAddress,
                                    FromUserId = x.FromUserId,
                                    Id = x.Id,
                                    Message = x.Message,
                                    SentTime = x.SentTime,
                                    ToAddress = x.ToAddress,
                                    Subject = x.Subject,
                                    HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                                    IsUserEmail = x.FromUserId > 0 ? true : false,
                                    ToUserId = x.ToUserId,
                                    IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                                    IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                                    IsRead = x.IsRead
                                })
                                .OrderByDescending(x => x.SentTime)
                                .ToList();
                            result.AddRange(userEmails);
                        }
                    }
                }

                List<IpsEmailModel> ownEmails = _ipsDataContext.IpsEmails.Include("IPSEMailAttachments").Where(x => (x.ToAddress.Contains(realCurrentUser.User.WorkEmail) || x.CCAddress.Contains(realCurrentUser.User.WorkEmail) || x.BCCAddress.Contains(realCurrentUser.User.WorkEmail)) && x.FromUserId != realCurrentUser.User.Id)
                    .Select(x => new IpsEmailModel()
                    {
                        BCCAddress = x.BCCAddress,
                        CCAddress = x.CCAddress,
                        FromAddress = x.FromAddress,
                        FromUserId = x.FromUserId,
                        Id = x.Id,
                        Message = x.Message,
                        SentTime = x.SentTime,
                        ToAddress = x.ToAddress,
                        Subject = x.Subject,
                        HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                        IsUserEmail = x.FromUserId > 0 ? true : false,
                        ToUserId = x.ToUserId,
                        IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsRead = x.IsRead
                    })
                    .OrderByDescending(x => x.SentTime)
                    .ToList();
                result.AddRange(ownEmails);
            }
            return result;

        }

        public List<IpsEmailModel> getGmailMessages(IpsGmailUserModel ipsGmailUserModel)
        {
            List<IpsEmailModel> result = new List<IpsEmailModel>();
            if ((!string.IsNullOrEmpty(ipsGmailUserModel.Email)) && (!string.IsNullOrEmpty(ipsGmailUserModel.Password)))
            {
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                string userEmail = realCurrentUser.User.WorkEmail != null ? realCurrentUser.User.WorkEmail : (currentUser.Email != null ? currentUser.Email : "");
                GmailUserService gmailUserService = new GmailUserService();
                List<IpsEmailModel> gmailMessages = gmailUserService.GetMails(ipsGmailUserModel.Email, ipsGmailUserModel.Password, userEmail);
                result.AddRange(gmailMessages);
            }
            return result;
        }

        public List<IpsEmailModel> getGmailSentMessages(IpsGmailUserModel ipsGmailUserModel)
        {
            List<IpsEmailModel> result = new List<IpsEmailModel>();
            if ((!string.IsNullOrEmpty(ipsGmailUserModel.Email)) && (!string.IsNullOrEmpty(ipsGmailUserModel.Password)))
            {
                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                string userEmail = realCurrentUser.User.WorkEmail != null ? realCurrentUser.User.WorkEmail : (currentUser.Email != null ? currentUser.Email : "");
                GmailUserService gmailUserService = new GmailUserService();
                List<IpsEmailModel> gmailMessages = gmailUserService.GetSentMails(ipsGmailUserModel.Email, ipsGmailUserModel.Password, userEmail);
                result.AddRange(gmailMessages);
            }
            return result;
        }


        public IpsUnreadMessageModel getUnreadMessages()
        {
            IpsUnreadMessageModel result = new IpsUnreadMessageModel();
            var currentUser = _authService.getCurrentUser();
            if (currentUser != null)
            {
                var realCurrentUser = _authService.GetUserById(currentUser.Id);

                List<IpsEmailModel> ownEmails = _ipsDataContext.IpsEmails.Include("IPSEMailAttachments").Where(x => (x.ToAddress.Contains(realCurrentUser.User.WorkEmail) || x.CCAddress.Contains(realCurrentUser.User.WorkEmail) || x.BCCAddress.Contains(realCurrentUser.User.WorkEmail)) && x.FromUserId != realCurrentUser.User.Id && x.IsRead == false)
                      .Select(x => new IpsEmailModel()
                      {
                          BCCAddress = x.BCCAddress,
                          CCAddress = x.CCAddress,
                          FromAddress = x.FromAddress,
                          FromUserId = x.FromUserId,
                          Id = x.Id,
                          Message = x.Message,
                          SentTime = x.SentTime,
                          ToAddress = x.ToAddress,
                          Subject = x.Subject,
                          HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                          IsUserEmail = x.FromUserId > 0 ? true : false,
                          ToUserId = x.ToUserId,
                          IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                          IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                          IsRead = x.IsRead
                      })
                      .OrderByDescending(x => x.SentTime)
                      .ToList();
                result.Count = ownEmails.Count;
                result.Messages.AddRange(ownEmails.Take(5).ToList());
            }
            return result;
        }


        public List<IpsEmailModel> GetAllSentEmails()
        {
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            List<int> userOrganizationIdList = _authService.GetUserOrganizations();

            List<IpsEmailModel> result = new List<IpsEmailModel>();
            if (_authService.IsFromGlobalOrganization(userOrganizationIdList))
            {
                result = _ipsDataContext.IpsEmails
                    .Include("IPSEMailAttachments")
                    .Where(x => x.FromUserId == realCurrentUser.User.Id)
                    .Select(x => new IpsEmailModel()
                    {
                        BCCAddress = x.BCCAddress,
                        CCAddress = x.CCAddress,
                        FromAddress = x.FromAddress,
                        FromUserId = x.FromUserId,
                        Id = x.Id,
                        Message = x.Message,
                        SentTime = x.SentTime,
                        ToAddress = x.ToAddress,
                        Subject = x.Subject,
                        HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                        IsUserEmail = x.FromUserId > 0 ? true : false,
                        ToUserId = x.ToUserId,
                        IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsRead = x.IsRead
                    })
                    .OrderByDescending(x => x.SentTime)
                    .ToList();
            }
            else
            {
                //foreach (int userOrgId in userOrganizationIdList)
                //{
                //    var isAdminOrSuperAdmin = _authService.IsInOrganizationInRoleOf("Admin", userOrgId) || _authService.IsInOrganizationInRoleOf("Super Admin", userOrgId);
                //    if (isAdminOrSuperAdmin)
                //    {
                //        OrganizationService _organizationService = new OrganizationService();
                //        List<IPSParticipants> organizationUsers = _organizationService.GetOrganizationUsers(userOrgId);
                //        if (organizationUsers != null)
                //        {
                //            List<int> otherUsersIds = organizationUsers.Where(x => x.WorkEmail != realCurrentUser.User.WorkEmail).Select(x => x.Id).ToList();
                //            List<IpsEmailModel> userEmails = _ipsDataContext.IpsEmails.Include("IPSEMailAttachments")
                //                .Where(x => otherUsersIds.IndexOf(x.FromUserId.HasValue ? x.FromUserId.Value : 0) > -1)
                //                .Select(x => new IpsEmailModel()
                //                {
                //                    BCCAddress = x.BCCAddress,
                //                    CCAddress = x.CCAddress,
                //                    FromAddress = x.FromAddress,
                //                    FromUserId = x.FromUserId,
                //                    Id = x.Id,
                //                    Message = x.Message,
                //                    SentTime = x.SentTime,
                //                    ToAddress = x.ToAddress,
                //                    Subject = x.Subject,
                //                    HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                //                    IsUserEmail = x.FromUserId > 0 ? true : false,
                //                    ToUserId = x.ToUserId,
                //                    IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                //                    IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                //                })
                //                .ToList();
                //            result.AddRange(userEmails);
                //        }
                //    }
                //}

                List<IpsEmailModel> ownEmails = _ipsDataContext.IpsEmails.Include("IPSEMailAttachments")
                    .Where(x => x.FromUserId == realCurrentUser.User.Id)
                    .Select(x => new IpsEmailModel()
                    {
                        BCCAddress = x.BCCAddress,
                        CCAddress = x.CCAddress,
                        FromAddress = x.FromAddress,
                        FromUserId = x.FromUserId,
                        Id = x.Id,
                        Message = x.Message,
                        SentTime = x.SentTime,
                        ToAddress = x.ToAddress,
                        Subject = x.Subject,
                        HasAttachment = x.IPSEMailAttachments.Count > 0 ? true : false,
                        IsUserEmail = x.FromUserId > 0 ? true : false,
                        ToUserId = x.ToUserId,
                        IsSentEmail = x.FromUserId.HasValue ? (x.FromUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsReceivedEmail = x.ToUserId.HasValue ? (x.ToUserId.Value == realCurrentUser.User.Id ? true : false) : false,
                        IsRead = x.IsRead
                    })
                    .OrderByDescending(x => x.SentTime)
                    .ToList();
                result.AddRange(ownEmails);
            }
            return result;

        }

        public IpsEmail GetEmailById(int id)
        {
            return _ipsDataContext.IpsEmails.Include("IPSEMailAttachments").Where(x => x.Id == id).FirstOrDefault();
        }

        public IpsEmailModel GetGmailById(IpsGmailUserModel ipsGmailUserModel, string storagePath)
        {
            GmailUserService gmailUserService = new GmailUserService();
            return gmailUserService.GetGmailById(ipsGmailUserModel, storagePath);
        }

        public bool MarkEmailAsRead(int id)
        {
            bool result = false;
            if (id > 0)
            {
                IpsEmail original = _ipsDataContext.IpsEmails.Where(x => x.Id == id).FirstOrDefault();
                if (original != null)
                {
                    IpsEmail newEmail = new IpsEmail()
                    {
                        BCCAddress = original.BCCAddress,
                        CCAddress = original.CCAddress,
                        FromAddress = original.FromAddress,
                        FromUserId = original.FromUserId,
                        Id = original.Id,
                        Message = original.Message,
                        SentTime = original.SentTime,
                        Subject = original.Subject,
                        ToAddress = original.ToAddress,
                        ToUserId = original.ToUserId,
                        IsRead = true,
                        ReadAt = DateTime.Now
                    };
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(newEmail);
                    _ipsDataContext.SaveChanges();
                    result = true;
                }
            }
            return result;
        }

        public bool MarkEmailsAsRead(List<int> emailIds)
        {
            bool result = false;
            foreach (int id in emailIds)
            {
                if (id > 0)
                {
                    IpsEmail original = _ipsDataContext.IpsEmails.Where(x => x.Id == id).FirstOrDefault();
                    if (original != null)
                    {
                        IpsEmail newEmail = new IpsEmail()
                        {
                            BCCAddress = original.BCCAddress,
                            CCAddress = original.CCAddress,
                            FromAddress = original.FromAddress,
                            FromUserId = original.FromUserId,
                            Id = original.Id,
                            Message = original.Message,
                            SentTime = original.SentTime,
                            Subject = original.Subject,
                            ToAddress = original.ToAddress,
                            ToUserId = original.ToUserId,
                            IsRead = true,
                            ReadAt = DateTime.Now
                        };
                        _ipsDataContext.Entry(original).CurrentValues.SetValues(newEmail);
                        _ipsDataContext.SaveChanges();
                        result = true;
                    }
                }
            }
            return result;
        }

        public List<IpsUserModel> GetUsersByEmail()
        {
            List<IpsUserModel> result;
            int currentOrgId = _authService.GetCurrentUserOrgId();
            OrganizationService organizationService = new OrganizationService();
            List<int> subOrgIds = organizationService.GetSubOrganizations(currentOrgId).Select(x => x.Id).ToList();
            result = _ipsDataContext.Users.Where(x => x.OrganizationId == currentOrgId || subOrgIds.Contains(x.OrganizationId.HasValue ? x.OrganizationId.Value : 0) == true).Select(u => new IpsUserModel()
            {
                Id = u.Id,
                Email = u.WorkEmail,
                FirstName = u.FirstName,
                ImageUrl = u.ImagePath,
                IsActive = u.IsActive,
                LastName = u.LastName,
                OrganizationName = u.Organization.Name,
                CSVFileName = u.Organization.CSVFile,
            }).ToList();

            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            List<Project> allProjects = _ipsDataContext.Projects.Include("Link_ProjectUsers").Where(x => x.IsActive == true).ToList();
            List<Link_ProjectUsers> projectMembers = new List<Link_ProjectUsers>();
            foreach (Project project in allProjects)
            {

                bool isManager = _ipsDataContext.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id && x.RoleId == 1);
                if (isManager)
                {
                    projectMembers.AddRange(project.Link_ProjectUsers);
                }
            }

            List<int> projectUserIds = projectMembers.Select(x => x.UserId).Distinct().ToList();
            if (projectUserIds.Count > 0)
            {
                List<IpsUserModel> projectUsers = _ipsDataContext.Users.Where(x => projectUserIds.Contains(x.Id) == true).Select(u => new IpsUserModel()
                {
                    Id = u.Id,
                    Email = u.WorkEmail,
                    FirstName = u.FirstName,
                    ImageUrl = u.ImagePath,
                    IsActive = u.IsActive,
                    LastName = u.LastName,
                    //OrganizationName = u.Organization.Name,
                }).ToList();

                result.AddRange(projectUsers.Distinct());
            }
            return result;
        }

        public bool sendEmail(IpsEmail email, List<string> attachments)
        {
            MailNotification mailNotification = new MailNotification();
            return mailNotification.SendUSerEmail(email, attachments);
        }
    }
}

using IPS.BusinessModels.Common;
using IPS.BusinessModels.Enum;
using IPS.BusinessModels.NotificationTemplateModels;
using IPS.BusinessModels.ResourceModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class NotificationTemplatesService : BaseService, IPS.Business.INotificationTemplatesService
    {
        public IQueryable<NotificationTemplate> Get()
        {
            return _ipsDataContext.NotificationTemplates.Include("Culture").AsQueryable();
            //List<NotificationTemplate> result = new List<NotificationTemplate>();
            //List<int> organizationIds = null;
            //bool canAccessAllOrganization = false;
            //List<IpsPermissionModel> permissions = _authService.GetCurrentUserPermissionsByResource((int)ResourceEnum.NotificationTemplates);
            //if (permissions.Count() > 0)
            //{
            //    if (_authService.HasRoleLevelPermission(permissions, ResourceEnum.NotificationTemplates, OperationEnum.Read, out organizationIds, out canAccessAllOrganization))
            //    {
            //        if (canAccessAllOrganization)
            //        {
            //            return _ipsDataContext.NotificationTemplates.AsQueryable();
            //        }
            //        else
            //        {

            //            foreach (var p in permissions)
            //            {
            //                if (organizationIds.Contains(p.OrganizationId))
            //                {
            //                    if (p.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
            //                    {
            //                        List<NotificationTemplate> templates = _ipsDataContext.NotificationTemplates.Where(x => x.OrganizationId == p.OrganizationId).ToList();
            //                        result.AddRange(templates);
            //                    }
            //                    else if (p.PermissionLevelId == (int)PermissionLevelEnum.OwnDepartment)
            //                    {

            //                        var currentUser = _authService.getCurrentUser();
            //                        var realCurrentUser = _authService.GetUserById(currentUser.Id);

            //                        foreach (Department d in realCurrentUser.User.Departments1)
            //                        {
            //                            DepartmentService _DepartmentService = new DepartmentService();
            //                            Department department = _DepartmentService.GetById(d.Id).FirstOrDefault();
            //                            List<int> userids = department.Users.Select(x => x.Id).ToList();
            //                            List<NotificationTemplate> templates = _ipsDataContext.NotificationTemplates.Where(x => userids.Contains((int)x.CreatedBy)).ToList();
            //                            result.AddRange(templates);
            //                        }

            //                    }
            //                    else if (p.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
            //                    {
            //                        int currentuserId = _authService.GetCurrentUserId();
            //                        List<NotificationTemplate> templates = _ipsDataContext.NotificationTemplates.Where(x => x.CreatedBy == currentuserId).ToList();
            //                        result.AddRange(templates);
            //                    }
            //                }
            //            }
            //            return result.AsQueryable();
            //        }
            //    }
            //}
            //else
            //{

            //}
            //return result.AsQueryable();
        }
        public List<IPSDropDown> GetDDL()
        {
            return _ipsDataContext.NotificationTemplates.Select(x => new IPSDropDown() { Id = x.Id, Name = x.Name }).OrderBy(x => x.Name).ToList();
        }

        public List<NotificationTemplateType> GetNotificationTemplateTypesDDL()
        {
            return _ipsDataContext.NotificationTemplateTypes.OrderBy(x => x.Category).ToList();
        }

        public IQueryable<NotificationTemplate> GetById(int id)
        {
            return _ipsDataContext.NotificationTemplates.Where(nt => nt.Id == id).AsQueryable();
        }

        public IPSNotificationTemplateModel GetNotificationTemplateById(int id)
        {
            return _ipsDataContext.NotificationTemplates.Include("Culture").Where(nt => nt.Id == id).Select(x => new IPSNotificationTemplateModel()
            {
                Id = x.Id,
                Name = x.Name,
                OrganizationId = x.OrganizationId,
                EmailBody = x.EmailBody,
                EmailSubject = x.EmailSubject,
                EvaluationRoleId = x.EvaluationRoleId,
                SMSMessage = x.SMSMessage,
                StageTypeId = x.StageTypeId,
                UIMessage = x.UIMessage,
                CultureId = x.CultureId,
                CultureName = x.Culture != null ? x.Culture.CultureName : string.Empty,
            }).FirstOrDefault();


        }
        public NotificationTemplate Add(NotificationTemplate notificationTemplate)
        {

            notificationTemplate.Stages = null;
            notificationTemplate.Stages1 = null;
            notificationTemplate.Stages2 = null;
            notificationTemplate.Stages3 = null;
            notificationTemplate.Stages4 = null;
            notificationTemplate.Stages5 = null;
            notificationTemplate.Stages6 = null;
            notificationTemplate.Stages7 = null;
            notificationTemplate.Stages8 = null;
            notificationTemplate.Stages9 = null;
            notificationTemplate.Stages10 = null;
            notificationTemplate.Stages11 = null;
            notificationTemplate.Stages12 = null;
            notificationTemplate.Stages13 = null;
            notificationTemplate.Stages14 = null;
            notificationTemplate.Stages15 = null;
            //notificationTemplate.OrganizationId = _authService.GetCurrentUserOrgId();
            notificationTemplate.CreatedOn = DateTime.Now;
            notificationTemplate.CreatedBy = _authService.GetCurrentUserId();

            _ipsDataContext.NotificationTemplates.Add(notificationTemplate);
            _ipsDataContext.SaveChanges();
            return notificationTemplate;
        }

        public bool CloneNotificationTemplateById(int id)
        {
            bool result = false;
            NotificationTemplate original = _ipsDataContext.NotificationTemplates.Where(x => x.Id == id).FirstOrDefault();
            if (original != null)
            {
                NotificationTemplate newTemplate = new NotificationTemplate()
                {
                    CultureId = original.CultureId,
                    EmailBody = original.EmailBody,
                    EmailSubject = original.EmailSubject,
                    EvaluationRoleId = original.EvaluationRoleId,
                    IsDefualt = original.IsDefualt,
                    NotificationTemplateTypeId = original.NotificationTemplateTypeId,
                    ProfileTypeId = original.ProfileTypeId,
                    ProjectTypeId = original.ProjectTypeId,
                    SMSMessage = original.SMSMessage,
                    StageTypeId = original.StageTypeId,
                    UIMessage = original.UIMessage,
                    CreatedBy = _authService.GetCurrentUserId(),
                    CreatedOn = DateTime.Now,
                    OrganizationId = _authService.GetCurrentUserOrgId(),
                    Name = original.Name,
                    StateTypeId = original.StateTypeId,
                };
                string copyName = original.Name + " clone";
                if (_ipsDataContext.NotificationTemplates.Where(p => p.Name == copyName).Count() > 0)
                {
                    int i = 1;
                    while (true)
                    {
                        if (_ipsDataContext.Profiles.Where(p => p.Name == copyName + i.ToString()).Count() == 0)
                        {
                            copyName = copyName + i.ToString();
                            break;
                        }
                        i++;
                    }
                }
                newTemplate.Name = copyName;
                _ipsDataContext.NotificationTemplates.Add(newTemplate);
                _ipsDataContext.SaveChanges();
                if (newTemplate.Id > 0)
                {
                    result = true;
                }
                else
                {
                    result = false;
                }
            }
            return result;
        }

        public bool Update(NotificationTemplate notificationTemplate)
        {
            var original = _ipsDataContext.NotificationTemplates.Find(notificationTemplate.Id);

            if (original != null)
            {
                notificationTemplate.Stages = null;
                notificationTemplate.Stages1 = null;
                notificationTemplate.Stages2 = null;
                notificationTemplate.Stages3 = null;
                notificationTemplate.Stages4 = null;
                notificationTemplate.Stages5 = null;
                notificationTemplate.Stages6 = null;
                notificationTemplate.Stages7 = null;
                notificationTemplate.Stages8 = null;
                notificationTemplate.Stages9 = null;
                notificationTemplate.Stages10 = null;
                notificationTemplate.Stages11 = null;
                notificationTemplate.Stages12 = null;
                notificationTemplate.Stages13 = null;
                notificationTemplate.Stages14 = null;
                notificationTemplate.Stages15 = null;
                notificationTemplate.ModifiedOn = DateTime.Now;
                notificationTemplate.ModifiedBy = _authService.GetCurrentUserId();
                _ipsDataContext.Entry(original).CurrentValues.SetValues(notificationTemplate);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public string Delete(NotificationTemplate notificationTemplate)
        {
            _ipsDataContext.NotificationTemplates.Remove(notificationTemplate);
            try
            {
                var result = _ipsDataContext.SaveChanges();
                return "OK";
            }


            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;


            }
        }
    }
}

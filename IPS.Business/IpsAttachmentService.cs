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
    public class IpsAttachmentService : BaseService, IIpsAttachmentService
    {
        public int Add(IpsAttachment ipsAttachment)
        {
            int result = 0;
            ipsAttachment.CreatedBy = _authService.GetCurrentUserId();
            ipsAttachment.CreatedOn = DateTime.Now;
            _ipsDataContext.IpsAttachments.Add(ipsAttachment);
            result = _ipsDataContext.SaveChanges();
            return result;
        }
        public List<IpsAttachment> GetUserAttachments()
        {
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            List<int> userOrganizationIdList = _authService.GetUserOrganizations();

            List<IpsAttachment> result = new List<IpsAttachment>();
            List<int> userAttachmentIds = _ipsDataContext.IpsAttachmentUsers.Where(x => x.UserId == realCurrentUser.User.Id).Select(x => x.Id).ToList();
            result = _ipsDataContext.IpsAttachments
                .Include("IpsAttachmentUsers")
                .Include("IpsAttachmentFileDetails")
                .Where(x => userAttachmentIds.Contains(x.Id) == true)
                .OrderByDescending(x => x.CreatedOn)
                .ToList();
            return result;
        }

        public IpsAttachment GetAttachmentById(int id)
        {
            IpsAttachment result = new IpsAttachment();
            result = _ipsDataContext.IpsAttachments
                .Include("IpsAttachmentUsers")
                .Include("IpsAttachmentFileDetails")
                .Where(x => x.Id == id)
                .FirstOrDefault();
            return result;
        }
    }
}

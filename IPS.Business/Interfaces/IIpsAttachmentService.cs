using IPS.BusinessModels.EmailModel;
using IPS.BusinessModels.UserModel;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business.Interfaces
{
    public interface IIpsAttachmentService
    {
        List<IpsAttachment> GetUserAttachments();
        IpsAttachment GetAttachmentById(int id);
        int Add(IpsAttachment ipsAttachment);
    }
}

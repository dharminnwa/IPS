using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProjectRoleModels;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.TrainingDiaryModels;
using System.Net;
using System.Data.Entity.Infrastructure;
using log4net;
using IPS.BusinessModels.UserModel;
using System.Configuration;
using System.IO;
using IPS.WebApi.Constants;
using IPS.BusinessModels.EmailModel;

namespace IPS.WebApi.Controllers
{
    public class AttachmentController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IIpsAttachmentService _service;
        public AttachmentController(IIpsAttachmentService service)
        {
            _service = service;

        }

        [HttpGet]
        [Route("api/attachment/getUserAttachments")]
        public List<IpsAttachment> GetUserAttachments()
        {
            return _service.GetUserAttachments();
        }

        [HttpGet]
        [Route("api/attachment/getAttachmentById/{id}")]
        public IpsAttachment GetAttachmentById(int id)
        {
            return _service.GetAttachmentById(id);
        }

        

        [HttpPost]
        [Route("api/attachment/save")]
        public int Save(IpsAttachment ipsAttachment)
        {
            return _service.Add(ipsAttachment);
        }

        public List<string> getAttachmentPath(IpsEmail email)
        {
            List<string> result = new List<string>();
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;
            foreach (IPSEMailAttachment emailAttachment in email.IPSEMailAttachments)
            {
                if (!string.IsNullOrEmpty(emailAttachment.FileName))
                {
                    if (string.IsNullOrWhiteSpace(fileStorageRoot))
                    {
                        filePath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, UploadFolders.UserAttachments, emailAttachment.FileName);
                    }
                    else
                    {
                        filePath = Path.Combine(fileStorageRoot, UploadFolders.EmailAttachments, emailAttachment.FileName);
                    }

                    if (File.Exists(filePath))
                    {
                        result.Add(filePath);
                    }
                }
            }
            return result;
        }
    }
}
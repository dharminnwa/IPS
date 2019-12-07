using System;
using System.IO;
using System.Web;
using System.Web.Http;
using IPS.Business;
using IPS.WebApi.Constants;
using System.Configuration;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class UploadController : BaseController
    {
        private readonly DocumentsService _documentsService;

        public UploadController(DocumentsService documentsService)
        {
            _documentsService = documentsService;
        }

        [Route("api/Upload")]
        public IHttpActionResult Post()
        {
            return Upload(UploadFolders.Images);
        }

        [HttpPost]
        [Route("api/Upload/userAttachments")]
        public IHttpActionResult UserAttachments()
        {
            return Upload(UploadFolders.UserAttachments);
        }
        [HttpPost]
        [Route("api/Upload/trainingMaterials")]
        public IHttpActionResult UploadTrainingMaterials()
        {
            return Upload(UploadFolders.TrainingMaterials);
        }

        [HttpPost]
        [Route("api/Upload/emailAttachment")]
        public IHttpActionResult UploadEmailAttachment()
        {
            return UploadEmailAttachment(UploadFolders.EmailAttachments);
        }

        [HttpPost]
        [Route("api/upload/answerMaterials")]
        public IHttpActionResult UploadAnswerMaterials()
        {
            var fileName = string.Empty;
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count;)
                {
                    var file = files[i];
                    var id = Guid.NewGuid();
                    fileName = file.FileName;
                    Upload(UploadFolders.AnswerMaterials, file, id);
                    _documentsService.Save(fileName, file.ContentType, id);
                    return Ok(new { id, name = fileName });
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("api/upload/questionMaterials")]
        public IHttpActionResult UploadQuestionMaterials()
        {
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count;)
                {
                    var file = files[i];
                    var id = Guid.NewGuid();
                    Upload(UploadFolders.QuestionMaterials, file, id);
                    _documentsService.Save(file.FileName, file.ContentType, id);
                    return Ok(new { id });
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("api/Upload/customerCSV")]
        public IHttpActionResult UploadcustomerCSV()
        {
            return UploadCustomerCSV(UploadFolders.CustomerCsv);
        }

        [HttpPost]
        [Route("api/Upload/organizationCSV")]
        public IHttpActionResult UploadOrganizationCSV()
        {
            return UploadOrganizationCSV(UploadFolders.OrganizationCsv);
        }

        private IHttpActionResult Upload(string folder)
        {
            var fileName = string.Empty;
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count; i++)
                {
                    fileName = Upload(folder, files[i]);
                }
            }
            return Ok(fileName);
        }

        private IHttpActionResult UploadEmailAttachment(string folder)
        {
            var fileName = string.Empty;
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count; i++)
                {
                    fileName = UploadAttachment(folder, files[i]);
                }
            }
            return Ok(fileName);
        }

        private string Upload(string folder, HttpPostedFile file, Guid? id = null)
        {
            if (!id.HasValue)
            {
                id = Guid.NewGuid();
            }

            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string directoryPath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                directoryPath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, folder);
            }
            else
            {
                directoryPath = Path.Combine(fileStorageRoot, folder);
            }

            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            var fileName = id + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(directoryPath, fileName);

            file.SaveAs(filePath);

            return fileName;
        }

        private string UploadAttachment(string folder, HttpPostedFile file)
        {
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string directoryPath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                directoryPath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, folder);
            }
            else
            {
                directoryPath = Path.Combine(fileStorageRoot, folder);
            }

            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            var fileName = file.FileName;
            var filePath = Path.Combine(directoryPath, fileName);
            if (File.Exists(filePath))
            {
                fileName = Path.GetFileNameWithoutExtension(filePath) + "_" + DateTime.Now.Ticks.ToString() + Path.GetExtension(file.FileName);
                filePath = Path.Combine(directoryPath, fileName);
            }
            file.SaveAs(filePath);
            return fileName;
        }


        private IHttpActionResult UploadCustomerCSV(string folder)
        {
            var fileName = string.Empty;
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count; i++)
                {
                    fileName = UploadFileWihtSameName(folder, files[i]);
                }
            }
            return Ok(fileName);
        }
        private string UploadFileWihtSameName(string folder, HttpPostedFile file)
        {
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string directoryPath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                directoryPath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, folder);
            }
            else
            {
                directoryPath = Path.Combine(fileStorageRoot, folder);
            }

            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            var fileName = file.FileName;
            var filePath = Path.Combine(directoryPath, fileName);
            if (File.Exists(filePath))
            {
                fileName = Path.GetFileNameWithoutExtension(filePath) + "_" + String.Format("{0:yyyyMMddHHmmss}", DateTime.Now) + Path.GetExtension(file.FileName);
                filePath = Path.Combine(directoryPath, fileName);
            }

            file.SaveAs(filePath);

            return fileName;
        }

        private IHttpActionResult UploadOrganizationCSV(string folder)
        {
            var fileName = string.Empty;
            if (HttpContext.Current.Request.Files.Count > 0)
            {
                var files = HttpContext.Current.Request.Files;
                for (int i = 0; i < files.Count; i++)
                {
                    fileName = UploadFileWihtSameName(folder, files[i]);
                }
            }
            return Ok(fileName);
        }
    }
}
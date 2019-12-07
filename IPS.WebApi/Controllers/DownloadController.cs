using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Web.Http;
using IPS.Business.Extensions;
using IPS.Business.Interfaces;
using IPS.WebApi.Constants;
using System.Configuration;

namespace IPS.WebApi.Controllers
{
    public class DownloadController : BaseController
    {
        private readonly IDocumentsService _documentsService;

        public DownloadController(IDocumentsService documentsService)
        {
            _documentsService = documentsService;
        }

        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        [HttpGet]
        [Route("api/Download/{id}")]
        public void Get(string id)
        {
            Download(UploadFolders.Images, id);
        }

        [HttpGet]
        [Route("api/Download/trainingMaterials/{id}")]
        public void GetTrainingMaterials(string id)
        {
            Download(UploadFolders.TrainingMaterials, id);
        }

        [HttpGet]
        [Route("api/Download/attachment/{fileName}")]
        public void GetAttachment(string fileName)
        {
            Download(UploadFolders.EmailAttachments, fileName);
        }


        [HttpGet]
        [Route("api/Download/userattachment/{fileName}")]
        public void GetUserAttachment(string fileName)
        {
            Download(UploadFolders.UserAttachments, fileName);
        }


        [HttpGet]
        [Route("api/Download/gmailAttachment/{fileName}")]
        public void gmailAttachment(string fileName)
        {
            Download(UploadFolders.GmailAttachments, fileName);
        }

        private void Download(string folder, string fileName, string resourceType = "")
        {
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                filePath = HttpContext.Current.Server.MapPath($"~\\{UploadFolders.BaseFolder}\\{folder}\\{fileName}");
            }
            else
            {
                filePath = fileStorageRoot + $"\\{folder}\\{fileName}";
            }

            if (string.IsNullOrEmpty(resourceType))
            {
                HttpContext.Current.Response.ContentType = Helper.GetMimeType(Path.GetExtension(fileName));
            }
            else
            {
                HttpContext.Current.Response.ContentType = resourceType;
            }

            try
            {
                HttpContext.Current.Response.WriteFile(filePath);

            }
            catch (Exception)
            {
            }

            HttpContext.Current.Response.End();
        }

        [HttpGet]
        [Route("api/download/answerMaterials/{id}")]
        public void DownloadAnswerMaterial(Guid id)
        {
            var document = _documentsService.Get(id);
            Download(UploadFolders.AnswerMaterials, document.GetName(), document.ResourceType);
        }

        [HttpGet]
        [Route("api/download/questionMaterials/{id}")]
        public void DownloadQuestionMaterial(Guid id)
        {
            var document = _documentsService.Get(id);
            Download(UploadFolders.QuestionMaterials, document.GetName(), document.ResourceType);
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        [HttpDelete]
        [Route("api/Download/{id}")]
        public IHttpActionResult Delete(string id)
        {
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                filePath = HttpContext.Current.Server.MapPath($"~\\{UploadFolders.BaseFolder}\\{UploadFolders.Images}\\{id}");
            }
            else
            {
                filePath = fileStorageRoot + $"\\{UploadFolders.Images}\\{id}";
            }

            try
            {
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (Exception)
            {
                return BadRequest(id + " can not be deleted");
            }

            return Ok(id);
        }
    }
}
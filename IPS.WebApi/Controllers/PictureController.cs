using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using IPS.WebApi.FlowJs;
using IPS.WebApi.FlowJs.Interface;
using Microsoft.AspNet.Identity;
using System.Configuration;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    [RoutePrefix("api/Picture")]
    public class PictureController : BaseController
    {
        private readonly IFlowJsRepo _flowJs;
        string ProfileUploadFolder = "";
        public PictureController()
        {
            _flowJs = new FlowJsRepo();
            ProfileUploadFolder = ConfigurationManager.AppSettings["ProfileUploadFolder"];
        }
        
        [HttpGet]
        [Route("Upload")]
        public IHttpActionResult PictureUploadGet()
        {
            var request = HttpContext.Current.Request;

            var chunkExists = _flowJs.ChunkExists(ProfileUploadFolder, request);
            if (chunkExists) return Ok();
            return NotFound();
        }

        [HttpPost]
        [Route("Upload")]
        public IHttpActionResult PictureUploadPost()
        {
            var request = HttpContext.Current.Request;
            
            var validationRules = new FlowValidationRules();
            validationRules.AcceptedExtensions.AddRange(new List<string> { "jpeg", "jpg", "png", "bmp" });
            validationRules.MaxFileSize = 5000000;

            try
            {
                var status = _flowJs.PostChunk(request, ProfileUploadFolder, validationRules);
    
                if (status.Status == PostChunkStatus.Done)
                {
                    // file uploade is complete. Below is an example of further file handling
                    var filePath = Path.Combine(ProfileUploadFolder, status.FileName);
                    var file = File.ReadAllBytes(filePath);
                    File.WriteAllBytes(filePath, file);  //await _fileManager.UploadPictureToS3(User.Identity.GetUserId(), file, status.FileName);
                    //File.Delete(filePath);
                    return Ok(status.FileName);
                }
    
                if (status.Status == PostChunkStatus.PartlyDone)
                {
                    return Ok();
                }
    
                status.ErrorMessages.ForEach(x => ModelState.AddModelError("file", x));
                return BadRequest(ModelState);
            }
            catch (Exception)
            {
                ModelState.AddModelError("file", "exception");
                return BadRequest(ModelState);
            }
        }
    }
}
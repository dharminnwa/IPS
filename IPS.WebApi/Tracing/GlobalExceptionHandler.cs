using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace IPS.WebApi.Controllers
{
    public class GlobalExceptionHandler:ExceptionHandler
    {
        public override void HandleCore(System.Web.Http.ExceptionHandling.ExceptionHandlerContext context)
        {
            context.Result = new GlobalException()
            {
                StatusCode = HttpStatusCode.InternalServerError,
                Message    = string.Format("Internal exception has occured: {0}", context.Exception.Message),
                Request    = context.Request
            };
            
        }
    }

    public class GlobalException : IHttpActionResult
    {
        public HttpRequestMessage Request { get; set; }
        public HttpStatusCode StatusCode  { get; set; }
        public string Message             { get; set; }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            var response = new HttpResponseMessage(StatusCode)
            {
                Content = new StringContent(Message),
                RequestMessage = Request
            };

            return Task.FromResult(response);
        }
    }
}
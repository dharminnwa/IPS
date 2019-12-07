using System;
using System.Web.Http.ExceptionHandling;
using log4net;

namespace IPS.WebApi.Controllers
{
    public class GlobalExceptionLogger: ExceptionLogger
    {
        private static readonly ILog Log4Net = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public override void Log(ExceptionLoggerContext context)
        {
            Log4Net.Error(String.Format("Unhandled exception thrown in {0} for request {1}: {2}",
                context.Request.Method, context.Request.RequestUri,context.Exception));
        }
    }
}
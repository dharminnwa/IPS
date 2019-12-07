using Common.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;

[assembly: log4net.Config.XmlConfigurator(Watch = true)]
namespace IPSScheduler
{
    public class Global : System.Web.HttpApplication
    {
        private static JobScheduler scheduler = new JobScheduler();

        protected void Application_Start(object sender, EventArgs e)
        {
            log4net.Config.XmlConfigurator.Configure();
            scheduler.Start();
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {
            //scheduler.Stop();
            ILog Log = LogManager.GetLogger("Global.asax");
            Log.Debug("Application_End triggered");
            var client = new WebClient();
            var url = ConfigurationManager.AppSettings["SchedulerHostUrl"] + "ping.aspx";
            client.DownloadString(url);
        }
    }
}
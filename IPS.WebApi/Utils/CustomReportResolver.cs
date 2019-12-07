using System.Net;
using Telerik.Reporting;

namespace IPS.WebApi.Utils
{
    public class CustomReportResolver : Telerik.Reporting.Services.Engine.IReportResolver
    {
        public string ReportsPath { get; set; }

        public Telerik.Reporting.ReportSource Resolve(string reportId)
        {

            var reportSource = GetReport(reportId);
            return reportSource;
        }

        public Telerik.Reporting.ReportSource GetReport(string reportId)
        {
            //Commented by Feng[10th/Apr/2019]: some clients' logo url is on TLS not SSL, in such a case, .Net framework won't be able to get the logo since
            //                                  it tries to build a SSL communication channel in default. Below code line resolves the problem.
            //                                  TLS is an updated version of SSL.
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls;

            Telerik.Reporting.XmlSerialization.ReportXmlSerializer xmlSerializer = new Telerik.Reporting.XmlSerialization.ReportXmlSerializer();
            var reportObject = (Telerik.Reporting.Report)xmlSerializer.Deserialize(ReportsPath + "\\" + reportId);

            //var connectionStringHandler = new ReportConnectionStringManager(ConfigurationManager.ConnectionStrings["IPSData"].ConnectionString);
            var sourceReportSource = new InstanceReportSource { ReportDocument = reportObject };
            //var reportSource = connectionStringHandler.UpdateReportSource(sourceReportSource);
            return sourceReportSource;
        }

        public CustomReportResolver(string reportsPath)
        {
            ReportsPath = reportsPath;
        }
    }
}